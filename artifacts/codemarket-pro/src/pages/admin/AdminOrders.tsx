import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layout/AdminLayout";
import { getAllOrders, updateOrderStatus } from "@/lib/firestore";
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

export default function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAllOrders().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleStatusChange = async (id: string, status: Order["status"]) => {
    await updateOrderStatus(id, status);
    toast({ title: "Order updated" });
    load();
  };

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold mb-6">Orders</h1>

      {loading ? (
        <div className="space-y-2">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-16 rounded-lg"/>)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <>
          {/* ── Desktop table ── */}
          <div className="hidden sm:block rounded-lg border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Order</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Customer</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Products</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Total</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Method</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors" data-testid={`admin-order-row-${o.id}`}>
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-muted-foreground">#{o.id.slice(0,8).toUpperCase()}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{formatDate(o.createdAt)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-xs">{o.userName}</div>
                      <div className="text-xs text-muted-foreground">{o.userEmail}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {o.products.map((p) => (
                          <div key={p.productId} className="text-xs text-muted-foreground truncate max-w-32">{p.productTitle}</div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-xs">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs capitalize">{o.paymentMethod}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Select value={o.status} onValueChange={(v) => handleStatusChange(o.id, v as Order["status"])}>
                        <SelectTrigger className={`h-7 text-xs w-28 border ${statusColors[o.status]}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile card list ── */}
          <div className="sm:hidden space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="rounded-lg border border-border bg-card p-3" data-testid={`admin-order-row-${o.id}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="font-mono text-xs font-semibold">#{o.id.slice(0,8).toUpperCase()}</span>
                    <span className="text-xs text-muted-foreground ml-2">{formatDate(o.createdAt)}</span>
                  </div>
                  <Select value={o.status} onValueChange={(v) => handleStatusChange(o.id, v as Order["status"])}>
                    <SelectTrigger className={`h-7 text-xs w-28 border ${statusColors[o.status]}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-xs font-medium">{o.userName}</div>
                <div className="text-xs text-muted-foreground mb-2">{o.userEmail}</div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">
                    {o.products.length} item{o.products.length !== 1 ? "s" : ""} · <Badge variant="outline" className="text-xs capitalize">{o.paymentMethod}</Badge>
                  </div>
                  <span className="text-sm font-semibold text-primary">{formatPrice(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
