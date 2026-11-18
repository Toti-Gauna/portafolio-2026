import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

// Local container: preinstalled Chromium. CI: the browser installed by `npx playwright install chromium`.
const chromium = process.env.CHROMIUM_PATH ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);

// Serves the static export (`npm run build` first). Chromium: the CI/container binary when present.
// PW_PORT lets two checkouts run their e2e suites side by side.
const port = Number(process.env.PW_PORT ?? 4173);
export default defineConfig({
  testDir: 'tests/e2e',
  // The 3D studies of the gate are drawn by software here: they take a machine for themselves. They run once the
  // rest has finished, so they never starve the tests that watch timing (seen in CI, 18/11/2026).
  projects: [
    { name: 'site', testIgnore: /v2-gate-3d\.spec\.ts$/ },
    { name: 'gate-3d', testMatch: /v2-gate-3d\.spec\.ts$/, dependencies: ['site'] },
  ],
  webServer: { command: `python3 -m http.server ${port} -d out`, url: `http://127.0.0.1:${port}/es/`, reuseExistingServer: true },
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    // /v2 opens behind its gate on every load of the home (lote 3.1): the QA switch skips it everywhere but in the gate's own tests.
    // The world of Work starts by day or by night with the visitor's clock (lote 4.3): the tests start by day.
    storageState: { cookies: [], origins: [{ origin: `http://127.0.0.1:${port}`, localStorage: [{ name: 'ig:v2:gate', value: 'off' }, { name: 'ig:v2:time', value: 'day' }] }] },
    launchOptions: { executablePath: chromium },
  },
});
