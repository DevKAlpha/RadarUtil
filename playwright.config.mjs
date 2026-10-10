import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4173/RadarUtil/', channel: 'msedge', trace: 'retain-on-failure' },
  webServer: { command: 'node scripts/serve-build.mjs', url: 'http://127.0.0.1:4173/RadarUtil/', reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'escritorio', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'movil', use: { viewport: { width: 390, height: 844 } } }
  ]
});
