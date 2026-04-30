import { ROUND_COUNT, DISTRACTOR_CHO_COUNT, DISTRACTOR_JUNG_COUNT } from './config.js';
import { decompose } from './hangul.js';
import { CHO_SINGLE, CHO_ALL, JUNG_CHARS, JONG_SINGLE, JONG_ALL } from '../data/jamo.js';
import {
  SYLLABLES_L1,
  SYLLABLES_L2_SINGLE, SYLLABLES_L2_DOUBLE,
  SYLLABLES_L3_SINGLE, SYLLABLES_L3_DOUBLE,
  SYLLABLES_L4_COMPLEX,
} from '../data/lessons.js';
import { shuffle, pickExcluding } from './utils.js';
import state from './state.js';

export function initLesson(level = 1, roundCount = ROUND_COUNT) {
  state.level = level;
  state.roundCount = roundCount;

  if (level === 2) {
    // 홑자음 85% + 쌍자음 15%
    const dCnt = Math.round(roundCount * 0.15);
    const sCnt = roundCount - dCnt;
    state.lessonQueue = shuffle([
      ...shuffle([...SYLLABLES_L2_SINGLE]).slice(0, sCnt),
      ...shuffle([...SYLLABLES_L2_DOUBLE]).slice(0, dCnt),
    ]);
  } else if (level === 3) {
    // 홑받침: 홑자음 + 쌍자음 초성 혼합
    const pool = shuffle([...SYLLABLES_L3_SINGLE, ...SYLLABLES_L3_DOUBLE]);
    state.lessonQueue = pool.slice(0, roundCount);
  } else if (level === 4) {
    // 겹받침 50% + 홑받침 50%
    const dCnt = Math.round(roundCount * 0.5);
    const sCnt = roundCount - dCnt;
    state.lessonQueue = shuffle([
      ...shuffle([...SYLLABLES_L4_COMPLEX]).slice(0, dCnt),
      ...shuffle([...SYLLABLES_L3_SINGLE]).slice(0, sCnt),
    ]);
  } else {
    // Level 1
    state.lessonQueue = shuffle([...SYLLABLES_L1]).slice(0, roundCount);
  }

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
  const choPool  = level >= 2 ? CHO_ALL  : CHO_SINGLE;
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
