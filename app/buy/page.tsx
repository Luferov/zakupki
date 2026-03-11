"use client";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Rating,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useMarketplace } from "@/components/providers/marketplace-provider";
import { Product, REVIEWS } from "@/lib/marketplace";

export default function BuyPage() {
  const { addToCart, categories, isProductsLoading, products } = useMarketplace();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const maxPriceNumber = Number(maxPrice);

    return products.filter((product) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        product.name.toLowerCase().includes(normalizedSearch);
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesPrice =
        maxPrice.length === 0 ||
        (Number.isFinite(maxPriceNumber) && product.price <= maxPriceNumber);

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchQuery, selectedCategory, maxPrice]);

  return (
    <Stack spacing={3.5}>
      <Paper
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "rgba(148,163,184,0.26)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
          justifyContent="space-between"
        >
          <Stack spacing={1}>
            <Typography variant="h4">Покупка товаров</Typography>
            <Typography color="text.secondary">
              Найдите нужный товар, отфильтруйте результаты и добавьте покупки в
              корзину.
            </Typography>
          </Stack>
          <Chip
            color="primary"
            icon={<LocalMallOutlinedIcon />}
            label={`Найдено товаров: ${filteredProducts.length}`}
          />
        </Stack>
      </Paper>

      <Paper
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "rgba(148,163,184,0.26)",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField
            label="Название товара"
            placeholder="Например: наушники"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={() => setSearchQuery(searchInput)}
            sx={{ minWidth: { md: 130 } }}
          >
            Поиск
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterAltOutlinedIcon />}
            onClick={() => setFiltersOpen(true)}
            sx={{ minWidth: { md: 150 } }}
          >
            Фильтры
          </Button>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        {isProductsLoading ? (
          <Paper
            sx={{
              p: 3,
              gridColumn: "1 / -1",
              border: "1px solid",
              borderColor: "rgba(148,163,184,0.22)",
            }}
          >
            <Typography>Загрузка товаров из базы данных...</Typography>
          </Paper>
        ) : null}

        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              border: "1px solid",
              borderColor: "rgba(148,163,184,0.22)",
              transition: "transform 150ms ease, box-shadow 150ms ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 5,
              },
            }}
          >
            <CardMedia
              component="img"
              height="190"
              image={product.image}
              alt={product.name}
              loading="lazy"
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Stack spacing={1.2}>
                <Chip label={product.category} size="small" sx={{ width: "fit-content" }} />
                <Typography variant="h6">{product.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  В наличии: {product.quantity} шт.
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {product.price.toLocaleString("ru-RU")} ₽
                </Typography>
              </Stack>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2, pt: 0, flexWrap: "wrap", gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SellOutlinedIcon />}
                onClick={() => addToCart(product.id)}
              >
                В корзину
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setSelectedProduct(product)}
              >
                Связь с продавцом
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      <Paper
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "rgba(148,163,184,0.26)",
        }}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          Отзывы покупателей
        </Typography>
        <Stack spacing={1.5}>
          {REVIEWS.map((review) => (
            <Paper
              key={review.id}
              variant="outlined"
              sx={{ p: 2, borderColor: "rgba(148,163,184,0.26)" }}
            >
              <Stack spacing={0.8}>
                <Typography fontWeight={700}>{review.author}</Typography>
                <Rating value={review.rating} readOnly precision={0.5} size="small" />
                <Typography color="text.secondary">{review.text}</Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Paper>

      <Dialog open={filtersOpen} onClose={() => setFiltersOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Фильтры товаров</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField
              select
              label="Категория"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <MenuItem value="all">Все категории</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Максимальная цена"
              type="number"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              slotProps={{ htmlInput: { min: 1 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            color="inherit"
            onClick={() => {
              setSelectedCategory("all");
              setMaxPrice("");
            }}
          >
            Сбросить
          </Button>
          <Button variant="contained" onClick={() => setFiltersOpen(false)}>
            Применить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Связь с продавцом</DialogTitle>
        <DialogContent>
          <Stack spacing={1.3} sx={{ pt: 0.8 }}>
            <Typography color="text.secondary">
              Товар: {selectedProduct?.name}
            </Typography>
            <Button
              startIcon={<EmailOutlinedIcon />}
              variant="outlined"
              component="a"
              href={`mailto:${selectedProduct?.sellerContact.email ?? ""}`}
            >
              Email: {selectedProduct?.sellerContact.email}
            </Button>
            <Button startIcon={<LocalMallOutlinedIcon />} variant="outlined" disabled>
              Max: {selectedProduct?.sellerContact.max}
            </Button>
            <Button
              startIcon={<WhatsAppIcon />}
              variant="outlined"
              component="a"
              href={`https://wa.me/${selectedProduct?.sellerContact.whatsapp
                .replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              disabled={
                !selectedProduct?.sellerContact.whatsapp ||
                selectedProduct.sellerContact.whatsapp === "не указан"
              }
            >
              WhatsApp: {selectedProduct?.sellerContact.whatsapp}
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedProduct(null)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
