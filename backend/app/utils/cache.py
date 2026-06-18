"""Simple in-memory LRU cache with TTL for agent responses."""

import time
from collections import OrderedDict
from typing import Any


class LRUCache:
    def __init__(self, capacity: int = 128, ttl: int = 300):
        self.capacity = capacity
        self.ttl = ttl
        self._cache: OrderedDict[str, tuple[float, Any]] = OrderedDict()

    def get(self, key: str) -> Any | None:
        if key not in self._cache:
            return None
        expire_at, value = self._cache[key]
        if time.monotonic() > expire_at:
            del self._cache[key]
            return None
        self._cache.move_to_end(key)
        return value

    def set(self, key: str, value: Any):
        self._cache[key] = (time.monotonic() + self.ttl, value)
        self._cache.move_to_end(key)
        if len(self._cache) > self.capacity:
            self._cache.popitem(last=False)

    def clear(self):
        self._cache.clear()

    @property
    def size(self) -> int:
        return len(self._cache)


agent_cache = LRUCache(capacity=256, ttl=600)
