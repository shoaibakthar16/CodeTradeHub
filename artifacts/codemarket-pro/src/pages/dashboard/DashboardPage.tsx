import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Download, Package, ShoppingBag, User, ExternalLink, AlertTriangle, Heart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { getPurchasedProductIds, getProductById } from "@/lib/firestore";
import { formatPrice } from "@/lib/stripe";
import type { Product } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [permError, setPermError] = useState(false);

  useEffect(() => {
    if (!user) { setLocation("/login"); return; }
    getPurchasedProductIds(user.uid).then(async (ids) => {
      const fetched = await Promise.all(ids.map((id) => getProductById(id)));
      setProducts(fetched.filter(Boolean) as Product[]);
    }).catch((err) => {
      if (err?.code === "permission-denied") setPermError(true);
    }).finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Firestore rules error */}
        {permError && (
          <div className="mb-6 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-400 mb-1">Firestore security rules need updating</p>
              <p className="text-yellow-400/80 mb-2">Your Firebase project is blocking reads. Paste these rules in Firebase Console → Firestore → Rules:</p>
              <pre className="text-xs font-mono bg-black/30 rounded p-3 text-yellow-300 overflow-x-auto whitespace-pre">{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{id} {
      allow read: if resource.data.published == true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /orders/{id} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow update: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /reviews/{id} {
      allow read: if resource.data.approved == true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /coupons/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}`}</pre>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold">My Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Welcome back, {user.displayName || "User"}</p>
            </div>
          </div>
          {/* Tab nav — scrolls horizontally on small screens */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Button variant="outline" size="sm" className="shrink-0" asChild>
              <Link href="/dashboard/orders"><ShoppingBag className="w-4 h-4 mr-1.5" />Orders</Link>
            </Button>
            <Button variant="outline" size="sm" className="shrink-0" asChild>
              <Link href="/dashboard/downloads"><Download className="w-4 h-4 mr-1.5" />Downloads</Link>
            </Button>
            <Button variant="outline" size="sm" className="shrink-0" asChild>
              <Link href="/dashboard/wishlist">
                <Heart className="w-4 h-4 mr-1.5 text-rose-400" />
                Wishlist
                {wishlistCount > 0 && (
                  <span className="ml-1.5 text-xs bg-rose-500 text-white rounded-full px-1.5 py-0.5 leading-none">{wishlistCount}</span>
                )}
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="rounded-lg border border-border bg-card p-4">
            <Package className="w-4 h-4 text-muted-foreground mb-2" />
            <div className="font-bold text-xl">{products.length}</div>
            <div className="text-xs text-muted-foreground">Purchased Products</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 min-w-0">
            <User className="w-4 h-4 text-muted-foreground mb-2" />
            <div className="font-bold text-sm truncate" title={user.email || ""}>{user.email || "-"}</div>
            <div className="text-xs text-muted-foreground">Email</div>
          </div>
        </div>

        {/* Purchased products */}
        <h2 className="text-lg font-semibold mb-4">Your Products</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-base font-medium mb-2">No purchases yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Browse our products and make your first purchase.</p>
            <Button asChild><Link href="/products">Browse Products</Link></Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card" data-testid={`dashboard-product-${p.id}`}>
                <div className="w-16 h-12 rounded overflow-hidden bg-muted shrink-0">
                  {p.thumbnail ? (
                    <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-mono text-xs text-muted-foreground">&lt;/&gt;</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs font-mono">v{p.version}</Badge>
                    <span className="text-xs text-muted-foreground">{formatPrice(p.price)}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {p.fileUrl && (
                    <Button size="sm" variant="default" className="h-8 text-xs gap-1" asChild data-testid={`button-download-${p.id}`}>
                      <a href={p.fileUrl} target="_blank" rel="noopener noreferrer" download>
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </Button>
                  )}
                  {p.demoUrl && (
                    <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                      <a href={p.demoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  )}
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
