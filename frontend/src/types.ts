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

export interface CoverLetterResponse {
  cover_letter: string;
}

export interface CoverLetterLink {
  label: string;
  url: string;
}

export interface CoverLetterDetails {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  links?: CoverLetterLink[];
  company_name?: string;
  role_title?: string;
  hiring_manager?: string;
}

export interface Profile {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  links: CoverLetterLink[];
}

export interface ATSCheckItem {
  category: string;
  status: string;
  detail: string;
  fix: string;
}

export interface ATSReport {
  overall_score: number;
  checks: ATSCheckItem[];
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