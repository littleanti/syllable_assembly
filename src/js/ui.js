import state from './state.js';

const SCREENS = ['start', 'settings', 'orientation', 'play', 'end'];

export function showScreen(name) {
  SCREENS.forEach(s => {
    const el = document.getElementById(`screen-${s}`);
    if (el) el.hidden = s !== name;
  });
  state.currentScreen = name;
}

export function updateProgress(current, stars, total) {
  const el = document.getElementById('progress-text');
  if (el) el.textContent = `${current} / ${total}`;

  const bar = document.getElementById('progress-fill');
  if (bar) bar.style.width = `${(current / total) * 100}%`;

  const score = document.getElementById('score-inline');
  if (score) score.textContent = stars;
}

export function showTargetHint(syllable) {
  const el = document.getElementById('target-display');
  if (el) el.textContent = syllable;
}

export function updateSlotDisplay(slotName, char) {
  const el = document.querySelector(`[data-slot="${slotName}"]`);
  if (!el) return;
  if (char) {
    el.textContent = char;
    el.classList.add('filled');
  } else {
    el.textContent = '';
    el.classList.remove('filled');
  }
}

export function showAssembledSyllable(syllable) {
  const el = document.getElementById('assembled-display');
  if (!el) return;
  el.textContent = syllable;
  // Restart animation: remove → force reflow → re-add
  el.classList.remove('pop-in');
  void el.offsetWidth;
  el.classList.add('pop-in');
  // forwards fill-mode keeps opacity:1 after animation ends
}

export function clearAssembledSyllable() {
  const el = document.getElementById('assembled-display');
  if (el) { el.textContent = ''; el.className = 'assembled-display'; }
}

export function showReward() {
  const dock = document.getElementById('dock');
  if (dock) {
    dock.classList.add('reward');
    dock.addEventListener('animationend', () => dock.classList.remove('reward'), { once: true });
  }
  const overlay = document.getElementById('reward-overlay');
  if (overlay) {
    overlay.hidden = false;
    overlay.classList.add('show');
    setTimeout(() => {
      overlay.classList.remove('show');
      overlay.hidden = true;
    }, 1200);
  }
}

export function showEndScreen(stars, total) {
  showScreen('end');
  const el = document.getElementById('end-stars');
  if (el) el.textContent = `${'⭐'.repeat(stars)}`;
  const msg = document.getElementById('end-message');
  if (msg) {
    const pct = stars / total;
    msg.textContent =
      pct >= 0.9 ? '완벽해요! 🎉' :
      pct >= 0.7 ? '아주 잘했어요! 😊' :
      pct >= 0.5 ? '잘했어요! 👍' :
      '조금만 더 연습해요! 💪';
  }
}

export function showPartialFeedback(msg) {
  const el = document.getElementById('partial-feedback');
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.hidden = true; }, 2400);
}

export function hidePartialFeedback() {
  const el = document.getElementById('partial-feedback');
  if (el) { el.hidden = true; clearTimeout(el._t); }
}

function isPortraitBlocked() {
  // Allow portrait on tablets (width >= 600px) — only block on small phones
  return window.innerHeight > window.innerWidth && window.innerWidth < 600;
}

export function checkOrientation() {
  const blocked = isPortraitBlocked();
  if (blocked && state.currentScreen === 'play') {
    showScreen('orientation');
    return true;
  }
  if (!blocked && state.currentScreen === 'orientation') {
    showScreen('play');
    return false;
  }
  return blocked;
}
