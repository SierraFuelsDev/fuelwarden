"use client";
import { useState } from "react";

const documents = [
  {
    key: "privacy",
    title: "Privacy Policy",
    content: `This is the Privacy Policy.\n\nYour privacy is important to us. Please read this policy carefully to understand how we collect, use, and protect your information. (Insert your privacy policy here.)`,
  },
  {
    key: "terms",
    title: "Terms and Conditions",
    content: `These are the Terms and Conditions.\n\nBy using FuelWarden, you agree to abide by these terms. Please read them carefully. (Insert your terms and conditions here.)`,
  },
];

export default function PoliciesInfoPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">
        <div className="w-full max-w-xl space-y-4">
          <h1 className="text-2xl font-bold mb-6 text-center">Policies & Info</h1>
          {documents.map((doc) => (
            <div key={doc.key} className="border border-border rounded-lg overflow-hidden bg-card">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted transition-colors focus:outline-none"
                onClick={() => setOpen(open === doc.key ? null : doc.key)}
                aria-expanded={open === doc.key}
                id={doc.key}
              >
                <span className="font-medium text-lg text-foreground">{doc.title}</span>
                <svg
                  className={`w-5 h-5 ml-2 transition-transform ${open === doc.key ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {open === doc.key && (
                <div className="px-4 py-3 border-t border-border bg-muted text-muted-foreground whitespace-pre-line text-sm">
                  {doc.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 