/** Public facts used across the site. Everything here has been approved by Ignacio. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://portfolio.eclipse-business.com').replace(/\/$/, '');
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');
export const CONTACT_EMAIL = 'ignaciogauna.developer@gmail.com';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/ignacio-emanuel-gauna/';
export const GITHUB_URL = 'https://github.com/Toti-Gauna';

export const absoluteUrl = (path: string) => `${SITE_URL}${BASE_PATH}${path}`;

/** Path of a file in /public, with the optional basePath. */
export const asset = (path: string) => `${BASE_PATH}${path}`;
