import { SNAP_EXPAND_PX, SPRING_BACK_MS } from './config.js';
import { pointInExpandedRect } from './utils.js';

const DRAG_THRESHOLD = 8;

export class DragManager {
  constructor() {
    this.dragging = null;
    this._pending = null;
    this.slots = [];
    this.onPlaced = null;
    this.enabled = true;
    this._attached = false;
    this._boundDown = e => this._onDown(e);
    this._boundMove = e => this._onMove(e);
    this._boundUp   = e => this._onUp(e);
  }

  init(paletteEl) {
    if (this._attached) return;
    paletteEl.addEventListener('pointerdown', this._boundDown);
    document.addEventListener('pointermove',  this._boundMove, { passive: false });
    document.addEventListener('pointerup',    this._boundUp);
    document.addEventListener('pointercancel', this._boundUp);
    this._attached = true;
  }

  updateSlots(slots) {
    this.slots = slots;
  }

  _onDown(e) {
    if (!this.enabled) return;
    const block = e.target.closest('.jamo-block');
    if (!block || block.classList.contains('placed')) return;
    // No preventDefault here — allows click to fire when no drag occurs
    this._pending = {
      el: block,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
    };
  }

  _onMove(e) {
    if (this.dragging) {
      const d = this.dragging;
      if (e.pointerId !== d.pointerId) return;
      e.preventDefault();

      const left = e.clientX - d.offsetX;
      const top  = e.clientY - d.offsetY;
      d.el.style.left = left + 'px';
      d.el.style.top  = top  + 'px';

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
      return;
    }

    const p = this._pending;
    if (!p || e.pointerId !== p.pointerId) return;

    const dx = e.clientX - p.startX;
    const dy = e.clientY - p.startY;
    if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;

    // Threshold exceeded — lift block and start drag
    e.preventDefault();
    const block = p.el;
    this._pending = null;

    if (!block.isConnected || block.classList.contains('placed')) return;

    const rect = block.getBoundingClientRect();

    const ph = document.createElement('div');
    ph.className = 'drag-placeholder';
    ph.style.cssText = `width:${rect.width}px;height:${rect.height}px;flex-shrink:0;`;
    block.parentNode.insertBefore(ph, block);

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
      pointerId: p.pointerId,
      offsetX: p.startX - rect.left,
      offsetY: p.startY - rect.top,
      originLeft: rect.left,
      originTop: rect.top,
      w: rect.width,
      h: rect.height,
      char: block.dataset.char,
      category: block.dataset.category,
      snapTarget: null,
    };
  }

  _onUp(e) {
    if (this._pending && e.pointerId === this._pending.pointerId) {
      this._pending = null;
      // No drag — let click event handle tap
      return;
    }

    const d = this.dragging;
    if (!d || e.pointerId !== d.pointerId) return;
    this.dragging = null;
    e.preventDefault(); // suppress click after a real drag

    d.el.classList.remove('dragging');
    this.slots.forEach(s => s.el.classList.remove('magnet-active'));

    if (d.snapTarget) {
      d.ph.remove();
      d.el.remove();
      this.onPlaced?.(d.char, d.category, d.snapTarget.name);
    } else {
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
