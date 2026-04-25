import { compose, CHO, JUNG, JONG } from './hangul.js';
import { applyVowelShape, setJongVisible } from './layout.js';
import {
  showScreen, showTargetHint, updateSlotDisplay,
  showAssembledSyllable, clearAssembledSyllable,
  showReward, showEndScreen, updateProgress,
  showPartialFeedback, hidePartialFeedback,
} from './ui.js';
import { speak, speakPartial } from './audio.js';
import { DragManager } from './pointer.js';
import { TapManager } from './tap.js';
import { initLesson, currentTarget, advanceLesson, isLessonComplete, buildPalette } from './lesson.js';
import { loadProgress, saveProgress } from './storage.js';
import { REWARD_DELAY_MS, ROUND_COUNT } from './config.js';
import { sleep } from './utils.js';
import state from './state.js';

const drag = new DragManager();
const tap  = new TapManager();

let busy = false;
let dragInitialized = false;
let currentLevel   = 1;
let currentTapMode = false;

export function startGame(level = 1, tapMode = false) {
  currentLevel   = level;
  currentTapMode = tapMode;

  initLesson(level);
  showScreen('play');
  updateProgress(0, ROUND_COUNT);

  const paletteEl = document.getElementById('palette');
  const dockEl    = document.getElementById('dock');

  if (!dragInitialized) {
    drag.init(paletteEl);
    drag.onPlaced = onJamoPlaced;
    dragInitialized = true;
  }

  if (tapMode) {
    drag.enabled = false;
    tap.enable(paletteEl, dockEl);
    tap.onPlaced = onJamoPlaced;
  } else {
    drag.enabled = true;
    tap.disable();
  }

  startRound();
}

export function stopGame() {
  showScreen('start');
}

export function getCurrentSettings() {
  return { level: currentLevel, tapMode: currentTapMode };
}

function startRound() {
  busy = false;
  clearAssembledSyllable();
  hidePartialFeedback();
  tap.reset();
  state.board = { cho: null, jung: null, jong: null };

  const target = currentTarget();
  if (!target) return;
  state.target = target;

  const dockEl = document.getElementById('dock');
  applyVowelShape(target.jung, dockEl);
  setJongVisible(target.hasJong, dockEl);
  ['cho', 'jung', 'jong'].forEach(s => updateSlotDisplay(s, null));

  renderPalette(buildPalette(target, currentLevel));

  const slots = [
    { el: document.querySelector('[data-slot="cho"]'),  name: 'cho',  accepts: 'cho' },
    { el: document.querySelector('[data-slot="jung"]'), name: 'jung', accepts: 'jung' },
  ];
  if (target.hasJong) {
    const jongEl = document.querySelector('[data-slot="jong"]');
    if (jongEl) slots.push({ el: jongEl, name: 'jong', accepts: 'jong' });
  }
  drag.updateSlots(slots);

  showTargetHint(target.syllable);
  setTimeout(() => speak(target.syllable, 0.75), 300);
}

function renderPalette(blocks) {
  const palette = document.getElementById('palette');
  palette.innerHTML = '';
  blocks.forEach(({ char, category }) => {
    const btn = document.createElement('button');
    btn.className = `jamo-block color-${category}`;
    btn.dataset.char = char;
    btn.dataset.category = category;
    btn.textContent = char;
    btn.setAttribute('aria-label', char);
    palette.appendChild(btn);
  });
}

async function onJamoPlaced(char, category, slotName) {
  if (busy) return;
  state.board[slotName] = char;
  updateSlotDisplay(slotName, char);

  const { cho, jung, jong, hasJong } = state.target;
  const b = state.board;

  if (b.cho && !b.jung) {
    speakPartial(b.cho);
  } else if (b.cho && b.jung) {
    const cIdx = CHO.indexOf(b.cho);
    const vIdx = JUNG.indexOf(b.jung);
    const jIdx = (hasJong && b.jong) ? Math.max(0, JONG.indexOf(b.jong)) : 0;
    const assembled = compose(cIdx, vIdx, jIdx);
    showAssembledSyllable(assembled);
    speak(assembled, 0.85);
  }

  const choOk  = b.cho  === cho;
  const jungOk = b.jung === jung;
  const jongOk = !hasJong || b.jong === jong;

  if (hasJong && choOk && jungOk && !b.jong) {
    showPartialFeedback('거의 다 됐어요! 받침을 놓아요 👇');
  }

  if (choOk && jungOk && jongOk && b.cho && b.jung) {
    await handleSuccess();
  }
}

async function handleSuccess() {
  busy = true;
  speak(state.target.syllable, 0.75);
  showReward();
  advanceLesson();
  updateProgress(state.stars, ROUND_COUNT);

  const saved = loadProgress();
  saved.totalStars = (saved.totalStars || 0) + 1;
  saveProgress(saved);

  await sleep(REWARD_DELAY_MS);

  if (isLessonComplete()) {
    showEndScreen(state.stars, ROUND_COUNT);
  } else {
    startRound();
  }
}

export function replayTargetAudio() {
  if (state.target) speak(state.target.syllable, 0.75);
}
