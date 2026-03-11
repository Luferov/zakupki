"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import {
  Button,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { FormEvent, SyntheticEvent, useState } from "react";
import { useMarketplace } from "@/components/providers/marketplace-provider";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const { isAuthLoading, login, register, user } = useMarketplace();

  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const success =
      mode === "register"
        ? await register({ name, email, password })
        : await login({ email, password });

    setIsSubmitting(false);

    if (success) {
      router.push("/buy");
    }
  };

  if (isAuthLoading) {
    return (
      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Typography>Проверяем сессию...</Typography>
      </Paper>
    );
  }

  if (user) {
    return (
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          border: "1px solid",
          borderColor: "rgba(148,163,184,0.24)",
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h4">Вы уже авторизованы</Typography>
          <Typography color="text.secondary">
            Аккаунт: {user.name ?? user.email}
          </Typography>
          <Button
            component={Link}
            href="/buy"
            variant="contained"
            startIcon={<VerifiedUserOutlinedIcon />}
            sx={{ width: "fit-content" }}
          >
            Перейти к покупкам
          </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: { xs: 3, md: 4 },
        border: "1px solid",
        borderColor: "rgba(148,163,184,0.24)",
        maxWidth: 560,
        mx: "auto",
      }}
    >
      <Stack spacing={2}>
        <Typography variant="h4">Регистрация и вход</Typography>
        <Typography color="text.secondary">
          Авторизуйтесь, чтобы добавлять товары в корзину и публиковать новые
          позиции.
        </Typography>

        <Tabs
          value={mode}
          onChange={(_: SyntheticEvent, value: AuthMode) => setMode(value)}
        >
          <Tab value="login" label="Вход" />
          <Tab value="register" label="Регистрация" />
        </Tabs>

        {mode === "register" ? (
          <TextField
            label="Имя"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        ) : null}

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <TextField
          label="Пароль"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          startIcon={
            mode === "register" ? <PersonAddAlt1OutlinedIcon /> : <LoginOutlinedIcon />
          }
        >
          {mode === "register" ? "Зарегистрироваться" : "Войти"}
        </Button>
      </Stack>
    </Paper>
  );
}
