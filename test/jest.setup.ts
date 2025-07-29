import * as dotenv from 'dotenv';

dotenv.config({ path: `env/test.env` });

// Global test timeout
jest.setTimeout(30000);

// Global beforeAll and afterAll for Redis test setup
beforeAll(async () => {
  // Initialize test environment here if needed
});

afterAll(async () => {
  // Cleanup test environment here if needed
});
