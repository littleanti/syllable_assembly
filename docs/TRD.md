# 🔧 TRD — 공감각적 음절 조립 게임

> Technical Requirements Document
> Last updated: 2026-04-25
> Target: 모바일 태블릿 1순위, 폰 2순위, PC 보조

## 1. 기술 스택

| 레이어 | 선택 | 근거 |
|---|---|---|
| 언어 | Vanilla JavaScript (ES2020+) | 빌드 없음, 1단계 게임과 일관 |
| 모듈 시스템 | ES Modules (`type="module"`) | 네이티브 지원, 정적 서빙 |
| 렌더링 | DOM + CSS Transform | 60fps 유지, Canvas 회피 (보급형 안드로이드 고려) |
| 레이아웃 | CSS Grid + Flex + CSS Variables | 모음 형태별 슬롯 동적 분기 |
| 입력 | Pointer Events API | 마우스/터치/펜 통합 (iOS·Android 동시 지원) |
| 오디오 | Web Audio API + 사전 디코딩 캐시 | 자모/음절 즉시 재생, 자동재생 정책 우회 |
| 폰트 | Google Fonts (Jua, Gowun Dodum) `font-display: swap` | 한글 친화, FOIT 회피 |
| 개발 서버 | `npx serve -p 4322` | 부모 AGENTS.md 포트 컨벤션 |
| 저장소 | `localStorage` (P1), `IndexedDB` (P2) | 5MB 한도 → 누적 데이터는 IndexedDB |
| 배포 | 정적 호스팅 + PWA Manifest + Service Worker | 홈 화면 설치, 오프라인 |

**의도적으로 제외한 것**:
- React/Vue/Lit — 이 규모/대상에서는 과함, 1단계와 일관 유지
- TypeScript — 프로토타입 속도 우선 (P2 시점에 마이그레이션 고려)
- Canvas / WebGL — DOM/CSS만으로 60fps 가능, 디버깅 단순
- 빌드 도구 (Vite/Webpack) — ES Modules로 충분
- npm 의존성 — 정적 자산만 포함

## 2. 아키텍처

### 2.1 디렉터리 구조 (제안)
```
2_syllable_assembly/
├── index.html
├── manifest.webmanifest
├── service-worker.js
├── docs/                   # PRD/TRD/PLAN
└── src/
    ├── css/
    │   ├── tokens.css      # 색상·간격·반경 변수
    │   ├── base.css        # 리셋, 폰트, 100dvh
    │   ├── layout.css      # Grid 슬롯, 모음 분기 클래스
    │   ├── blocks.css      # 자모 블록(빨/파/노), 드래그 상태
    │   └── screens.css     # 시작/플레이/종료
    ├── data/
    │   ├── jamo.js         # 자모 메타(자음/모음/받침, 음가, 색상)
    │   └── lessons.js      # 학습 단계별 자모 풀 + 목표 음절
    └── js/
        ├── main.js         # 진입점, AudioContext 활성화 게이트
        ├── config.js       # 상수 (포트, dp 환산, 자성 거리)
        ├── state.js        # 전역 상태 싱글톤
        ├── storage.js      # localStorage 래퍼
        ├── utils.js        # 순수 유틸 (clamp, dist, throttle)
        ├── hangul.js       # 한글 조합/분해 (§3.1)
        ├── audio.js        # Web Audio 래퍼, 사전 디코딩
        ├── pointer.js      # Pointer Events 통합 + 자성 스냅
        ├── layout.js       # 모음 형태별 슬롯 좌표 계산
        ├── ui.js           # 화면 전환, 애니메이션 트리거
        ├── settings.js     # 자모 범위/테마/탭모드 설정
        ├── lesson.js       # 출제 로직, 진척도
        └── game.js         # 라운드 컨트롤러 (조립 → 검증 → 보상)
```

