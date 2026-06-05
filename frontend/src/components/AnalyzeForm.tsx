import { useState } from "react";

interface Props {
  loading: boolean;
  onSubmit: (resume: string, jobDescription: string) => void;
}

export default function AnalyzeForm({ loading, onSubmit }: Props) {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const canSubmit = resume.trim() && jobDescription.trim() && !loading;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field
        label="Your resume"
        placeholder="Paste your resume text here…"
        value={resume}
        onChange={setResume}
      />
      <Field
        label="Job description"
        placeholder="Paste the job description here…"
        value={jobDescription}
        onChange={setJobDescription}
      />
      <div className="md:col-span-2">
        <button
          disabled={!canSubmit}
          onClick={() => onSubmit(resume, jobDescription)}
          className="rounded-full bg-forest px-7 py-3 font-medium text-paper transition
                     hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Analyzing…" : "Analyze fit"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-muted">{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        className="w-full resize-none rounded-2xl border border-line bg-white/60 p-4
                   text-sm leading-relaxed outline-none transition
                   focus:border-forest focus:ring-2 focus:ring-forest/20"
      />
    </label>
  );
}
