"use client";

import { usePathname, useRouter } from "next/navigation";
import { Box, Button, Stack, Tab, Tabs } from "@mui/material";
import { useSyncExternalStore } from "react";
import { clearAuth, getAuthEmail, subscribeAuth } from "./authClient";

const TABS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Companies", href: "/companies" },
  { label: "User", href: "/user" },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const email = useSyncExternalStore(subscribeAuth, getAuthEmail, () => "");
  const loggedIn = !!email;
  const currentHref = loggedIn ? (TABS.find((t) => pathname?.startsWith(t.href))?.href ?? false) : false;

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", px: { xs: 1, sm: 2 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        gap={1}
        sx={{ py: 0.5 }}
      >
        {loggedIn ? (
          <Tabs
            value={currentHref}
            aria-label="Navigation Tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ minHeight: 44 }}
          >
            {TABS.map((t) => (
              <Tab
                key={t.href}
                label={t.label}
                value={t.href}
                onClick={() => {
                  router.push(t.href);
                }}
                sx={{ minHeight: 44 }}
              />
            ))}
          </Tabs>
        ) : (
          <Box />
        )}

        <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: "flex-end", sm: "flex-end" } }}>
          {loggedIn ? (
            <Button
              variant="text"
              onClick={() => {
                clearAuth();
                router.replace("/login");
              }}
            >
              Log out
            </Button>
          ) : (
            <>
              <Button variant="text" onClick={() => router.push("/login")}>
                Login
              </Button>
              <Button variant="text" onClick={() => router.push("/signup")}>
                Signup
              </Button>
            </>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

