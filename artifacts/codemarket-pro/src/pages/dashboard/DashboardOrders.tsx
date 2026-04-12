import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { getOrdersByUser } from "@/lib/firestore";
import { formatPrice } from "@/lib/stripe";
import type { Order } from "@/types";

const statusColors: Record<Order["status"], string> = {
  paid: "bg-green-500/10 text-green-400 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function DashboardOrders() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLocation("/login"); return; }
    getOrdersByUser(user.uid).then(setOrders).finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/dashboard"><ArrowLeft className="w-4 h-4 mr-1.5" />Dashboard</Link>
        </Button>
        <h1 className="text-2xl font-bold mb-8">Order History</h1>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-base font-medium mb-2">No orders yet</h3>
            <Button asChild><Link href="/products">Start Shopping</Link></Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="p-5 rounded-lg border border-border bg-card" data-testid={`order-item-${order.id}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-mono text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</span>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {typeof order.createdAt === "string"
                        ? order.createdAt
                        : order.createdAt instanceof Date
                        ? order.createdAt.toLocaleDateString()
                        : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusColors[order.status]}>
                      {order.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">{order.paymentMethod}</Badge>
                  </div>
                </div>
                <div className="space-y-1 mb-3">
                  {order.products.map((p) => (
                    <div key={p.productId} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{p.productTitle}</span>
                      <span>{formatPrice(p.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border text-sm font-semibold">
                  <span className="text-muted-foreground">{order.products.length} item{order.products.length !== 1 ? "s" : ""}</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
