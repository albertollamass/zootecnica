export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAdminProducts } from "@/lib/admin";
import ProductTable from "./ProductTable";

export default async function AdminProductosPage() {
  const products = await getAdminProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark"
        >
          Nuevo producto
        </Link>
      </div>
      {products.length === 0 ? (
        <p className="text-zinc-500">
          No hay productos. Crea el primero con &quot;Nuevo producto&quot;.
        </p>
      ) : (
        <ProductTable products={products} />
      )}
    </div>
  );
}
