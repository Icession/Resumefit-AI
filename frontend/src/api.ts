import type { AnalyzeResponse } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body?.detail) {
      return typeof body.detail === "string"
        ? body.detail
        : JSON.stringify(body.detail);
    }
  } catch {
  }
  return `Request failed (${res.status})`;
}

export async function analyzeResume(
  resume: string,
  jobDescription: string
): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    body: form,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}