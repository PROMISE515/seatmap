const memoryStorage = new Map<string, string>();

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined" || !("localStorage" in window)) return null;
  try {
    const storage = window.localStorage;
    const testKey = "__seatmap_storage_test__";
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return storage;
  } catch {
    return null;
  }
}

export function getStoredValue(key: string): string | null {
  const storage = getBrowserStorage();
  if (storage) return storage.getItem(key);
  return memoryStorage.get(key) ?? null;
}

export function setStoredValue(key: string, value: string) {
  const storage = getBrowserStorage();
  if (storage) {
    storage.setItem(key, value);
    return;
  }
  memoryStorage.set(key, value);
}

export function removeStoredValue(key: string) {
  const storage = getBrowserStorage();
  if (storage) {
    storage.removeItem(key);
    return;
  }
  memoryStorage.delete(key);
}
