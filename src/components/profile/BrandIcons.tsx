// Realistic brand / detail glyphs used in the profile "Account details" list.

export function GoogleLogo({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18A13.2 13.2 0 0 1 11 24c0-1.45.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

export function GithubLogo({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="#fff" aria-hidden="true">
      <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58v-2.2c-3.34.72-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.92 1.23 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.82 1.1.82 2.22v3.29c0 .32.21.69.82.57A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

export function EmailProviderLogo({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="2" y="4.5" width="20" height="15" rx="2.5" fill="#1F2937" stroke="#4B5563" strokeWidth="1.2" />
      <path d="M3 7l9 6 9-6" fill="none" stroke="#60A5FA" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IdCardLogo({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="2" y="4.5" width="20" height="15" rx="2.5" fill="#0F172A" stroke="#334155" strokeWidth="1.2" />
      <circle cx="8.5" cy="11" r="2.4" fill="#22D3EE" opacity="0.9" />
      <path d="M5 16.4c.6-1.6 2-2.4 3.5-2.4s2.9.8 3.5 2.4" stroke="#22D3EE" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <rect x="14" y="9" width="6" height="1.5" rx="0.75" fill="#64748B" />
      <rect x="14" y="12" width="6" height="1.5" rx="0.75" fill="#475569" />
    </svg>
  );
}

export function ClockLogo({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="#0F172A" stroke="#475569" strokeWidth="1.3" />
      <circle cx="12" cy="12" r="6.6" fill="none" stroke="#1E293B" strokeWidth="1" />
      <path d="M12 7.5V12l3 1.8" stroke="#A5B4FC" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="12" cy="12" r="1" fill="#A5B4FC" />
    </svg>
  );
}

export function PlanLogo({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M3 9l4 2.5L12 5l5 6.5L21 9l-1.6 9H4.6L3 9Z" fill="url(#planGrad)" stroke="#38BDF8" strokeWidth="1" strokeLinejoin="round" />
      <rect x="4.6" y="18" width="14.8" height="1.8" rx="0.9" fill="#38BDF8" opacity="0.85" />
      <defs>
        <linearGradient id="planGrad" x1="3" y1="5" x2="21" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0EA5E9" stopOpacity="0.55" />
          <stop offset="1" stopColor="#1E3A8A" stopOpacity="0.55" />
        </linearGradient>
      </defs>
    </svg>
  );
}
