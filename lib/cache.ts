// Single-process in-memory TTL cache. Fits the local AgendOS server; if this
// ever runs multi-instance, move the shared external-store cache to Redis.
const store = new Map<string, { expires: number; value: Promise<unknown> }>();

export function cached<T>(key: string, ttlSecs: number, fn: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as Promise<T>;
  const value = fn().catch((e) => {
    store.delete(key); // never cache failures
    throw e;
  });
  store.set(key, { expires: Date.now() + ttlSecs * 1000, value });
  return value;
}