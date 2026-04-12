import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Code2, Layers, Smartphone, ShoppingBag, Zap, Shield, Flame, Clock, Star, Quote, Globe, BookOpen, Store, Puzzle } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/store/ProductCard";
import { getProducts } from "@/lib/firestore";
import type { Product } from "@/types";

const CATEGORIES = [
  { label: "Website Templates", slug: "templates", icon: Layers, color: "text-violet-400" },
  { label: "SaaS Starter Kits", slug: "saas", icon: Zap, color: "text-yellow-400" },
  { label: "Mobile Apps", slug: "mobile", icon: Smartphone, color: "text-cyan-400" },
  { label: "Admin Panels", slug: "admin-panels", icon: Shield, color: "text-green-400" },
  { label: "E-Commerce", slug: "ecommerce", icon: ShoppingBag, color: "text-pink-400" },
  { label: "Full-Stack Apps", slug: "fullstack", icon: Code2, color: "text-orange-400" },
  { label: "WordPress Plugins", slug: "wordpress", icon: Globe, color: "text-blue-400" },
  { label: "Blogger Templates", slug: "blogger", icon: BookOpen, color: "text-orange-300" },
  { label: "Shopify Templates", slug: "shopify", icon: Store, color: "text-green-300" },
  { label: "Browser Extensions", slug: "extensions", icon: Puzzle, color: "text-rose-400" },
];

function SectionHeader({ title, icon: Icon, href, color }: { title: string; icon: React.ElementType; href: string; color?: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2.5">
        <div className={`p-1.5 rounded-md bg-white/5 ${color || "text-primary"}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
        <Link href={href}>
          View all <ArrowRight className="ml-1 w-3.5 h-3.5" />
        </Link>
      </Button>
    </div>
  );
}

function ProductRow({ products, loading }: { products: Product[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (products.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ publishedOnly: true })
      .then(setAllProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const latest = allProducts.slice(0, 8);
  const byCategory = CATEGORIES.map((cat) => ({
    ...cat,
    products: allProducts.filter((p) => p.category === cat.slug).slice(0, 4),
  })).filter((cat) => loading || cat.products.length > 0);

  const hasAnyProducts = allProducts.length > 0;

  const featured = allProducts.filter((p) => p.featured).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
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

      {/* Category Tiles */}
      <section className="py-14 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-1.5 rounded-md bg-white/5 text-primary">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold">Browse by Category</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const count = allProducts.filter((p) => p.category === cat.slug).length;
              return (
                <Link key={cat.slug} href={`/products?category=${cat.slug}`}>
                  <div
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
                    data-testid={`link-category-${cat.slug}`}
                  >
                    <Icon className={`w-6 h-6 ${cat.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors font-medium leading-tight">
                      {cat.label}
                    </span>
                    {count > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        {count}
                      </Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-14 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Latest Products" icon={Clock} href="/products" />
          {loading || hasAnyProducts ? (
            <ProductRow products={latest} loading={loading} />
          ) : (
            <div className="text-center py-20 border border-dashed border-border rounded-xl">
              <Code2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-base font-medium mb-2">No products yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Admin can add products from the admin panel.</p>
              <Button variant="outline" asChild>
                <Link href="/admin/products">Go to Admin</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Popular This Week */}
      {(loading || hasAnyProducts) && (
        <section className="py-14 border-b border-border bg-card/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader title="Most Popular" icon={Flame} href="/products" color="text-orange-400" />
            <ProductRow
              products={[...allProducts].sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0)).slice(0, 4)}
              loading={loading}
            />
          </div>
        </section>
      )}

      {/* Per-Category Sections */}
      {byCategory.map((cat, idx) => (
        <section
          key={cat.slug}
          className={`py-14 border-b border-border ${idx % 2 === 0 ? "" : "bg-card/20"}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title={cat.label}
              icon={cat.icon}
              href={`/products?category=${cat.slug}`}
              color={cat.color}
            />
            <ProductRow products={cat.products} loading={loading} />
          </div>
        </section>
      ))}

      {/* Featured Products */}
      {(loading || featured.length > 0) && (
        <section className="py-14 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader title="Featured Products" icon={Star} href="/products" color="text-amber-400" />
            <ProductRow products={featured} loading={loading} />
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 border-b border-border bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold mb-2">Loved by Developers</h2>
            <p className="text-sm text-muted-foreground">See what builders are saying about CodeTradeHub</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Ahmad R.", role: "Full-Stack Developer", text: "Saved me 3 weeks of work. The SaaS kit had everything — auth, payments, admin panel — all production-ready.", stars: 5 },
              { name: "Priya M.", role: "Indie Hacker", text: "I launched my SaaS in 4 days using a template from CodeTradeHub. The code quality is seriously impressive.", stars: 5 },
              { name: "James T.", role: "Freelance Dev", text: "My clients love the polished UIs. I deliver projects in half the time now. Best investment I've made this year.", stars: 5 },
            ].map((t) => (
              <div key={t.name} className="p-5 rounded-xl border border-border bg-card">
                <Quote className="w-6 h-6 text-primary/30 mb-3" />
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to build faster?</h2>
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
