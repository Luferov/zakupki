"use client";

import Link from "next/link";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import {
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useMarketplace } from "@/components/providers/marketplace-provider";

export default function CartPage() {
  const { cartDetails, cartTotal, removeFromCart, user } = useMarketplace();

  if (!user) {
    return (
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          border: "1px solid",
          borderColor: "rgba(148,163,184,0.24)",
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h4">Корзина</Typography>
          <Typography color="text.secondary">
            Чтобы работать с корзиной, войдите в аккаунт.
          </Typography>
          <Button component={Link} href="/auth" variant="contained" sx={{ width: "fit-content" }}>
            Войти или зарегистрироваться
          </Button>
        </Stack>
      </Paper>
    );
  }

  if (cartDetails.length === 0) {
    return (
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          border: "1px solid",
          borderColor: "rgba(148,163,184,0.24)",
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h4">Корзина</Typography>
          <Typography color="text.secondary">
            В корзине пока нет товаров.
          </Typography>
          <Button
            component={Link}
            href="/buy"
            variant="contained"
            startIcon={<ShoppingCartOutlinedIcon />}
            sx={{ width: "fit-content" }}
          >
            Перейти к каталогу
          </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3.5 },
          border: "1px solid",
          borderColor: "rgba(148,163,184,0.24)",
        }}
      >
        <Typography variant="h4">Корзина</Typography>
        <Typography color="text.secondary">
          Проверьте товары и перейдите к оплате.
        </Typography>
      </Paper>

      <Paper
        sx={{
          p: { xs: 2.5, md: 3 },
          border: "1px solid",
          borderColor: "rgba(148,163,184,0.24)",
        }}
      >
        <Stack divider={<Divider flexItem />} spacing={1.5}>
          {cartDetails.map((item) => (
            <Stack
              key={item.product.id}
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ sm: "center" }}
              sx={{ py: 0.6 }}
            >
              <Stack spacing={0.5}>
                <Typography fontWeight={700}>{item.product.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.product.category} • {item.quantity} шт.
                </Typography>
                <Typography variant="body2" color="primary.main" fontWeight={700}>
                  {item.subtotal.toLocaleString("ru-RU")} ₽
                </Typography>
              </Stack>
              <IconButton
                color="error"
                aria-label={`Удалить ${item.product.name}`}
                onClick={() => removeFromCart(item.product.id)}
              >
                <DeleteOutlineOutlinedIcon />
              </IconButton>
            </Stack>
          ))}
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ md: "center" }}
          sx={{ mt: 3 }}
        >
          <Typography variant="h5">
            Итог: {cartTotal.toLocaleString("ru-RU")} ₽
          </Typography>
          <Button component={Link} href="/checkout" variant="contained" size="large">
            Перейти к оплате
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
