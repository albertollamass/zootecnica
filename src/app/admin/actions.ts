"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminUser } from "@/lib/admin";
import { slugify } from "@/lib/utils";

const BUCKET = "product-images";
const MAX_IMAGES = 4;

async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const isAdmin = await isAdminUser(user.id);
  if (!isAdmin) redirect("/admin/login");
  return user.id;
}

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Credenciales incorrectas." };
  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

function getImages(formData: FormData): File[] {
  return formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_IMAGES);
}

async function ensureUniqueSlug(
  admin: ReturnType<typeof createAdminClient>,
  base: string,
  excludeId?: string
): Promise<string> {
  let slug = base;
  let n = 2;
  for (;;) {
    let query = admin.from("products").select("id").eq("slug", slug);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return slug;
    slug = `${base}-${n++}`;
  }
}

async function uploadImages(
  admin: ReturnType<typeof createAdminClient>,
  productId: string,
  files: File[]
): Promise<{ path: string }[]> {
  const paths: { path: string }[] = [];
  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `products/${productId}/${Date.now()}-${safeName}`;
    const { error } = await admin.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw new Error(`No se pudo subir ${file.name}: ${error.message}`);
    paths.push({ path });
  }
  return paths;
}

async function removeStoredImages(
  admin: ReturnType<typeof createAdminClient>,
  paths: string[]
) {
  if (paths.length === 0) return;
  await admin.storage.from(BUCKET).remove(paths);
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre es obligatorio.");

  const base = slugify(name) || `producto-${Date.now()}`;
  const slug = await ensureUniqueSlug(admin, base);

  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock") ?? 0);
  const category_id = String(formData.get("category_id") ?? "") || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const active = formData.get("active") === "on";

  const { data: product, error } = await admin
    .from("products")
    .insert({
      name,
      slug,
      price: Number.isFinite(price) ? price : 0,
      stock: Number.isFinite(stock) ? stock : 0,
      category_id,
      description,
      active,
    })
    .select("id")
    .single();

  if (error) throw new Error(`No se pudo crear el producto: ${error.message}`);

  const files = getImages(formData);
  if (files.length > 0) {
    const uploaded = await uploadImages(admin, product.id, files);
    if (uploaded.length > 0) {
      await admin.from("product_images").insert(
        uploaded.map((u, i) => ({
          product_id: product.id,
          path: u.path,
          position: i,
        }))
      );
    }
  }

  revalidatePath("/", "layout");
  revalidateTag("categories", "max");
  redirect("/admin/productos");
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("products")
    .select("id, slug")
    .eq("id", productId)
    .single();
  if (!existing) throw new Error("Producto no encontrado.");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre es obligatorio.");

  const base = slugify(name) || `producto-${Date.now()}`;
  const slug = await ensureUniqueSlug(admin, base, productId);

  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock") ?? 0);
  const category_id = String(formData.get("category_id") ?? "") || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const active = formData.get("active") === "on";

  const { error: updateError } = await admin
    .from("products")
    .update({
      name,
      slug,
      price: Number.isFinite(price) ? price : 0,
      stock: Number.isFinite(stock) ? stock : 0,
      category_id,
      description,
      active,
    })
    .eq("id", productId);
  if (updateError) throw new Error(`No se pudo actualizar: ${updateError.message}`);

  const { data: currentImages } = await admin
    .from("product_images")
    .select("id, path")
    .eq("product_id", productId);

  const toRemove: string[] = [];
  const toRemoveIds: string[] = [];
  for (const img of currentImages ?? []) {
    if (formData.get(`removeImage_${img.id}`) === "on") {
      toRemove.push(img.path);
      toRemoveIds.push(img.id);
    }
  }
  if (toRemoveIds.length > 0) {
    await admin.from("product_images").delete().in("id", toRemoveIds);
    await removeStoredImages(admin, toRemove);
  }

  const files = getImages(formData);
  if (files.length > 0) {
    const uploaded = await uploadImages(admin, productId, files);
    if (uploaded.length > 0) {
      const { data: remaining } = await admin
        .from("product_images")
        .select("id")
        .eq("product_id", productId);
      const nextPosition = remaining?.length ?? 0;
      await admin.from("product_images").insert(
        uploaded.map((u, i) => ({
          product_id: productId,
          path: u.path,
          position: nextPosition + i,
        }))
      );
    }
  }

  revalidatePath("/", "layout");
  revalidateTag("categories", "max");
  redirect("/admin/productos");
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: images } = await admin
    .from("product_images")
    .select("path")
    .eq("product_id", productId);
  if (images && images.length > 0) {
    await removeStoredImages(
      admin,
      images.map((i) => i.path)
    );
  }

  const { error } = await admin.from("products").delete().eq("id", productId);
  if (error) throw new Error(`No se pudo eliminar: ${error.message}`);

  revalidatePath("/", "layout");
  revalidateTag("categories", "max");
  redirect("/admin/productos");
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre es obligatorio.");

  const base = slugify(name) || `categoria-${Date.now()}`;
  const sort_order = Number(formData.get("sort_order") ?? 0);

  let slug = base;
  let n = 2;
  for (;;) {
    const { data } = await admin
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) break;
    slug = `${base}-${n++}`;
  }

  const { error } = await admin.from("categories").insert({ name, slug, sort_order });
  if (error) throw new Error(`No se pudo crear la categoría: ${error.message}`);

  revalidatePath("/", "layout");
  revalidateTag("categories", "max");
  redirect("/admin/categorias");
}

export async function updateCategory(categoryId: string, formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre es obligatorio.");
  const sort_order = Number(formData.get("sort_order") ?? 0);

  const { error } = await admin
    .from("categories")
    .update({ name, sort_order })
    .eq("id", categoryId);
  if (error) throw new Error(`No se pudo actualizar: ${error.message}`);

  revalidatePath("/", "layout");
  revalidateTag("categories", "max");
  redirect("/admin/categorias");
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin.from("categories").delete().eq("id", categoryId);
  if (error) throw new Error(`No se pudo eliminar: ${error.message}`);

  revalidatePath("/", "layout");
  revalidateTag("categories", "max");
  redirect("/admin/categorias");
}
