import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Star,
  Upload,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation as useWouterLocation } from "wouter";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Coupons", href: "/admin/coupons", icon: Tag },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Uploads", href: "/admin/uploads", icon: Upload },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  const [location, setLocation] = useWouterLocation();

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
          <p className="text-sm text-muted-foreground mb-4">You don't have admin permissions.</p>
          <Button onClick={() => setLocation("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-sidebar flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">Admin Panel</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/admin" ? location === "/admin" : location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded text-sm cursor-pointer transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                  data-testid={`link-admin-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <Link href="/">
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Store
            </div>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
