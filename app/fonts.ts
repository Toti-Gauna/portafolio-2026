import { Archivo, JetBrains_Mono } from 'next/font/google';

// Self-hosted at build time by next/font: no request to Google from the visitor's browser.
export const fontSans = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-sans', display: 'swap' });
export const fontMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });
