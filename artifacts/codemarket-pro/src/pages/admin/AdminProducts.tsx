import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Package, Sparkles, Star, ImagePlus, X, GripVertical } from "lucide-react";
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
import { uploadProductPreviewImage, uploadProductThumbnail } from "@/lib/storage";
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
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadPreviewProgress, setUploadPreviewProgress] = useState(0);

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

  const addPreviewImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    setForm((f) => ({ ...f, previewImages: [...f.previewImages, url] }));
    setNewImageUrl("");
  };

  const removePreviewImage = (idx: number) => {
    setForm((f) => ({ ...f, previewImages: f.previewImages.filter((_, i) => i !== idx) }));
  };

  const handlePreviewImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const productId = editing?.id || `temp_${Date.now()}`;
    setUploadingPreview(true);
    setUploadPreviewProgress(0);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadProductPreviewImage(
          files[i],
          productId,
          form.previewImages.length + i,
          (p) => setUploadPreviewProgress(Math.round(((i / files.length) + p / 100 / files.length) * 100))
        );
        urls.push(url);
      }
      setForm((f) => ({ ...f, previewImages: [...f.previewImages, ...urls] }));
      setUploadPreviewProgress(100);
      toast({ title: `${urls.length} image${urls.length > 1 ? "s" : ""} uploaded!` });
    } catch (err) {
      toast({ title: "Upload failed", description: String(err), variant: "destructive" });
    } finally {
      setUploadingPreview(false);
      setTimeout(() => setUploadPreviewProgress(0), 1500);
    }
  };

  const handleThumbnailUpload = async (file: File | null) => {
    if (!file) return;
    const productId = editing?.id || `temp_${Date.now()}`;
    setUploadingThumb(true);
    try {
      const url = await uploadProductThumbnail(file, productId);
      setForm((f) => ({ ...f, thumbnail: url }));
      toast({ title: "Thumbnail uploaded!" });
    } catch (err) {
      toast({ title: "Thumbnail upload failed", description: String(err), variant: "destructive" });
    } finally {
      setUploadingThumb(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setNewImageUrl(""); setOpen(true); };
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
    setNewImageUrl("");
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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold">Products</h1>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={handleSeedData} disabled={seeding}>
            <Sparkles className="w-4 h-4 mr-1.5" />
            {seeding ? "Adding…" : "Seed Demo Data"}
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
          <div className="flex gap-2 justify-center flex-wrap">
            <Button size="sm" variant="outline" onClick={handleSeedData} disabled={seeding}>
              <Sparkles className="w-4 h-4 mr-1.5" />
              {seeding ? "Adding…" : "Seed Demo Data"}
            </Button>
            <Button size="sm" onClick={openCreate}>Create First Product</Button>
          </div>
        </div>
      ) : (
        <>
          {/* ── Desktop table ── */}
          <div className="hidden sm:block rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
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
          </div>

          {/* ── Mobile card list ── */}
          <div className="sm:hidden space-y-3">
            {products.map((p) => (
              <div key={p.id} className="rounded-lg border border-border bg-card p-3" data-testid={`product-row-${p.id}`}>
                <div className="flex items-start gap-3">
                  {p.thumbnail && (
                    <img src={p.thumbnail} alt="" className="w-12 h-9 rounded object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{p.title}</div>
                    <div className="text-xs font-mono text-muted-foreground truncate">{p.slug}</div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <Badge variant="outline" className="text-xs">{p.category}</Badge>
                      <span className="text-xs font-semibold text-primary">{formatPrice(p.price)}</span>
                      <button onClick={() => togglePublish(p)} data-testid={`toggle-publish-${p.id}`}>
                        {p.published
                          ? <Badge className="text-xs bg-green-500/10 text-green-400 border-green-500/20"><Eye className="w-3 h-3 mr-1"/>Published</Badge>
                          : <Badge variant="outline" className="text-xs text-muted-foreground"><EyeOff className="w-3 h-3 mr-1"/>Draft</Badge>
                        }
                      </button>
                      {p.featured && (
                        <Badge className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/20">⭐ Featured</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(p)} data-testid={`button-edit-${p.id}`}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id, p.title)} data-testid={`button-delete-${p.id}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                  <button onClick={() => toggleFeatured(p)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                    <Star className={`w-3.5 h-3.5 ${p.featured ? "fill-amber-400 text-amber-400" : ""}`} />
                    {p.featured ? "Unfeature" : "Mark Featured"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Product Dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Create Product"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="sm:col-span-2">
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
              <Label className="text-xs mb-1.5 block">Thumbnail</Label>
              <div className="flex gap-2">
                <Input value={form.thumbnail} onChange={(e)=>setForm({...form,thumbnail:e.target.value})} placeholder="https://... or upload →" className="text-xs" />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={uploadingThumb}
                  onClick={() => document.getElementById("thumb-upload-input")?.click()}
                  className="shrink-0 gap-1.5"
                >
                  {uploadingThumb ? (
                    <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ImagePlus className="w-3.5 h-3.5" />
                  )}
                  {uploadingThumb ? "Uploading…" : "Upload"}
                </Button>
                <input
                  id="thumb-upload-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleThumbnailUpload(e.target.files?.[0] || null)}
                />
              </div>
              {form.thumbnail && (
                <img src={form.thumbnail} alt="thumbnail" className="mt-2 w-full h-24 object-cover rounded-lg border border-border" onError={(e)=>(e.currentTarget.style.display="none")} />
              )}
            </div>

            {/* ── Demo / Preview Images ── */}
            <div className="sm:col-span-2">
              <Label className="text-xs flex items-center gap-1.5 mb-2">
                <ImagePlus className="w-3.5 h-3.5 text-primary" />
                Demo Screenshots ({form.previewImages.length} image{form.previewImages.length !== 1 ? "s" : ""})
              </Label>

              {/* Add new image — URL or upload */}
              <div className="flex gap-2 mb-3">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPreviewImage())}
                  placeholder="Paste image URL… or click Upload"
                  className="text-xs font-mono"
                  disabled={uploadingPreview}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addPreviewImage}
                  disabled={!newImageUrl.trim() || uploadingPreview}
                  className="shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={uploadingPreview}
                  onClick={() => document.getElementById("preview-images-input")?.click()}
                  className="shrink-0 gap-1.5"
                >
                  {uploadingPreview ? (
                    <span className="w-3.5 h-3.5 border-2 border-foreground/40 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ImagePlus className="w-3.5 h-3.5" />
                  )}
                  {uploadingPreview ? `${uploadPreviewProgress}%` : "Upload"}
                </Button>
                <input
                  id="preview-images-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => { handlePreviewImageUpload(e.target.files); e.target.value = ""; }}
                />
              </div>

              {/* Upload progress bar */}
              {uploadingPreview && (
                <div className="mb-3 space-y-1">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Uploading images to Firebase Storage…</span>
                    <span>{uploadPreviewProgress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 rounded-full"
                      style={{ width: `${uploadPreviewProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Preview grid */}
              {form.previewImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {form.previewImages.map((url, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-border aspect-video bg-muted">
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <span className="text-xs font-medium text-white">#{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removePreviewImage(idx)}
                          className="w-6 h-6 rounded-full bg-destructive/90 flex items-center justify-center hover:bg-destructive transition-colors"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 rounded-lg border border-dashed border-border text-center">
                  <ImagePlus className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">No demo images yet</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">Add image URLs above to showcase your product</p>
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <Label className="text-xs">Short Description</Label>
              <Input value={form.shortDescription} onChange={(e)=>setForm({...form,shortDescription:e.target.value})} className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Full Description</Label>
              <Textarea value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} className="mt-1" rows={3} />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Tech Stack (comma separated)</Label>
              <Input value={form.techStack} onChange={(e)=>setForm({...form,techStack:e.target.value})} className="mt-1 font-mono" placeholder="React, TypeScript, Tailwind" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Features (one per line)</Label>
              <Textarea value={form.features} onChange={(e)=>setForm({...form,features:e.target.value})} className="mt-1" rows={3} placeholder={"Authentication system\nPayment integration\nAdmin dashboard"} />
            </div>
            <div className="sm:col-span-2">
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
            <div className="sm:col-span-2 flex items-center gap-2">
              <Switch checked={form.published} onCheckedChange={(v)=>setForm({...form,published:v})} id="published" />
              <Label htmlFor="published" className="text-xs cursor-pointer">Published (visible to buyers)</Label>
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <Switch checked={form.featured} onCheckedChange={(v)=>setForm({...form,featured:v})} id="featured" />
              <Label htmlFor="featured" className="text-xs cursor-pointer">⭐ Featured (highlighted with badge)</Label>
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={()=>setOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto" data-testid="button-save-product">
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
