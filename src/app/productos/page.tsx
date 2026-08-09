export const revalidate = 3600;

import type { Metadata } from "next";
import { getProducts } from "@/lib/queries";
import ProductCard from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Productos | Zootecnica Jerezana",
  description: "Todos los productos disponibles",
};

export default async function ProductosPage() {
  const products = await getProducts();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-zinc-900">Productos</h1>
      {products.length === 0 ? (
        <p className="text-zinc-500">No hay productos disponibles.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
