import { useState, useEffect } from "react";
import { Plus, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layout/AdminLayout";
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/lib/firestore";
import type { Coupon } from "@/types";

const emptyForm = {
  code: "", discountType: "percentage" as "percentage"|"fixed",
  discountValue: 10, maxUses: 100, active: true,
  expiresAt: new Date(Date.now() + 30*24*60*60*1000).toISOString().split("T")[0]
};

function formatDate(v: unknown) {
  if (v instanceof Date) return v.toLocaleDateString();
  if (typeof v === "string") return v;
  return "";
}

export default function AdminCoupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getAllCoupons().then(setCoupons).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async () => {
    if (!form.code.trim()) { toast({ title: "Code required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await createCoupon({
        code: form.code.toUpperCase().trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        maxUses: Number(form.maxUses),
        usedCount: 0,
        active: form.active,
        expiresAt: new Date(form.expiresAt),
      });
      toast({ title: "Coupon created" });
      setOpen(false);
      load();
    } catch {
      toast({ title: "Error creating coupon", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (c: Coupon) => {
    await updateCoupon(c.id, { active: !c.active });
    load();
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    await deleteCoupon(id);
    toast({ title: "Coupon deleted" });
    load();
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold">Coupons</h1>
        <Button size="sm" onClick={() => { setForm(emptyForm); setOpen(true); }} data-testid="button-create-coupon">
          <Plus className="w-4 h-4 mr-1.5" /> New Coupon
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-14 rounded-lg"/>)}</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Tag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-3">No coupons yet</p>
          <Button size="sm" onClick={() => setOpen(true)}>Create Coupon</Button>
        </div>
      ) : (
        <>
          {/* ── Desktop table ── */}
          <div className="hidden sm:block rounded-lg border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Code</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Discount</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Usage</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Expires</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Active</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors" data-testid={`coupon-row-${c.id}`}>
                    <td className="px-4 py-3 font-mono font-bold text-sm">{c.code}</td>
                    <td className="px-4 py-3 text-xs">
                      {c.discountType === "percentage" ? `${c.discountValue}%` : `$${c.discountValue}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.usedCount}/{c.maxUses}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(c.expiresAt)}</td>
                    <td className="px-4 py-3">
                      <Switch checked={c.active} onCheckedChange={() => handleToggle(c)} />
                    </td>
                    <td className="px-4 py-3">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(c.id, c.code)} data-testid={`button-delete-coupon-${c.id}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile card list ── */}
          <div className="sm:hidden space-y-3">
            {coupons.map((c) => (
              <div key={c.id} className="rounded-lg border border-border bg-card p-3" data-testid={`coupon-row-${c.id}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono font-bold text-base">{c.code}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {c.discountType === "percentage" ? `${c.discountValue}% off` : `$${c.discountValue} off`}
                      {" · "}{c.usedCount}/{c.maxUses} used
                      {" · "} Expires {formatDate(c.expiresAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={c.active} onCheckedChange={() => handleToggle(c)} />
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(c.id, c.code)} data-testid={`button-delete-coupon-${c.id}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant={c.active ? "default" : "outline"} className="text-xs">
                    {c.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader><DialogTitle>Create Coupon</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">Coupon Code *</Label>
              <Input value={form.code} onChange={(e)=>setForm({...form,code:e.target.value.toUpperCase()})} className="mt-1 font-mono uppercase" placeholder="SUMMER20" data-testid="input-coupon-code" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Discount Type</Label>
                <Select value={form.discountType} onValueChange={(v: "percentage"|"fixed")=>setForm({...form,discountType:v})}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Value</Label>
                <Input type="number" value={form.discountValue} onChange={(e)=>setForm({...form,discountValue:+e.target.value})} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Max Uses</Label>
                <Input type="number" value={form.maxUses} onChange={(e)=>setForm({...form,maxUses:+e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Expires</Label>
                <Input type="date" value={form.expiresAt} onChange={(e)=>setForm({...form,expiresAt:e.target.value})} className="mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(v)=>setForm({...form,active:v})} id="coupon-active" />
              <Label htmlFor="coupon-active" className="text-xs cursor-pointer">Active immediately</Label>
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={()=>setOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleCreate} disabled={saving} className="w-full sm:w-auto" data-testid="button-save-coupon">
              {saving ? "Creating..." : "Create Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
