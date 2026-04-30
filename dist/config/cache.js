"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCacheKey = exports.getCacheStats = exports.deleteCacheByPrefix = exports.clearCache = exports.deleteCache = exports.setCache = exports.getCache = void 0;
class InMemoryCache {
    constructor() {
        this.cache = new Map();
    }
    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            return null;
        }
        // Check if expired
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    }
    set(key, data, ttlSeconds) {
        const expiresAt = Date.now() + (ttlSeconds * 1000);
        this.cache.set(key, { data, expiresAt });
    }
    delete(key) {
        this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    // Delete all keys that start with a prefix
    deleteByPrefix(prefix) {
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
            }
        }
    }
    // Get cache statistics
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}
// Create singleton instance
const cache = new InMemoryCache();
// Helper functions
const getCache = (key) => {
    return cache.get(key);
};
exports.getCache = getCache;
const setCache = (key, data, ttlSeconds) => {
    cache.set(key, data, ttlSeconds);
};
exports.setCache = setCache;
const deleteCache = (key) => {
    cache.delete(key);
};
exports.deleteCache = deleteCache;
const clearCache = () => {
    cache.clear();
};
exports.clearCache = clearCache;
const deleteCacheByPrefix = (prefix) => {
    cache.deleteByPrefix(prefix);
};
exports.deleteCacheByPrefix = deleteCacheByPrefix;
const getCacheStats = () => {
    return cache.getStats();
};
exports.getCacheStats = getCacheStats;
// Cache key generators
const generateCacheKey = (prefix, params) => {
    const sortedParams = Object.keys(params)
        .sort()
        .reduce((result, key) => {
        result[key] = params[key];
        return result;
    }, {});
    return `${prefix}:${JSON.stringify(sortedParams)}`;
};
exports.generateCacheKey = generateCacheKey;
exports.default = cache;
