import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Download, ArrowLeft, Package, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { getPurchasedProductIds, getProductById } from "@/lib/firestore";
import type { Product } from "@/types";

export default function DashboardDownloads() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLocation("/login"); return; }
    getPurchasedProductIds(user.uid).then(async (ids) => {
      const fetched = await Promise.all(ids.map((id) => getProductById(id)));
      setProducts(fetched.filter(Boolean) as Product[]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/dashboard"><ArrowLeft className="w-4 h-4 mr-1.5" />Dashboard</Link>
        </Button>
        <h1 className="text-2xl font-bold mb-8">My Downloads</h1>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <Download className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-base font-medium mb-2">No downloads available</h3>
            <p className="text-sm text-muted-foreground mb-4">Purchase products to access their source files.</p>
            <Button asChild><Link href="/products">Browse Products</Link></Button>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.id} className="p-4 rounded-lg border border-border bg-card" data-testid={`download-item-${p.id}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-9 rounded overflow-hidden bg-muted shrink-0">
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.title}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <Badge variant="secondary" className="text-xs font-mono">v{p.version}</Badge>
                      {p.fileName && <span className="text-xs text-muted-foreground font-mono truncate max-w-[160px]">{p.fileName}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {p.docsUrl && (
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1 flex-1 sm:flex-none" asChild>
                      <a href={p.docsUrl} target="_blank" rel="noopener noreferrer">
                        Docs <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  )}
                  {p.fileUrl ? (
                    <Button size="sm" className="h-8 text-xs gap-1.5 flex-1 sm:flex-none" asChild data-testid={`button-download-file-${p.id}`}>
                      <a href={p.fileUrl} target="_blank" rel="noopener noreferrer" download={p.fileName}>
                        <Download className="w-3.5 h-3.5" /> Download ZIP
                      </a>
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" className="h-8 text-xs flex-1 sm:flex-none" disabled>
                      File not available
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
