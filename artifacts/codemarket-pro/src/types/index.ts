export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  previewImages: string[];
  techStack: string[];
  features: string[];
  category: string;
  tags: string[];
  demoUrl?: string;
  docsUrl?: string;
  version: string;
  fileUrl?: string;
  fileName?: string;
  published: boolean;
  featured?: boolean;
  downloadCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  products: OrderItem[];
  total: number;
  status: "pending" | "paid" | "cancelled";
  paymentMethod: "stripe" | "whatsapp";
  stripeSessionId?: string;
  couponCode?: string;
  discountAmount?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  productSlug: string;
  price: number;
  thumbnail: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "user" | "admin";
  createdAt: Date | string;
}

export interface Review {
  id: string;
  productId: string;
  productTitle: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: Date | string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses: number;
  usedCount: number;
  expiresAt: Date | string;
  active: boolean;
  createdAt: Date | string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}
