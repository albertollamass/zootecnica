"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProduct } from "@/app/admin/actions";
import type { Product } from "@/lib/types";
import { formatPrice, productImageUrl } from "@/lib/utils";

function DeleteButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    if (!confirm("¿Eliminar este producto?")) return;
    setPending(true);
    try {
      await deleteProduct(productId);
      router.refresh();
    } catch {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
    >
      Eliminar
    </button>
  );
}

export default function ProductTable({ products }: { products: Product[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-zinc-500">
          <tr>
            <th className="px-4 py-3">Producto</th>
            <th className="px-4 py-3">Categoría</th>
            <th className="px-4 py-3">Precio</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-zinc-100 last:border-0">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                    {p.images?.[0] ? (
                      <Image
                        src={productImageUrl(p.images[0].path)}
                        alt={p.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                        Sin img
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900">{p.name}</p>
                    <p className="text-xs text-zinc-400">{p.slug}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-zinc-600">
                {p.category?.name ?? "—"}
              </td>
              <td className="px-4 py-3 text-zinc-900">{formatPrice(p.price)}</td>
              <td className="px-4 py-3 text-zinc-600">{p.stock}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    p.active
                      ? "bg-brand-soft text-brand"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {p.active ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/productos/${p.id}`}
                    className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
                  >
                    Editar
                  </Link>
                  <DeleteButton productId={p.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
