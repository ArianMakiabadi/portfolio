// In-memory sliding window per key (single process, so no shared store).
// Resets on restart, which is fine for keeping one IP from flooding the inbox.
export type RateLimiter = {
  // Records a hit and returns true, or returns false (recording nothing) when over the limit.
  tryAcquire(key: string): boolean;
  // Gives back one hit, e.g. when the request it allowed failed downstream.
  release(key: string): void;
};

type RateLimiterOptions = {
  limit: number;
  windowMs: number;
  now: () => number;
};

export function createRateLimiter({
  limit,
  windowMs,
  now,
}: RateLimiterOptions): RateLimiter {
  const hits = new Map<string, number[]>();
  let lastSweep = now();

  // Drops IPs whose hits have all expired, so the map can't grow without bound.
  function sweep(time: number) {
    if (time - lastSweep < windowMs) return;
    lastSweep = time;
    for (const [key, times] of hits) {
      // Hits are pushed in time order: the last one is the newest.
      const newest = times.at(-1);
      if (newest === undefined || time - newest >= windowMs) hits.delete(key);
    }
  }

  return {
    tryAcquire(key) {
      const time = now();
      sweep(time);
      const recent = (hits.get(key) ?? []).filter((t) => time - t < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }
      recent.push(time);
      hits.set(key, recent);
      return true;
    },
    release(key) {
      // Only the count matters, so dropping the newest hit is enough.
      hits.get(key)?.pop();
    },
  };
}
