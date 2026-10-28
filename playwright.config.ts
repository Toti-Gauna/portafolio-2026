import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

// Local container: preinstalled Chromium. CI: the browser installed by `npx playwright install chromium`.
const chromium = process.env.CHROMIUM_PATH ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);

// Serves the static export (`npm run build` first). Chromium: the CI/container binary when present.
// PW_PORT lets two checkouts run their e2e suites side by side.
const port = Number(process.env.PW_PORT ?? 4173);
export default defineConfig({
  testDir: 'tests/e2e',
  webServer: { command: `python3 -m http.server ${port} -d out`, url: `http://127.0.0.1:${port}/es/`, reuseExistingServer: true },
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    launchOptions: { executablePath: chromium },
  },
});
