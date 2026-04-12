import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  Timestamp,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Product, Order, UserProfile, Review, Coupon } from "../types";

function toDate(val: unknown): Date | string {
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return val as string;
}

function sortByDate(a: Date | string, b: Date | string): number {
  const da = a instanceof Date ? a : new Date(a || 0);
  const db2 = b instanceof Date ? b : new Date(b || 0);
  return db2.getTime() - da.getTime();
}

function docToProduct(id: string, data: Record<string, unknown>): Product {
  return {
    ...(data as Omit<Product, "id" | "createdAt" | "updatedAt">),
    id,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

// Products
export async function getProducts(params?: {
  category?: string;
  search?: string;
  limitCount?: number;
  publishedOnly?: boolean;
}): Promise<Product[]> {
  // Avoid composite index requirement by NOT using orderBy in Firestore queries.
  // We fetch, then sort client-side.
  const publishedQuery = query(
    collection(db, "products"),
    where("published", "==", true)
  );
  const allQuery = query(collection(db, "products"));

  const baseQuery = params?.publishedOnly !== false ? publishedQuery : allQuery;

  let snapshot;
  try {
    snapshot = await getDocs(baseQuery);
  } catch {
    // Fall back to published-only query when Firestore rules block the full query
    snapshot = await getDocs(publishedQuery);
  }

  let products = snapshot.docs
    .map((d) => docToProduct(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt as string);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt as string);
      return dateB.getTime() - dateA.getTime();
    });

  if (params?.category) {
    products = products.filter((p) => p.category === params.category);
  }

  if (params?.search) {
    const s = params.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        p.tags?.some((t) => t.toLowerCase().includes(s))
    );
  }

  if (params?.limitCount) {
    products = products.slice(0, params.limitCount);
  }

  return products;
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, "products", id));
  if (!snap.exists()) return null;
  return docToProduct(snap.id, snap.data() as Record<string, unknown>);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const q = query(collection(db, "products"), where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return docToProduct(d.id, d.data() as Record<string, unknown>);
}

export async function createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, "products"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  await updateDoc(doc(db, "products", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, "products", id));
}

// Orders
export async function createOrder(data: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, "orders"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const q = query(collection(db, "orders"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({
      ...(d.data() as Omit<Order, "id" | "createdAt" | "updatedAt">),
      id: d.id,
      createdAt: toDate(d.data().createdAt),
      updatedAt: toDate(d.data().updatedAt),
    }))
    .sort((a, b) => sortByDate(a.createdAt, b.createdAt));
}

export async function getAllOrders(): Promise<Order[]> {
  const snap = await getDocs(collection(db, "orders"));
  return snap.docs
    .map((d) => ({
      ...(d.data() as Omit<Order, "id" | "createdAt" | "updatedAt">),
      id: d.id,
      createdAt: toDate(d.data().createdAt),
      updatedAt: toDate(d.data().updatedAt),
    }))
    .sort((a, b) => sortByDate(a.createdAt, b.createdAt));
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
  await updateDoc(doc(db, "orders", id), { status, updatedAt: serverTimestamp() });
}

export async function getOrderById(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, "orders", id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...(data as Omit<Order, "id" | "createdAt" | "updatedAt">),
    id: snap.id,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export async function getPurchasedProductIds(userId: string): Promise<string[]> {
  const orders = await getOrdersByUser(userId);
  const paidOrders = orders.filter((o) => o.status === "paid");
  const ids = new Set<string>();
  paidOrders.forEach((o) => o.products.forEach((p) => ids.add(p.productId)));
  return Array.from(ids);
}

// User profiles
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...(data as Omit<UserProfile, "createdAt">),
    createdAt: toDate(data.createdAt),
  };
}

