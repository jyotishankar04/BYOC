"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  username: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  avatar: string | null;
  onboarded: boolean | null;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  id: string;
  userId: string;
}

interface ApiResponse {
  user: Record<string, unknown>;
  session: { id: string; userId: string };
}

interface SessionData {
  user: User;
  session: Session;
}

interface UseSessionReturn {
  data: SessionData | null;
  isPending: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

let cachedSession: SessionData | null = null;
let cachedError: Error | null = null;
let currentSessionPromise: Promise<SessionData | null> | null = null;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${BASE}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

async function fetchSession(retried = false): Promise<SessionData | null> {
  try {
    const res = await fetch(`${BASE}/api/v1/auth/me`, {
      credentials: "include",
    });
    if (!res.ok) {
      if (res.status === 401 && !retried) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return fetchSession(true);
        }
        return null;
      }
      if (res.status === 401) return null;
      throw new Error(`Session fetch failed: ${res.status}`);
    }
    const body = (await res.json()) as ApiResponse;
    if (!body.user) return null;
    return {
      user: body.user as unknown as User,
      session: body.session,
    };
  } catch (err) {
    throw err;
  }
}

function getOrFetchSession(): Promise<SessionData | null> {
  if (currentSessionPromise) return currentSessionPromise;
  currentSessionPromise = fetchSession().finally(() => {
    currentSessionPromise = null;
  });
  return currentSessionPromise;
}

export function useSession(): UseSessionReturn {
  const [data, setData] = useState<SessionData | null>(cachedSession);
  const [isPending, setIsPending] = useState(!cachedSession && !cachedError);
  const [error, setError] = useState<Error | null>(cachedError);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    setIsPending(true);
    try {
      const result = await getOrFetchSession();
      if (mountedRef.current) {
        cachedSession = result;
        cachedError = null;
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        cachedError = err as Error;
        setError(err as Error);
        setData(null);
      }
    } finally {
      if (mountedRef.current) {
        setIsPending(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (!cachedSession && !cachedError && !currentSessionPromise) {
      const timer = window.setTimeout(() => {
        void refresh();
      }, 0);
      return () => {
        mountedRef.current = false;
        window.clearTimeout(timer);
      };
    }
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  return { data, isPending, error, refresh };
}

export async function signIn(): Promise<void> {
  window.location.href = `${BASE}/api/v1/auth/google`;
}

export async function signOut(): Promise<void> {
  await fetch(`${BASE}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  cachedSession = null;
  cachedError = null;
  window.location.href = "/auth/login";
}