### 2.2 모듈 의존성
```
main.js
  ├─ audio.js ─→ config.js
  ├─ storage.js ─→ state.js, config.js
  ├─ settings.js ─→ state.js, storage.js, ui.js, lesson.js
  └─ game.js ─→ state.js, hangul.js, layout.js, pointer.js, audio.js, ui.js, lesson.js

공통 의존:
  config.js (최하위 상수)
  utils.js ─→ config.js
  hangul.js ─→ (순수, 의존성 없음)
  state.js ─→ config.js
  layout.js ─→ utils.js
  pointer.js ─→ utils.js, config.js
  ui.js ─→ utils.js
```

### 2.3 상태 모델

**저장소 (localStorage '2sa:progress' 키)**
```js
savedState = {
  level: 1|2|3|4,          // 1=받침없음, 2=쌍자음, 3=홑받침, 4=겹받침
  correctionMode: boolean,  // true: 틀린 즉시 거부, false: 모두 채운 후 검사
  roundCount: 5|10|15|20,  // 라운드 수
  stars: number,            // 누적 별 개수 (현재 세션 종료 후 누적)
}
```

**런타임 상태 (state.js — in-memory)**
```js
state = {
  audioReady: boolean,       // 자동재생 정책 통과 플래그
  currentScreen: 'start'|'settings'|'play'|'end',
  board: { cho: string|null, jung: string|null, jong: string|null },
  target: {                  // 현재 라운드 목표
    syllable: string,        // 예: '가', '갑'
    cho: string,             // 초성 문자 (예: 'ㄱ')
    jung: string,            // 중성 문자 (예: 'ㅏ')
    jong: string|null,       // 종성 문자 (예: 'ㅂ') 또는 null
    hasJong: boolean,
    choIdx: number, jungIdx: number, jongIdx: number,
  },
  lessonQueue: string[],     // 이번 세션 출제 음절 큐 (shuffle된 배열)
  lessonIdx: number,         // 현재 진행 인덱스
  stars: number,             // 이번 세션 별 획득 수
  level: number,             // 현재 레벨 (1~4)
  roundCount: number,        // 이번 세션 라운드 수
}
```

### 2.4 레벨별 음절 풀

| 레벨 | 음절 유형 | 팔레트 구성 | 비고 |
|---|---|---|---|
| 1 | 받침 없는 음절 (가, 나, 다...) | 초성(정답+오답2) + 중성(정답+오답2) | CHO_SINGLE + JUNG_CHARS 풀 |
| 2 | 쌍자음(ㄲ,ㄸ,ㅃ,ㅆ,ㅉ) 초성 포함. 홑자음 85% + 쌍자음 15% | 레벨1과 동일 구성 | CHO_ALL 풀 사용, 음절 비율 조정 |
| 3 | 홑받침(ㄱ,ㄴ,ㄷ...) 포함. 홑+쌍자음 초성 혼합 | 초성(정답+오답2) + 중성(정답+오답2) + 종성(정답+오답1) | JONG_SINGLE 풀, 홑자음 초성 |
| 4 | 겹받침(ㄳ,ㄵ,ㄶ...) 50% + 홑받침 50% | 레벨3과 동일 구성 | JONG_ALL 풀 사용, 음절 비율 조정 |

### 2.5 화면 상태 머신
```
start ──→ settings ──→ play ──→ end
  │          ↑          ↑      │
  ├──────────┴──────────┘      │
  └────────────────────────────┘
```

전이 시 부작용:
- 모든 전이 → `drag.releaseAll()` (드래그 중단)
- `play` 진입 → `initLesson()` + `layout.applyVowelShape(jung)` + 자모 팔레트 렌더링
- `start` → `play` 첫 진입에서만 `audio.unlock()` (사용자 제스처 게이트)
- 레벨 선택: 홈 화면 레벨 버튼(data-level="1|2|3|4")으로 즉시 게임 시작

## 3. 핵심 알고리즘

### 3.1 한글 음절 조합 / 분해

**조합 공식 (부모 AGENTS.md §"Implementation Priorities")**:
```js
// 0xAC00 = '가', 21개 중성, 28개 종성(없음 포함)
function compose(choIdx, jungIdx, jongIdx = 0) {
  return String.fromCharCode(0xAC00 + (choIdx * 588) + (jungIdx * 28) + jongIdx);
}

// 역분해
function decompose(syllable) {
  const code = syllable.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return null;
  const cho = Math.floor(code / 588);
  const jung = Math.floor((code % 588) / 28);
  const jong = code % 28;
  return { cho, jung, jong };  // jong === 0 ⇒ 받침 없음
}
```

