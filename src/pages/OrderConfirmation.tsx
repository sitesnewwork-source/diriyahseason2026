import { useLocation, Link } from "react-router-dom";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Ticket, Calendar, MapPin, Download, Home, Image, FileText } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import Footer from "@/components/Footer";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface OrderTicket {
  id: number;
  name: string;
  price: number;
  qty: number;
}

interface OrderState {
  tickets: OrderTicket[];
  firstName?: string;
  lastName?: string;
  email: string;
  total: number;
  vat: number;
  subtotal: number;
  paymentMethod: string;
}

const OrderConfirmation = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const location = useLocation();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const order = location.state as OrderState | null;

  const downloadAsImage = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const link = document.createElement("a");
      link.download = `diriyah-ticket-${confirmationNumber}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const downloadAsPDF = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
      pdf.save(`diriyah-ticket-${confirmationNumber}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  const confirmationNumber = `DIR-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const orderDate = new Date().toLocaleDateString(isAr ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (!order) {
    return (
      <div className="min-h-screen bg-background font-body" dir={isAr ? "rtl" : "ltr"}>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <p className="text-muted-foreground mb-4">
            {isAr ? "لا توجد بيانات طلب. يرجى إتمام عملية الشراء أولاً." : "No order data found. Please complete a purchase first."}
          </p>
          <Link to="/checkout">
            <Button className="bg-primary text-primary-foreground">
              {isAr ? "العودة للدفع" : "Go to Checkout"}
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body" dir={isAr ? "rtl" : "ltr"}>
      <Header />

      <main className="pt-28 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <BackButton />
        </div>
        <div className="max-w-2xl mx-auto">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              {isAr ? "تم استلام طلبك!" : "Order Received!"}
            </h1>
            <p className="text-muted-foreground">
              {isAr
                ? "شكراً لك! طلبك قيد المراجعة وسيتم تأكيده من قبل الإدارة. ستصلك التفاصيل على بريدك الإلكتروني."
                : "Thank you! Your order is under review and will be confirmed by the admin. Details will be sent to your email."}
            </p>
          </motion.div>

          {/* Confirmation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-5"
          >
            {/* Order Info */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  {isAr ? "تفاصيل الطلب" : "Order Details"}
                </h2>
                <span className="text-xs font-mono bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
                  {confirmationNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">{isAr ? "تاريخ الطلب" : "Order Date"}</p>
                  <p className="font-medium text-foreground">{orderDate}</p>
                </div>
                {(order.firstName || order.lastName) && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">{isAr ? "الاسم" : "Name"}</p>
                    <p className="font-medium text-foreground">{order.firstName} {order.lastName}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">{isAr ? "البريد الإلكتروني" : "Email"}</p>
                  <p className="font-medium text-foreground" dir="ltr">{order.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">{isAr ? "طريقة الدفع" : "Payment Method"}</p>
                  <p className="font-medium text-foreground">
                    {order.paymentMethod === "card"
                      ? (isAr ? "بطاقة ائتمان" : "Credit Card")
                      : "Apple Pay"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">{isAr ? "الحالة" : "Status"}</p>
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium text-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    {isAr ? "قيد المراجعة" : "Pending Review"}
                  </span>
                </div>
              </div>
            </div>

            {/* Tickets */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Ticket className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-semibold text-foreground">
                  {isAr ? "التذاكر" : "Tickets"}
                </h2>
              </div>

              <div className="space-y-3">
                {order.tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg bg-background">
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{ticket.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{isAr ? "الدرعية" : "Diriyah"}</span>
                        <Calendar className="w-3 h-3 ms-2" />
                        <span>2026-04-15</span>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-bold text-foreground">
                        {ticket.price * ticket.qty} {isAr ? "ر.س" : "SAR"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        × {ticket.qty}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span>{order.subtotal} {isAr ? "ر.س" : "SAR"}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{isAr ? "ضريبة القيمة المضافة (15%)" : "VAT (15%)"}</span>
                  <span>{order.vat} {isAr ? "ر.س" : "SAR"}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-foreground text-lg">
                  <span>{isAr ? "الإجمالي" : "Total"}</span>
                  <span>{order.total} {isAr ? "ر.س" : "SAR"}</span>
                </div>
              </div>
            </div>

            {/* Digital Ticket QR - wrapped for capture */}
            <div ref={ticketRef} className="bg-card rounded-xl border border-border p-6 text-center">
              <h2 className="font-display text-lg font-semibold text-foreground mb-1">
                {isAr ? "التذكرة الرقمية" : "Digital Ticket"}
              </h2>
              <p className="text-xs text-muted-foreground mb-3">
                {isAr ? "امسح رمز QR عند الدخول" : "Scan QR code at entry"}
              </p>
              {/* Ticket info inside capture */}
              <div className="text-xs text-muted-foreground mb-4 space-y-1">
                {order.tickets.map((t) => (
                  <p key={t.id}>{t.name} × {t.qty}</p>
                ))}
                <p>{isAr ? "الإجمالي:" : "Total:"} {order.total} {isAr ? "ر.س" : "SAR"}</p>
              </div>
              <div className="inline-flex p-4 bg-white rounded-xl shadow-sm border border-border">
                <QRCodeSVG
                  value={`https://diriyah.sa/ticket/${confirmationNumber}`}
                  size={180}
                  level="M"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#1a1a1a"
                />
              </div>
              <p className="text-xs font-mono text-muted-foreground mt-4 tracking-wider">
                {confirmationNumber}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={downloadAsImage}
                disabled={downloading}
                className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                <Image className="w-4 h-4" />
                {isAr ? "تحميل كصورة" : "Download as Image"}
              </Button>
              <Button
                onClick={downloadAsPDF}
                disabled={downloading}
                variant="outline"
                className="flex-1 h-12 gap-2 border-primary text-primary"
              >
                <FileText className="w-4 h-4" />
                {isAr ? "تحميل كـ PDF" : "Download as PDF"}
              </Button>
            </div>
            <div className="flex justify-center pt-1">
              <Link to="/">
                <Button variant="ghost" className="gap-2 text-muted-foreground">
                  <Home className="w-4 h-4" />
                  {isAr ? "العودة للرئيسية" : "Back to Home"}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
