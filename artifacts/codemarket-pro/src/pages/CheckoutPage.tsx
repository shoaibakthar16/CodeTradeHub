import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { CreditCard, MessageCircle, Lock, TestTube, ArrowLeft, ShoppingBag, Check, Loader2 } from "lucide-react";
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

const STEPS = [
  { label: "Validating order", duration: 700 },
  { label: "Processing payment", duration: 1200 },
  { label: "Confirming with bank", duration: 900 },
  { label: "Creating your order", duration: 600 },
];

function PaymentProcessing({ onDone }: { onDone: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let idx = 0;
    function runStep() {
      if (idx >= STEPS.length) { onDone(); return; }
      const delay = STEPS[idx].duration;
      setCurrentStep(idx);
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, idx]);
        idx++;
        setTimeout(runStep, 150);
      }, delay);
    }
    runStep();
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center">
      <div className="max-w-sm w-full mx-4">
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke="hsl(var(--primary))" strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - (completedSteps.length / STEPS.length))}`}
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-primary" />
            </div>
          </div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Secure Payment Processing</p>
        </div>

        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const done = completedSteps.includes(i);
            const active = currentStep === i && !done;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-300 ${
                  done
                    ? "border-primary/30 bg-primary/5"
                    : active
                    ? "border-border bg-card"
                    : "border-transparent opacity-40"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  done ? "bg-primary text-primary-foreground" : active ? "border-2 border-primary" : "border border-border"
                }`}>
                  {done ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : active ? (
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                  ) : null}
                </div>
                <span className={`text-sm ${done ? "text-foreground font-medium" : active ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
                {done && <Check className="w-3.5 h-3.5 text-primary ml-auto" />}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          🔒 256-bit SSL encrypted — Test Mode
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { items, total, subtotal, discountAmount, couponCode, clearCart, itemCount } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [paying, setPaying] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) setLocation("/login");
  }, [user, setLocation]);

  if (!user) return null;

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
      const orderData: Parameters<typeof createOrder>[0] = {
        userId: user.uid,
        userEmail: user.email!,
        userName: user.displayName || "User",
        products: items.map((i) => ({
          productId: i.product.id,
          productTitle: i.product.title,
          productSlug: i.product.slug,
          price: i.product.price,
          thumbnail: i.product.thumbnail || "",
        })),
        total,
        status: "paid",
        paymentMethod: "stripe",
      };
      if (couponCode) orderData.couponCode = couponCode;
      if (discountAmount) orderData.discountAmount = discountAmount;
      const orderId = await createOrder(orderData);
      clearCart();
      setPendingOrderId(orderId);
      setShowProcessing(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      console.error("Checkout error:", err);
      toast({ title: "Payment failed", description: msg, variant: "destructive" });
      setPaying(false);
    }
  };

  const handleProcessingDone = () => {
    setShowProcessing(false);
    setLocation(`/success?orderId=${pendingOrderId}`);
  };

  const handleWhatsApp = async () => {
    try {
      const waOrderData: Parameters<typeof createOrder>[0] = {
        userId: user.uid,
        userEmail: user.email!,
        userName: user.displayName || "User",
        products: items.map((i) => ({
          productId: i.product.id,
          productTitle: i.product.title,
          productSlug: i.product.slug,
          price: i.product.price,
          thumbnail: i.product.thumbnail || "",
        })),
        total,
        status: "pending",
        paymentMethod: "whatsapp",
      };
      if (couponCode) waOrderData.couponCode = couponCode;
      if (discountAmount) waOrderData.discountAmount = discountAmount;
      await createOrder(waOrderData);
      window.open(whatsappUrl, "_blank");
      toast({ title: "WhatsApp opened", description: "Your order has been saved. Complete payment via WhatsApp." });
    } catch {
      window.open(whatsappUrl, "_blank");
    }
  };

  return (
    <>
      {showProcessing && <PaymentProcessing onDone={handleProcessingDone} />}
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
            <div className="lg:col-span-3 space-y-4">
              {/* Stripe Test Mode Card */}
              <Card className="border-primary/30 shadow-lg shadow-primary/5">
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
                  <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-400 font-mono">
                    ⚡ Test mode active — no real charge will occur. Order is created instantly.
                  </div>

                  {/* Mock card input fields */}
                  <div className="space-y-2.5">
                    <div className="flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm font-mono text-muted-foreground">4242 4242 4242 4242</span>
                      <Badge className="ml-auto text-[10px] h-4 px-1.5 bg-primary/20 text-primary border-0">Test card</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex h-10 rounded-md border border-border bg-muted/40 px-3 items-center">
                        <span className="text-sm font-mono text-muted-foreground">12 / 26</span>
                      </div>
                      <div className="flex h-10 rounded-md border border-border bg-muted/40 px-3 items-center">
                        <span className="text-sm font-mono text-muted-foreground">123</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {["Visa", "Mastercard", "Amex"].map((brand) => (
                      <div key={brand} className="h-9 rounded-md border border-border bg-muted/30 flex items-center justify-center">
                        <span className="text-xs font-mono text-muted-foreground">{brand}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full gap-2 h-12 text-base font-semibold"
                    size="lg"
                    onClick={handleStripeCheckout}
                    disabled={paying}
                    data-testid="button-pay-stripe"
                  >
                    <Lock className="w-4 h-4" />
                    {paying ? "Creating order…" : `Pay ${formatPrice(total)} — Test Mode`}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    🔒 Secured by Stripe · SSL Encrypted
                  </p>
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
    </>
  );
}
