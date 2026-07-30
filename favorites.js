(() => {
  const STORAGE_KEY = "osanpoClubFavoritesV1";
  const KEY_PATTERN = /^(area|course|spot|story):[a-z0-9-]+$/;

  const normalize = (values) => {
    if (!Array.isArray(values)) return [];
    return [...new Set(values.filter((value) => typeof value === "string" && KEY_PATTERN.test(value)))];
  };

  const read = () => {
    try {
      return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    } catch {
      return [];
    }
  };

  const write = (values) => {
    const normalized = normalize(values);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    } catch {
      return null;
    }
  };

  const key = (type, id) => `${type}:${id}`;
  const has = (type, id) => read().includes(key(type, id));
  const toggle = (type, id) => {
    const target = key(type, id);
    if (!KEY_PATTERN.test(target)) return null;
    const values = read();
    const active = !values.includes(target);
    const nextValues = active ? [...values, target] : values.filter((value) => value !== target);
    return write(nextValues) ? active : null;
  };

  window.OSANPO_FAVORITES = {
    storageKey: STORAGE_KEY,
    key,
    read,
    write,
    has,
    toggle,
  };
})();
