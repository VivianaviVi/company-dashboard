"use client";

import { getAuthToken } from "./authClient";

export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3002").replace(/\/+$/, "");

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

// Fetch helper that automatically adds JSON headers and JWT Authorization if available.
export async function apiFetch<T = Json>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as T) : (null as T);

  if (!res.ok) {
    const msg = (data as unknown as { message?: string })?.message || `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

