import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Code2, Layers, Smartphone, ShoppingBag, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/store/ProductCard";
import { getProducts } from "@/lib/firestore";
import type { Product } from "@/types";

const categories = [
  { label: "Website Templates", slug: "templates", icon: Layers },
  { label: "SaaS Starter Kits", slug: "saas", icon: Zap },
  { label: "Mobile Apps", slug: "mobile", icon: Smartphone },
  { label: "Admin Panels", slug: "admin-panels", icon: Shield },
  { label: "E-Commerce", slug: "ecommerce", icon: ShoppingBag },
  { label: "Full-Stack Apps", slug: "fullstack", icon: Code2 },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ publishedOnly: true, limitCount: 8 })
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono text-primary">Premium Source Code Marketplace</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
              Buy & Sell{" "}
              <span className="text-primary">Source Code</span>{" "}
              for Your Next Project
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              Skip the weeks of boilerplate. Get production-ready website templates, SaaS kits, and full app source code — built by developers, for developers.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" asChild data-testid="button-browse-products">
                <Link href="/products">
                  Browse Products <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Start Selling</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 mt-10">
              {[
                { value: "100+", label: "Source Files" },
                { value: "50+", label: "Categories" },
                { value: "Test Mode", label: "Secure Payments" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-bold text-lg">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.slug} href={`/products?category=${cat.slug}`}>
                  <div
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
                    data-testid={`link-category-${cat.slug}`}
                  >
                    <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                      {cat.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold">Latest Products</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/products">
                View all <ArrowRight className="ml-1 w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-border rounded-xl">
              <Code2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-base font-medium mb-2">No products yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Admin can add products from the admin panel.</p>
              <Button variant="outline" asChild>
                <Link href="/admin/products">Go to Admin</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border bg-card/30">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to build faster?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of developers who save weeks of work by buying production-ready source code from CodeTradeHub.
          </p>
          <Button size="lg" asChild>
            <Link href="/products">
              Explore All Products <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
