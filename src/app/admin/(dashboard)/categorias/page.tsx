export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getAdminCategories } from "@/lib/admin";
import CategoryManager from "./CategoryManager";

export const metadata: Metadata = {
  title: "Categorías | Zootecnica Jerezana",
};

export default async function AdminCategoriasPage() {
  const categories = await getAdminCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-zinc-900">Categorías</h1>
      <CategoryManager categories={categories} />
    </div>
  );
}
