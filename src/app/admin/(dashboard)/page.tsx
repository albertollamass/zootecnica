export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAdminStats } from "@/lib/admin";

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-zinc-900">Panel de administración</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">Productos</p>
          <p className="text-3xl font-bold text-zinc-900">{stats.products}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">Productos activos</p>
          <p className="text-3xl font-bold text-zinc-900">{stats.activeProducts}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">Categorías</p>
          <p className="text-3xl font-bold text-zinc-900">{stats.categories}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Link
          href="/admin/productos/nuevo"
          className="rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark"
        >
          Nuevo producto
        </Link>
        <Link
          href="/admin/categorias"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 font-semibold text-zinc-700 hover:border-brand hover:text-brand"
        >
          Gestionar categorías
        </Link>
      </div>
    </div>
  );
}
