"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { createProduct, updateProduct } from "@/app/admin/actions";
import type { Category, Product } from "@/lib/types";
import { productImageUrl } from "@/lib/utils";

const MAX_IMAGES = 4;

export default function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: Product;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const action = product
    ? updateProduct.bind(null, product.id)
    : createProduct;

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await action(formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar.");
      setPending(false);
    }
  }

  function onFilesChange(filesList: FileList | null) {
    const selected = Array.from(filesList ?? []).slice(0, MAX_IMAGES);
    setFiles(selected);
  }

  return (
    <form
      action={onSubmit}
      className="flex max-w-2xl flex-col gap-5 rounded-xl border border-zinc-200 bg-white p-6"
    >
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Nombre *
        <input
          type="text"
          name="name"
          required
          defaultValue={product?.name}
          className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-brand"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Categoría
        <select
          name="category_id"
          defaultValue={product?.category_id ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-brand"
        >
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Precio (€) *
          <input
            type="number"
            name="price"
            required
            min="0"
            step="0.01"
            defaultValue={product?.price}
            className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Stock
          <input
            type="number"
            name="stock"
            min="0"
            defaultValue={product?.stock}
            className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-brand"
          />
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm font-medium text-zinc-700">
          <input
            type="checkbox"
            name="active"
            defaultChecked={product ? product.active : true}
            className="h-4 w-4 accent-brand"
          />
          Activo
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Descripción
        <textarea
          name="description"
          rows={5}
          defaultValue={product?.description ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-brand"
        />
      </label>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-zinc-700">Fotos (máx. {MAX_IMAGES})</p>

        {product && (product.images?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-3">
            {product.images?.map((img) => (
              <label key={img.id} className="flex cursor-pointer flex-col items-center gap-1 text-xs text-zinc-600">
                <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-zinc-200">
                  <Image
                    src={productImageUrl(img.path)}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <span className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    name={`removeImage_${img.id}`}
                    className="h-3 w-3 accent-red-600"
                  />
                  Eliminar
                </span>
              </label>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={(e) => onFilesChange(e.target.files)}
          className="block w-full text-sm text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-brand-dark"
        />
        {files.length > 0 && (
          <p className="text-xs text-zinc-500">{files.length} foto(s) seleccionada(s).</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {pending ? "Guardando…" : product ? "Guardar cambios" : "Crear producto"}
        </button>
        <button
          type="reset"
          onClick={() => {
            if (fileInputRef.current) fileInputRef.current.value = "";
            setFiles([]);
          }}
          className="rounded-lg border border-zinc-300 px-4 py-2 font-semibold text-zinc-700 hover:border-zinc-400"
        >
          Limpiar
        </button>
      </div>
    </form>
  );
}
