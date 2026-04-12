import { Link } from "wouter";
import { Heart, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/store/ProductCard";
import { useWishlist } from "@/contexts/WishlistContext";

export default function WishlistPage() {
  const { items, count } = useWishlist();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Wishlist</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{count} saved item{count !== 1 ? "s" : ""}</p>
        </div>
        {count > 0 && (
          <Button asChild size="sm">
            <Link href="/products">
              Browse more <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
        )}
      </div>

      {count === 0 ? (
        <div className="text-center py-24 border border-dashed border-border rounded-xl">
          <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-medium mb-2">Your wishlist is empty</h3>
          <p className="text-sm text-muted-foreground mb-5">Hover over a product card and click the heart icon to save it here.</p>
          <Button asChild>
            <Link href="/products">
              <ShoppingCart className="w-4 h-4 mr-2" /> Browse Products
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
