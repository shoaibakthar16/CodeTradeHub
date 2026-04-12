import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Download, ArrowRight, Package, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getOrderById } from "@/lib/firestore";
import { formatPrice } from "@/lib/stripe";
import type { Order } from "@/types";

// Confetti particle
function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#6d5aed", "#00d4ff", "#f59e0b", "#10b981", "#f43f5e", "#a78bfa"];
    const particles: {
      x: number; y: number; vx: number; vy: number;
      color: string; size: number; rotation: number; vr: number; opacity: number;
    }[] = [];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 8,
        opacity: 1,
      });
    }

    let raf: number;
    let frame = 0;
    function animate() {
      frame++;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;
        p.vy += 0.05;
        if (frame > 120) p.opacity = Math.max(0, p.opacity - 0.012);
        ctx!.save();
        ctx!.globalAlpha = p.opacity;
        ctx!.translate(p.x, p.y);
        ctx!.rotate((p.rotation * Math.PI) / 180);
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx!.restore();
      });
      if (particles.some((p) => p.opacity > 0)) {
        raf = requestAnimationFrame(animate);
      }
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}

function AnimatedCheck() {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    setTimeout(() => setChecked(true), 500);
  }, []);

  const circumference = 2 * Math.PI * 36;

  return (
    <div className={`relative w-24 h-24 mx-auto mb-6 transition-all duration-500 ${visible ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="36" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
        <circle
          cx="48" cy="48" r="36" fill="none"
          stroke="hsl(var(--primary))" strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={checked ? 0 : circumference}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.65, 0, 0.35, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="0 0 24 24" fill="none"
          className="w-10 h-10"
          stroke="hsl(var(--primary))" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path
            d="M5 13l4 4L19 7"
            strokeDasharray="24"
            strokeDashoffset={checked ? 0 : 24}
            style={{ transition: "stroke-dashoffset 0.5s ease 0.7s" }}
          />
        </svg>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const orderId = new URLSearchParams(window.location.search).get("orderId");

  useEffect(() => {
    const load = async () => {
      if (orderId) {
        try {
          const o = await getOrderById(orderId);
          setOrder(o);
        } catch { /* ignore */ }
      }
      setLoading(false);
    };
    load();
    setTimeout(() => setContentVisible(true), 300);
  }, [orderId]);

  return (
    <>
      <Confetti />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-16 px-4">
          <div
            className={`max-w-lg w-full text-center transition-all duration-700 ${
              contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <AnimatedCheck />

            {/* Stars decoration */}
            <div className="flex items-center justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                Payment Successful!
              </h1>
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-muted-foreground mb-8">
              Your order is confirmed. Download your source code from the dashboard anytime.
            </p>

            {/* Order card */}
            {loading ? (
              <div className="rounded-xl border border-border bg-card p-5 mb-6 text-left space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ) : order ? (
              <div
                className="rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-5 mb-6 text-left"
                style={{ animationDelay: "400ms" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-muted-foreground">Order ID</span>
                  <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2.5 mb-4">
                  {order.products.map((p) => (
                    <div key={p.productId} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center shrink-0">
                          <Package className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="font-medium">{p.productTitle}</span>
                      </div>
                      <span className="font-semibold text-primary">{formatPrice(p.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-border pt-3">
                  <span>Total paid</span>
                  <span className="text-primary">{formatPrice(order.total)}</span>
                </div>

                <div className="mt-4 flex items-center gap-2 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">Payment verified · Test Mode</span>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild data-testid="button-go-dashboard" className="gap-2">
                <Link href="/dashboard/downloads">
                  <Download className="w-4 h-4" />
                  Download Files
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="gap-2">
                <Link href="/products">
                  Continue Shopping <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              A confirmation receipt has been saved to your dashboard.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
