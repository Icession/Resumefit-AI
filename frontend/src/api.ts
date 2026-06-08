import type {
  AnalysisRecord,
  AnalyzeResponse,
  ATSReport,
  CoverLetterDetails,
  CoverLetterLink,
  CoverLetterResponse,
  Profile,
  User,
} from "./types";

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

// Drop empty fields so we only send details the user actually filled in.
function cleanFlat(details: Omit<CoverLetterDetails, "links">): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(details)) {
    if (typeof value === "string" && value.trim()) out[key] = value.trim();
  }
  return out;
}

function cleanLinks(links: CoverLetterLink[] = []): CoverLetterLink[] {
  return links
    .map((l) => ({ label: l.label.trim(), url: l.url.trim() }))
    .filter((l) => l.label && l.url);
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

export async function generateCoverLetter(
  resume: string,
  jobDescription: string,
  details: CoverLetterDetails = {}
): Promise<CoverLetterResponse> {
  const { links, ...flat } = details;
  const res = await fetch(`${API_URL}/cover-letter`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      resume,
      job_description: jobDescription,
      ...cleanFlat(flat),
      links: cleanLinks(links),
    }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function generateCoverLetterFile(
  file: File,
  jobDescription: string,
  details: CoverLetterDetails = {}
): Promise<CoverLetterResponse> {
  const { links, ...flat } = details;
  const form = new FormData();
  form.append("resume_file", file);
  form.append("job_description", jobDescription);
  for (const [key, value] of Object.entries(cleanFlat(flat))) {
    form.append(key, value);
  }
  for (const link of cleanLinks(links)) {
    form.append("link_labels", link.label);
    form.append("link_urls", link.url);
  }

  const res = await fetch(`${API_URL}/cover-letter/file`, {
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

export async function getProfile(): Promise<Profile> {
  const res = await fetch(`${API_URL}/profile`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function saveProfile(profile: Profile): Promise<Profile> {
  const res = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      links: (profile.links ?? []).filter((l) => l.label.trim() && l.url.trim()),
    }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function deleteHistoryItem(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/history/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function deleteAccount(): Promise<void> {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function checkATS(resume: string): Promise<ATSReport> {
  const res = await fetch(`${API_URL}/ats-check`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ resume }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function checkATSFile(file: File): Promise<ATSReport> {
  const form = new FormData();
  form.append("resume_file", file);
  const res = await fetch(`${API_URL}/ats-check/file`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: form,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}