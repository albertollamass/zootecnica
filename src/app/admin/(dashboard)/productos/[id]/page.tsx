export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminCategories, getAdminProduct } from "@/lib/admin";
import ProductForm from "../ProductForm";

export const metadata: Metadata = {
  title: "Editar producto | Zootecnica Jerezana",
};

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getAdminCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-zinc-900">Editar producto</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
