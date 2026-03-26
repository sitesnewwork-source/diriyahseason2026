import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin, Utensils, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { actionNotify } from "@/hooks/use-action-notify";
import { places } from "@/data/places";
import { experiences } from "@/data/experiences";
import { restaurants } from "@/data/restaurants";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

type ResultType = "place" | "experience" | "restaurant";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: ResultType;
  image: string;
  link: string;
}

const typeConfig: Record<ResultType, { label: string; icon: typeof MapPin; color: string }> = {
  place: { label: "مكان", icon: MapPin, color: "bg-emerald-500/20 text-emerald-400" },
  experience: { label: "تجربة", icon: Compass, color: "bg-blue-500/20 text-blue-400" },
  restaurant: { label: "مطعم", icon: Utensils, color: "bg-amber-500/20 text-amber-400" },
};

const SearchDialog = ({ open, onClose }: SearchDialogProps) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const allItems: SearchResult[] = useMemo(() => [
    ...places.map((p) => ({
      id: p.id, title: p.name, subtitle: p.subtitle, type: "place" as const,
      image: p.image, link: `/place/${p.id}`,
    })),
    ...experiences.map((e) => ({
      id: e.id, title: e.title, subtitle: e.category, type: "experience" as const,
      image: e.image, link: `/experience/${e.id}`,
    })),
    ...restaurants.map((r) => ({
      id: r.id, title: r.name, subtitle: r.cuisine, type: "restaurant" as const,
      image: r.image, link: `/restaurant/${r.id}`,
    })),
  ], []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return allItems.filter(
      (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
    );
  }, [query, allItems]);

  const handleSelect = (result: SearchResult) => {
    actionNotify({ message: result.title, icon: "🔍", sound: "soft" });
    navigate(result.link);
    setQuery("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[90%] max-w-lg bg-earth border border-cream/10 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-cream/10">
              <Search className="w-5 h-5 text-cream/40 flex-shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن أماكن، تجارب، مطاعم..."
                className="flex-1 bg-transparent text-cream placeholder:text-cream/30 outline-none text-sm"
                dir="rtl"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-cream/40 hover:text-cream">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto">
              {query.trim() && results.length === 0 && (
                <div className="py-12 text-center text-cream/40 text-sm">
                  لا توجد نتائج لـ "{query}"
                </div>
              )}

              {!query.trim() && (
                <div className="py-8 text-center text-cream/30 text-xs">
                  اكتب للبحث في الأماكن والتجارب والمطاعم
                </div>
              )}

              {results.map((result) => {
                const config = typeConfig[result.type];
                const Icon = config.icon;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-cream/5 transition-colors text-right"
                  >
                    <img
                      src={result.image}
                      alt={result.title}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-cream text-sm font-medium truncate">{result.title}</p>
                      <p className="text-cream/40 text-xs truncate">{result.subtitle}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full flex-shrink-0 ${config.color}`}>
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-cream/10 flex justify-between text-cream/20 text-[10px]">
              <span>ESC للإغلاق</span>
              <span>↵ للتنقل</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchDialog;
