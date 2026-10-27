import { defineConfig } from '@playwright/test';

// Serves the static export (`npm run build` first). Chromium: the CI/container binary when present.
export default defineConfig({
  testDir: 'tests/e2e',
  webServer: { command: 'python3 -m http.server 4173 -d out', url: 'http://127.0.0.1:4173/es/', reuseExistingServer: true },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    launchOptions: { executablePath: process.env.CHROMIUM_PATH ?? (process.platform === 'linux' ? '/opt/pw-browsers/chromium' : undefined) },
  },
});
