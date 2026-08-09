export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getAdminCategories } from "@/lib/admin";
import ProductForm from "../ProductForm";

export const metadata: Metadata = {
  title: "Nuevo producto | Zootecnica Jerezana",
};

export default async function NuevoProductoPage() {
  const categories = await getAdminCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-zinc-900">Nuevo producto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
