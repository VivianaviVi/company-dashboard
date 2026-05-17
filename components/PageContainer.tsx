"use client";

import type { ReactNode } from "react";
import { Box, Container } from "@mui/material";

// Responsive page wrapper.
// - Uses MUI Container breakpoints to keep content readable on mobile/tablet/desktop.
// - Standardizes page padding to reduce per-page layout code.
export function PageContainer({
  children,
  maxWidth = "lg",
}: {
  children: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  return (
    <Box sx={{ width: "100%", bgcolor: "background.default" }}>
      <Container
        maxWidth={maxWidth}
        sx={{
          py: { xs: 2, sm: 3 },
          px: { xs: 1.5, sm: 2 },
        }}
      >
        {children}
      </Container>
    </Box>
  );
}

