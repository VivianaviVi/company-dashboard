"use client";

import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import { PageContainer } from "../../components/PageContainer";

export default function SignupPage() {
  return (
    <PageContainer maxWidth="sm">
      <Box sx={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Paper sx={{ p: 2, width: 420, maxWidth: "100%" }}>
          <Stack spacing={2}>
            <Typography variant="h4">Signup</Typography>
            <Alert severity="info">
              Please login with: admin@example.com / manager@example.com / test@example.com (password: 123456)
            </Alert>
            <Button variant="contained" onClick={() => (window.location.href = "/login")}>
              Go to Login
            </Button>
          </Stack>
        </Paper>
      </Box>
    </PageContainer>
  );
}

