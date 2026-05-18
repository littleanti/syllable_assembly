<!-- Parent: ../AGENTS.md -->
<!-- Updated: 2026-05-05 -->

# 2_syllable_assembly — 음절 조립소

## Status
**구현 완료** — Vanilla JS + CSS, 빌드 단계 없음. PWA Service Worker 포함.

## Key Files

| File | Description |
|------|-------------|
| `index.html` | 앱 진입점 — start/settings/play/end/rotate 화면 포함 |
| `package.json` | `npm run dev` → `npx serve . -l 4322`, `npm run live` → live-server 4322 |
| `service-worker.js` | PWA 오프라인 캐시 |

### Key JS Modules (`src/js/`)

| Module | 역할 |
|--------|------|
| `config.js` | 순수 상수 (ROUND_COUNT 등) |
| `hangul.js` | 조합(`compose`) / 분해(`decompose`) / 모음 형태(`getVowelShape`) / 자모 발음(`jamoToPhoneme`) |
| `utils.js` | 범용 유틸리티 |
| `state.js` | 전역 상태 (`board`, `target`, `lessonQueue`, `lessonIdx`, `stars`) |
| `storage.js` | localStorage 영속화 (level, tapMode, correctionMode, roundCount) |
| `lesson.js` | 레벨별 음절 풀 혼합, `buildPalette()` 오답 블록 생성 |
| `layout.js` | 모음 형태(수직/수평)에 따라 dock grid-template 전환 |
| `pointer.js` | Pointer Events API 기반 드래그 앤 드롭 + 슬롯 스냅 |
| `tap.js` | 탭-탭 모드 — 자모 선택 → 슬롯 자동 배치 |
| `audio.js` | Web Speech API TTS (자모 단독 + 조합 음절 발음) |
| `ui.js` | 화면 전환 (`showScreen`), 회전 감지 (`checkOrientation`) |
| `game.js` | 게임 루프 — `startRound`, `onJamoPlaced`, `handleSuccess/Failure` |
| `main.js` | 진입점 — 이벤트 바인딩, 설정 저장/로드, `startGame()` 호출 |

### Key Data Files (`src/data/`)

| File | 역할 |
|------|------|
| `jamo.js` | 초성/중성/종성 배열 및 음절 풀 상수 |
| `lessons.js` | 레벨별 음절 데이터셋 (`SYLLABLES_NO_JONG`, `SYLLABLES_WITH_JONG`, `SYLLABLES_DOUBLE_CHO`, `SYLLABLES_DOUBLE_JONG`) |

## Purpose
한글의 초성·중성·종성이 2차원 평면상에 결합되는 원리를 직접 조립하며 체화하는 파닉스 게임.
`1_chosung_quiz`에서 단어를 '인출'하던 학습자가 흩어진 자모를 직접 조합하여 음절을 만드는 능동적 생산자로 전환된다.

## Target & Cognitive Goal

| 항목 | 내용 |
|------|------|
| 대상 연령 | 만 4 ~ 6세 (유아 후기) |
| 발달 단계 | 음운론적 해독 (Phonological Decoding) |
| 핵심 인지 목표 | 자소-음소 대응, 공간 지각, 한글 조합 합법성 인지 |
| 선행 게임 | `../1_chosung_quiz/` |
| 후행 게임 | `../3_word_network/` |

## Levels

| 레벨 | 설명 | 음절 풀 |
|------|------|---------|
| 1 | 받침 없음 | `SYLLABLES_NO_JONG` |
| 2 | 홑받침 | `SYLLABLES_WITH_JONG` |
| 3 | 쌍자음 70% + 홑자음 30% | `SYLLABLES_DOUBLE_CHO` + `SYLLABLES_NO_JONG` |
| 4 | 겹받침 70% + 홑받침 30% | `SYLLABLES_DOUBLE_JONG` + `SYLLABLES_WITH_JONG` |

비율은 `lesson.js > initLesson()`에서 `Math.round(roundCount * 0.7)` 로 계산.

## Architecture

### Entry Point
`src/js/main.js` — 이벤트 바인딩, 설정 저장/로드, `startGame()` 호출

### Game Flow
```
main.js → startGame(level, tapMode, corrMode, roundCount)
  └─ lesson.js: initLesson()  — 음절 큐 생성, state 초기화
  └─ game.js: startRound()   — 타겟 설정, 팔레트 렌더링
       └─ onJamoPlaced()     — 자모 배치 시 평가
            ├─ handleSuccess() → advanceLesson() → 다음 라운드 or 종료
            └─ handleFailure() → skipLesson()   → 다음 라운드 or 종료
```

### Key Modules

| 파일 | 역할 |
|------|------|
| `hangul.js` | 조합(`compose`) / 분해(`decompose`) — `0xAC00 + 초성×588 + 중성×28 + 종성` |
| `layout.js` | 모음 형태(수직/수평)에 따라 dock grid-template 전환 |
| `pointer.js` | Pointer Events API 기반 드래그 앤 드롭 + 슬롯 스냅 |
| `tap.js` | 탭-탭 모드 — 자모 선택 → 슬롯 자동 배치 |
| `lesson.js` | 레벨별 음절 풀 혼합, `buildPalette()` 로 오답 블록 생성 |
| `audio.js` | Web Speech API TTS (자모 단독 발음 + 조합 음절 발음) |
| `state.js` | 전역 상태 (`board`, `target`, `lessonQueue`, `roundCount` 등) |
| `storage.js` | localStorage: level, tapMode, correctionMode, roundCount |

