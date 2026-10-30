import { afterEach, vi } from 'vitest';

process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:5432/users_test?schema=public';

afterEach(() => {
  vi.restoreAllMocks();
});
