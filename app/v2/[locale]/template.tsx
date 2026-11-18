import type { ReactNode } from 'react';

/**
 * Re-mounts on every change of page (the header stays in the layout). Where the browser has no View
 * Transitions, or for the back and forward buttons, the new page fades in (`html[data-nav="fade"]`, motion.css);
 * the first load never animates.
 */
export default function V2Template({ children }: { children: ReactNode }) {
  return <div className="v2-page">{children}</div>;
}
