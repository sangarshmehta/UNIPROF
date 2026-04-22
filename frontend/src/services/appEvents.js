const listeners = new Map();

function getBucket(eventName) {
  if (!listeners.has(eventName)) listeners.set(eventName, new Set());
  return listeners.get(eventName);
}

export function emitEvent(eventName, payload) {
  const bucket = getBucket(eventName);
  bucket.forEach((listener) => listener(payload));
}

export function onEvent(eventName, listener) {
  const bucket = getBucket(eventName);
  bucket.add(listener);
  return () => {
    bucket.delete(listener);
  };
}