**자모 인덱스 테이블**:
- 초성 19개: `[ㄱ ㄲ ㄴ ㄷ ㄸ ㄹ ㅁ ㅂ ㅃ ㅅ ㅆ ㅇ ㅈ ㅉ ㅊ ㅋ ㅌ ㅍ ㅎ]`
- 중성 21개: `[ㅏ ㅐ ㅑ ㅒ ㅓ ㅔ ㅕ ㅖ ㅗ ㅘ ㅙ ㅚ ㅛ ㅜ ㅝ ㅞ ㅟ ㅠ ㅡ ㅢ ㅣ]`
- 종성 28개(0=없음): `[· ㄱ ㄲ ㄳ ㄴ ㄵ ㄶ ㄷ ㄹ ㄺ ㄻ ㄼ ㄽ ㄾ ㄿ ㅀ ㅁ ㅂ ㅄ ㅅ ㅆ ㅇ ㅈ ㅊ ㅋ ㅌ ㅍ ㅎ]`

**합법성 검증**: 조합 후 음절이 NFC 정규화로 동일하게 유지되는지 + 학습 화이트리스트(빈도 상위 음절)에 포함되는지 이중 체크.

### 3.2 모음 형태 분기 (레이아웃)
```js
const VOWEL_SHAPE = {
  vertical:   ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅣ'],   // 좌(초성) 우(중성) 하(종성)
  horizontal: ['ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ'],                              // 상(초성) 중(중성) 하(종성)
  complex:    ['ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ'],                  // 단계 1: 가로형 처리, 단계 2: 두 모음 자소 결합
};

// CSS Grid Template — JS에서 클래스 토글
.shape-vertical   { grid-template: "cho jung" 1fr / 1fr 1fr; ... }
.shape-horizontal { grid-template: "cho" 1fr "jung" 1fr; ... }
.has-jong .shape-vertical   { grid-template: "cho jung" 1fr "jong jong" auto / 1fr 1fr; }
.has-jong .shape-horizontal { grid-template: "cho" 1fr "jung" 1fr "jong" auto; }
```

### 3.3 드래그 + 자성 스냅 (Pointer Events)
```js
// pointerdown → setPointerCapture, store originId
// pointermove → 좌표 추적, 슬롯 거리 계산
//   dist <= SNAP_PX(20dp) ⇒ 슬롯 'magnet-active' 클래스 추가
// pointerup → 가장 가까운 활성 슬롯에 배치 시도
//   합법(자음↔초성, 모음↔중성, 받침↔종성)이면 commit, 아니면 spring-back

const SNAP_PX = 30 * window.devicePixelRatio; // dp → px (확장된 거리)
const TOUCH_TARGET_PX = 64 * window.devicePixelRatio;
```

iOS Safari 주의점:
- `touch-action: none` 을 드래그 가능 요소에 부여 (스크롤 충돌 방지)
- `passive: false` 로 `touchmove` 등록 시에만 `preventDefault` 가능 — Pointer Events는 자동 처리
- 더블탭 줌은 `<meta name="viewport" content="..., user-scalable=no">` 로 차단 (접근성 트레이드오프 인지)

### 3.4 교정 모드 (correctionMode)

**ON 모드 (correctionMode = true)**:
```js
onJamoPlaced(char, category, slotName):
  state.board[slotName] = char
  const correctChar = { cho, jung, jong }[slotName]
  if (char !== correctChar):
    슬롯 엘리먼트에 'reject-flash' 클래스 추가 (380ms)
    playIncorrect() 소리
    state.board[slotName] = null (자모 원위치)
    return  // 계속 진행 안 함
  else:
    정상 배치 진행
```

