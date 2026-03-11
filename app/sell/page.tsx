"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEvent, FormEvent, useState } from "react";
import { useMarketplace } from "@/components/providers/marketplace-provider";
import { PRODUCT_CATEGORIES, ProductCategory } from "@/lib/marketplace";

interface SellFormState {
  name: string;
  description: string;
  price: string;
  quantity: string;
  category: ProductCategory;
}

const INITIAL_STATE: SellFormState = {
  name: "",
  description: "",
  price: "",
  quantity: "",
  category: "Другое",
};

export default function SellPage() {
  const router = useRouter();
  const { addProduct, notify, user } = useMarketplace();
  const [form, setForm] = useState<SellFormState>(INITIAL_STATE);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      notify("Допустимы только JPG и PNG файлы.", "error");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      notify("Для публикации товара нужно войти в аккаунт.", "warning");
      router.push("/auth");
      return;
    }

    const price = Number(form.price);
    const quantity = Number(form.quantity);
    if (!form.name.trim()) {
      notify("Название товара обязательно.", "error");
      return;
    }
    if (!Number.isFinite(price) || price < 1) {
      notify("Цена должна быть не меньше 1 рубля.", "error");
      return;
    }
    if (!Number.isFinite(quantity) || quantity < 1) {
      notify("Количество должно быть не меньше 1.", "error");
      return;
    }

    setIsSubmitting(true);
    const created = await addProduct({
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      quantity,
      category: form.category,
      imageFile,
    });
    setIsSubmitting(false);

    if (!created) {
      return;
    }

    setForm(INITIAL_STATE);
    setImagePreview("");
    setImageFile(null);
    router.push("/buy");
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
          <Typography variant="h4">Продажа товаров</Typography>
          <Typography color="text.secondary">
            Публикация товаров доступна только авторизованным пользователям.
          </Typography>
          <Button component={Link} href="/auth" variant="contained" sx={{ width: "fit-content" }}>
            Войти или зарегистрироваться
          </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "rgba(148,163,184,0.24)",
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h4">Продажа товаров</Typography>
          <Typography color="text.secondary">
            Заполните карточку товара, и он сразу появится в каталоге.
          </Typography>
        </Stack>
      </Paper>

      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: { xs: 2.5, md: 4 },
          border: "1px solid",
          borderColor: "rgba(148,163,184,0.24)",
        }}
      >
        <Stack spacing={2}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadOutlinedIcon />}
            sx={{ width: "fit-content" }}
          >
            Загрузить фото (JPG/PNG)
            <input
              type="file"
              accept="image/png,image/jpeg"
              hidden
              onChange={handleImageUpload}
            />
          </Button>

          {imagePreview ? (
            <Box
              component="img"
              src={imagePreview}
              alt="Предпросмотр товара"
              sx={{
                width: { xs: "100%", sm: 260 },
                borderRadius: 2,
                border: "1px solid",
                borderColor: "rgba(148,163,184,0.32)",
              }}
            />
          ) : null}

          <TextField
            label="Название товара"
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
            required
          />
          <TextField
            label="Характеристики"
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
            multiline
            minRows={4}
          />
          <TextField
            label="Категория"
            select
            value={form.category}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                category: event.target.value as ProductCategory,
              }))
            }
          >
            {PRODUCT_CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Цена"
            type="number"
            value={form.price}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, price: event.target.value }))
            }
            slotProps={{ htmlInput: { min: 1 } }}
            required
          />
          <TextField
            label="Доступное количество"
            type="number"
            value={form.quantity}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, quantity: event.target.value }))
            }
            slotProps={{ htmlInput: { min: 1 } }}
            required
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Inventory2OutlinedIcon />}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Публикуем..." : "Опубликовать"}
            </Button>
            <Button component={Link} href="/buy" variant="text">
              Перейти к покупкам
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
