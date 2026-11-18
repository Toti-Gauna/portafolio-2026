'use client';

import { useEffect, useRef } from 'react';
import { SHORTCUTS, type ShortcutAction } from '@/v2/motion/shortcuts';
import { CloseIcon } from '../ui/Icons';

export type ShortcutsLabels = {
  title: string; intro: string; close: string; toggle: string; off: string;
  actions: Record<ShortcutAction, string>;
};

/** The help of the shortcuts: a modal <dialog> with the list and the switch that turns them off (WCAG 2.1.4). */
export function ShortcutsDialog({ open, onClose, keysOn, onKeys, labels }: {
  open: boolean; onClose: () => void; keysOn: boolean; onKeys: (on: boolean) => void; labels: ShortcutsLabels;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const back = useRef<Element | null>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      back.current = document.activeElement;
      if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    } else if (!open && d.open) {
      if (typeof d.close === 'function') d.close(); else d.removeAttribute('open');
      (back.current as HTMLElement | null)?.focus?.();
    }
  }, [open]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onCancel = (e: Event) => { e.preventDefault(); onClose(); };
    const onBackdrop = (e: MouseEvent) => { if (e.target === d) onClose(); };
    d.addEventListener('cancel', onCancel);
    d.addEventListener('click', onBackdrop);
    return () => { d.removeEventListener('cancel', onCancel); d.removeEventListener('click', onBackdrop); };
  }, [onClose]);

  return (
    <dialog ref={ref} className="v2-keys" aria-labelledby="v2-keys-h">
      <div className="v2-keys-in">
        <div className="v2-keys-top">
          <h2 id="v2-keys-h">{labels.title}</h2>
          <button type="button" className="v2-keys-close" aria-label={labels.close} onClick={onClose} autoFocus><CloseIcon /></button>
        </div>
        <p className="v2-keys-intro">{labels.intro}</p>
        <dl className="v2-keys-list" data-off={!keysOn || undefined}>
          {SHORTCUTS.map((s) => (
            <div key={s.action}>
              <dt><kbd className="ui-kbd">{s.key}</kbd></dt>
              <dd>{labels.actions[s.action]}</dd>
            </div>
          ))}
        </dl>
        <label className="ui-switch v2-keys-switch" htmlFor="v2-keys-on">
          <span>{labels.toggle}</span>
          <input type="checkbox" role="switch" id="v2-keys-on" checked={keysOn} onChange={(e) => onKeys(e.target.checked)} />
          <span className="ui-switch-track" aria-hidden="true"><span /></span>
        </label>
        {!keysOn && <p className="v2-keys-note">{labels.off}</p>}
      </div>
    </dialog>
  );
}