export async function createOrUpdateUserProfile(profile: Omit<UserProfile, "createdAt">): Promise<void> {
  await setDoc(
    doc(db, "users", profile.uid),
    { ...profile, createdAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs
    .map((d) => ({
      ...(d.data() as Omit<UserProfile, "createdAt">),
      createdAt: toDate(d.data().createdAt),
    }))
    .sort((a, b) => sortByDate(a.createdAt, b.createdAt));
}

export async function setUserRole(uid: string, role: "user" | "admin"): Promise<void> {
  await updateDoc(doc(db, "users", uid), { role });
}

// Reviews
export async function getReviewsByProduct(productId: string): Promise<Review[]> {
  const q = query(
    collection(db, "reviews"),
    where("productId", "==", productId),
    where("approved", "==", true)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({
      ...(d.data() as Omit<Review, "id" | "createdAt">),
      id: d.id,
      createdAt: toDate(d.data().createdAt),
    }))
    .sort((a, b) => sortByDate(a.createdAt, b.createdAt));
}

export async function getAllReviews(): Promise<Review[]> {
  const snap = await getDocs(collection(db, "reviews"));
  return snap.docs
    .map((d) => ({
      ...(d.data() as Omit<Review, "id" | "createdAt">),
      id: d.id,
      createdAt: toDate(d.data().createdAt),
    }))
    .sort((a, b) => sortByDate(a.createdAt, b.createdAt));
}

export async function createReview(data: Omit<Review, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, "reviews"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function approveReview(id: string, approved: boolean): Promise<void> {
  await updateDoc(doc(db, "reviews", id), { approved });
}

export async function deleteReview(id: string): Promise<void> {
  await deleteDoc(doc(db, "reviews", id));
}

// Coupons
export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const q = query(
    collection(db, "coupons"),
    where("code", "==", code.toUpperCase()),
    where("active", "==", true),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data();
  return {
    ...(data as Omit<Coupon, "id" | "createdAt" | "expiresAt">),
    id: d.id,
    createdAt: toDate(data.createdAt),
    expiresAt: toDate(data.expiresAt),
  };
}

export async function getAnnouncementCoupon(): Promise<Coupon | null> {
  const q = query(
    collection(db, "coupons"),
    where("showInAnnouncement", "==", true),
    where("active", "==", true),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data();
  return {
    ...(data as Omit<Coupon, "id" | "createdAt" | "expiresAt">),
    id: d.id,
    createdAt: toDate(data.createdAt),
    expiresAt: toDate(data.expiresAt),
  };
}

export async function getAllCoupons(): Promise<Coupon[]> {
  const snap = await getDocs(collection(db, "coupons"));
  return snap.docs
    .map((d) => ({
      ...(d.data() as Omit<Coupon, "id" | "createdAt" | "expiresAt">),
      id: d.id,
      createdAt: toDate(d.data().createdAt),
      expiresAt: toDate(d.data().expiresAt),
    }))
    .sort((a, b) => sortByDate(a.createdAt, b.createdAt));
}

export async function createCoupon(data: Omit<Coupon, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, "coupons"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCoupon(id: string, data: Partial<Coupon>): Promise<void> {
  await updateDoc(doc(db, "coupons", id), data);
}

export async function deleteCoupon(id: string): Promise<void> {
  await deleteDoc(doc(db, "coupons", id));
}

// Stats
export async function getDashboardStats(): Promise<{
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  recentOrders: Order[];
}> {
  const [productsSnap, ordersSnap, usersSnap] = await Promise.all([
    getDocs(collection(db, "products")),
    getDocs(collection(db, "orders")),
    getDocs(collection(db, "users")),
  ]);

  const allOrders = ordersSnap.docs.map((d) => d.data() as Order);
  const totalRevenue = allOrders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const recentOrders = ordersSnap.docs
    .map((d) => ({
      ...(d.data() as Omit<Order, "id" | "createdAt" | "updatedAt">),
      id: d.id,
      createdAt: toDate(d.data().createdAt),
      updatedAt: toDate(d.data().updatedAt),
    }))
    .sort((a, b) => sortByDate(a.createdAt, b.createdAt))
    .slice(0, 10);

  return {
    totalProducts: productsSnap.size,
    totalOrders: ordersSnap.size,
    totalRevenue,
    totalUsers: usersSnap.size,
    recentOrders,
  };
}
