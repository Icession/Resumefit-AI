import { useEffect, useRef, useState } from "react";
import {
  generateCoverLetter,
  generateCoverLetterFile,
  getProfile,
  saveProfile,
} from "../api";
import { useAuth } from "../AuthContext";
import type { CoverLetterDetails, CoverLetterLink } from "../types";

interface Props {
  resumeText: string;
  resumeFile: File | null;
  jobDescription: string;
}

type FlatKey =
  | "full_name"
  | "email"
  | "phone"
  | "location"
  | "company_name"
  | "role_title"
  | "hiring_manager";

type Field = { key: FlatKey; label: string; placeholder: string };

const PROFILE_FIELDS: Field[] = [
  { key: "full_name", label: "Full name", placeholder: "Jane Doe" },
  { key: "email", label: "Email", placeholder: "you@email.com" },
  { key: "phone", label: "Phone", placeholder: "Phone number" },
  { key: "location", label: "Location", placeholder: "City, Country" },
];

const TARGET_FIELDS: Field[] = [
  { key: "company_name", label: "Company", placeholder: "Acme Inc." },
  { key: "role_title", label: "Role title", placeholder: "Junior Full-Stack Developer" },
  { key: "hiring_manager", label: "Hiring manager", placeholder: "Optional" },
];

const DEFAULT_LINKS: CoverLetterLink[] = [
  { label: "LinkedIn", url: "" },
  { label: "GitHub", url: "" },
  { label: "Portfolio", url: "" },
];

export default function CoverLetterPanel({
  resumeText,
  resumeFile,
  jobDescription,
}: Props) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [letter, setLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [fields, setFields] = useState<Partial<Record<FlatKey, string>>>({});
  const [links, setLinks] = useState<CoverLetterLink[]>(DEFAULT_LINKS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Auto-fill saved details once for a logged-in user.
  const loadedRef = useRef(false);
  useEffect(() => {
    if (!user || loadedRef.current) return;
    loadedRef.current = true;
    getProfile()
      .then((p) => {
        setFields({
          full_name: p.full_name ?? "",
          email: p.email ?? user.email,
          phone: p.phone ?? "",
          location: p.location ?? "",
        });
        if (p.links && p.links.length > 0) setLinks(p.links);
        if (p.full_name || (p.links && p.links.length > 0)) setShowDetails(true);
      })
      .catch(() => {
        // No saved profile yet, or fetch failed — keep defaults.
      });
  }, [user]);

  function updateField(key: FlatKey, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function updateLink(index: number, key: keyof CoverLetterLink, value: string) {
    setLinks((current) =>
      current.map((link, i) => (i === index ? { ...link, [key]: value } : link))
    );
  }

  function addLink() {
    setLinks((current) => [...current, { label: "", url: "" }]);
  }

  function removeLink(index: number) {
    setLinks((current) => current.filter((_, i) => i !== index));
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setCopied(false);
    const details: CoverLetterDetails = { ...fields, links };
    try {
      const data = resumeFile
        ? await generateCoverLetterFile(resumeFile, jobDescription, details)
        : await generateCoverLetter(resumeText, jobDescription, details);
      setLetter(data.cover_letter);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Couldn't generate the cover letter."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await saveProfile({
        full_name: fields.full_name,
        email: fields.email,
        phone: fields.phone,
        location: fields.location,
        links,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save your profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    if (!letter) return;
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy to clipboard.");
    }
  }

  function handleDownload() {
    if (!letter) return;
    const blob = new Blob([letter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cover-letter.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  function renderField(field: Field) {
    return (
      <label key={field.key} className="block">
        <span className="mb-1 block text-xs text-muted">{field.label}</span>
        <input
          type="text"
          value={fields[field.key] ?? ""}
          onChange={(e) => updateField(field.key, e.target.value)}
          placeholder={field.placeholder}
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-forest focus:outline-none"
        />
      </label>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-line bg-white/60 p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <span className="h-5 w-1 rounded-full bg-forest" />
        <h2 className="font-display text-xl font-semibold">Cover letter</h2>
      </div>

      <p className="mb-4 text-sm text-muted">
        Generate a tailored cover letter from the same resume and job description —
        grounded in your real experience, never fabricated.
      </p>

      <button
        type="button"
        onClick={() => setShowDetails((s) => !s)}
        className="text-sm font-medium text-forest hover:text-forest-dark"
      >
        {showDetails ? "− Hide your details" : "+ Add your details (optional)"}
      </button>

      {showDetails && (
        <div className="mt-4 space-y-5">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
              Your info
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {PROFILE_FIELDS.map(renderField)}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">
              Links
            </p>
            <p className="mb-3 text-xs text-muted">
              Added exactly as typed into the signature — never rewritten by the AI. Add
              any: LinkedIn, GitHub, portfolio, GitLab, Stack Overflow, X, etc.
            </p>
            <div className="space-y-2">
              {links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateLink(index, "label", e.target.value)}
                    placeholder="Label"
                    className="w-32 shrink-0 rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-forest focus:outline-none"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => updateLink(index, "url", e.target.value)}
                    placeholder="https://..."
                    className="flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-forest focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    aria-label="Remove link"
                    className="shrink-0 rounded-lg border border-line px-3 text-muted hover:border-forest hover:text-forest"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addLink}
              className="mt-2 text-sm font-medium text-forest hover:text-forest-dark"
            >
              + Add link
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:border-forest hover:text-forest disabled:opacity-60"
              >
                {saving ? "Saving..." : saved ? "Saved!" : "Save to profile"}
              </button>
              <span className="text-xs text-muted">
                Saves your info &amp; links (not the company/role) and auto-fills next time.
              </span>
            </div>
          ) : (
            <p className="text-xs text-muted">
              Log in to save these details and auto-fill them next time.
            </p>
          )}

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
              This application
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {TARGET_FIELDS.map(renderField)}
            </div>
          </div>
        </div>
      )}

      <div className="mt-5">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-lg bg-forest px-4 py-2 font-medium text-white hover:bg-forest-dark disabled:opacity-60"
        >
          {loading ? "Writing..." : letter ? "Regenerate" : "Generate cover letter"}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {letter && (
        <div className="mt-5">
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:border-forest hover:text-forest"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:border-forest hover:text-forest"
            >
              Download .txt
            </button>
          </div>
          <div className="whitespace-pre-wrap rounded-xl border border-line bg-paper px-5 py-4 font-sans leading-relaxed text-ink">
            {letter}
          </div>
        </div>
      )}
    </section>
  );
}