import { useState, useEffect } from "react";
import { Check, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layout/AdminLayout";
import { getAllReviews, approveReview, deleteReview } from "@/lib/firestore";
import type { Review } from "@/types";

export default function AdminReviews() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAllReviews().then(setReviews).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleApprove = async (id: string, approved: boolean) => {
    await approveReview(id, approved);
    toast({ title: approved ? "Review approved" : "Review hidden" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await deleteReview(id);
    toast({ title: "Review deleted" });
    load();
  };

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold mb-6">Reviews ({reviews.length})</h1>

      {loading ? (
        <div className="space-y-3">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-20 rounded-lg"/>)}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className={`p-4 rounded-lg border bg-card ${r.approved ? "border-green-500/20" : "border-border"}`} data-testid={`review-row-${r.id}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{r.userName}</span>
                    <div className="flex">
                      {Array.from({length:5}).map((_,i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i<r.rating?"fill-yellow-400 text-yellow-400":"text-muted-foreground/20"}`} />
                      ))}
                    </div>
                    <Badge variant="outline" className="text-xs">{r.approved ? "Approved" : "Pending"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.productTitle}</p>
                </div>
                <div className="flex gap-1.5">
                  {!r.approved ? (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-green-500/30 text-green-400 hover:bg-green-500/10" onClick={() => handleApprove(r.id, true)} data-testid={`button-approve-${r.id}`}>
                      <Check className="w-3 h-3" /> Approve
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleApprove(r.id, false)}>
                      Hide
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(r.id)} data-testid={`button-delete-review-${r.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
