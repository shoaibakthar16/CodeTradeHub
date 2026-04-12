import { useState, useEffect } from "react";
import { Upload, FileCode, Image as ImageIcon, Package, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layout/AdminLayout";
import { getProducts, updateProduct } from "@/lib/firestore";
import { uploadProductFile, uploadProductThumbnail } from "@/lib/storage";
import type { Product } from "@/types";

export default function AdminUploads() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [thumbUrl, setThumbUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    getProducts({ publishedOnly: false }).then(setProducts).finally(() => setLoading(false));
  }, []);

  const handleUpload = async () => {
    if (!selectedProductId) { toast({ title: "Select a product first", variant: "destructive" }); return; }
    if (!zipFile && !thumbFile) { toast({ title: "Select files to upload", variant: "destructive" }); return; }
    setUploading(true);
    setProgress(0);
    try {
      const updates: Partial<Product> = {};
      if (thumbFile) {
        const url = await uploadProductThumbnail(thumbFile, selectedProductId, (p) => setProgress(p * 0.4));
        updates.thumbnail = url;
        setThumbUrl(url);
      }
      if (zipFile) {
        const url = await uploadProductFile(zipFile, selectedProductId, (p) => setProgress(40 + p * 0.6));
        updates.fileUrl = url;
        updates.fileName = zipFile.name;
        setFileUrl(url);
      }
      await updateProduct(selectedProductId, updates);
      toast({ title: "Files uploaded!", description: "Product updated with new files." });
      setProgress(100);
    } catch (err) {
      toast({ title: "Upload failed", description: String(err), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold mb-6">File Uploads</h1>

      <div className="max-w-xl space-y-6">
        <div className="p-5 rounded-lg border border-border bg-card space-y-4">
          <h2 className="font-semibold text-sm">Upload Product Files</h2>

          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div>
              <Label className="text-xs mb-1.5 block">Select Product *</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger data-testid="select-product">
                  <SelectValue placeholder="Choose a product..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5" />
                        {p.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label className="text-xs mb-1.5 block flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Thumbnail Image (PNG/JPG)
            </Label>
            <div
              className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => document.getElementById("thumb-input")?.click()}
            >
              {thumbFile ? (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>{thumbFile.name}</span>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  <Upload className="w-6 h-6 mx-auto mb-1 opacity-40" />
                  Click to select thumbnail
                </div>
              )}
            </div>
            <input
              id="thumb-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
              data-testid="input-thumbnail"
            />
          </div>

          <div>
            <Label className="text-xs mb-1.5 block flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5" /> Source Code ZIP File
            </Label>
            <div
              className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => document.getElementById("zip-input")?.click()}
            >
              {zipFile ? (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>{zipFile.name}</span>
                  <span className="text-muted-foreground text-xs">({(zipFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  <Upload className="w-6 h-6 mx-auto mb-1 opacity-40" />
                  Click to select ZIP file
                </div>
              )}
            </div>
            <input
              id="zip-input"
              type="file"
              accept=".zip,.tar.gz,.rar"
              className="hidden"
              onChange={(e) => setZipFile(e.target.files?.[0] || null)}
              data-testid="input-zip"
            />
          </div>

          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading...</span><span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {(thumbUrl || fileUrl) && !uploading && (
            <div className="p-3 rounded bg-green-500/5 border border-green-500/20 text-xs space-y-1">
              {thumbUrl && <div className="flex items-center gap-1.5 text-green-400"><Check className="w-3.5 h-3.5" />Thumbnail uploaded</div>}
              {fileUrl && <div className="flex items-center gap-1.5 text-green-400"><Check className="w-3.5 h-3.5" />ZIP uploaded & product updated</div>}
            </div>
          )}

          <Button className="w-full gap-2" onClick={handleUpload} disabled={uploading || !selectedProductId} data-testid="button-upload">
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading..." : "Upload Files"}
          </Button>
        </div>

        <div className="p-4 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground space-y-1.5">
          <p className="font-medium text-foreground">Upload Guidelines</p>
          <p>Thumbnails: PNG or JPG, 16:9 ratio recommended (1280x720 or 1920x1080)</p>
          <p>Source files: ZIP, TAR.GZ, or RAR archive containing the full project</p>
          <p>Files are stored in Firebase Storage and only accessible to buyers with a paid order</p>
        </div>
      </div>
    </AdminLayout>
  );
}
