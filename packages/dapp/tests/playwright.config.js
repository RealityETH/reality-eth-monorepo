import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '*.test.js',
  timeout: 60000,
  globalSetup: './global-setup.js',
  globalTeardown: './global-teardown.js',
  use: {
    headless: true,
    baseURL: 'http://localhost:8082',
  },
  // Run tests serially — each test mutates chain state
  workers: 1,
});
