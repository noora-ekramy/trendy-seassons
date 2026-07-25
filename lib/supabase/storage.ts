/**
 * Supabase Storage helpers for product images
 * Bucket: product-images (create in Supabase Dashboard > Storage)
 */

const BUCKET = "product-images";

export function getPublicImageUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return path;
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
}
