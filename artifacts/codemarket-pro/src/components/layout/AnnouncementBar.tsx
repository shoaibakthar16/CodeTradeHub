import { useState } from "react";
import { Link } from "wouter";
import { X, Tag } from "lucide-react";

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="relative bg-gradient-to-r from-primary/90 via-primary to-violet-600 text-primary-foreground text-xs py-2 px-4 flex items-center justify-center gap-2 font-medium">
      <Tag className="w-3.5 h-3.5 shrink-0" />
      <span>
        Use code <strong className="font-bold tracking-wide bg-white/20 px-1.5 py-0.5 rounded text-white">LAUNCH20</strong> for 20% off your first purchase!{" "}
        <Link href="/products" className="underline underline-offset-2 hover:no-underline">Shop now →</Link>
      </span>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
