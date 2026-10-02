export function nextRng(state: number): { unit: number; next: number } {
  const next = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return { unit: next / 0x100000000, next };
}

export function pickIndex(
  state: number,
  length: number,
): {
  index: number;
  next: number;
} {
  const { unit, next } = nextRng(state);
  return { index: Math.floor(unit * length), next };
}

export function shuffle<T>(
  items: T[],
  state: number,
): { items: T[]; next: number } {
  const copy = [...items];
  let rng = state;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const picked = pickIndex(rng, i + 1);
    rng = picked.next;
    const swap = copy[i];
    copy[i] = copy[picked.index];
    copy[picked.index] = swap;
  }
  return { items: copy, next: rng };
}

export function pickUnique<T>(
  pool: T[],
  count: number,
  state: number,
): { items: T[]; next: number } {
  const { items, next } = shuffle(pool, state);
  return { items: items.slice(0, Math.min(count, items.length)), next };
}
