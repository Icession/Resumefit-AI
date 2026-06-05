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
