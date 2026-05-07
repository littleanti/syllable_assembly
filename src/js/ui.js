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

export function showEndScreen(correct, total) {
  showScreen('end');
  const pct = total > 0 ? correct / total : 0;
  const { title, emojis } = getEndingMessage(pct);

  document.getElementById('end-celebrate').textContent = emojis;
  document.getElementById('end-title').textContent     = title;
  document.getElementById('end-score').textContent     = correct;
  document.getElementById('end-total').textContent     = total;
  document.getElementById('end-total2').textContent    = total;
  document.getElementById('end-accuracy').textContent  = `정답률 ${Math.round(pct * 100)}%`;
}

function getEndingMessage(pct) {
  if (pct === 1)   return { title: '완벽해요! 천재!', emojis: '🏆👑✨' };
  if (pct >= 0.7)  return { title: '정말 잘했어요!',  emojis: '🎉⭐🎊' };
  if (pct >= 0.4)  return { title: '잘했어요!',       emojis: '😊👍💫' };
  return                  { title: '다시 해볼까요?',  emojis: '💪🌱📚' };
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
  return false;
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