**OFF 모드 (correctionMode = false, 기본)**:
```js
onJamoPlaced(char, category, slotName):
  state.board[slotName] = char
  updateSlotDisplay(slotName, char)
  speak(jamoToPhoneme(char))
  
  // 모든 슬롯 채워졌는지 확인
  const allFilled = b.cho && b.jung && (!hasJong || b.jong)
  if (allFilled):
    if (all correct):
      handleSuccess() → playCorrect() + showReward() + 다음 라운드
    else (하나라도 틀림):
      handleFailure() → playIncorrect() + wrong-shake 애니메이션 + skipLesson()
```

**탭-탭 모드 (TapManager)**:
- F12 구현: `tap.js` 에서 자모 버튼 탭 → 해당 카테고리(cho/jung/jong)의 빈 슬롯에 자동 배치
- DragManager와 동시에 활성화 (드래그와 탭 모두 지원)
- `tap.onPlaced = onJamoPlaced` 로 동일 검증 로직 공유

### 3.4 오디오 재생 (자동재생 정책)
```js
// 첫 사용자 제스처(시작 버튼)에서 unlock
async function unlockAudio() {
  audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') await audioCtx.resume();
  await Promise.all(JAMO_SOUNDS.map(preload));   // ArrayBuffer → decodeAudioData
}
// 결합 시 즉시 재생 (지연 < 50ms 목표)
function play(jamo) {
  const src = audioCtx.createBufferSource();
  src.buffer = cache.get(jamo);
  src.connect(audioCtx.destination);
  src.start(0);
}
```

대안: 사전 녹음 부재 시 OscillatorNode 합성 톤 (자모별 주파수 매핑) 폴백.

### 3.5 리듬 모드 (P1)
- `audioCtx.currentTime` 기준 BPM 그리드 계산 (예: 96 BPM ⇒ 비트 간격 0.625s)
- 결합 시각이 가장 가까운 비트로부터 ±100ms 이내면 "Perfect" (×1.5), ±200ms "Good" (×1.2)
- 시각 메트로놈은 CSS `@keyframes` + `animation-play-state` 로 동기화

## 4. 외부 API

### 4.1 Pointer Events API
- `pointerdown / pointermove / pointerup / pointercancel`
- `setPointerCapture(pointerId)` — 요소 밖으로 나가도 추적 유지
- 폴백: 미지원 환경(구형 iOS 12 이하)에서는 `touchstart/move/end` + `mousedown` 듀얼 핸들러

### 4.2 Web Audio API
- `AudioContext`, `decodeAudioData`, `BufferSource`
- iOS Safari: `playsinline` + 사용자 제스처 후 `resume()` 필수
- 미지원 시(거의 없음) HTMLAudioElement 폴백

### 4.3 Screen Orientation API (선택)
```js
if (screen.orientation?.lock) {
  try { await screen.orientation.lock('landscape'); } catch { /* iOS 미지원 */ }
}
```
iOS Safari 미지원 → CSS `@media (orientation: portrait)` 로 회전 안내 표시.

### 4.4 localStorage / IndexedDB
- localStorage: 설정·세션 별 개수 (P1)
- IndexedDB: 누적 학습 이력 (P2, 5MB 초과 가능성 대비)
- 둘 다 `try/catch` 로 Private Mode 대응 → 실패해도 게임은 동작

## 5. 렌더링 전략

### 5.1 자모 블록 렌더
- `<button class="jamo cho">ㄱ</button>` — 시맨틱 + 접근성
- 색상: 자음 `--color-cho` (빨강 계열), 모음 `--color-jung` (파랑 계열), 받침 `--color-jong` (노랑 계열)
- 형태 패턴(색맹 대응): 자음 사각, 모음 원형, 받침 모서리 둥근 사각

### 5.2 슬롯 렌더
- 모음 형태 변경 시 CSS 클래스만 토글 → Grid가 자동 재배치
- 자성 활성화: `transform: scale(1.08)` + `box-shadow` 펄스

### 5.3 음절 결합 시각 효과
- 자모 → 슬롯 이동: `transform: translate3d()` 트랜지션 (compositor)
- 결합 완료: 자모 페이드 아웃 + 음절 글자 페이드 인 (180ms)
- 보상 애니메이션: 우주선 점등은 `box-shadow` + `filter: brightness()` 키프레임 (1.2s)

