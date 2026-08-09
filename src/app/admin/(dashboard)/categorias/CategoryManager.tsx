"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/app/admin/actions";
import type { Category } from "@/lib/types";

function CategoryForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await createCategory(formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar.");
      setPending(false);
    }
  }

  return (
    <form
      action={onSubmit}
      className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6"
    >
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 sm:col-span-2">
          Nombre *
          <input
            type="text"
            name="name"
            required
            placeholder="Ej. Alimentación"
            className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Orden
          <input
            type="number"
            name="sort_order"
            defaultValue={0}
            className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-brand"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Creando…" : "Crear categoría"}
      </button>
    </form>
  );
}

function CategoryRow({ category }: { category: Category }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onUpdate(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await updateCategory(category.id, formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar.");
      setPending(false);
    }
  }

  async function onDelete() {
    if (!confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    setPending(true);
    try {
      await deleteCategory(category.id);
      router.refresh();
    } catch {
      setPending(false);
    }
  }

  return (
    <form
      action={onUpdate}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white p-4"
    >
      {error && (
        <p className="w-full rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <label className="flex min-w-48 flex-1 flex-col gap-1 text-sm font-medium text-zinc-700">
        Nombre
        <input
          type="text"
          name="name"
          required
          defaultValue={category.name}
          className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-brand"
        />
      </label>
      <label className="flex w-28 flex-col gap-1 text-sm font-medium text-zinc-700">
        Orden
        <input
          type="number"
          name="sort_order"
          defaultValue={category.sort_order}
          className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-brand"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 disabled:opacity-50"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
        >
          Eliminar
        </button>
      </div>
    </form>
  );
}

export default function CategoryManager({ categories }: { categories: Category[] }) {
  return (
    <div className="flex flex-col gap-6">
      <CategoryForm />
      {categories.length === 0 ? (
        <p className="text-zinc-500">No hay categorías todavía.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {categories.map((c) => (
            <CategoryRow key={c.id} category={c} />
          ))}
        </div>
      )}
    </div>
  );
}
