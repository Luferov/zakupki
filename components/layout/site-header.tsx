"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import {
  AppBar,
  Badge,
  Box,
  Button,
  Chip,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { useMarketplace } from "@/components/providers/marketplace-provider";

const NAVIGATION_LINKS = [
  { href: "/", label: "Главная" },
  { href: "/buy", label: "Покупка" },
  { href: "/sell", label: "Продажа" },
  { href: "/cart", label: "Корзина" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { cartCount, isAuthLoading, logout, user } = useMarketplace();

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid",
        borderColor: "rgba(148, 163, 184, 0.25)",
      }}
    >
      <Toolbar sx={{ gap: 2, justifyContent: "space-between", px: { xs: 2, md: 4 } }}>
        <Button
          component={Link}
          href="/"
          startIcon={<StorefrontOutlinedIcon />}
          sx={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}
        >
          НеМаркеплейс
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          {NAVIGATION_LINKS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                variant={isActive ? "contained" : "text"}
                color={isActive ? "primary" : "inherit"}
                size="small"
              >
                {item.label}
              </Button>
            );
          })}

          <IconButton component={Link} href="/cart" color="primary" sx={{ ml: 0.5 }}>
            <Badge badgeContent={cartCount} color="secondary">
              <ShoppingCartOutlinedIcon />
            </Badge>
          </IconButton>

          {isAuthLoading ? (
            <Button disabled size="small">
              Загрузка...
            </Button>
          ) : user ? (
            <>
              <Chip
                size="small"
                icon={<AccountCircleOutlinedIcon />}
                label={user.name ?? user.email}
                color="primary"
                variant="outlined"
              />
              <Button
                size="small"
                color="inherit"
                onClick={() => {
                  void logout();
                }}
                startIcon={<LogoutOutlinedIcon />}
              >
                Выйти
              </Button>
            </>
          ) : (
            <Button
              component={Link}
              href="/auth"
              variant="outlined"
              size="small"
              startIcon={<AccountCircleOutlinedIcon />}
            >
              Войти
            </Button>
          )}
        </Box>
      </Toolbar>
      <Typography
        component="span"
        sx={{ display: "none" }}
        aria-live="polite"
        aria-atomic="true"
      >
        В корзине товаров: {cartCount}
      </Typography>
    </AppBar>
  );
}
