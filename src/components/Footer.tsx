import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-6 text-sm text-zinc-500 sm:flex-row sm:justify-between">
<p>© {new Date().getFullYear()} Zootecnica Jerezana</p>
        <span className="flex items-center gap-4">
          <span className="text-zinc-400">Tienda y encargos en Jerez de la Frontera</span>
          <Link href="/admin" className="text-zinc-400 hover:text-brand">
            Admin
          </Link>
        </span>
      </div>
    </footer>
  );
}
