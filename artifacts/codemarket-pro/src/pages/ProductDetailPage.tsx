import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import {
  ExternalLink, Star, ShoppingCart, Check, MessageCircle, ChevronLeft,
  Code2, Download, FileCode, BookOpen, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getProductBySlug, getReviewsByProduct, createReview } from "@/lib/firestore";
import { formatPrice } from "@/lib/stripe";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Product, Review } from "@/types";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const { addItem, isInCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!params.slug) return;
    Promise.all([
      getProductBySlug(params.slug),
      // reviews loaded after product
    ])
      .then(([p]) => {
        setProduct(p);
        if (p) {
          getReviewsByProduct(p.id).then(setReviews);
        }
      })
      .finally(() => setLoading(false));
  }, [params.slug]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    setSubmittingReview(true);
    try {
      await createReview({
        productId: product.id,
        productTitle: product.title,
        userId: user.uid,
        userName: user.displayName || "User",
        userPhoto: user.photoURL || undefined,
        rating: reviewRating,
        comment: reviewComment,
        approved: false,
      });
      toast({ title: "Review submitted", description: "Your review is pending approval." });
      setReviewComment("");
      setReviewRating(5);
    } catch {
      toast({ title: "Error", description: "Failed to submit review.", variant: "destructive" });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <Skeleton className="aspect-video w-full rounded-xl mb-4" />
              <Skeleton className="h-8 w-2/3 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-16">
            <Code2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Product not found</h2>
            <Button asChild><Link href="/products">Browse Products</Link></Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const allImages = [product.thumbnail, ...(product.previewImages || [])].filter(Boolean);
  const inCart = isInCart(product.id);
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null;

  const whatsappMsg = encodeURIComponent(
    `Hi! I'm interested in purchasing:\n${product.title}\nPrice: ${formatPrice(product.price)}\n${product.demoUrl ? `Demo: ${product.demoUrl}` : ""}`
  );
  const whatsappUrl = `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}?text=${whatsappMsg}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-foreground">Products</Link>
          <span>/</span>
          <span className="text-foreground">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Gallery */}
            <div className="mb-6">
              <div className="aspect-video rounded-xl overflow-hidden border border-border bg-muted mb-3">
                {allImages[selectedImage] ? (
                  <img src={allImages[selectedImage]} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-mono text-6xl text-muted-foreground/20">&lt;/&gt;</span>
                  </div>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`shrink-0 w-20 h-14 rounded overflow-hidden border-2 transition-colors ${i === selectedImage ? "border-primary" : "border-border"}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="mb-6">
              <div className="flex flex-wrap items-start gap-2 mb-2">
                <Badge variant="outline">{product.category}</Badge>
                <Badge variant="secondary" className="font-mono">v{product.version}</Badge>
                {avgRating !== null && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{avgRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({reviews.length})</span>
                  </div>
                )}
              </div>
              <h1 className="text-2xl font-bold mb-3">{product.title}</h1>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Tech Stack */}
            {product.techStack?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Code2 className="w-4 h-4" /> Tech Stack
                </h2>
                <div className="flex flex-wrap gap-2">
                  {product.techStack.map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded border border-border bg-muted text-sm font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {product.features?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Features
                </h2>
                <ul className="space-y-1.5">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator className="my-6" />

            {/* Reviews */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Reviews ({reviews.length})</h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground mb-6">No reviews yet. Be the first!</p>
              ) : (
                <div className="space-y-4 mb-6">
                  {reviews.map((r) => (
                    <div key={r.id} className="p-4 rounded-lg border border-border bg-card">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {r.userName[0]}
                        </div>
                        <span className="text-sm font-medium">{r.userName}</span>
                        <div className="flex ml-auto">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Write review */}
              {user && (
                <form onSubmit={handleReviewSubmit} className="space-y-3 p-4 rounded-lg border border-border">
                  <h3 className="text-sm font-semibold">Write a Review</h3>
                  <div>
                    <Label className="text-xs mb-1.5 block">Rating</Label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((n) => (
                        <button key={n} type="button" onClick={() => setReviewRating(n)}>
                          <Star className={`w-5 h-5 cursor-pointer transition-colors ${n <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Comment</Label>
                    <Textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      rows={3}
                      required
                      data-testid="input-review-comment"
                    />
                  </div>
                  <Button type="submit" size="sm" disabled={submittingReview} data-testid="button-submit-review">
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky top-20 space-y-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold" data-testid="text-product-price">{formatPrice(product.price)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-4">One-time payment. Lifetime access.</p>

                <Button
                  className="w-full mb-2 gap-2"
                  size="lg"
                  onClick={() => !inCart && addItem(product)}
                  variant={inCart ? "secondary" : "default"}
                  data-testid="button-add-to-cart"
                >
                  {inCart ? <><Check className="w-4 h-4" /> In Cart</> : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
                </Button>

                {inCart && (
                  <Button className="w-full mb-2" variant="outline" asChild>
                    <Link href="/cart">View Cart</Link>
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full gap-2 border-green-500/30 hover:bg-green-500/10 hover:text-green-400"
                  asChild
                  data-testid="button-whatsapp"
                >
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4" />
                    Buy via WhatsApp
                  </a>
                </Button>

                <div className="mt-4 space-y-2">
                  {product.demoUrl && (
                    <a
                      href={product.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" /> Live Demo
                    </a>
                  )}
                  {product.docsUrl && (
                    <a
                      href={product.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <BookOpen className="w-4 h-4" /> Documentation
                    </a>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Download className="w-4 h-4" /> {product.downloadCount || 0} downloads
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileCode className="w-4 h-4" /> Version {product.version}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-xs font-semibold mb-2 text-muted-foreground">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
