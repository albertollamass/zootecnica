import "server-only";

import { unstable_cache } from "next/cache";
import { createDataClient } from "@/lib/supabase/data";
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

export const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const supabase = createDataClient();
    const { data } = await supabase
      .from("categories")
      .select("id, slug, name, sort_order, created_at")
      .order("sort_order")
      .order("name");
    return (data ?? []) as Category[];
  },
  ["categories"],
  { tags: ["categories"], revalidate: 3600 }
);

export async function getProducts(): Promise<Product[]> {
  const supabase = createDataClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, category_id, slug, name, description, price, stock, active, created_at, updated_at, category:categories(id, slug, name)")
    .eq("active", true)
    .order("created_at", { ascending: false });

  const ids = (products ?? []).map((p) => p.id);
  const { data: images } =
    ids.length > 0
      ? await supabase
          .from("product_images")
          .select("*")
          .in("product_id", ids)
          .order("position")
      : { data: [] as ProductImage[] };

  return normalize((products ?? []) as unknown as DbProduct[], images ?? []);
}

export async function getProductsByCategory(slug: string): Promise<{
  category: Category;
  products: Product[];
} | null> {
  const supabase = createDataClient();
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) return null;

  const { data: products } = await supabase
    .from("products")
    .select("id, category_id, slug, name, description, price, stock, active, created_at, updated_at, category:categories(id, slug, name)")
    .eq("active", true)
    .eq("category_id", category.id)
    .order("created_at", { ascending: false });

  const ids = (products ?? []).map((p) => p.id);
  const { data: images } =
    ids.length > 0
      ? await supabase
          .from("product_images")
          .select("*")
          .in("product_id", ids)
          .order("position")
      : { data: [] as ProductImage[] };

  return {
    category,
    products: normalize((products ?? []) as unknown as DbProduct[], images ?? []),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createDataClient();
  const { data: product } = await supabase
    .from("products")
    .select("id, category_id, slug, name, description, price, stock, active, created_at, updated_at, category:categories(id, slug, name)")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!product) return null;

  const { data: images } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", product.id)
    .order("position");

  const normalized = normalize([product as unknown as DbProduct], images ?? []);
  return normalized[0] ?? null;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const all = await getProducts();
  return all.slice(0, limit);
}

