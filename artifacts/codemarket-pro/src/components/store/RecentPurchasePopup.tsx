import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle2, X } from "lucide-react";
import { getProducts } from "@/lib/firestore";
import type { Product } from "@/types";

const ROUTE_BLOCKLIST = ["/admin", "/login", "/checkout", "/success"];
const CITIES = ["Kathmandu", "Delhi", "Dhaka", "Lahore", "Mumbai", "Karachi"];

export default function RecentPurchasePopup() {
  const [location] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [current, setCurrent] = useState<Product | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [city, setCity] = useState("Kathmandu");

  const shouldShow = useMemo(
    () => !ROUTE_BLOCKLIST.some((prefix) => location.startsWith(prefix)),
    [location],
  );

  useEffect(() => {
    getProducts({ publishedOnly: true, limitCount: 12 })
      .then(setProducts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!shouldShow || dismissed || products.length === 0) return;

    const showNotification = () => {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
      setCurrent(randomProduct);
      setCity(randomCity);
      setVisible(true);
      window.setTimeout(() => setVisible(false), 4200);
    };

    showNotification();
    const interval = window.setInterval(showNotification, 14000);
    return () => window.clearInterval(interval);
  }, [dismissed, products, shouldShow]);

  if (!shouldShow || dismissed || !current) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 z-40 max-w-xs rounded-lg border border-border bg-card/95 backdrop-blur p-3 shadow-xl transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
      data-testid="recent-purchase-popup"
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        aria-label="Close popup"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="flex items-start gap-2 pr-5">
        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs text-muted-foreground">Recent purchase</p>
          <p className="text-sm font-medium leading-snug">
            Someone from {city} bought{" "}
            <Link href={`/products/${current.slug}`} className="text-primary hover:underline">
              {current.title}
            </Link>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Just now</p>
        </div>
      </div>
    </div>
  );
}
