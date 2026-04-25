import { init as audioInit, unlock as audioUnlock } from './audio.js';
import { showScreen, checkOrientation, showTotalStars } from './ui.js';
import { startGame, stopGame, replayTargetAudio, getCurrentSettings } from './game.js';
import { loadProgress, saveProgress } from './storage.js';

audioInit();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}

// ── Helpers ──────────────────────────────────────────────
const LEVEL_LABELS = {
  1: '레벨 1 · 받침 없음 · 홑자음',
  2: '레벨 2 · 받침 있음 · 홑자음',
  3: '레벨 3 · 받침 없음 · 쌍자음',
  4: '레벨 4 · 받침 있음 · 쌍자음+겹받침',
};

// ── Saved preferences ────────────────────────────────────
const _saved = loadProgress();
let selectedLevel   = _saved.level   || 1;
let selectedTapMode = _saved.tapMode || false;

showTotalStars(_saved.totalStars || 0);
updateLevelDisplay();

window.addEventListener('resize', () => checkOrientation());

function updateLevelDisplay() {
  const el = document.getElementById('current-level-display');
  if (el) el.textContent = LEVEL_LABELS[selectedLevel] || '';
}

function saveSettings() {
  const s = loadProgress();
  s.level   = selectedLevel;
  s.tapMode = selectedTapMode;
  saveProgress(s);
}

function isPortraitBlocked() {
  return window.innerHeight > window.innerWidth && window.innerWidth < 600;
}

function launchGame(level, tapMode) {
  if (isPortraitBlocked()) {
    showScreen('orientation');
    const resume = () => {
      if (!isPortraitBlocked()) {
        window.removeEventListener('resize', resume);
        startGame(level, tapMode);
      }
    };
    window.addEventListener('resize', resume);
  } else {
    startGame(level, tapMode);
  }
}

// ── Start screen buttons ─────────────────────────────────
document.getElementById('btn-start').addEventListener('click', async () => {
  await audioUnlock();
  launchGame(selectedLevel, selectedTapMode);
});

document.getElementById('btn-open-settings').addEventListener('click', () => {
  // Sync UI to current settings before opening
  document.querySelectorAll('.level-chip').forEach(btn => {
    btn.classList.toggle('active', Number(btn.dataset.level) === selectedLevel);
  });
  const tapToggle = document.getElementById('toggle-tap');
  if (tapToggle) tapToggle.checked = selectedTapMode;
  showScreen('settings');
});

// ── Settings screen ──────────────────────────────────────
document.querySelectorAll('.level-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedLevel = Number(btn.dataset.level);
    document.querySelectorAll('.level-chip').forEach(b =>
      b.classList.toggle('active', b === btn)
    );
  });
});

document.getElementById('toggle-tap').addEventListener('change', e => {
  selectedTapMode = e.target.checked;
});

document.getElementById('btn-close-settings').addEventListener('click', () => {
  saveSettings();
  updateLevelDisplay();
  showScreen('start');
});

document.getElementById('btn-settings-done').addEventListener('click', () => {
  saveSettings();
  updateLevelDisplay();
  showScreen('start');
});

// ── Play screen buttons ──────────────────────────────────
document.getElementById('btn-retry').addEventListener('click', () => {
  const s = getCurrentSettings();
  startGame(s.level, s.tapMode);
  showTotalStars(loadProgress().totalStars || 0);
});

document.getElementById('btn-quit').addEventListener('click', () => {
  stopGame();
  showTotalStars(loadProgress().totalStars || 0);
});

// ── End screen buttons ───────────────────────────────────
document.getElementById('btn-home').addEventListener('click', () => {
  showScreen('start');
  showTotalStars(loadProgress().totalStars || 0);
});

// ── Audio controls ───────────────────────────────────────
document.getElementById('target-card').addEventListener('click', () => replayTargetAudio());

document.getElementById('btn-speak').addEventListener('click', e => {
  e.stopPropagation();
  replayTargetAudio();
});
