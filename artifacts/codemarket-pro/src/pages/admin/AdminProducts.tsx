import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Package, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/firestore";
import { seedDemoProducts } from "@/lib/seedData";
import { formatPrice } from "@/lib/stripe";
import type { Product } from "@/types";

const CATEGORIES = ["templates","saas","mobile","admin-panels","ecommerce","fullstack","wordpress","blogger","shopify","extensions","other"];

const emptyForm = {
  title: "", slug: "", shortDescription: "", description: "",
  price: 0, originalPrice: undefined as number | undefined,
  category: "templates", version: "1.0.0", techStack: "",
  features: "", tags: "", thumbnail: "", demoUrl: "", docsUrl: "",
  published: false, featured: false, downloadCount: 0, previewImages: [], fileUrl: "", fileName: ""
};

export default function AdminProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = () => {
    setLoading(true);
    getProducts({ publishedOnly: false }).then(setProducts).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const count = await seedDemoProducts();
      toast({ title: `${count} demo products added!`, description: "Reload to see them in the store." });
      load();
    } catch {
      toast({ title: "Seed failed", description: "Check Firestore rules and try again.", variant: "destructive" });
    } finally {
      setSeeding(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      title: p.title, slug: p.slug, shortDescription: p.shortDescription,
      description: p.description, price: p.price,
      originalPrice: p.originalPrice, category: p.category,
      version: p.version, techStack: (p.techStack || []).join(", "),
      features: (p.features || []).join("\n"), tags: (p.tags || []).join(", "),
      thumbnail: p.thumbnail || "", demoUrl: p.demoUrl || "",
      docsUrl: p.docsUrl || "", published: p.published,
      downloadCount: p.downloadCount || 0, previewImages: p.previewImages || [],
      fileUrl: p.fileUrl || "", fileName: p.fileName || "",
      featured: p.featured || false,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const data = {
        title: form.title,
        slug: form.slug,
        shortDescription: form.shortDescription,
        description: form.description,
        price: Number(form.price) || 0,
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        category: form.category,
        version: form.version,
        techStack: form.techStack.split(",").map((s) => s.trim()).filter(Boolean),
        features: form.features.split("\n").map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        thumbnail: form.thumbnail,
        previewImages: form.previewImages,
        demoUrl: form.demoUrl || undefined,
        docsUrl: form.docsUrl || undefined,
        fileUrl: form.fileUrl || undefined,
        fileName: form.fileName || undefined,
        published: form.published,
        featured: form.featured,
        downloadCount: form.downloadCount,
      };
      if (editing) {
        await updateProduct(editing.id, data);
        toast({ title: "Product updated" });
      } else {
        await createProduct(data);
        toast({ title: "Product created" });
      }
      setOpen(false);
      load();
    } catch {
      toast({ title: "Error saving product", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteProduct(id);
      toast({ title: "Product deleted" });
      load();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const togglePublish = async (p: Product) => {
    await updateProduct(p.id, { published: !p.published });
    load();
  };

  const toggleFeatured = async (p: Product) => {
    await updateProduct(p.id, { featured: !p.featured });
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Products</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleSeedData} disabled={seeding}>
            <Sparkles className="w-4 h-4 mr-1.5" />
            {seeding ? "Adding demo data…" : "Seed Demo Data"}
          </Button>
          <Button size="sm" onClick={openCreate} data-testid="button-create-product">
            <Plus className="w-4 h-4 mr-1.5" /> New Product
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-14 rounded-lg"/>)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-3">No products yet</p>
          <div className="flex gap-2 justify-center">
            <Button size="sm" variant="outline" onClick={handleSeedData} disabled={seeding}>
              <Sparkles className="w-4 h-4 mr-1.5" />
              {seeding ? "Adding…" : "Seed Demo Data"}
            </Button>
            <Button size="sm" onClick={openCreate}>Create First Product</Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Product</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Category</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Price</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Featured</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors" data-testid={`product-row-${p.id}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.thumbnail && <img src={p.thumbnail} alt="" className="w-8 h-6 rounded object-cover" />}
                      <div>
                        <div className="font-medium text-xs">{p.title}</div>
                        <div className="text-xs font-mono text-muted-foreground">{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{p.category}</Badge></td>
                  <td className="px-4 py-3 text-xs font-medium">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePublish(p)} data-testid={`toggle-publish-${p.id}`}>
                      {p.published
                        ? <Badge className="text-xs bg-green-500/10 text-green-400 border-green-500/20"><Eye className="w-3 h-3 mr-1"/>Published</Badge>
                        : <Badge variant="outline" className="text-xs text-muted-foreground"><EyeOff className="w-3 h-3 mr-1"/>Draft</Badge>
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleFeatured(p)}>
                      {p.featured
                        ? <Badge className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/20">⭐ Featured</Badge>
                        : <Badge variant="outline" className="text-xs text-muted-foreground">—</Badge>
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(p)} data-testid={`button-edit-${p.id}`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id, p.title)} data-testid={`button-delete-${p.id}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Create Product"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label className="text-xs">Title *</Label>
              <Input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} className="mt-1" data-testid="input-product-title" />
            </div>
            <div>
              <Label className="text-xs">Slug *</Label>
              <Input value={form.slug} onChange={(e)=>setForm({...form,slug:e.target.value.toLowerCase().replace(/\s+/g,"-")})} className="mt-1 font-mono" placeholder="my-product" />
            </div>
            <div>
              <Label className="text-xs">Category</Label>
              <Select value={form.category} onValueChange={(v)=>setForm({...form,category:v})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Price ($)</Label>
              <Input type="number" value={form.price} onChange={(e)=>setForm({...form,price:+e.target.value})} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Original Price ($) — optional</Label>
              <Input type="number" value={form.originalPrice||""} onChange={(e)=>setForm({...form,originalPrice:e.target.value?+e.target.value:undefined})} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Version</Label>
              <Input value={form.version} onChange={(e)=>setForm({...form,version:e.target.value})} className="mt-1 font-mono" />
            </div>
            <div>
              <Label className="text-xs">Thumbnail URL</Label>
              <Input value={form.thumbnail} onChange={(e)=>setForm({...form,thumbnail:e.target.value})} className="mt-1" placeholder="https://..." />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Short Description</Label>
              <Input value={form.shortDescription} onChange={(e)=>setForm({...form,shortDescription:e.target.value})} className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Full Description</Label>
              <Textarea value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} className="mt-1" rows={3} />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Tech Stack (comma separated)</Label>
              <Input value={form.techStack} onChange={(e)=>setForm({...form,techStack:e.target.value})} className="mt-1 font-mono" placeholder="React, TypeScript, Tailwind" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Features (one per line)</Label>
              <Textarea value={form.features} onChange={(e)=>setForm({...form,features:e.target.value})} className="mt-1" rows={3} placeholder="Authentication system&#10;Payment integration&#10;Admin dashboard" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Tags (comma separated)</Label>
              <Input value={form.tags} onChange={(e)=>setForm({...form,tags:e.target.value})} className="mt-1" placeholder="react, saas, dashboard" />
            </div>
            <div>
              <Label className="text-xs">Demo URL</Label>
              <Input value={form.demoUrl} onChange={(e)=>setForm({...form,demoUrl:e.target.value})} className="mt-1" placeholder="https://demo.example.com" />
            </div>
            <div>
              <Label className="text-xs">Docs URL</Label>
              <Input value={form.docsUrl} onChange={(e)=>setForm({...form,docsUrl:e.target.value})} className="mt-1" placeholder="https://docs.example.com" />
            </div>
            <div>
              <Label className="text-xs">File URL (ZIP download)</Label>
              <Input value={form.fileUrl} onChange={(e)=>setForm({...form,fileUrl:e.target.value})} className="mt-1" placeholder="https://storage.firebase.com/..." />
            </div>
            <div>
              <Label className="text-xs">File Name</Label>
              <Input value={form.fileName} onChange={(e)=>setForm({...form,fileName:e.target.value})} className="mt-1 font-mono" placeholder="product-v1.0.zip" />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Switch checked={form.published} onCheckedChange={(v)=>setForm({...form,published:v})} id="published" />
              <Label htmlFor="published" className="text-xs cursor-pointer">Published (visible to buyers)</Label>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Switch checked={form.featured} onCheckedChange={(v)=>setForm({...form,featured:v})} id="featured" />
              <Label htmlFor="featured" className="text-xs cursor-pointer">⭐ Featured (highlighted with badge)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} data-testid="button-save-product">
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
