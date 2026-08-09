export const revalidate = 3600;

import Link from "next/link";
import { getCategories, getFeaturedProducts } from "@/lib/queries";
import ProductCard from "@/components/ProductCard";

const steps = [
  {
    n: "1",
    title: "Explora el catálogo",
    text: "Navega por las categorías y mira cada producto con sus fotos, precio y descripción.",
  },
  {
    n: "2",
    title: "Haz tu encargo",
    text: "Esta web es para encargar productos de la tienda: pasa por Zootécnica Jerezana o contacta con nosotros y dínos qué quieres.",
  },
  {
    n: "3",
    title: "Recoge tu pedido",
    text: "Preparamos tu pedido y lo tienes listo para recoger en la tienda, sin esperas.",
  },
];

export default async function Home() {
  const [categories, featured] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
  ]);

  return (
    <div className="flex flex-col gap-16">
      <section className="relative overflow-hidden rounded-2xl bg-brand px-6 py-16 text-white">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-soft">
            Desde 1985 · Jerez de la Frontera
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Zootécnica Jerezana
          </h1>
          <p className="mt-4 text-lg text-brand-soft">
            Tienda de animales, clínica veterinaria y farmacia. Esta web es la
            tienda online de la casa: consulta todos nuestros productos y haz tu
            encargo para recogerlo en tienda.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/productos"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-brand hover:bg-brand-soft"
            >
              Ver productos
            </Link>
            <Link
              href="#como-funciona"
              className="rounded-lg border border-white/70 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              Cómo funciona
            </Link>
          </div>
        </div>
      </section>

      <section id="como-funciona">
        <h2 className="mb-6 text-2xl font-bold text-zinc-900">
          ¿Cómo hacer un encargo?
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-xl border border-zinc-200 bg-white p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
                {s.n}
              </span>
              <h3 className="mt-4 font-semibold text-zinc-900">{s.title}</h3>
              <p className="mt-2 text-sm text-zinc-600">{s.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 rounded-xl bg-brand-soft p-4 text-sm text-zinc-700">
          Esta web no tiene carrito ni pago online: es un catálogo para realizar
          encargos. Elige tus productos y pásate por nuestra tienda en Jerez o
          contacta con nosotros para confirmar disponibilidad y recogida.
        </p>
      </section>

      {categories.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-zinc-900">Categorías</h2>
            <Link
              href="/productos"
              className="text-sm font-semibold text-brand hover:text-brand-dark"
            >
              Ver todo →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categoria/${c.slug}`}
                className="rounded-xl border border-zinc-200 bg-white p-6 text-center font-medium text-zinc-800 transition-colors hover:border-brand hover:text-brand"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-zinc-900">Destacados</h2>
            <Link
              href="/productos"
              className="text-sm font-semibold text-brand hover:text-brand-dark"
            >
              Ver todo →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
