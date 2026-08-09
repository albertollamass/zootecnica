import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Category, Product, ProductImage } from "@/lib/types";

type DbProduct = Omit<Product, "price" | "images"> & {
  price: string;
  category: Pick<Category, "id" | "slug" | "name"> | null;
};

function normalize(products: DbProduct[], images: ProductImage[]): Product[] {
  const byProduct = new Map<string, ProductImage[]>();
  for (const img of images) {
    const arr = byProduct.get(img.product_id) ?? [];
    arr.push(img);
    byProduct.set(img.product_id, arr);
  }
  return products.map((p) => ({
    ...p,
    price: Number(p.price),
    images: byProduct.get(p.id) ?? [],
  }));
}

export async function getAdminProducts(): Promise<Product[]> {
  const admin = createAdminClient();
  const { data: products } = await admin
    .from("products")
    .select("id, category_id, slug, name, description, price, stock, active, created_at, updated_at, category:categories(id, slug, name)")
    .order("created_at", { ascending: false });

  const ids = (products ?? []).map((p) => p.id);
  const { data: images } =
    ids.length > 0
      ? await admin
          .from("product_images")
          .select("*")
          .in("product_id", ids)
          .order("position")
      : { data: [] as ProductImage[] };

  return normalize((products ?? []) as unknown as DbProduct[], images ?? []);
}

export async function getAdminProduct(id: string): Promise<Product | null> {
  const admin = createAdminClient();
  const { data: product } = await admin
    .from("products")
    .select("id, category_id, slug, name, description, price, stock, active, created_at, updated_at, category:categories(id, slug, name)")
    .eq("id", id)
    .single();

  if (!product) return null;

  const { data: images } = await admin
    .from("product_images")
    .select("*")
    .eq("product_id", product.id)
    .order("position");

  const normalized = normalize([product as unknown as DbProduct], images ?? []);
  return normalized[0] ?? null;
}

export async function getAdminCategories(): Promise<Category[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("categories")
    .select("id, slug, name, sort_order, created_at")
    .order("sort_order")
    .order("name");
  return (data ?? []) as Category[];
}

export async function getAdminStats(): Promise<{
  products: number;
  activeProducts: number;
  categories: number;
}> {
  const admin = createAdminClient();
  const [{ count: products }, { count: activeProducts }, { count: categories }] =
    await Promise.all([
      admin.from("products").select("*", { count: "exact", head: true }),
      admin
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("active", true),
      admin.from("categories").select("*", { count: "exact", head: true }),
    ]);
  return {
    products: products ?? 0,
    activeProducts: activeProducts ?? 0,
    categories: categories ?? 0,
  };
}

export async function isAdminUser(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role === "admin";
}
