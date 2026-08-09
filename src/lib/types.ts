export type Category = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  position: number;
  path: string;
  created_at: string;
};

export type Product = {
  id: string;
  category_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  images?: ProductImage[];
};

export type ProductWithImages = Product & { images: ProductImage[] };
