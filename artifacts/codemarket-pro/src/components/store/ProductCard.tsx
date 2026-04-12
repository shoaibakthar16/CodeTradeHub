import { Link } from "wouter";
import { ExternalLink, ShoppingCart, Check, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { formatPrice } from "@/lib/stripe";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, isInCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const inCart = isInCart(product.id);
  const wishlisted = isWishlisted(product.id);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <Card
      className="group flex flex-col overflow-hidden border-border bg-card hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
      data-testid={`card-product-${product.id}`}
    >
      {/* Thumbnail */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-video bg-muted overflow-hidden">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-mono text-4xl text-muted-foreground/30">&lt;/&gt;</span>
            </div>
          )}

          {/* Top-left badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Badge variant="secondary" className="text-xs font-mono">v{product.version}</Badge>
            {product.featured && (
              <Badge className="text-xs bg-amber-500 text-black border-0 flex items-center gap-1">
                <Star className="w-2.5 h-2.5" /> Featured
              </Badge>
            )}
          </div>

          {/* Discount badge */}
          {hasDiscount && (
            <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs">
              -{discountPct}%
            </Badge>
          )}

          {/* Wishlist button — shown on hover */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product); }}
            className={`absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center border transition-all
              ${wishlisted
                ? "bg-rose-500 border-rose-500 text-white opacity-100"
                : "bg-background/80 border-border text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-rose-400 hover:border-rose-400"
              }`}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            data-testid={`button-wishlist-${product.id}`}
          >
            <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-current" : ""}`} />
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-sm leading-snug hover:text-primary transition-colors line-clamp-2 mb-1" data-testid={`text-product-title-${product.id}`}>
              {product.title}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground line-clamp-2">{product.shortDescription}</p>
        </div>

        {/* Tech stack badges */}
        {product.techStack?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.techStack.slice(0, 3).map((tech) => (
              <span key={tech} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                {tech}
              </span>
            ))}
            {product.techStack.length > 3 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                +{product.techStack.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Category */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[10px]">{product.category}</Badge>
          {product.demoUrl && (
            <a href={product.demoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-accent transition-colors flex items-center gap-1">
              Demo <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base text-foreground" data-testid={`text-price-${product.id}`}>
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant={inCart ? "secondary" : "default"}
            onClick={() => !inCart && addItem(product)}
            className="h-8 text-xs gap-1.5"
            data-testid={`button-add-cart-${product.id}`}
          >
            {inCart ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
