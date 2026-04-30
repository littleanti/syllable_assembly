import { jamoToPhoneme } from './hangul.js';

let _ctx = null;
let unlocked = false;
let koVoice = null;

export function getContext() { return _ctx; }

function loadVoice() {
  if (!window.speechSynthesis) return;
  const set = () => {
    koVoice = speechSynthesis.getVoices().find(v => v.lang.startsWith('ko')) || null;
  };
  set();
  speechSynthesis.addEventListener('voiceschanged', set);
}

export function init() {
  loadVoice();
}

export async function unlock() {
  if (unlocked) return;
  // iOS Safari: AudioContext must be created after user gesture
  try {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (_ctx.state === 'suspended') await _ctx.resume();
    const buf = _ctx.createBuffer(1, 1, 22050);
    const src = _ctx.createBufferSource();
    src.buffer = buf;
    src.connect(_ctx.destination);
    src.start(0);
    unlocked = true;
  } catch {}
}

export function speak(text, rate = 0.82) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR';
  u.rate = rate;
  if (koVoice) u.voice = koVoice;
  speechSynthesis.speak(u);
}

// Speak a jamo as its natural phoneme sound ('ㄱ' → speak '그')
export function speakJamo(char) {
  speak(jamoToPhoneme(char), 0.9);
}

// Speak partially-assembled syllable (cho placed, jung not yet)
export function speakPartial(cho) {
  speak(jamoToPhoneme(cho), 0.9);
}

// Speak a single text and return a Promise that resolves when speech ends
export function speakAndWait(text, rate = 0.82) {
  return new Promise(resolve => {
    if (!window.speechSynthesis) { resolve(); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    u.rate = rate;
    if (koVoice) u.voice = koVoice;
    u.onend = resolve;
    u.onerror = resolve;
    speechSynthesis.speak(u);
  });
}

// Speak multiple texts in sequence (queued, no cancel between them)
export function speakSequence(texts, rate = 0.82) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  texts.forEach(text => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    u.rate = rate;
    if (koVoice) u.voice = koVoice;
    speechSynthesis.speak(u);
  });
}

// ── Tone feedback (Web Audio API, same pattern as 1_chosung_quiz) ──
function tone(freq, start, dur, type = 'sine', peak = 0.18) {
  if (!_ctx) return;
  const t0 = _ctx.currentTime + start;
  const osc  = _ctx.createOscillator();
  const gain = _ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(_ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

// 정답: C5 → E5 → G5 밝은 상승 아르페지오
export function playCorrect() {
  tone(523.25, 0.00, 0.14, 'triangle');
  tone(659.25, 0.12, 0.14, 'triangle');
  tone(783.99, 0.24, 0.22, 'triangle');
}

// 오답: G3 → D3 낮은 하강 톤
export function playIncorrect() {
  tone(196.00, 0.00, 0.16, 'sawtooth', 0.12);
  tone(146.83, 0.14, 0.28, 'sawtooth', 0.12);
}
