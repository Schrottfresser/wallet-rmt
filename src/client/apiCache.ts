import { LRUCache } from 'lru-cache';

type JsonObject = Record<string, unknown>;

const apiCache = new LRUCache<string, JsonObject>({
    max: 100,
    ttl: 6 * 60 * 1000, // one minute
});

export default apiCache;
