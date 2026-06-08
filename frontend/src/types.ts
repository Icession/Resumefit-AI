export interface Suggestion {
  original: string;
  improved: string;
}

export interface AnalyzeResponse {
  match_score: number;
  missing_keywords: string[];
  suggestions: Suggestion[];
  summary: string;
}

export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface AnalysisRecord {
  id: number;
  job_description: string;
  match_score: number;
  missing_keywords: string[];
  suggestions: Suggestion[];
  summary: string;
  created_at: string;
}