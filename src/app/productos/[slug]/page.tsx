export const revalidate = 3600;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/queries";
import { formatPrice, productImageUrl } from "@/lib/utils";
import ProductCarousel from "@/components/ProductCarousel";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: `${product.name} | Zootecnica Jerezana`,
    description: product.description ?? undefined,
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <ProductCarousel
        images={(product.images ?? []).map((img) => productImageUrl(img.path))}
      />
      <div className="flex flex-col gap-4">
        <p className="text-sm uppercase tracking-wide text-zinc-400">
          {product.category?.name ?? "Sin categoría"}
        </p>
        <h1 className="text-3xl font-bold text-zinc-900">{product.name}</h1>
        <p className="text-2xl font-semibold text-brand">
          {formatPrice(product.price)}
        </p>
        <p className="text-sm text-zinc-500">
          {product.stock > 0 ? `Stock: ${product.stock}` : "Sin stock"}
        </p>
        {product.description && (
          <div className="whitespace-pre-line text-zinc-700">
            {product.description}
          </div>
        )}
      </div>
    </div>
  );
}
