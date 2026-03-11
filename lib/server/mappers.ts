import "server-only";

import { AuthUser, CartDetail, Product } from "@/lib/marketplace";

interface UserFields {
  id: string;
  email: string;
  name: string | null;
  maxHandle: string | null;
  whatsapp: string | null;
}

interface ProductFields {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  imagePath: string;
  seller: UserFields;
}

interface CartItemFields {
  quantity: number;
  product: ProductFields;
}

function normalizeCategory(rawCategory: string): Product["category"] {
  const allowedCategories = new Set<Product["category"]>([
    "Электроника",
    "Дом",
    "Одежда",
    "Спорт",
    "Другое",
  ]);

  if (allowedCategories.has(rawCategory as Product["category"])) {
    return rawCategory as Product["category"];
  }

  return "Другое";
}

export function mapUser(user: Pick<UserFields, "id" | "email" | "name">): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export function mapProduct(product: ProductFields): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    quantity: product.quantity,
    image: product.imagePath,
    category: normalizeCategory(product.category),
    sellerName: product.seller.name ?? product.seller.email,
    sellerContact: {
      email: product.seller.email,
      max: product.seller.maxHandle ?? "не указан",
      whatsapp: product.seller.whatsapp ?? "не указан",
    },
  };
}

export function mapCartItem(item: CartItemFields): CartDetail {
  const product = mapProduct(item.product);

  return {
    product,
    quantity: item.quantity,
    subtotal: item.quantity * product.price,
  };
}
