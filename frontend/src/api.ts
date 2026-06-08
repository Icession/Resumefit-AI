import type { AnalysisRecord, AnalyzeResponse, User } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const TOKEN_KEY = "resumatch_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body?.detail) {
      return typeof body.detail === "string"
        ? body.detail
        : JSON.stringify(body.detail);
    }
  } catch {
    // ignore non-JSON error bodies
  }
  return `Request failed (${res.status})`;
}

export async function analyzeResume(
  resume: string,
  jobDescription: string
): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ resume, job_description: jobDescription }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function analyzeResumeFile(
  file: File,
  jobDescription: string
): Promise<AnalyzeResponse> {
  const form = new FormData();
  form.append("resume_file", file);
  form.append("job_description", jobDescription);

  const res = await fetch(`${API_URL}/analyze/file`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: form,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export async function signup(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data: TokenResponse = await res.json();
  setToken(data.access_token);
}

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data: TokenResponse = await res.json();
  setToken(data.access_token);
}

export async function getMe(): Promise<User> {
  const res = await fetch(`${API_URL}/auth/me`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getHistory(): Promise<AnalysisRecord[]> {
  const res = await fetch(`${API_URL}/history`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}