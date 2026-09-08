import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bundleService } from '../../src/services/bundle.service';

vi.mock('../../src/services/api.client', () => ({
  apiClient: {
    post: vi.fn().mockResolvedValue({ data: { success: true } })
  }
}));

// Mock localStorage
const localStorageMock = (function() {
  let store: any = {};
  return {
    getItem: function(key: string) {
      return store[key] || null;
    },
    setItem: function(key: string, value: string) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('bundleService', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('creates and updates a bundle', async () => {
    const created = await bundleService.createBundle({ name: 'Test Bundle', type: 'COMPANY' });
    expect(created.name).toBe('Test Bundle');
    expect(created._id).toMatch(/^custom_/);

    const updated = await bundleService.updateBundle(created._id, { name: 'Updated Bundle' });
    expect(updated.name).toBe('Updated Bundle');
  });
});
