import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
}

export async function uploadProductFile(
  file: File,
  productId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  return uploadFile(file, `products/${productId}/${file.name}`, onProgress);
}

export async function uploadProductThumbnail(
  file: File,
  productId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  return uploadFile(file, `thumbnails/${productId}/${file.name}`, onProgress);
}

export async function uploadProductPreviewImage(
  file: File,
  productId: string,
  index: number,
  onProgress?: (progress: number) => void
): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  return uploadFile(file, `previews/${productId}/preview_${index}_${Date.now()}.${ext}`, onProgress);
}

export async function deleteFile(url: string): Promise<void> {
  const fileRef = ref(storage, url);
  await deleteObject(fileRef);
}
