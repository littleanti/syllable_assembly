export class TapManager {
  constructor() {
    this.selected = null;
    this.onPlaced = null;
    this._paletteEl = null;
    this._dockEl = null;
    this._boundBlock = e => this._onBlockClick(e);
    this._boundSlot  = e => this._onSlotClick(e);
  }

  enable(paletteEl, dockEl) {
    this.disable();
    this._paletteEl = paletteEl;
    this._dockEl = dockEl;
    paletteEl.addEventListener('click', this._boundBlock);
    dockEl.addEventListener('click', this._boundSlot);
  }

  disable() {
    this._clearSelection();
    this._paletteEl?.removeEventListener('click', this._boundBlock);
    this._dockEl?.removeEventListener('click', this._boundSlot);
  }

  reset() {
    this._clearSelection();
  }

  _clearSelection() {
    if (this.selected) {
      this.selected.classList.remove('selected');
      this.selected = null;
    }
  }

  _onBlockClick(e) {
    const block = e.target.closest('.jamo-block');
    if (!block) return;
    // Toggle deselect on same block
    if (this.selected === block) { this._clearSelection(); return; }
    this._clearSelection();
    this.selected = block;
    block.classList.add('selected');
  }

  _onSlotClick(e) {
    const slot = e.target.closest('.slot');
    if (!slot || !this.selected) return;
    if (slot.classList.contains('filled')) return;

    const slotName = slot.dataset.slot;
    const category = this.selected.dataset.category;

    // Wrong type → reject flash, keep selection
    if (category !== slotName) {
      slot.classList.add('reject-flash');
      setTimeout(() => slot.classList.remove('reject-flash'), 380);
      return;
    }

    const char = this.selected.dataset.char;
    const el = this.selected;
    this._clearSelection();
    el.remove();
    this.onPlaced?.(char, category, slotName);
  }
}
