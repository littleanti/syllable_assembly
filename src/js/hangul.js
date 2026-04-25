export const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
export const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
export const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

const VERTICAL_SET = new Set(['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅣ']);
const HORIZONTAL_SET = new Set(['ㅗ','ㅛ','ㅜ','ㅠ','ㅡ']);

export function compose(choIdx, jungIdx, jongIdx = 0) {
  return String.fromCharCode(0xAC00 + choIdx * 588 + jungIdx * 28 + jongIdx);
}

export function decompose(syllable) {
  const code = syllable.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return null;
  const choIdx = Math.floor(code / 588);
  const jungIdx = Math.floor((code % 588) / 28);
  const jongIdx = code % 28;
  return {
    choIdx, jungIdx, jongIdx,
    cho: CHO[choIdx],
    jung: JUNG[jungIdx],
    jong: JONG[jongIdx] || null,
  };
}

export function getVowelShape(jungChar) {
  if (VERTICAL_SET.has(jungChar)) return 'vertical';
  if (HORIZONTAL_SET.has(jungChar)) return 'horizontal';
  return 'horizontal'; // complex vowels → horizontal for MVP
}

// Speak-friendly phoneme: ㄱ → '그', ㄴ → '느', ㅏ → '아'
export function jamoToPhoneme(char) {
  const choIdx = CHO.indexOf(char);
  if (choIdx !== -1) {
    // consonant: compose with ㅡ (neutral vowel, jungIdx=18)
    return compose(choIdx, 18, 0);
  }
  const jungIdx = JUNG.indexOf(char);
  if (jungIdx !== -1) {
    // vowel: compose with ㅇ (silent initial, choIdx=11)
    return compose(11, jungIdx, 0);
  }
  return char;
}
