export class TapManager {
  constructor() {
    this.onPlaced = null;
    this._paletteEl = null;
    this._boundBlock = e => this._onBlockClick(e);
  }

  enable(paletteEl, _dockEl) {
    this.disable();
    this._paletteEl = paletteEl;
    paletteEl.addEventListener('click', this._boundBlock);
  }

  disable() {
    this._paletteEl?.removeEventListener('click', this._boundBlock);
    this._paletteEl = null;
  }

  reset() {}

  _onBlockClick(e) {
    const block = e.target.closest('.jamo-block');
    if (!block) return;

    const category = block.dataset.category;
    const slotEl = document.querySelector(`[data-slot="${category}"]`);
    if (slotEl?.classList.contains('filled')) return;

    const char = block.dataset.char;
    block.remove();
    this.onPlaced?.(char, category, category);
  }
}
