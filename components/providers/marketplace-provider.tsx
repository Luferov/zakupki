"use client";

import { Alert, AlertColor, Snackbar } from "@mui/material";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AuthUser,
  CartDetail,
  CheckoutInput,
  LoginInput,
  NewProductInput,
  PRODUCT_CATEGORIES,
  Product,
  ProductCategory,
  RegisterInput,
} from "@/lib/marketplace";

interface MarketplaceContextValue {
  user: AuthUser | null;
  isAuthLoading: boolean;
  isProductsLoading: boolean;
  isCartLoading: boolean;
  products: Product[];
  categories: ProductCategory[];
  cartDetails: CartDetail[];
  cartCount: number;
  cartTotal: number;
  register: (input: RegisterInput) => Promise<boolean>;
  login: (input: LoginInput) => Promise<boolean>;
  logout: () => Promise<void>;
  addProduct: (input: NewProductInput) => Promise<boolean>;
  addToCart: (productId: string) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<void>;
  checkout: (input: CheckoutInput) => Promise<boolean>;
  refreshProducts: () => Promise<void>;
  refreshCart: () => Promise<void>;
  notify: (message: string, severity?: AlertColor) => void;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const MarketplaceContext = createContext<MarketplaceContextValue | undefined>(
  undefined,
);

async function readApiError(response: Response, fallback: string) {
  const body = await response.json().catch(() => null);
  if (body && typeof body.error === "string") {
    return body.error;
  }
  return fallback;
}

export function MarketplaceProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartDetails, setCartDetails] = useState<CartDetail[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const categories = useMemo(() => {
    const dynamicCategories = products.map((product) => product.category);
    return [...new Set([...PRODUCT_CATEGORIES, ...dynamicCategories])];
  }, [products]);

  const cartCount = useMemo(
    () => cartDetails.reduce((sum, item) => sum + item.quantity, 0),
    [cartDetails],
  );
  const cartTotal = useMemo(
    () => cartDetails.reduce((sum, item) => sum + item.subtotal, 0),
    [cartDetails],
  );

  const notify = useCallback((message: string, severity: AlertColor = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  const refreshProducts = useCallback(async () => {
    const response = await fetch("/api/products", { cache: "no-store" });
    if (!response.ok) {
      const message = await readApiError(
        response,
        "Не удалось загрузить товары.",
      );
      throw new Error(message);
    }

    const data = (await response.json()) as { products: Product[] };
    setProducts(data.products);
  }, []);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCartDetails([]);
      return;
    }

    const response = await fetch("/api/cart", { cache: "no-store" });
    if (response.status === 401) {
      setCartDetails([]);
      return;
    }
    if (!response.ok) {
      const message = await readApiError(
        response,
        "Не удалось загрузить корзину.",
      );
      throw new Error(message);
    }

    const data = (await response.json()) as { items: CartDetail[] };
    setCartDetails(data.items);
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const sessionResponse = await fetch("/api/auth/session", {
          cache: "no-store",
        });
        if (!sessionResponse.ok) {
          throw new Error("Не удалось проверить авторизацию.");
        }

        const sessionData = (await sessionResponse.json()) as {
          user: AuthUser | null;
        };
        if (cancelled) {
          return;
        }

        setUser(sessionData.user);

        try {
          await refreshProducts();
        } catch (error) {
          if (!cancelled) {
            notify(
              error instanceof Error
                ? error.message
                : "Не удалось загрузить товары.",
              "error",
            );
          }
        } finally {
          if (!cancelled) {
            setIsProductsLoading(false);
          }
        }

        if (sessionData.user) {
          try {
            const cartResponse = await fetch("/api/cart", { cache: "no-store" });
            if (cartResponse.ok) {
              const cartData = (await cartResponse.json()) as { items: CartDetail[] };
              if (!cancelled) {
                setCartDetails(cartData.items);
              }
            }
          } catch {
            if (!cancelled) {
              notify("Не удалось загрузить корзину.", "error");
            }
          } finally {
            if (!cancelled) {
              setIsCartLoading(false);
            }
          }
        } else if (!cancelled) {
          setCartDetails([]);
          setIsCartLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          notify(
            error instanceof Error ? error.message : "Ошибка инициализации данных.",
            "error",
          );
          setIsProductsLoading(false);
          setIsCartLoading(false);
        }
      } finally {
        if (!cancelled) {
          setIsAuthLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [notify, refreshProducts]);

  const register = useCallback(
    async (input: RegisterInput) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        notify(await readApiError(response, "Не удалось зарегистрироваться."), "error");
        return false;
      }

      const data = (await response.json()) as { user: AuthUser };
      setUser(data.user);
      setCartDetails([]);
      notify("Регистрация выполнена.");
      return true;
    },
    [notify],
  );

  const login = useCallback(
    async (input: LoginInput) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        notify(await readApiError(response, "Не удалось выполнить вход."), "error");
        return false;
      }

      const data = (await response.json()) as { user: AuthUser };
      setUser(data.user);

      try {
        const cartResponse = await fetch("/api/cart", { cache: "no-store" });
        if (cartResponse.ok) {
          const cartData = (await cartResponse.json()) as { items: CartDetail[] };
          setCartDetails(cartData.items);
        }
      } catch (error) {
        notify(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить корзину после входа.",
          "error",
        );
      }

      notify("Вы вошли в аккаунт.");
      return true;
    },
    [notify],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setCartDetails([]);
    notify("Вы вышли из аккаунта.", "info");
  }, [notify]);

  const addProduct = useCallback(
    async (input: NewProductInput) => {
      if (!user) {
        notify("Для публикации товара нужно войти в аккаунт.", "warning");
        return false;
      }

      const formData = new FormData();
      formData.append("name", input.name);
      formData.append("description", input.description);
      formData.append("price", String(input.price));
      formData.append("quantity", String(input.quantity));
      formData.append("category", input.category);
      if (input.imageFile) {
        formData.append("image", input.imageFile);
      }

      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        notify(await readApiError(response, "Не удалось опубликовать товар."), "error");
        return false;
      }

      await refreshProducts();
      notify("Товар опубликован и сохранён в базе.");
      return true;
    },
    [notify, refreshProducts, user],
  );

  const addToCart = useCallback(
    async (productId: string) => {
      if (!user) {
        notify("Чтобы добавлять товары в корзину, нужно войти.", "warning");
        return false;
      }

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        notify(await readApiError(response, "Не удалось добавить товар в корзину."), "error");
        return false;
      }

      const data = (await response.json()) as { items: CartDetail[] };
      setCartDetails(data.items);
      notify("Товар добавлен в корзину.");
      return true;
    },
    [notify, user],
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      if (!user) {
        notify("Нужно войти, чтобы управлять корзиной.", "warning");
        return;
      }

      const response = await fetch(
        `/api/cart?productId=${encodeURIComponent(productId)}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        notify(await readApiError(response, "Не удалось удалить товар из корзины."), "error");
        return;
      }

      const data = (await response.json()) as { items: CartDetail[] };
      setCartDetails(data.items);
      notify("Товар удалён из корзины.", "info");
    },
    [notify, user],
  );

  const checkout = useCallback(
    async (input: CheckoutInput) => {
      if (!user) {
        notify("Для оформления заказа нужно войти.", "warning");
        return false;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        notify(await readApiError(response, "Не удалось оплатить заказ."), "error");
        return false;
      }

      setCartDetails([]);
      await refreshProducts();
      notify("Заказ успешно оплачен. Спасибо за покупку!");
      return true;
    },
    [notify, refreshProducts, user],
  );

  const value = useMemo<MarketplaceContextValue>(
    () => ({
      user,
      isAuthLoading,
      isProductsLoading,
      isCartLoading,
      products,
      categories,
      cartDetails,
      cartCount,
      cartTotal,
      register,
      login,
      logout,
      addProduct,
      addToCart,
      removeFromCart,
      checkout,
      refreshProducts,
      refreshCart,
      notify,
    }),
    [
      user,
      isAuthLoading,
      isProductsLoading,
      isCartLoading,
      products,
      categories,
      cartDetails,
      cartCount,
      cartTotal,
      register,
      login,
      logout,
      addProduct,
      addToCart,
      removeFromCart,
      checkout,
      refreshProducts,
      refreshCart,
      notify,
    ],
  );

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3200}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used inside MarketplaceProvider.");
  }
  return context;
}