## 6. 성능 고려사항

| 영역 | 최적화 |
|---|---|
| 60fps 보장 | `transform`/`opacity`만 변경, `width/height`/`top/left` 회피 |
| 입력 지연 | Pointer 이벤트 핸들러 16ms 이내 처리, 무거운 계산은 `requestIdleCallback` |
| 오디오 지연 | 사전 디코딩, `BufferSource` 재사용 풀 |
| 메모리 | 사운드 LRU 캐시 (자모 88개 × 평균 30KB ≈ 2.6MB) |
| 초기 로드 | 자모 사운드는 `start` 화면에서 백그라운드 프리페치 |
| 폰트 | `preconnect` + `font-display: swap` |
| 폴리필 | 폴리필 없음 — 타겟 브라우저 네이티브 지원 확인 |

## 7. 보안 / 프라이버시

- 외부 서버 통신 없음, 광고 없음, 추적 없음
- 사용자 입력은 자모 블록 선택뿐 → XSS 표면 거의 없음
- 미래 텍스트 입력(P2 발음 평가 결과 등) 시 `textContent` 사용 필수
- localStorage/IndexedDB는 도메인 샌드박스 — 다른 게임과 격리되도록 키 prefix `2sa:`

## 8. 테스트 전략

### 수동 테스트 체크리스트 (실기기 필수)

#### 디바이스 매트릭스
- [ ] iPad Mini (iOS 15+) — 가로 잠금, 자동재생 게이트, 자성 스냅
- [ ] iPad Pro 12.9" — 큰 화면 슬롯 비율
- [ ] 갤럭시 탭 A8 (Android 12+) — 보급형 60fps 유지
- [ ] iPhone SE (작은 화면 폰) — 가로 모드에서 도크 가독성
- [ ] 보급형 안드로이드 폰 (2GB RAM) — 메모리·프레임

#### 핵심 시나리오
- [ ] 첫 진입 → "시작" 탭 → AudioContext unlock 성공
- [ ] 세로로 들었을 때 회전 안내 일러스트 표시
- [ ] `ㄱ` + `ㅏ` → `가` 결합 + 발음 출력 (지연 < 100ms)
- [ ] `ㄱ` + `ㅗ` → 슬롯이 수평형(상/중) 으로 재배치
- [ ] `ㄱ` + `ㅏ` + `ㅂ` → `갑` 완성 + 보상 애니메이션
- [ ] 자음을 모음 슬롯에 떨어뜨리면 부드러운 spring-back
- [ ] 자성 거리 ±20dp 흡착 동작 — 너무 멀어도 흡수 X
- [ ] 더블탭 줌 비활성화, 의도치 않은 스크롤 없음
- [ ] iOS Safari 주소창 변동 시 레이아웃 깨지지 않음 (`100dvh`)
- [ ] Private Mode → localStorage 저장 실패해도 게임 정상

#### 접근성·예외
- [ ] 색맹 시뮬레이터(Daltonize)에서 자모 형태로 식별 가능
- [ ] 시스템 음소거 → UI는 정상 동작 (자막/시각 피드백 유지)
- [ ] 슬로우 디바이스에서 보상 애니메이션 끝나기 전 다음 입력 가능

### 자동화 (P2 후보)
- Vitest + jsdom: `compose/decompose`, `VOWEL_SHAPE` 분류, 합법성 검증
- Playwright (모바일 에뮬레이션): 핵심 3개 시나리오 E2E
- 단, 실기기 검증을 대체할 수 없음 — 보조 수단으로만

## 9. 배포

| 옵션 | 명령 | 비고 |
|---|---|---|
| 로컬 | `npx serve -p 4322` | 부모 AGENTS.md 포트 |
| GitHub Pages | `gh-pages` 브랜치 푸시 | HTTPS 자동 |
| Netlify | 드래그 앤 드롭 | PWA 헤더 자동 |
| Cloudflare Pages | Git 연동 | 한국 latency 양호 |
| TWA (P2) | Android 앱 스토어 패키징 | Play Store 배포 시 |

