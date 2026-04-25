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

// ── Saved preferences ────────────────────────────────────
const _saved = loadProgress();
let selectedLevel      = _saved.level      || 1;
let selectedTapMode    = _saved.tapMode    || false;
let selectedCorrection = _saved.correctionMode || false;

showTotalStars(_saved.totalStars || 0);

window.addEventListener('resize', () => checkOrientation());

// ── Helpers ──────────────────────────────────────────────
function saveSettings() {
  const s = loadProgress();
  s.level          = selectedLevel;
  s.tapMode        = selectedTapMode;
  s.correctionMode = selectedCorrection;
  saveProgress(s);
}

function isPortraitBlocked() {
  return window.innerHeight > window.innerWidth && window.innerWidth < 600;
}

function launchGame(level, tapMode, corrMode) {
  if (isPortraitBlocked()) {
    showScreen('orientation');
    const resume = () => {
      if (!isPortraitBlocked()) {
        window.removeEventListener('resize', resume);
        startGame(level, tapMode, corrMode);
      }
    };
    window.addEventListener('resize', resume);
  } else {
    startGame(level, tapMode, corrMode);
  }
}

// ── Level buttons (home screen) ──────────────────────────
document.querySelectorAll('.level-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    selectedLevel = Number(btn.dataset.level);
    saveSettings();
    await audioUnlock();
    launchGame(selectedLevel, selectedTapMode, selectedCorrection);
  });
});

// ── Settings screen ──────────────────────────────────────
document.getElementById('btn-open-settings').addEventListener('click', () => {
  const tapToggle = document.getElementById('toggle-tap');
  if (tapToggle) tapToggle.checked = selectedTapMode;
  const corrToggle = document.getElementById('toggle-correction');
  if (corrToggle) corrToggle.checked = selectedCorrection;
  showScreen('settings');
});

document.getElementById('toggle-tap').addEventListener('change', e => {
  selectedTapMode = e.target.checked;
});

document.getElementById('toggle-correction').addEventListener('change', e => {
  selectedCorrection = e.target.checked;
});

document.getElementById('btn-close-settings').addEventListener('click', () => {
  saveSettings();
  showScreen('start');
});

document.getElementById('btn-settings-done').addEventListener('click', () => {
  saveSettings();
  showScreen('start');
});

// ── Play screen buttons ──────────────────────────────────
document.getElementById('btn-retry').addEventListener('click', () => {
  const s = getCurrentSettings();
  startGame(s.level, s.tapMode, s.correctionMode);
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
