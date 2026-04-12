import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, SlidersHorizontal, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/store/ProductCard";
import { getProducts } from "@/lib/firestore";
import type { Product } from "@/types";

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Templates", value: "templates" },
  { label: "SaaS Kits", value: "saas" },
  { label: "Mobile Apps", value: "mobile" },
  { label: "Admin Panels", value: "admin-panels" },
  { label: "E-Commerce", value: "ecommerce" },
  { label: "Full-Stack", value: "fullstack" },
];

export default function ProductsPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    getProducts({ publishedOnly: true })
      .then(setAllProducts)
      .finally(() => setLoading(false));
  }, []);

  const filtered = allProducts
    .filter((p) => {
      const matchCat = category === "all" || p.category === category;
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <div className="border-b border-border bg-card/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-1">Source Code Products</h1>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${filtered.length} product${filtered.length !== 1 ? "s" : ""} available`}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full sm:w-40" data-testid="select-sort">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                data-testid={`filter-category-${cat.value}`}
              >
                <Badge
                  variant={category === cat.value ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  {cat.label}
                </Badge>
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-border rounded-xl">
              <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-base font-medium mb-2">No products found</h3>
              <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters.</p>
              <Button variant="outline" onClick={() => { setSearch(""); setCategory("all"); }}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
