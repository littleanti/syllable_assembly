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
