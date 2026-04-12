import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Trash2, ShoppingCart, Tag, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { getCouponByCode } from "@/lib/firestore";
import { formatPrice } from "@/lib/stripe";

export default function CartPage() {
  const { items, removeItem, subtotal, total, discountAmount, couponCode, setCoupon, clearCoupon } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const coupon = await getCouponByCode(couponInput.trim());
      if (!coupon || !coupon.active) {
        toast({ title: "Invalid coupon", description: "This coupon code is not valid.", variant: "destructive" });
        return;
      }
      if (coupon.usedCount >= coupon.maxUses) {
        toast({ title: "Coupon expired", description: "This coupon has reached its usage limit.", variant: "destructive" });
        return;
      }
      const discount =
        coupon.discountType === "percentage"
          ? subtotal * (coupon.discountValue / 100)
          : Math.min(coupon.discountValue, subtotal);
      setCoupon(coupon.code, discount);
      toast({ title: "Coupon applied!", description: `${formatPrice(discount)} discount applied.` });
    } catch {
      toast({ title: "Error", description: "Failed to apply coupon.", variant: "destructive" });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    setLocation("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-sm text-muted-foreground mb-6">Browse our products and add some to your cart.</p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card"
                data-testid={`cart-item-${item.product.id}`}
              >
                <div className="w-16 h-12 rounded overflow-hidden bg-muted shrink-0">
                  {item.product.thumbnail ? (
                    <img src={item.product.thumbnail} alt={item.product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-mono text-xs text-muted-foreground">&lt;/&gt;</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug}`}>
                    <p className="font-medium text-sm hover:text-primary truncate transition-colors">
                      {item.product.title}
                    </p>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.product.category}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-semibold" data-testid={`text-item-price-${item.product.id}`}>
                    {formatPrice(item.product.price)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.product.id)}
                    data-testid={`button-remove-${item.product.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="rounded-lg border border-border bg-card p-5 sticky top-20">
              <h2 className="font-semibold mb-4">Order Summary</h2>

              {/* Coupon */}
              {couponCode ? (
                <div className="flex items-center justify-between mb-4 p-2.5 rounded bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-mono font-medium">{couponCode}</span>
                  </div>
                  <button onClick={clearCoupon} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Coupon code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="font-mono text-sm"
                    data-testid="input-coupon"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    data-testid="button-apply-coupon"
                  >
                    Apply
                  </Button>
                </div>
              )}

              <Separator className="mb-4" />
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
              </div>
              <Separator className="mb-4" />
              <div className="flex justify-between font-bold mb-5">
                <span>Total</span>
                <span data-testid="text-cart-total">{formatPrice(total)}</span>
              </div>
              <Button className="w-full gap-2" onClick={handleCheckout} data-testid="button-checkout">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-3">
                Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
