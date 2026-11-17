import type { ReactNode } from 'react';

// /v2 is the new portfolio, built in batches next to the published one. Its document (<html>, fonts, tokens)
// lives in app/v2/[locale]/layout.tsx; the /v2/ language redirect renders its own <html>, like app/page.tsx.
export default function V2Root({ children }: { children: ReactNode }) {
  return children;
}
