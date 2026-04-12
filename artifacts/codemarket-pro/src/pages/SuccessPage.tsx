import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle, Download, ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getOrderById } from "@/lib/firestore";
import { formatPrice } from "@/lib/stripe";
import type { Order } from "@/types";

export default function SuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const orderId = new URLSearchParams(window.location.search).get("orderId");

  useEffect(() => {
    if (orderId) {
      getOrderById(orderId)
        .then(setOrder)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Payment Successful</h1>
          <p className="text-muted-foreground mb-8">
            Your order has been confirmed. You can now access your purchased source code from your dashboard.
          </p>

          {loading ? (
            <div className="rounded-lg border border-border bg-card p-5 mb-6 text-left space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ) : order ? (
            <div className="rounded-lg border border-border bg-card p-5 mb-6 text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-muted-foreground">Order ID</span>
                <span className="text-xs font-mono">{order.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="space-y-2 mb-4">
                {order.products.map((p) => (
                  <div key={p.productId} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{p.productTitle}</span>
                    </div>
                    <span className="font-medium">{formatPrice(p.price)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-border pt-3">
                <span>Total paid</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild data-testid="button-go-dashboard">
              <Link href="/dashboard/downloads">
                <Download className="w-4 h-4 mr-2" />
                Download Files
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">
                Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
