import type { AnalyzeResponse } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function analyzeResume(
  resume: string,
  jobDescription: string
): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume, job_description: jobDescription }),
  });

  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}
