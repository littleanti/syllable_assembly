// Metadata for jamo blocks used in the game palette.

export const CHO_META = [
  { char: 'ㄱ', name: '기역',   color: 'cho' },
  { char: 'ㄲ', name: '쌍기역', color: 'cho' },
  { char: 'ㄴ', name: '니은',   color: 'cho' },
  { char: 'ㄷ', name: '디귿',   color: 'cho' },
  { char: 'ㄸ', name: '쌍디귿', color: 'cho' },
  { char: 'ㄹ', name: '리을',   color: 'cho' },
  { char: 'ㅁ', name: '미음',   color: 'cho' },
  { char: 'ㅂ', name: '비읍',   color: 'cho' },
  { char: 'ㅃ', name: '쌍비읍', color: 'cho' },
  { char: 'ㅅ', name: '시옷',   color: 'cho' },
  { char: 'ㅆ', name: '쌍시옷', color: 'cho' },
  { char: 'ㅇ', name: '이응',   color: 'cho' },
  { char: 'ㅈ', name: '지읒',   color: 'cho' },
  { char: 'ㅉ', name: '쌍지읒', color: 'cho' },
  { char: 'ㅊ', name: '치읓',   color: 'cho' },
  { char: 'ㅋ', name: '키읔',   color: 'cho' },
  { char: 'ㅌ', name: '티읕',   color: 'cho' },
  { char: 'ㅍ', name: '피읖',   color: 'cho' },
  { char: 'ㅎ', name: '히읗',   color: 'cho' },
];

export const CHO_SINGLE = CHO_META
  .filter(m => !['ㄲ','ㄸ','ㅃ','ㅆ','ㅉ'].includes(m.char))
  .map(m => m.char);
export const CHO_ALL = CHO_META.map(m => m.char);

export const JUNG_META = [
  { char: 'ㅏ', name: '아', color: 'jung', shape: 'vertical' },
  { char: 'ㅑ', name: '야', color: 'jung', shape: 'vertical' },
  { char: 'ㅓ', name: '어', color: 'jung', shape: 'vertical' },
  { char: 'ㅕ', name: '여', color: 'jung', shape: 'vertical' },
  { char: 'ㅗ', name: '오', color: 'jung', shape: 'horizontal' },
  { char: 'ㅛ', name: '요', color: 'jung', shape: 'horizontal' },
  { char: 'ㅜ', name: '우', color: 'jung', shape: 'horizontal' },
  { char: 'ㅠ', name: '유', color: 'jung', shape: 'horizontal' },
  { char: 'ㅡ', name: '으', color: 'jung', shape: 'horizontal' },
  { char: 'ㅣ', name: '이', color: 'jung', shape: 'vertical' },
];

export const JONG_META = [
  { char: 'ㄱ', name: '기역',     color: 'jong' },
  { char: 'ㄴ', name: '니은',     color: 'jong' },
  { char: 'ㄷ', name: '디귿',     color: 'jong' },
  { char: 'ㄹ', name: '리을',     color: 'jong' },
  { char: 'ㅁ', name: '미음',     color: 'jong' },
  { char: 'ㅂ', name: '비읍',     color: 'jong' },
  { char: 'ㅅ', name: '시옷',     color: 'jong' },
  { char: 'ㅇ', name: '이응',     color: 'jong' },
  // complex jong — Level 4
  { char: 'ㄺ', name: '리을기역', color: 'jong' },
  { char: 'ㄻ', name: '리을미음', color: 'jong' },
  { char: 'ㄼ', name: '리을비읍', color: 'jong' },
  { char: 'ㄵ', name: '니은지읒', color: 'jong' },
  { char: 'ㅄ', name: '비읍시옷', color: 'jong' },
];

export const JONG_SINGLE = JONG_META
  .filter(m => ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ'].includes(m.char))
  .map(m => m.char);
export const JONG_ALL = [...new Set(JONG_META.map(m => m.char))];

// Legacy exports (kept for any existing consumers)
export const CHO_CHARS  = CHO_SINGLE;
export const JUNG_CHARS = JUNG_META.map(m => m.char);
export const JONG_CHARS = JONG_SINGLE;
