import { init as audioInit, unlock as audioUnlock } from './audio.js';
import { showScreen, checkOrientation } from './ui.js';
import { startGame, stopGame, replayTargetAudio, getCurrentSettings } from './game.js';
import { loadProgress, saveProgress } from './storage.js';
import { ROUND_COUNT } from './config.js';

audioInit();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}

// ── Saved preferences ────────────────────────────────────
const _saved = loadProgress();
let selectedLevel      = _saved.level      || 1;
let selectedCorrection = _saved.correctionMode || false;
let selectedRoundCount = _saved.roundCount || ROUND_COUNT;

const COUNT_OPTIONS = [5, 10, 15, 20];

window.addEventListener('resize', () => checkOrientation());

// ── Helpers ──────────────────────────────────────────────
function saveSettings() {
  const s = loadProgress();
  s.level          = selectedLevel;
  s.correctionMode = selectedCorrection;
  s.roundCount     = selectedRoundCount;
  saveProgress(s);
}

function launchGame(level, corrMode, roundCount) {
  startGame(level, corrMode, roundCount);
}

function syncToggle(id, value) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('on', value);
}

function renderCountChips() {
  const row = document.getElementById('count-chips');
  if (!row) return;
  row.innerHTML = '';
  COUNT_OPTIONS.forEach(n => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (n === selectedRoundCount ? ' active' : '');
    btn.textContent = `${n}문제`;
    btn.addEventListener('click', () => {
      selectedRoundCount = n;
      renderCountChips();
    });
    row.appendChild(btn);
  });
}

// ── Level buttons (home screen) ──────────────────────────
document.querySelectorAll('.level-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    selectedLevel = Number(btn.dataset.level);
    saveSettings();
    await audioUnlock();
    launchGame(selectedLevel, selectedCorrection, selectedRoundCount);
  });
});

// ── Settings screen ──────────────────────────────────────
document.getElementById('btn-open-settings').addEventListener('click', () => {
  syncToggle('toggle-correction', selectedCorrection);
  renderCountChips();
  showScreen('settings');
});

document.getElementById('toggle-correction').addEventListener('click', function () {
  selectedCorrection = !selectedCorrection;
  this.classList.toggle('on', selectedCorrection);
});

document.getElementById('btn-settings-reset').addEventListener('click', () => {
  selectedCorrection = false;
  selectedRoundCount = ROUND_COUNT;
  syncToggle('toggle-correction', false);
  renderCountChips();
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
  startGame(s.level, s.correctionMode, s.roundCount);
});

document.getElementById('btn-quit').addEventListener('click', () => {
  stopGame();
});

// ── End screen buttons ───────────────────────────────────
document.getElementById('btn-open-settings-end').addEventListener('click', () => {
  syncToggle('toggle-correction', selectedCorrection);
  renderCountChips();
  showScreen('settings');
});

document.getElementById('btn-home').addEventListener('click', () => {
  showScreen('start');
});

// ── Audio controls ───────────────────────────────────────
document.getElementById('target-card').addEventListener('click', () => replayTargetAudio());

document.getElementById('btn-speak').addEventListener('click', e => {
  e.stopPropagation();
  replayTargetAudio();
});
