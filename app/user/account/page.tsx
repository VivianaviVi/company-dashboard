"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { PageContainer } from "../../../components/PageContainer";
import { getAuthEmail, getAuthToken, subscribeAuth } from "../../../components/authClient";
import { apiFetch } from "../../../components/apiClient";

type Me = {
  id: string;
  email: string;
  name: string;
  title: string;
  status: "active" | "inactive";
  role: "admin" | "manager" | "user";
};

export default function AccountPage() {
  const router = useRouter();
  const email = useSyncExternalStore(subscribeAuth, getAuthEmail, () => "");
  const token = useSyncExternalStore(subscribeAuth, getAuthToken, () => "");

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!email || !token) window.location.href = "/login";
  }, [email, token]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!email || !token) return;
      setError("");
      setSaved(false);
      setLoading(true);
      try {
        const data = await apiFetch<Me>("/users/me");
        if (cancelled) return;
        setMe(data);
        setName(data.name || "");
        setTitle(data.title || "");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [email, token]);

  async function onSave() {
    if (!email) return;
    setError("");
    setSaved(false);
    try {
      const updated = await apiFetch<Me>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim(), title: title.trim() }),
      });
      setMe(updated);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  if (!email || !token) {
    return (
      <PageContainer maxWidth="sm">
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h5">Please login</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You need to login to view your account.
          </Typography>
          <Button variant="contained" href="/login" sx={{ mt: 2 }}>
            Go to Login
          </Button>
        </Paper>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="md">
      <Stack spacing={2} component={Paper} sx={{ p: { xs: 1.5, sm: 2 }, width: "100%" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="h4">Account</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your profile (email is your login and cannot be edited)
            </Typography>
          </Box>
          <Button variant="text" onClick={() => router.push("/user")}>
            Back
          </Button>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {saved ? <Alert severity="success">Saved</Alert> : null}

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          ) : (
            <Stack spacing={2}>
              <TextField label="Email" value={me?.email || email} disabled />
              <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <TextField label="Role" value={me?.role || ""} disabled />
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button variant="outlined" onClick={() => { setName(me?.name || ""); setTitle(me?.title || ""); setSaved(false); }}>
                  Reset
                </Button>
                <Button variant="contained" onClick={onSave} disabled={loading}>
                  Save
                </Button>
              </Box>
            </Stack>
          )}
        </Paper>
      </Stack>
    </PageContainer>
  );
}

