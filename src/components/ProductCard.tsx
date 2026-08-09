import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice, productImageUrl } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0];

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full bg-zinc-100">
        {image ? (
          <Image
            src={productImageUrl(image.path)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs uppercase tracking-wide text-zinc-400">
          {product.category?.name ?? "Sin categoría"}
        </p>
        <h2 className="line-clamp-2 font-medium text-zinc-900">{product.name}</h2>
        <p className="mt-auto pt-2 font-semibold text-brand">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
