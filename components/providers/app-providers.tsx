"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { Box, Container, CssBaseline, ThemeProvider } from "@mui/material";
import { SiteHeader } from "@/components/layout/site-header";
import { MarketplaceProvider } from "@/components/providers/marketplace-provider";
import { theme } from "@/lib/theme";

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MarketplaceProvider>
          <Box
            sx={{
              minHeight: "100vh",
              background:
                "radial-gradient(circle at 8% 0%, #e0f2f1 0%, #f4f7fb 32%, #ffffff 100%)",
            }}
          >
            <SiteHeader />
            <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
              {children}
            </Container>
          </Box>
        </MarketplaceProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
