import { useState } from "react";
import { Link, useLocation } from "wouter";
import { CreditCard, MessageCircle, Lock, TestTube, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { createOrder } from "@/lib/firestore";
import { formatPrice } from "@/lib/stripe";

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { items, total, subtotal, discountAmount, couponCode, clearCart, itemCount } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [paying, setPaying] = useState(false);

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (itemCount === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-16">
            <ShoppingBag className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">No items to checkout</h2>
            <Button asChild><Link href="/products">Browse Products</Link></Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const whatsappMsg = encodeURIComponent(
    `Hi! I'd like to purchase:\n${items.map((i) => `- ${i.product.title} ($${i.product.price})`).join("\n")}\n\nTotal: $${total.toFixed(2)}`
  );
  const whatsappUrl = `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}?text=${whatsappMsg}`;

  const handleStripeCheckout = async () => {
    setPaying(true);
    try {
      const orderId = await createOrder({
        userId: user.uid,
        userEmail: user.email!,
        userName: user.displayName || "User",
        products: items.map((i) => ({
          productId: i.product.id,
          productTitle: i.product.title,
          productSlug: i.product.slug,
          price: i.product.price,
          thumbnail: i.product.thumbnail,
        })),
        total,
        status: "paid",
        paymentMethod: "stripe",
        couponCode: couponCode || undefined,
        discountAmount: discountAmount || undefined,
      });
      clearCart();
      setLocation(`/success?orderId=${orderId}`);
    } catch {
      toast({ title: "Payment failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setPaying(false);
    }
  };

  const handleWhatsApp = async () => {
    try {
      await createOrder({
        userId: user.uid,
        userEmail: user.email!,
        userName: user.displayName || "User",
        products: items.map((i) => ({
          productId: i.product.id,
          productTitle: i.product.title,
          productSlug: i.product.slug,
          price: i.product.price,
          thumbnail: i.product.thumbnail,
        })),
        total,
        status: "pending",
        paymentMethod: "whatsapp",
        couponCode: couponCode || undefined,
        discountAmount: discountAmount || undefined,
      });
      window.open(whatsappUrl, "_blank");
      toast({ title: "WhatsApp opened", description: "Your order has been saved. Complete payment via WhatsApp." });
    } catch {
      window.open(whatsappUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/cart">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Cart
          </Link>
        </Button>
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Payment options */}
          <div className="lg:col-span-3 space-y-4">
            {/* Stripe Test Mode */}
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Pay with Card
                  </CardTitle>
                  <Badge variant="outline" className="text-xs border-yellow-500/40 text-yellow-400 bg-yellow-500/10">
                    <TestTube className="w-3 h-3 mr-1" /> Test Mode
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-400">
                  This is test mode. No real charge will occur. Full Stripe integration will be enabled soon.
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["Visa", "Mastercard", "Amex"].map((brand) => (
                    <div key={brand} className="h-10 rounded border border-border bg-muted/50 flex items-center justify-center">
                      <span className="text-xs font-mono text-muted-foreground">{brand}</span>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleStripeCheckout}
                  disabled={paying}
                  data-testid="button-pay-stripe"
                >
                  <Lock className="w-4 h-4" />
                  {paying ? "Processing..." : `Pay ${formatPrice(total)} (Test)`}
                </Button>
              </CardContent>
            </Card>

            {/* WhatsApp */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-400" />
                  Pay via WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Contact us on WhatsApp to arrange manual payment. Your order will be saved as pending and unlocked after confirmation.
                </p>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-green-500/30 hover:bg-green-500/10 hover:text-green-400"
                  onClick={handleWhatsApp}
                  data-testid="button-whatsapp"
                >
                  <MessageCircle className="w-4 h-4" />
                  Order via WhatsApp
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <Card className="sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <div className="w-10 h-8 rounded bg-muted overflow-hidden shrink-0">
                        {item.product.thumbnail ? (
                          <img src={item.product.thumbnail} alt={item.product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[10px] font-mono text-muted-foreground">&lt;/&gt;</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.product.title}</p>
                      </div>
                      <span className="text-xs font-semibold shrink-0">{formatPrice(item.product.price)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="mb-3" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>Discount ({couponCode})</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span data-testid="text-checkout-total">{formatPrice(total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
