import { useState, useEffect } from "react";
import { Package, ShoppingBag, Users, DollarSign, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/layout/AdminLayout";
import { getDashboardStats } from "@/lib/firestore";
import { formatPrice } from "@/lib/stripe";
import type { Order } from "@/types";

const statusColors: Record<Order["status"], string> = {
  paid: "bg-green-500/10 text-green-400 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

function formatDate(v: unknown) {
  if (typeof v === "string") return v;
  if (v instanceof Date) return v.toLocaleDateString();
  return "";
}

export default function AdminPage() {
  const [stats, setStats] = useState<{
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    recentOrders: Order[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: "Products",     value: stats.totalProducts,           icon: Package,     color: "text-primary" },
    { label: "Total Orders", value: stats.totalOrders,             icon: ShoppingBag, color: "text-accent" },
    { label: "Revenue",      value: formatPrice(stats.totalRevenue), icon: DollarSign,  color: "text-green-400" },
    { label: "Users",        value: stats.totalUsers,              icon: Users,       color: "text-yellow-400" },
  ] : [];

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold mb-6">Dashboard Overview</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
          : statCards.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="p-4 rounded-lg border border-border bg-card" data-testid={`stat-${s.label.toLowerCase()}`}>
                  <Icon className={`w-5 h-5 mb-2 ${s.color}`} />
                  <div className="text-2xl font-bold leading-none mb-1">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              );
            })}
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Recent Orders</h2>
        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
          </div>
        ) : !stats?.recentOrders.length ? (
          <div className="text-center py-10 border border-dashed border-border rounded-lg">
            <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block rounded-lg border border-border overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Order</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Customer</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Items</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Total</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors" data-testid={`order-row-${order.id}`}>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-xs">{order.userName}</div>
                        <div className="text-xs text-muted-foreground">{order.userEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{order.products.length} item{order.products.length !== 1 ? "s" : ""}</td>
                      <td className="px-4 py-3 font-medium text-xs">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-xs ${statusColors[order.status]}`}>{order.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden space-y-2">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="rounded-lg border border-border bg-card p-3" data-testid={`order-row-${order.id}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-semibold">#{order.id.slice(0,8).toUpperCase()}</span>
                    <Badge variant="outline" className={`text-xs ${statusColors[order.status]}`}>{order.status}</Badge>
                  </div>
                  <div className="text-xs font-medium">{order.userName}</div>
                  <div className="text-xs text-muted-foreground">{order.userEmail}</div>
                  <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">{order.products.length} item{order.products.length !== 1 ? "s" : ""}</span>
                    <span className="text-sm font-semibold text-primary">{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
