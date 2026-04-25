export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export function pickExcluding(arr, excludeSet, n) {
  const pool = arr.filter(x => !excludeSet.has(x));
  return shuffle(pool).slice(0, n);
}

export function rectCenter(rect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export function pointInExpandedRect(px, py, rect, expand) {
  return px >= rect.left - expand && px <= rect.right + expand &&
         py >= rect.top - expand && py <= rect.bottom + expand;
}
