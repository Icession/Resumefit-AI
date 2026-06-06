import { useRef, useState, type ChangeEvent } from "react";

interface Props {
  loading: boolean;
  onSubmit: (
    resumeText: string,
    resumeFile: File | null,
    jobDescription: string
  ) => void;
}

const SAMPLE_RESUME = `Jane Doe
Frontend Developer

EXPERIENCE
- Built responsive web apps with React and JavaScript.
- Worked on the company website and made it load faster.
- Collaborated with designers to implement UI from Figma mockups.

SKILLS
React, JavaScript, HTML, CSS, Git

EDUCATION
B.S. in Computer Science, 2023`;

const SAMPLE_JOB = `Full-Stack Developer

We're looking for a Full-Stack Developer to build features end to end.

Requirements:
- 2+ years building production web applications
- Strong React and TypeScript skills
- Experience with Node.js and REST APIs
- Familiarity with PostgreSQL or another database
- Docker and CI/CD experience a plus
- Cloud deployment (AWS or GCP)`;

export default function AnalyzeForm({ loading, onSubmit }: Props) {
  const [resume, setResume] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit =
    Boolean((file || resume.trim()) && jobDescription.trim()) && !loading;

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
  }

  function clearFile() {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSample() {
    setResume(SAMPLE_RESUME);
    setJobDescription(SAMPLE_JOB);
    clearFile();
    onSubmit(SAMPLE_RESUME, null, SAMPLE_JOB);
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {/* Resume: paste text OR upload a file */}
      <div>
        <span className="mb-2 block text-sm font-medium text-muted">Your resume</span>
        <textarea
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          placeholder="Paste your resume text here…"
          rows={9}
          disabled={!!file}
          className="w-full resize-none rounded-2xl border border-line bg-white/60 p-4
                     text-sm leading-relaxed outline-none transition focus:border-forest
                     focus:ring-2 focus:ring-forest/20 disabled:opacity-50"
        />
        <div className="mt-3 text-sm">
          {file ? (
            <div className="flex items-center gap-2 rounded-full border border-forest/30
                            bg-forest/5 px-3 py-1.5 text-forest-dark">
              <span className="truncate">📄 {file.name}</span>
              <button
                onClick={clearFile}
                aria-label="Remove file"
                className="ml-auto rounded-full px-2 leading-none hover:bg-forest/10"
              >
                ×
              </button>
            </div>
          ) : (
            <label className="inline-flex cursor-pointer items-center text-forest
                              underline underline-offset-4 hover:text-forest-dark">
              or upload a PDF / .txt
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                onChange={handleFile}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Job description */}
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-muted">Job description</span>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here…"
          rows={9}
          className="w-full resize-none rounded-2xl border border-line bg-white/60 p-4
                     text-sm leading-relaxed outline-none transition focus:border-forest
                     focus:ring-2 focus:ring-forest/20"
        />
      </label>

      <div className="md:col-span-2 flex flex-wrap items-center gap-3">
        <button
          disabled={!canSubmit}
          onClick={() => onSubmit(resume, file, jobDescription)}
          className="rounded-full bg-forest px-7 py-3 font-medium text-paper transition
                     hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Analyzing…" : "Analyze fit"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={handleSample}
          className="rounded-full border border-forest/40 px-6 py-3 font-medium text-forest
                     transition hover:bg-forest/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Try with a sample
        </button>
      </div>
    </div>
  );
}