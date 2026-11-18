import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet';
export type ButtonSize = 'md' | 'sm';

/** `magnetic`: the pull in px of the magnetic hover (lote 2.2); `cursor`: the word the contextual cursor shows over it. */
type Common = { variant?: ButtonVariant; size?: ButtonSize; iconStart?: ReactNode; iconEnd?: ReactNode; children: ReactNode; className?: string; magnetic?: number; cursor?: string };
type AsLink = Common & { href: string; external?: boolean; externalLabel?: string };
type AsButton = Common & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>;

const cls = (variant: ButtonVariant, size: ButtonSize, extra?: string) => ['ui-btn', `ui-btn--${variant}`, `ui-btn--${size}`, extra].filter(Boolean).join(' ');

/**
 * One main action per screen (`primary`, the brand gradient); `secondary` is glass, `quiet` is text with an arrow.
 * With `href` it renders a real link; otherwise a <button> (type="button" unless told otherwise).
 */
export function Button(props: AsLink | AsButton) {
  const { variant = 'primary', size = 'md', iconStart, iconEnd, children, className, magnetic, cursor } = props;
  const motion = { 'data-magnetic': magnetic, 'data-cursor': cursor };
  const inner = (
    <>
      {iconStart}
      <span>{children}</span>
      {iconEnd}
    </>
  );
  if (props.href !== undefined) {
    const { external, externalLabel } = props as AsLink;
    return (
      <a className={cls(variant, size, className)} href={props.href} {...motion} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {inner}
        {external && externalLabel && <span className="ui-sr">{externalLabel}</span>}
      </a>
    );
  }
  const { variant: _v, size: _s, iconStart: _a, iconEnd: _b, children: _c, className: _d, magnetic: _m, cursor: _k, type = 'button', ...rest } = props as AsButton;
  return (
    <button className={cls(variant, size, className)} type={type} {...motion} {...rest}>
      {inner}
    </button>
  );
}

/** A square 44 px button that only shows an icon: the label is required and read aloud. */
export function IconButton({ label, children, pressed, ...rest }: { label: string; children: ReactNode; pressed?: boolean } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>) {
  return (
    <button type="button" className="ui-iconbtn" aria-label={label} aria-pressed={pressed} {...rest}>
      {children}
    </button>
  );
}
