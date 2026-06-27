import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs))
}

/**
 * Supabase returns the joined product_images relation as `product_images: { url, sortOrder }[]`.
 * The frontend (store + dashboard) expects a flat, sorted `images: string[]`.
 * Use this to normalize a single product or an array of products from any query
 * that joins `product_images(url, sortOrder)`.
 */
export function withImages<T extends { product_images?: { url: string; sortOrder: number }[] | null }>(
  product: T
): Omit<T, "product_images"> & { images: string[] } {
  const { product_images, ...rest } = product
  const images = (product_images || [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((img) => img.url)
  return { ...rest, images }
}

export function withImagesList<T extends { product_images?: { url: string; sortOrder: number }[] | null }>(
  products: T[] | null | undefined
): (Omit<T, "product_images"> & { images: string[] })[] {
  return (products || []).map(withImages)
}
