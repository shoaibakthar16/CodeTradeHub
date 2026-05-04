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
import { trackEvent } from "@/lib/analytics";

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
    trackEvent("checkout_click", {
      source: "cart",
      itemCount: items.length,
      total,
      loggedIn: Boolean(user),
    });
    if (!user) {
      setLocation("/login");
      return;
    }
    setLocation("/checkout");
  };

  const paypalEmail = import.meta.env.VITE_PAYPAL_EMAIL;
  const paypalCartUrl = paypalEmail
    ? `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(paypalEmail)}&item_name=${encodeURIComponent(`CodeTradeHub Order (${items.length} item${items.length > 1 ? "s" : ""})`)}&amount=${total.toFixed(2)}&currency_code=USD&no_shipping=1`
    : null;

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

              {paypalCartUrl && (
                <>
                  <div className="flex items-center gap-2 my-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[11px] text-muted-foreground">or pay with</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <a
                    href={paypalCartUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("paypal_click", { source: "cart", itemCount: items.length, total })}
                    className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all bg-[#FFC439] hover:bg-[#f0b429] text-[#003087] border border-[#FFC439] hover:shadow-md"
                    data-testid="button-paypal-cart"
                  >
                    <svg className="w-14 h-auto" viewBox="0 0 101 32" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#003087" d="M 12.237 2.8 L 4.437 2.8 C 3.937 2.8 3.437 3.2 3.337 3.7 L 0.237 23.7 C 0.137 24.1 0.437 24.4 0.837 24.4 L 4.537 24.4 C 5.037 24.4 5.537 24 5.637 23.5 L 6.437 18.1 C 6.537 17.6 6.937 17.2 7.537 17.2 L 10.037 17.2 C 15.137 17.2 18.137 14.7 18.937 9.8 C 19.237 7.7 18.937 6 17.937 4.8 C 16.837 3.5 14.837 2.8 12.237 2.8 Z M 13.137 10.1 C 12.737 12.9 10.537 12.9 8.537 12.9 L 7.337 12.9 L 8.137 7.7 C 8.137 7.4 8.437 7.2 8.737 7.2 L 9.237 7.2 C 10.637 7.2 11.937 7.2 12.637 8 C 13.137 8.4 13.337 9.1 13.137 10.1 Z"/>
                      <path fill="#003087" d="M 35.437 10 L 31.737 10 C 31.437 10 31.137 10.2 31.137 10.5 L 30.937 11.5 L 30.637 11.1 C 29.737 9.8 27.837 9.4 25.937 9.4 C 21.537 9.4 17.737 12.8 17.037 17.5 C 16.637 19.9 17.237 22.1 18.637 23.6 C 19.937 25 21.737 25.6 23.837 25.6 C 27.337 25.6 29.337 23.4 29.337 23.4 L 29.137 24.4 C 29.037 24.8 29.337 25.1 29.737 25.1 L 33.137 25.1 C 33.637 25.1 34.137 24.7 34.237 24.2 L 36.237 10.7 C 36.337 10.4 36.037 10 35.437 10 Z M 30.437 17.6 C 30.037 19.9 28.237 21.5 25.937 21.5 C 24.737 21.5 23.837 21.1 23.237 20.4 C 22.637 19.7 22.437 18.7 22.637 17.6 C 23.037 15.3 24.837 13.7 27.137 13.7 C 28.337 13.7 29.237 14.1 29.837 14.8 C 30.437 15.5 30.637 16.5 30.437 17.6 Z"/>
                      <path fill="#003087" d="M 55.337 10 L 51.637 10 C 51.237 10 50.937 10.2 50.737 10.5 L 45.537 18.1 L 43.337 10.8 C 43.137 10.3 42.737 10 42.237 10 L 38.637 10 C 38.237 10 37.937 10.4 38.037 10.8 L 42.237 23.6 L 38.337 29 C 38.037 29.4 38.337 30 38.837 30 L 42.537 30 C 42.937 30 43.237 29.8 43.437 29.5 L 55.937 10.9 C 56.137 10.5 55.837 10 55.337 10 Z"/>
                      <path fill="#009cde" d="M 67.737 2.8 L 59.937 2.8 C 59.437 2.8 58.937 3.2 58.837 3.7 L 55.737 23.7 C 55.637 24.1 55.937 24.4 56.337 24.4 L 60.337 24.4 C 60.737 24.4 61.037 24.1 61.037 23.8 L 61.937 18.1 C 62.037 17.6 62.437 17.2 63.037 17.2 L 65.537 17.2 C 70.637 17.2 73.637 14.7 74.437 9.8 C 74.737 7.7 74.437 6 73.437 4.8 C 72.237 3.5 70.237 2.8 67.737 2.8 Z M 68.637 10.1 C 68.237 12.9 66.037 12.9 64.037 12.9 L 62.837 12.9 L 63.637 7.7 C 63.637 7.4 63.937 7.2 64.237 7.2 L 64.737 7.2 C 66.137 7.2 67.437 7.2 68.137 8 C 68.637 8.4 68.837 9.1 68.637 10.1 Z"/>
                      <path fill="#009cde" d="M 90.937 10 L 87.237 10 C 86.937 10 86.637 10.2 86.637 10.5 L 86.437 11.5 L 86.137 11.1 C 85.237 9.8 83.337 9.4 81.437 9.4 C 77.037 9.4 73.237 12.8 72.537 17.5 C 72.137 19.9 72.737 22.1 74.137 23.6 C 75.437 25 77.237 25.6 79.337 25.6 C 82.837 25.6 84.837 23.4 84.837 23.4 L 84.637 24.4 C 84.537 24.8 84.837 25.1 85.237 25.1 L 88.637 25.1 C 89.137 25.1 89.637 24.7 89.737 24.2 L 91.737 10.7 C 91.837 10.4 91.437 10 90.937 10 Z M 85.837 17.6 C 85.437 19.9 83.637 21.5 81.337 21.5 C 80.137 21.5 79.237 21.1 78.637 20.4 C 78.037 19.7 77.837 18.7 78.037 17.6 C 78.437 15.3 80.237 13.7 82.537 13.7 C 83.737 13.7 84.637 14.1 85.237 14.8 C 85.937 15.5 86.037 16.5 85.837 17.6 Z"/>
                      <path fill="#009cde" d="M 95.337 3.3 L 92.137 23.7 C 92.037 24.1 92.337 24.4 92.737 24.4 L 95.937 24.4 C 96.437 24.4 96.937 24 97.037 23.5 L 100.137 3.5 C 100.237 3.1 99.937 2.8 99.537 2.8 L 95.937 2.8 C 95.637 2.8 95.437 3 95.337 3.3 Z"/>
                    </svg>
                    <span>Pay Now</span>
                  </a>
                </>
              )}

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
