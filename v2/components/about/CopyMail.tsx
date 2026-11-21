'use client';

import { useRef, useState } from 'react';

/**
 * «Copiar el mail» (lote 7.1): copies the address and says so in a live region. The address is also written on the
 * page and behind «Escribime», so without JavaScript (or without clipboard access) nothing is lost.
 */
export function CopyMail({ email, label, done }: { email: string; label: string; done: string }) {
  const [ok, setOk] = useState(false);
  const timer = useRef(0);
  const copy = async () => {
    try { await navigator.clipboard.writeText(email); } catch {
      // older browsers and insecure contexts: a selection the visitor can copy
      const r = document.createRange(), el = document.querySelector('[data-mail]');
      if (el) { r.selectNodeContents(el); const s = getSelection(); s?.removeAllRanges(); s?.addRange(r); }
    }
    setOk(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOk(false), 2400);
  };
  return (
    <>
      <button type="button" className="ui-btn ui-btn--secondary ab-copy" onClick={copy} data-ok={ok ? '' : undefined}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {ok ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></>}
        </svg>
        {label}
      </button>
      <span className="ab-live" role="status" aria-live="polite">{ok ? done : ''}</span>
    </>
  );
}
