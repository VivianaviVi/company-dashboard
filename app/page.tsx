"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Paper, Typography, Button, Stack } from "@mui/material";
import { PageContainer } from "../components/PageContainer";
import { getAuthToken } from "../components/authClient";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const t = getAuthToken();
    router.replace(t ? "/dashboard" : "/login");
  }, [router]);

  return (
    <PageContainer maxWidth="sm">
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack spacing={1.5} alignItems="flex-start">
          <Typography variant="h5">Loading...</Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting to your dashboard.
          </Typography>
          <Button variant="contained" onClick={() => router.push("/login")}>
            Go to Login
          </Button>
        </Stack>
      </Paper>
    </PageContainer>
  );
}
