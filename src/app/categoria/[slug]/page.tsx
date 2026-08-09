export const revalidate = 3600;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getProductsByCategory } from "@/lib/queries";
import ProductCard from "@/components/ProductCard";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductsByCategory(slug);
  if (!data) return { title: "Categoría no encontrada" };
  return {
    title: `${data.category.name} | Zootecnica Jerezana`,
  };
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProductsByCategory(slug);

  if (!data) notFound();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-zinc-900">{data.category.name}</h1>
      {data.products.length === 0 ? (
        <p className="text-zinc-500">No hay productos en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data.products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
