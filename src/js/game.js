import { compose, CHO, JUNG, JONG, jamoToPhoneme } from './hangul.js';
import { applyVowelShape, setJongVisible } from './layout.js';
import {
  showScreen, showTargetHint, updateSlotDisplay,
  showAssembledSyllable, clearAssembledSyllable,
  showReward, showEndScreen, updateProgress,
  showPartialFeedback, hidePartialFeedback,
} from './ui.js';
import { speak, speakPartial, speakSequence, speakAndWait, playCorrect, playIncorrect } from './audio.js';
import { DragManager } from './pointer.js';
import { TapManager } from './tap.js';
import { initLesson, currentTarget, advanceLesson, skipLesson, isLessonComplete, buildPalette } from './lesson.js';
import { loadProgress, saveProgress } from './storage.js';
import { REWARD_DELAY_MS, ROUND_COUNT } from './config.js';
import { sleep } from './utils.js';
import state from './state.js';

const drag = new DragManager();
const tap  = new TapManager();

let busy = false;
let dragInitialized = false;
let currentLevel   = 1;
let correctionMode = false;

export function startGame(level = 1, corrMode = false, roundCount = ROUND_COUNT) {
  currentLevel   = level;
  correctionMode = corrMode;

  initLesson(level, roundCount);
  showScreen('play');
  updateProgress(0, 0, state.roundCount);

  const paletteEl = document.getElementById('palette');
  const dockEl    = document.getElementById('dock');

  if (!dragInitialized) {
    drag.init(paletteEl);
    drag.onPlaced = onJamoPlaced;
    dragInitialized = true;
  }
  drag.enabled = true;

  tap.enable(paletteEl, dockEl);
  tap.onPlaced = onJamoPlaced;

  startRound();
}

export function stopGame() {
  showScreen('start');
}

export function getCurrentSettings() {
  return { level: currentLevel, correctionMode, roundCount: state.roundCount };
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
  setTimeout(() => speak(target.syllable, 0.75), 200);
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

  // Correction mode: immediately reject wrong placement
  if (correctionMode) {
    const correctChar = { cho, jung, jong }[slotName];
    if (char !== correctChar) {
      const slotEl = document.querySelector(`[data-slot="${slotName}"]`);
      if (slotEl) {
        slotEl.classList.add('reject-flash');
        setTimeout(() => slotEl.classList.remove('reject-flash'), 380);
      }
      playIncorrect();
      state.board[slotName] = null;
      updateSlotDisplay(slotName, null);
      return;
    }
  }

  const choOk  = b.cho  === cho;
  const jungOk = b.jung === jung;
  const jongOk = !hasJong || b.jong === jong;
  const isComplete = choOk && jungOk && jongOk && b.cho && b.jung;

  // Speak placed jamo's phoneme only when not completing (handleSuccess handles the final sequence)
  if (!isComplete) {
    speak(jamoToPhoneme(char), 0.9);
  }

  if (b.cho && b.jung) {
    const cIdx = CHO.indexOf(b.cho);
    const vIdx = JUNG.indexOf(b.jung);
    const jIdx = (hasJong && b.jong) ? Math.max(0, JONG.indexOf(b.jong)) : 0;
    showAssembledSyllable(compose(cIdx, vIdx, jIdx));
  }

  if (hasJong && choOk && jungOk && !b.jong) {
    showPartialFeedback('거의 다 됐어요! 받침을 놓아요 👇');
  }

  if (isComplete) {
    await handleSuccess(char);
    return;
  }

  // Default mode: all slots filled but wrong → skip to next
  if (!correctionMode) {
    const allFilled = b.cho && b.jung && (!hasJong || b.jong);
    if (allFilled) {
      await handleFailure();
    }
  }
}

async function handleSuccess(lastChar) {
  busy = true;
  playCorrect();
  showReward();
  advanceLesson();
  updateProgress(state.lessonIdx, state.stars, state.roundCount);

  // Speak last phoneme → assembled → 300ms gap → then transition
  await speakAndWait(jamoToPhoneme(lastChar), 0.9);
  await speakAndWait(state.target.syllable, 0.82);
  await sleep(200);

  if (isLessonComplete()) {
    showEndScreen(state.stars, state.lessonIdx);
  } else {
    startRound();
  }
}

async function handleFailure() {
  busy = true;
  playIncorrect();
  const dockEl = document.getElementById('dock');
  dockEl.classList.add('wrong-shake');
  dockEl.addEventListener('animationend', () => dockEl.classList.remove('wrong-shake'), { once: true });

  await sleep(700);

  skipLesson();
  updateProgress(state.lessonIdx, state.stars, state.roundCount);

  if (isLessonComplete()) {
    showEndScreen(state.stars, state.lessonIdx);
  } else {
    startRound();
  }
}

export function replayTargetAudio() {
  if (state.target) speak(state.target.syllable, 0.75);
}
