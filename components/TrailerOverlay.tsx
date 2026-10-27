'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

/** Placeholder until the 120 s trailer (phase 7) replaces it. Native <dialog>: focus trap and Escape come for free. */
export default function TrailerOverlay({ onClose }: { onClose: () => void }) {
  const t = useTranslations('trailer');
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    return () => d?.close();
  }, []);

  return (
    <dialog ref={ref} className="trailer" aria-labelledby="trailer-title" onClose={onClose}>
      <div className="trailer__body">
        <h2 id="trailer-title" className="trailer__title">{t('title')}</h2>
        <p>{t('soon')}</p>
        <button type="button" className="btn btn-primary" autoFocus onClick={onClose}>{t('close')}</button>
      </div>
    </dialog>
  );
}
