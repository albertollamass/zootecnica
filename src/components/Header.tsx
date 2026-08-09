import Link from "next/link";
import { getCategories } from "@/lib/queries";

export default async function Header() {
  const categories = await getCategories();

return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-brand"
        >
          Zootecnica Jerezana
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-600">
          <Link href="/productos" className="hover:text-brand">
            Productos
          </Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/categoria/${c.slug}`} className="hover:text-brand">
              {c.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
