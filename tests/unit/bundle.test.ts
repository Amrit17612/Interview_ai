import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bundleService } from '../../src/services/bundle.service';

let mockBackendBundles: any[] = [];

vi.mock('../../src/services/api.client', () => ({
  apiClient: {
    post: vi.fn().mockImplementation((url, data) => {
      // Simulate backend storing the bundle
      if (url === '/admin/custom-bundle-prices') {
        const existingIdx = mockBackendBundles.findIndex(b => b.bundleId === data.bundleId);
        if (existingIdx >= 0) {
          mockBackendBundles[existingIdx] = { ...mockBackendBundles[existingIdx], ...data };
        } else {
          mockBackendBundles.push(data);
        }
      }
      return Promise.resolve({ data: { success: true } });
    }),
    get: vi.fn().mockImplementation((url) => {
      if (url === '/bundles/custom') {
        return Promise.resolve({ data: { customBundles: mockBackendBundles } });
      }
      return Promise.resolve({ data: {} });
    })
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
    mockBackendBundles = [];
  });

  it('creates and updates a bundle', async () => {
    const created = await bundleService.createBundle({ name: 'Test Bundle', type: 'COMPANY' });
    expect(created.name).toBe('Test Bundle');
    expect(created._id).toMatch(/^custom_/);

    const updated = await bundleService.updateBundle(created._id, { name: 'Updated Bundle' });
    expect(updated.name).toBe('Updated Bundle');
  });
});
