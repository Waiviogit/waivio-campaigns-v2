# Test Setup Guide

This directory contains the test configuration and utilities for the waivio-campaigns-v2 project.

## Test Dependencies

The project uses the following test dependencies:
- Jest 29.5.0
- @types/jest 29.5.0
- ts-jest 29.1.0
- @nestjs/testing 8.0.0

## Redis Test Client

The `RedisTestClient` is specifically designed for testing and uses Redis database 7 to ensure isolation from production data.

### Features:
- Connects to Redis database 7 for test isolation
- Implements all Redis operations from the main client
- Includes test-specific methods for cleanup
- Proper error handling and logging

### Usage:

```typescript
import { RedisTestClient } from '../src/services/redis/clients/redis-test-client';
import { RedisTestHelper } from './helpers/redis-test-helper';

describe('My Test Suite', () => {
  let redisClient: RedisTestClient;

  beforeAll(async () => {
    redisClient = await RedisTestHelper.setupTestEnvironment();
  });

  afterAll(async () => {
    await RedisTestHelper.teardownTestEnvironment();
  });

  beforeEach(async () => {
    await RedisTestHelper.clearTestDatabase();
  });

  it('should test Redis operations', async () => {
    await redisClient.set('test:key', 'test-value');
    const result = await redisClient.get('test:key');
    expect(result).toBe('test-value');
  });
});
```

## Test Environment

The test environment is configured via `env/test.env` and includes:
- Redis URL: `redis://localhost:6379`
- Test Database: 7
- MongoDB URI: `mongodb://localhost:27017/waivio-test`
- API Port: 3001

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## Test Structure

- `redis-client.spec.ts` - Example Redis client tests
- `helpers/redis-test-helper.ts` - Test utilities for Redis
- `jest.setup.ts` - Global test setup
- `jest-e2e.json` - E2E test configuration

## Database Isolation

The test setup ensures complete isolation by:
1. Using Redis database 7 for all test operations
2. Clearing the test database before each test
3. Disconnecting and cleaning up after test suites
4. Using separate MongoDB database for tests

## Best Practices

1. Always use `RedisTestHelper` for setup and teardown
2. Clear the test database in `beforeEach` hooks
3. Use descriptive test keys with prefixes like `test:`
4. Handle async operations properly with await
5. Test both success and error scenarios 