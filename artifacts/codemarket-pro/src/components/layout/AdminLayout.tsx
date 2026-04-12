import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Tag, Star, Upload, ArrowLeft, Shield, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Overview",  href: "/admin",          icon: LayoutDashboard },
  { label: "Products",  href: "/admin/products",  icon: Package },
  { label: "Orders",    href: "/admin/orders",    icon: ShoppingBag },
  { label: "Users",     href: "/admin/users",     icon: Users },
  { label: "Coupons",   href: "/admin/coupons",   icon: Tag },
  { label: "Reviews",   href: "/admin/reviews",   icon: Star },
  { label: "Uploads",   href: "/admin/uploads",   icon: Upload },
];

function SidebarContent({ location, onClose }: { location: string; onClose?: () => void }) {
  return (
    <>
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">Admin Panel</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/admin"
            ? location === "/admin"
            : location.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded text-sm cursor-pointer transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
                data-testid={`link-admin-${item.label.toLowerCase()}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <Link href="/">
          <div
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors rounded hover:bg-sidebar-accent"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </div>
        </Link>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  const [location, setLocation] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const currentLabel = navItems.find((n) =>
    n.href === "/admin" ? location === "/admin" : location.startsWith(n.href)
  )?.label ?? "Admin";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Mobile top bar ── */}
      <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-sidebar sticky top-0 z-40">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-1.5 rounded hover:bg-sidebar-accent transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">{currentLabel}</span>
        </div>
      </header>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent location={location} onClose={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-56 shrink-0 border-r border-border bg-sidebar flex-col h-screen sticky top-0">
        <SidebarContent location={location} />
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
