import { loadStripe } from "@stripe/stripe-js";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

export const stripePromise = loadStripe(stripePublishableKey);

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function calculateDiscount(
  price: number,
  discountType: "percentage" | "fixed",
  discountValue: number
): number {
  if (discountType === "percentage") {
    return price * (discountValue / 100);
  }
  return Math.min(discountValue, price);
}
