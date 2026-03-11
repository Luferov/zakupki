"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FormEvent, useMemo, useState } from "react";
import { useMarketplace } from "@/components/providers/marketplace-provider";
import { PaymentMethod } from "@/lib/marketplace";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartDetails, cartTotal, checkout, notify, user } = useMarketplace();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("sbp");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [house, setHouse] = useState("");
  const [apartment, setApartment] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");

  const isFormValid = useMemo(
    () =>
      Boolean(
        city.trim() &&
          street.trim() &&
          house.trim() &&
          postalCode.trim() &&
          phone.trim().length >= 10,
      ),
    [city, street, house, postalCode, phone],
  );

  const handlePay = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      notify("Для оплаты заказа нужно войти в аккаунт.", "warning");
      router.push("/auth");
      return;
    }

    if (cartDetails.length === 0) {
      notify("Корзина пуста. Добавьте товары перед оплатой.", "warning");
      return;
    }

    if (!isFormValid) {
      notify("Заполните обязательные поля и корректный номер телефона.", "error");
      return;
    }

    const isPaid = await checkout({
      paymentMethod,
      city,
      street,
      house,
      apartment,
      postalCode,
      phone,
    });

    if (isPaid) {
      router.push("/buy");
    }
  };

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
          <Typography variant="h4">Оформление заказа</Typography>
          <Typography color="text.secondary">
            Чтобы оплатить заказ, сначала войдите в аккаунт.
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
          <Typography variant="h4">Оформление заказа</Typography>
          <Typography color="text.secondary">
            Сейчас корзина пустая. Вернитесь в каталог и добавьте товары.
          </Typography>
          <Button component={Link} href="/buy" variant="contained" sx={{ width: "fit-content" }}>
            Перейти к покупкам
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
        <Typography variant="h4">Корзина и оплата</Typography>
        <Typography color="text.secondary">
          Проверьте данные заказа и завершите оплату.
        </Typography>
      </Paper>

      <Paper
        component="form"
        onSubmit={handlePay}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          border: "1px solid",
          borderColor: "rgba(148,163,184,0.24)",
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={1.2}>
            <Typography variant="h6">Список товаров</Typography>
            {cartDetails.map((item) => (
              <Typography key={item.product.id} color="text.secondary">
                • {item.product.name} ({item.quantity} шт.) —{" "}
                {item.subtotal.toLocaleString("ru-RU")} ₽
              </Typography>
            ))}
            <Typography variant="h6" color="primary.main">
              Итоговая сумма: {cartTotal.toLocaleString("ru-RU")} ₽
            </Typography>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="h6">Способ оплаты</Typography>
            <RadioGroup
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
            >
              <FormControlLabel value="sbp" control={<Radio />} label="🏦 СБП" />
              <FormControlLabel value="card" control={<Radio />} label="💳 Карта" />
              <FormControlLabel value="invoice" control={<Radio />} label="📄 Счёт" />
            </RadioGroup>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="h6">Адрес доставки</Typography>
            <Box
              component="iframe"
              title="Карта доставки"
              src="https://www.openstreetmap.org/export/embed.html?bbox=37.53%2C55.70%2C37.74%2C55.82&amp;layer=mapnik"
              sx={{
                border: 0,
                width: "100%",
                height: 250,
                borderRadius: 2,
              }}
            />
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              <TextField
                label="Город"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Улица"
                value={street}
                onChange={(event) => setStreet(event.target.value)}
                fullWidth
                required
              />
            </Stack>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              <TextField
                label="Дом"
                value={house}
                onChange={(event) => setHouse(event.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Квартира"
                value={apartment}
                onChange={(event) => setApartment(event.target.value)}
                fullWidth
              />
              <TextField
                label="Индекс"
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
                fullWidth
                required
              />
            </Stack>
          </Stack>

          <TextField
            label="Телефон получателя"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+7 (900) 123-45-67"
            required
          />

          <Button type="submit" variant="contained" size="large" disabled={!isFormValid}>
            Оплатить заказ
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