빌드 단계 불필요. 단, Service Worker 캐시 파일 목록은 릴리즈 시 갱신 필요.

## 11. 홈·설정·완료 화면 디자인 시스템

시작 화면(`start-screen`), 설정 화면(`settings-screen`), 게임 완료 화면(`end-screen`)은 `1_chosung_quiz` 의 디자인 시스템을 계승한다. 아래 수치는 `1_chosung_quiz/src/css/screens.css` · `components.css` 의 실제 값이다.

### 폰트

| 요소 | 규격 |
|---|---|
| 폰트 로드 | `<link>` Google Fonts — `Jua`, `Gowun Dodum` (1단계와 동일) |
| 시작·완료 화면 제목 | `font-family: 'Jua', sans-serif` |
| 시작 화면 제목 크기 | `font-size: 3rem; letter-spacing: 2px; color: var(--coral)` |
| 설정 화면 제목 크기 | `font-size: 1.8rem; color: var(--coral)` |
| 완료 화면 제목 크기 | `font-size: 2.1rem; color: var(--coral)` |
| 설명·부제목·본문 | `font-family: 'Gowun Dodum', sans-serif; font-size: clamp(0.9rem, 3vw, 1.2rem)` |
| 섹션 레이블 (설정) | `font-family: 'Jua', sans-serif; font-size: 1.05rem` |

### 버튼

| 요소 | 규격 |
|---|---|
| 버튼 레이블 폰트 | `font-family: 'Jua', sans-serif; letter-spacing: 0.5px` |
| 버튼 기본 (`.btn`) | `font-size: 1.2rem; padding: 14px 28px; border-radius: 100px` |
| 버튼 대형 (`.btn.big`) | `font-size: 1.45rem; padding: 16px 44px; border-radius: 100px` |
| 버튼 소형 (`.btn.small`) | `font-size: 1rem; padding: 10px 20px; border-radius: 100px` |
| 버튼 기본 색상 | `background: var(--coral); color: #fff; box-shadow: 0 5px 0 var(--coral-dark)` |
| 버튼 눌림 효과 | `transform: translateY(4px); box-shadow: 0 1px 0 var(--coral-dark)` |

### 색상·레이아웃

| 요소 | 규격 |
|---|---|
| 색상 변수 출처 | `1_chosung_quiz/src/css/tokens.css` (`--coral #FF7757`, `--navy #2D3047`, `--cream #FFF6E4`, `--mint #6BCAB8`, `--yellow #FFD166`) |
| 배경 | `background: var(--cream)` (`#FFF6E4`) |
| 레이아웃 | 수직 중앙 정렬, 카드형 컨테이너 (`start-screen`, `settings-screen`, `end-screen`) |

> 플레이 화면은 이 게임 특유의 가로 모드·자모 블록 레이아웃을 사용한다.  
> 시작·설정·완료 화면만 위 규격을 의무 준수한다.

## 2.6 미구현 기능 (P1/P2)

- **F15 리듬 모드**: 4/4박자 BGM + 비트 가중치 (M8 이후)
- **F16 자모 범위 설정**: jamoFilter — 교사·부모용 부분집합 (M8 이후)
- **F19 테마 선택**: 우주선/냄비/가마솥 토글 (현재 단일 테마 고정)

## 10. 미해결 기술 이슈

- [ ] 자모 발음 사운드 소스 — 자체 녹음 vs 라이선스 음원 vs 합성 톤
- [ ] 가로 잠금 미지원 환경(임베드 iframe) 폴백
- [ ] 복합 모음(ㅘ, ㅝ, ㅞ, ㅢ)의 두 자소 결합 애니메이션 사양 (현재 가로형 처리로 단계 1 완료)
- [ ] 리듬 모드 BGM 라이선스 (CC0 검토) — F15 구현 시
- [ ] PWA 설치 프롬프트 노출 시점 (학습 1회 완료 후?)
- [ ] iOS WebKit 의 Pointer Events 구현 차이로 인한 자성 거리 미세 조정