### State Shape (`state.js`)
```js
{
  audioReady, currentScreen,
  board: { cho, jung, jong },   // 현재 배치된 자모
  target: { syllable, cho, jung, jong, hasJong, ... },
  lessonQueue: string[],         // 라운드별 음절 목록
  lessonIdx, stars,
  level, roundCount              // 동적 문제 수
}
```

## Settings

설정 화면(`#screen-settings`)은 `1_chosung_quiz` 스타일:
- max-width 500px 센터 정렬, navy 테두리 3D 박스 섹션
- div 기반 토글 스위치 (`.toggle` / `.toggle.on`)
- chip-row 문제 수 선택 (5 / 10 / 15 / 20)

| 설정 | 기본값 | 저장 키 |
|------|--------|---------|
| 문제 수 | 10 | `roundCount` |
| 탭-탭 모드 | OFF | `tapMode` |
| 오답 수정 모드 | OFF | `correctionMode` |

## UI Layout (Play Screen)

```
┌─ play-header ─────────────────────┐
│  [✕]  0/10 ████░░░░  🏆 0         │
└───────────────────────────────────┘
┌─ play-main ───────────────────────┐
│        [ 목표  가  🔊 ]            │  ← #target-card
│                가                 │  ← #assembled-display (opacity 0→1)
│        ┌──────┬──────┐            │
│        │ 초성 │ 중성 │            │  ← #dock slots
│        └──────┴──────┘            │
│        └─── 받침 ───┘ (조건부)    │
└───────────────────────────────────┘
┌─ palette ─────────────────────────┐
│  [ㄱ] [ㄴ] [ㅏ] [ㅗ] ...          │  ← 자모 블록
└───────────────────────────────────┘
```

`#assembled-display`는 dock 내부 overlay가 아닌 target-card와 dock **사이** 독립 요소.
자모가 배치될 때마다 조합된 음절을 `.pop-in` 애니메이션으로 표시.

## Dev Server

```bash
npm run dev   # npx serve . -l 4322
npm run live  # npx live-server --port=4322
```

포트: **4322** (`1_chosung_quiz`=3000 과 충돌 방지)

## Key Behaviors to Preserve

- 잘못된 배치(오답 블록) → 기본 모드: 전체 완성 시 `wrong-shake` 후 다음으로 스킵
- 오답 수정 모드: 배치 즉시 `reject-flash` 후 해당 슬롯 초기화
- 받침 슬롯은 `hasJong` 일 때만 표시 (`hidden` 토글)
- 모음 형태에 따라 dock이 `shape-vertical` / `shape-horizontal` CSS class 전환
- 세로 모드(폰, 600px 미만)에서 게임 화면 진입 시 회전 안내 화면으로 전환

## Testing Checklist

- [ ] 레벨 3: 쌍자음(까, 따 등) 7개 + 홑자음 3개 섞임 확인
- [ ] 레벨 4: 겹받침(닭, 흙 등) 7개 + 홑받침 3개 섞임 확인
- [ ] 문제 수 5/10/15/20 변경 후 게임 진행 수 일치 확인
- [ ] 탭-탭 모드 — 드래그 없이 자모 선택 가능
- [ ] 오답 수정 모드 — 틀린 자모 배치 시 즉시 반려
- [ ] 수평 모음(ㅗ, ㅜ, ㅡ) dock 레이아웃 수직 배치 확인
- [ ] 세로 화면 진입 시 회전 안내 표시
- [ ] 설정 저장 — 새로고침 후 이전 설정 복원

## Design Consistency (홈·설정·완료 화면)

시작 화면(`start-screen`), 설정 화면(`settings-screen`), 게임 완료 화면(`end-screen`)은 `1_chosung_quiz`의 디자인 시스템을 계승한다.

| 요소 | 규격 |
|------|------|
| 시작·완료 화면 제목 | `font-family: 'Jua', sans-serif` |
| 시작 화면 제목 크기 | `font-size: 3rem; letter-spacing: 2px; color: var(--coral)` |
| 설정 화면 제목 크기 | `font-size: 1.8rem; color: var(--coral)` |
| 완료 화면 제목 크기 | `font-size: 2.1rem; color: var(--coral)` |
| 설명·본문 | `font-family: 'Gowun Dodum', sans-serif; font-size: clamp(0.9rem, 3vw, 1.2rem)` |
| 버튼 기본 (`.btn`) | `font-family: 'Jua', sans-serif; font-size: 1.2rem; padding: 14px 28px; border-radius: 100px` |
| 버튼 대형 (`.btn.big`) | `font-size: 1.45rem; padding: 16px 44px; border-radius: 100px` |
| 버튼 소형 (`.btn.small`) | `font-size: 1rem; padding: 10px 20px; border-radius: 100px` |
| 버튼 색상 | `background: var(--coral); color: #fff; box-shadow: 0 5px 0 var(--coral-dark)` |
| 버튼 눌림 | `transform: translateY(4px); box-shadow: 0 1px 0 var(--coral-dark)` |
| 배경 | `background: var(--cream)` (`#FFF6E4`) |
| 색상 변수 | `1_chosung_quiz/src/css/tokens.css` 팔레트 동일 적용 |

> 플레이 화면(가로 모드·자모 블록 레이아웃)은 이 게임 특유의 방식을 사용.  
> 상세 스펙: `docs/TRD.md §11` 및 `docs/PLAN.md` 디자인 일관성 체크리스트 참조.
