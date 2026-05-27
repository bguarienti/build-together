// Google Calendar integration via Google Identity Services (browser-only, no backend).
// Single-user / single-browser: the OAuth Client ID and access token are stored in localStorage.

const GSI_SRC = "https://accounts.google.com/gsi/client";
const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

const LS_CLIENT_ID = "gcal.clientId";
const LS_TOKEN = "gcal.token"; // { access_token, expires_at }

export type GCalEvent = {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  htmlLink?: string;
  status?: string;
};

export type GCalCalendar = {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
};

type StoredToken = { access_token: string; expires_at: number };

declare global {
  interface Window {
    google?: any;
  }
}

export function getClientId(): string {
  return localStorage.getItem(LS_CLIENT_ID) || "";
}

export function setClientId(id: string) {
  localStorage.setItem(LS_CLIENT_ID, id.trim());
}

export function getStoredToken(): StoredToken | null {
  try {
    const raw = localStorage.getItem(LS_TOKEN);
    if (!raw) return null;
    const t = JSON.parse(raw) as StoredToken;
    if (!t.access_token || !t.expires_at) return null;
    // 30s safety window
    if (Date.now() > t.expires_at - 30_000) return null;
    return t;
  } catch {
    return null;
  }
}

export function clearToken() {
  localStorage.removeItem(LS_TOKEN);
}

export function isConnected(): boolean {
  return !!getStoredToken();
}

let gsiPromise: Promise<void> | null = null;
function loadGsi(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gsiPromise) return gsiPromise;
  gsiPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Falha ao carregar Google Identity Services")));
      return;
    }
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Falha ao carregar Google Identity Services"));
    document.head.appendChild(s);
  });
  return gsiPromise;
}

export async function requestAccessToken(prompt: "" | "consent" = ""): Promise<string> {
  const clientId = getClientId();
  if (!clientId) throw new Error("Configure o Google OAuth Client ID primeiro.");
  await loadGsi();

  return new Promise((resolve, reject) => {
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPE,
        prompt,
        callback: (resp: any) => {
          if (resp.error) {
            reject(new Error(resp.error_description || resp.error));
            return;
          }
          const expiresInSec = Number(resp.expires_in || 3600);
          const stored: StoredToken = {
            access_token: resp.access_token,
            expires_at: Date.now() + expiresInSec * 1000,
          };
          localStorage.setItem(LS_TOKEN, JSON.stringify(stored));
          resolve(stored.access_token);
        },
        error_callback: (err: any) => {
          reject(new Error(err?.message || "Autorização cancelada"));
        },
      });
      tokenClient.requestAccessToken({ prompt });
    } catch (e: any) {
      reject(e);
    }
  });
}

async function getValidToken(): Promise<string> {
  const t = getStoredToken();
  if (t) return t.access_token;
  return requestAccessToken("");
}

async function gcalFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const token = await getValidToken();
  const url = new URL(`https://www.googleapis.com/calendar/v3${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    clearToken();
    throw new Error("Sessão Google expirada. Conecte novamente.");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Calendar API [${res.status}]: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function listCalendars(): Promise<GCalCalendar[]> {
  const data = await gcalFetch<{ items: GCalCalendar[] }>("/users/me/calendarList");
  return data.items || [];
}

export async function listEventsForDay(calendarId: string, day: Date): Promise<GCalEvent[]> {
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);
  const data = await gcalFetch<{ items: GCalEvent[] }>(
    `/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "100",
    }
  );
  return (data.items || []).filter((e) => e.status !== "cancelled");
}
