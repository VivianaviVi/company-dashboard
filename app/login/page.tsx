"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { PageContainer } from "../../components/PageContainer";
import { setAuth } from "../../components/authClient";
import { API_BASE } from "../../components/apiClient";

function isBlank(value: string) {
  return value.trim() === "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hasIllegalChars(value: string) {
  return /[<>"'`\\]/.test(value);
}

async function loginBackend(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const text = await res.text();
  const data = text ? (JSON.parse(text) as { access_token?: string; user?: { email?: string } | null; message?: string }) : {};
  if (!res.ok) throw new Error(data.message || `Login failed: ${res.status}`);
  if (!data.access_token) throw new Error("Login failed: missing access_token");
  return { token: data.access_token, email: (data.user?.email || email).trim() };
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  function validateEmail(nextEmail: string) {
    if (isBlank(nextEmail)) return "Email is required";
    if (hasIllegalChars(nextEmail)) return "Email contains illegal characters";
    if (!isValidEmail(nextEmail)) return "Invalid email format";
    return "";
  }

  function validatePassword(nextPassword: string) {
    if (isBlank(nextPassword)) return "Password is required";
    if (hasIllegalChars(nextPassword)) return "Password contains illegal characters";
    if (/\s/.test(nextPassword)) return "Password cannot contain spaces";
    return "";
  }

  async function onSubmit() {
    setSuccess(false);
    setSubmitError("");

    const emailValue = email.trim();
    const e1 = validateEmail(emailValue);
    const e2 = validatePassword(password);
    setEmailError(e1);
    setPasswordError(e2);
    if (e1 || e2) return;

    try {
      const { token, email: e } = await loginBackend(emailValue, password);
      setAuth(e, token);
      setSuccess(true);
      router.replace("/dashboard");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <PageContainer maxWidth="sm">
      <Box sx={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Paper sx={{ p: 2, width: 420, maxWidth: "100%" }}>
        <Stack
          spacing={2}
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
        <Typography variant="h4">Login</Typography>

        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError("");
          }}
          onBlur={() => setEmailError(validateEmail(email))}
          error={!!emailError}
          helperText={emailError || " "}
          fullWidth
        />

        <TextField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError("");
          }}
          onBlur={() => setPasswordError(validatePassword(password))}
          error={!!passwordError}
          helperText={passwordError || " "}
          fullWidth
        />

        <Button variant="contained" type="submit">
          Sign in
        </Button>

        {submitError ? <Alert severity="error">{submitError}</Alert> : null}
        {success ? <Alert severity="success">Signed in</Alert> : null}

        <Alert severity="info">
          Test accounts: admin@example.com / manager@example.com / test@example.com (password: 123456)
        </Alert>

        <Button
          variant="text"
          onClick={() => {
            window.location.href = "/signup";
          }}
        >
          Go to Sign up
        </Button>
        </Stack>
        </Paper>
      </Box>
    </PageContainer>
  );
}

