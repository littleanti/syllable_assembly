import { SNAP_EXPAND_PX, SPRING_BACK_MS } from './config.js';
import { pointInExpandedRect } from './utils.js';

export class DragManager {
  constructor() {
    this.dragging = null;
    this.slots = [];
    this.onPlaced = null;
    this.enabled = true;
    this._attached = false;
    // Bind once so removeEventListener can work if needed
    this._boundDown = e => this._onDown(e);
    this._boundMove = e => this._onMove(e);
    this._boundUp   = e => this._onUp(e);
  }

  // Call once after DOM ready
  init(paletteEl) {
    if (this._attached) return;
    paletteEl.addEventListener('pointerdown', this._boundDown);
    document.addEventListener('pointermove',  this._boundMove, { passive: false });
    document.addEventListener('pointerup',    this._boundUp);
    document.addEventListener('pointercancel', this._boundUp);
    this._attached = true;
  }

  // Update valid drop targets each round
  updateSlots(slots) {
    this.slots = slots;
  }

  _onDown(e) {
    if (!this.enabled) return;
    const block = e.target.closest('.jamo-block');
    if (!block || block.classList.contains('placed')) return;
    e.preventDefault();

    const rect = block.getBoundingClientRect();

    // Invisible placeholder preserves space in palette
    const ph = document.createElement('div');
    ph.className = 'drag-placeholder';
    ph.style.cssText = `width:${rect.width}px;height:${rect.height}px;flex-shrink:0;`;
    block.parentNode.insertBefore(ph, block);

    // Lift block into fixed layer
    block.style.cssText = `
      position:fixed;left:${rect.left}px;top:${rect.top}px;
      width:${rect.width}px;height:${rect.height}px;
      z-index:1000;margin:0;touch-action:none;pointer-events:none;
    `;
    document.body.appendChild(block);
    block.setPointerCapture(e.pointerId);
    block.classList.add('dragging');

    this.dragging = {
      el: block,
      ph,
      pointerId: e.pointerId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      originLeft: rect.left,
      originTop: rect.top,
      w: rect.width,
      h: rect.height,
      char: block.dataset.char,
      category: block.dataset.category,
      snapTarget: null,
    };
  }

  _onMove(e) {
    const d = this.dragging;
    if (!d || e.pointerId !== d.pointerId) return;
    e.preventDefault();

    const left = e.clientX - d.offsetX;
    const top  = e.clientY - d.offsetY;
    d.el.style.left = left + 'px';
    d.el.style.top  = top  + 'px';

    // Center of dragged block
    const cx = left + d.w / 2;
    const cy = top  + d.h / 2;

    let snap = null;
    for (const slot of this.slots) {
      if (slot.accepts !== d.category) continue;
      if (slot.el.classList.contains('filled')) continue;
      const r = slot.el.getBoundingClientRect();
      if (pointInExpandedRect(cx, cy, r, SNAP_EXPAND_PX)) { snap = slot; break; }
    }

    this.slots.forEach(s => s.el.classList.toggle('magnet-active', s === snap));
    d.snapTarget = snap;
  }

  _onUp(e) {
    const d = this.dragging;
    if (!d || e.pointerId !== d.pointerId) return;
    this.dragging = null;

    d.el.classList.remove('dragging');
    this.slots.forEach(s => s.el.classList.remove('magnet-active'));

    if (d.snapTarget) {
      d.ph.remove();
      d.el.remove();
      this.onPlaced?.(d.char, d.category, d.snapTarget.name);
    } else {
      // Spring back
      d.el.style.transition =
        `left ${SPRING_BACK_MS}ms cubic-bezier(.25,.8,.25,1),` +
        `top ${SPRING_BACK_MS}ms cubic-bezier(.25,.8,.25,1)`;
      d.el.style.left = d.originLeft + 'px';
      d.el.style.top  = d.originTop  + 'px';
      d.el.style.pointerEvents = '';
      setTimeout(() => {
        d.el.style.cssText = '';
        d.ph.replaceWith(d.el);
      }, SPRING_BACK_MS);
    }
  }
}
