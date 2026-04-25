import { ROUND_COUNT, DISTRACTOR_CHO_COUNT, DISTRACTOR_JUNG_COUNT } from './config.js';
import { decompose } from './hangul.js';
import { CHO_SINGLE, CHO_ALL, JUNG_CHARS, JONG_SINGLE, JONG_ALL } from '../data/jamo.js';
import {
  SYLLABLES_NO_JONG, SYLLABLES_WITH_JONG,
  SYLLABLES_DOUBLE_CHO, SYLLABLES_DOUBLE_JONG,
} from '../data/lessons.js';
import { shuffle, pickExcluding } from './utils.js';
import state from './state.js';

export function initLesson(level = 1) {
  state.level = level;
  let pool;
  switch (level) {
    case 2: pool = SYLLABLES_WITH_JONG;   break;
    case 3: pool = SYLLABLES_DOUBLE_CHO;  break;
    case 4: pool = SYLLABLES_DOUBLE_JONG; break;
    default: pool = SYLLABLES_NO_JONG;
  }
  state.lessonQueue = shuffle(pool).slice(0, ROUND_COUNT);
  state.lessonIdx = 0;
  state.stars = 0;
}

export function currentTarget() {
  const syllable = state.lessonQueue[state.lessonIdx];
  const d = decompose(syllable);
  if (!d) return null;
  return {
    syllable,
    cho: d.cho,
    jung: d.jung,
    jong: d.jong,
    hasJong: !!d.jong,
    choIdx: d.choIdx,
    jungIdx: d.jungIdx,
    jongIdx: d.jongIdx,
  };
}

export function advanceLesson() {
  state.stars++;
  state.lessonIdx++;
}

export function skipLesson() {
  state.lessonIdx++;
}

export function isLessonComplete() {
  return state.lessonIdx >= state.lessonQueue.length;
}

export function buildPalette(target, level = 1) {
  const choPool  = level >= 3 ? CHO_ALL  : CHO_SINGLE;
  const jongPool = level >= 4 ? JONG_ALL : JONG_SINGLE;

  const wrongCho  = pickExcluding(choPool,    new Set([target.cho]),  DISTRACTOR_CHO_COUNT);
  const wrongJung = pickExcluding(JUNG_CHARS, new Set([target.jung]), DISTRACTOR_JUNG_COUNT);

  const blocks = [
    { char: target.cho,  category: 'cho' },
    { char: target.jung, category: 'jung' },
    ...wrongCho.map(c  => ({ char: c, category: 'cho' })),
    ...wrongJung.map(c => ({ char: c, category: 'jung' })),
  ];

  if (target.hasJong && target.jong) {
    const wrongJong = pickExcluding(jongPool, new Set([target.jong]), 1);
    blocks.push({ char: target.jong, category: 'jong' });
    wrongJong.forEach(c => blocks.push({ char: c, category: 'jong' }));
  }

  return shuffle(blocks);
}
