"use client";

import Link from "next/link";
import EastOutlinedIcon from "@mui/icons-material/EastOutlined";
import AddBusinessOutlinedIcon from "@mui/icons-material/AddBusinessOutlined";
import ShoppingCartCheckoutOutlinedIcon from "@mui/icons-material/ShoppingCartCheckoutOutlined";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";

export default function Home() {
  return (
    <Stack spacing={4}>
      <Paper
        sx={{
          p: { xs: 3, md: 6 },
          border: "1px solid",
          borderColor: "rgba(15, 118, 110, 0.2)",
          background:
            "linear-gradient(150deg, rgba(20,184,166,0.14) 0%, rgba(255,255,255,1) 52%, rgba(249,115,22,0.16) 100%)",
        }}
      >
        <Stack spacing={3} maxWidth={700}>
          <Typography variant="h2" component="h1">
            НеМаркеплейс
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Площадка для покупки и продажи товаров с быстрым оформлением заказа.
            Всё, что нужно для MVP: каталог, корзина, публикация и checkout.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              component={Link}
              href="/buy"
              variant="contained"
              size="large"
              startIcon={<ShoppingCartCheckoutOutlinedIcon />}
              endIcon={<EastOutlinedIcon />}
            >
              Купить товары
            </Button>
            <Button
              component={Link}
              href="/sell"
              variant="outlined"
              size="large"
              startIcon={<AddBusinessOutlinedIcon />}
            >
              Продать товары
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        {[
          {
            title: "Каталог",
            text: "Поиск по названию, фильтрация по цене и категории, контакт с продавцом.",
          },
          {
            title: "Публикация",
            text: "Форма продажи с загрузкой фото, описанием, ценой и остатком.",
          },
          {
            title: "Checkout",
            text: "Корзина, итоговая сумма, способ оплаты, адрес и телефон получателя.",
          },
        ].map((card) => (
          <Paper
            key={card.title}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "rgba(148,163,184,0.25)",
              transition: "transform 160ms ease, box-shadow 160ms ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 4,
              },
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              {card.title}
            </Typography>
            <Typography color="text.secondary">{card.text}</Typography>
          </Paper>
        ))}
      </Box>
    </Stack>
  );
}
