import { getVowelShape } from './hangul.js';

const SHAPES = ['vertical', 'horizontal'];

export function applyVowelShape(jungChar, dockEl) {
  const shape = getVowelShape(jungChar);
  SHAPES.forEach(s => dockEl.classList.remove(`shape-${s}`));
  dockEl.classList.add(`shape-${shape}`);
}

export function setJongVisible(hasJong, dockEl) {
  const jongSlot = dockEl.querySelector('[data-slot="jong"]');
  if (!jongSlot) return;
  jongSlot.hidden = !hasJong;
  dockEl.classList.toggle('has-jong', hasJong);
}
