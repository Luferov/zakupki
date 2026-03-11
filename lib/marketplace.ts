export type ProductCategory =
  | "Электроника"
  | "Дом"
  | "Одежда"
  | "Спорт"
  | "Другое";

export type PaymentMethod = "sbp" | "card" | "invoice";

export interface SellerContact {
  email: string;
  max: string;
  whatsapp: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  category: ProductCategory;
  sellerName: string;
  sellerContact: SellerContact;
}

export interface NewProductInput {
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: ProductCategory;
  imageFile?: File | null;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartDetail {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CheckoutInput {
  paymentMethod: PaymentMethod;
  city: string;
  street: string;
  house: string;
  apartment?: string;
  postalCode: string;
  phone: string;
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Электроника",
  "Дом",
  "Одежда",
  "Спорт",
  "Другое",
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "base-1",
    name: "Беспроводные наушники AirSound",
    description:
      "Шумоподавление, до 32 часов автономной работы, удобный кейс для зарядки.",
    price: 5990,
    quantity: 18,
    category: "Электроника",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    sellerName: "Tech Store",
    sellerContact: {
      email: "techstore@example.com",
      max: "@techstore_support",
      whatsapp: "+79990001122",
    },
  },
  {
    id: "base-2",
    name: "Увлажнитель воздуха HomeMist",
    description:
      "Тихий режим, подсветка и автоматическое отключение при пустом баке.",
    price: 3490,
    quantity: 12,
    category: "Дом",
    image:
      "https://images.unsplash.com/photo-1518826778770-a729fb53327c?auto=format&fit=crop&w=900&q=80",
    sellerName: "Домашний комфорт",
    sellerContact: {
      email: "homecomfort@example.com",
      max: "@homecomfort",
      whatsapp: "+79990007733",
    },
  },
  {
    id: "base-3",
    name: "Фитнес-браслет Pulse X",
    description:
      "Шагомер, мониторинг сна и пульса, водозащита и экран с высоким контрастом.",
    price: 4290,
    quantity: 24,
    category: "Спорт",
    image:
      "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=900&q=80",
    sellerName: "Sport Point",
    sellerContact: {
      email: "sportpoint@example.com",
      max: "@sportpoint",
      whatsapp: "+79995554466",
    },
  },
  {
    id: "base-4",
    name: "Худи Urban Basic",
    description: "Плотный хлопок, свободный крой, мягкая внутренняя отделка.",
    price: 2790,
    quantity: 30,
    category: "Одежда",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    sellerName: "Street Style",
    sellerContact: {
      email: "streetstyle@example.com",
      max: "@streetstyle",
      whatsapp: "+79996668899",
    },
  },
];

export const REVIEWS = [
  {
    id: "r-1",
    author: "Марина",
    rating: 5,
    text: "Доставка быстрая, товар полностью соответствовал описанию.",
  },
  {
    id: "r-2",
    author: "Игорь",
    rating: 4,
    text: "Удобная корзина и понятное оформление заказа. Добавьте больше фильтров.",
  },
  {
    id: "r-3",
    author: "Светлана",
    rating: 5,
    text: "Связалась с продавцом через WhatsApp, все вопросы решили за пару минут.",
  },
];
