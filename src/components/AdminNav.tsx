"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";

const links = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={
            pathname === l.href || pathname.startsWith(`${l.href}/`)
              ? "text-brand"
              : "text-zinc-600 hover:text-brand"
          }
        >
          {l.label}
        </Link>
      ))}
      <form action={logoutAction} className="ml-auto">
        <button
          type="submit"
          className="rounded-lg bg-zinc-100 px-3 py-1.5 text-zinc-700 hover:bg-zinc-200"
        >
          Cerrar sesión
        </button>
      </form>
    </nav>
  );
}
