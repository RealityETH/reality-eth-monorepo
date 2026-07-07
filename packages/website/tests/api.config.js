import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: ['browse-api.test.js'],
  timeout: 30000,
  use: {
    baseURL: process.env.PONDER_URL || 'http://localhost:42070',
  },
  workers: 4,
});
