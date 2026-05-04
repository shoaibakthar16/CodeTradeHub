import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import {
  ExternalLink, Star, ShoppingCart, Check, MessageCircle, ChevronLeft,
  Code2, Download, FileCode, BookOpen, Shield, Zap, ShieldCheck, Receipt, BadgeCheck, PlayCircle
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
import ProductCard from "@/components/store/ProductCard";
import { getProductBySlug, getReviewsByProduct, createReview, getProducts } from "@/lib/firestore";
import { formatPrice } from "@/lib/stripe";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/analytics";
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
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
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
          getProducts({ publishedOnly: true }).then((all) => {
            const related = all
              .filter((item) => item.id !== p.id && item.category === p.category)
              .slice(0, 4);
            setRelatedProducts(related);
          });
        } else {
          setRelatedProducts([]);
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

  const paypalEmail = import.meta.env.VITE_PAYPAL_EMAIL;
  const paypalBuyNowUrl = paypalEmail
    ? `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(paypalEmail)}&item_name=${encodeURIComponent(product.title)}&amount=${product.price.toFixed(2)}&currency_code=USD&no_shipping=1`
    : null;
  const totalSales = Math.max(product.downloadCount || 0, reviews.length * 2);

  const rawVideoUrl = product.previewVideoUrl || product.demoUrl || "";
  const youtubeMatch = rawVideoUrl.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
  );
  const vimeoMatch = rawVideoUrl.match(/vimeo\.com\/(\d+)/);
  const isDirectVideo =
    /\.(mp4|webm|ogg)$/i.test(rawVideoUrl) || rawVideoUrl.includes("firebasestorage");
  const embedVideoUrl = youtubeMatch
    ? `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0&mute=1&rel=0`
    : vimeoMatch
      ? `https://player.vimeo.com/video/${vimeoMatch[1]}`
      : null;
  const iframePreviewUrl =
    embedVideoUrl || (!isDirectVideo && rawVideoUrl.startsWith("http") ? rawVideoUrl : null);

  const handleAddToCart = () => {
    if (inCart) return;
    addItem(product);
    trackEvent("add_to_cart", {
      source: "product_detail",
      productId: product.id,
      slug: product.slug,
      price: product.price,
      category: product.category,
    });
  };

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

            {/* Product video preview */}
            {(isDirectVideo || iframePreviewUrl) && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <PlayCircle className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold">10-20s Product Preview</h2>
                </div>
                <div className="aspect-video rounded-xl overflow-hidden border border-border bg-black/5">
                  {isDirectVideo ? (
                    <video
                      src={rawVideoUrl}
                      controls
                      muted
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <iframe
                      src={iframePreviewUrl || undefined}
                      title={`${product.title} preview`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  )}
                </div>
              </div>
            )}

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
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 gap-1">
                          <BadgeCheck className="w-3 h-3" /> Verified
                        </Badge>
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

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="rounded-md border border-border bg-muted/40 px-2 py-2 text-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
                    <p className="text-[10px] font-medium">Secure Payment</p>
                  </div>
                  <div className="rounded-md border border-border bg-muted/40 px-2 py-2 text-center">
                    <Zap className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
                    <p className="text-[10px] font-medium">Instant Download</p>
                  </div>
                  <div className="rounded-md border border-border bg-muted/40 px-2 py-2 text-center">
                    <Receipt className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
                    <p className="text-[10px] font-medium">Refund Policy</p>
                  </div>
                </div>

                <Button
                  className="w-full mb-2 gap-2"
                  size="lg"
                  onClick={handleAddToCart}
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

                {paypalBuyNowUrl && (
                  <a
                    href={paypalBuyNowUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("paypal_click", { source: "product_detail", productId: product.id, slug: product.slug, price: product.price })}
                    className="mb-2 w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all bg-[#FFC439] hover:bg-[#f0b429] text-[#003087] border border-[#FFC439] hover:shadow-md"
                    data-testid="button-paypal"
                  >
                    <svg className="w-14 h-auto" viewBox="0 0 101 32" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#003087" d="M 12.237 2.8 L 4.437 2.8 C 3.937 2.8 3.437 3.2 3.337 3.7 L 0.237 23.7 C 0.137 24.1 0.437 24.4 0.837 24.4 L 4.537 24.4 C 5.037 24.4 5.537 24 5.637 23.5 L 6.437 18.1 C 6.537 17.6 6.937 17.2 7.537 17.2 L 10.037 17.2 C 15.137 17.2 18.137 14.7 18.937 9.8 C 19.237 7.7 18.937 6 17.937 4.8 C 16.837 3.5 14.837 2.8 12.237 2.8 Z M 13.137 10.1 C 12.737 12.9 10.537 12.9 8.537 12.9 L 7.337 12.9 L 8.137 7.7 C 8.137 7.4 8.437 7.2 8.737 7.2 L 9.237 7.2 C 10.637 7.2 11.937 7.2 12.637 8 C 13.137 8.4 13.337 9.1 13.137 10.1 Z"/>
                      <path fill="#003087" d="M 35.437 10 L 31.737 10 C 31.437 10 31.137 10.2 31.137 10.5 L 30.937 11.5 L 30.637 11.1 C 29.737 9.8 27.837 9.4 25.937 9.4 C 21.537 9.4 17.737 12.8 17.037 17.5 C 16.637 19.9 17.237 22.1 18.637 23.6 C 19.937 25 21.737 25.6 23.837 25.6 C 27.337 25.6 29.337 23.4 29.337 23.4 L 29.137 24.4 C 29.037 24.8 29.337 25.1 29.737 25.1 L 33.137 25.1 C 33.637 25.1 34.137 24.7 34.237 24.2 L 36.237 10.7 C 36.337 10.4 36.037 10 35.437 10 Z M 30.437 17.6 C 30.037 19.9 28.237 21.5 25.937 21.5 C 24.737 21.5 23.837 21.1 23.237 20.4 C 22.637 19.7 22.437 18.7 22.637 17.6 C 23.037 15.3 24.837 13.7 27.137 13.7 C 28.337 13.7 29.237 14.1 29.837 14.8 C 30.437 15.5 30.637 16.5 30.437 17.6 Z"/>
                      <path fill="#003087" d="M 55.337 10 L 51.637 10 C 51.237 10 50.937 10.2 50.737 10.5 L 45.537 18.1 L 43.337 10.8 C 43.137 10.3 42.737 10 42.237 10 L 38.637 10 C 38.237 10 37.937 10.4 38.037 10.8 L 42.237 23.6 L 38.337 29 C 38.037 29.4 38.337 30 38.837 30 L 42.537 30 C 42.937 30 43.237 29.8 43.437 29.5 L 55.937 10.9 C 56.137 10.5 55.837 10 55.337 10 Z"/>
                      <path fill="#009cde" d="M 67.737 2.8 L 59.937 2.8 C 59.437 2.8 58.937 3.2 58.837 3.7 L 55.737 23.7 C 55.637 24.1 55.937 24.4 56.337 24.4 L 60.337 24.4 C 60.737 24.4 61.037 24.1 61.037 23.8 L 61.937 18.1 C 62.037 17.6 62.437 17.2 63.037 17.2 L 65.537 17.2 C 70.637 17.2 73.637 14.7 74.437 9.8 C 74.737 7.7 74.437 6 73.437 4.8 C 72.237 3.5 70.237 2.8 67.737 2.8 Z M 68.637 10.1 C 68.237 12.9 66.037 12.9 64.037 12.9 L 62.837 12.9 L 63.637 7.7 C 63.637 7.4 63.937 7.2 64.237 7.2 L 64.737 7.2 C 66.137 7.2 67.437 7.2 68.137 8 C 68.637 8.4 68.837 9.1 68.637 10.1 Z"/>
                      <path fill="#009cde" d="M 90.937 10 L 87.237 10 C 86.937 10 86.637 10.2 86.637 10.5 L 86.437 11.5 L 86.137 11.1 C 85.237 9.8 83.337 9.4 81.437 9.4 C 77.037 9.4 73.237 12.8 72.537 17.5 C 72.137 19.9 72.737 22.1 74.137 23.6 C 75.437 25 77.237 25.6 79.337 25.6 C 82.837 25.6 84.837 23.4 84.837 23.4 L 84.637 24.4 C 84.537 24.8 84.837 25.1 85.237 25.1 L 88.637 25.1 C 89.137 25.1 89.637 24.7 89.737 24.2 L 91.737 10.7 C 91.837 10.4 91.437 10 90.937 10 Z M 85.837 17.6 C 85.437 19.9 83.637 21.5 81.337 21.5 C 80.137 21.5 79.237 21.1 78.637 20.4 C 78.037 19.7 77.837 18.7 78.037 17.6 C 78.437 15.3 80.237 13.7 82.537 13.7 C 83.737 13.7 84.637 14.1 85.237 14.8 C 85.937 15.5 86.037 16.5 85.837 17.6 Z"/>
                      <path fill="#009cde" d="M 95.337 3.3 L 92.137 23.7 C 92.037 24.1 92.337 24.4 92.737 24.4 L 95.937 24.4 C 96.437 24.4 96.937 24 97.037 23.5 L 100.137 3.5 C 100.237 3.1 99.937 2.8 99.537 2.8 L 95.937 2.8 C 95.637 2.8 95.437 3 95.337 3.3 Z"/>
                    </svg>
                    <span>Buy Now</span>
                  </a>
                )}

                <Button
                  variant="outline"
                  className="w-full gap-2 border-green-500/30 hover:bg-green-500/10 hover:text-green-400"
                  asChild
                  data-testid="button-whatsapp"
                >
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("whatsapp_click", { source: "product_detail", productId: product.id, slug: product.slug, price: product.price })}
                  >
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
                    <BadgeCheck className="w-4 h-4" /> {totalSales}+ total sales
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

        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Related Products</h2>
              <Link href={`/products?category=${product.category}`} className="text-sm text-primary hover:underline">
                View more
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
}
