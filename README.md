> [!IMPORTANT]
> **이 저장소는 [`hangul_game`](https://github.com/littleanti/hangul_game) 모노레포로 통합되었습니다.**
> 앞으로 모든 개발·유지보수는 모노레포에서 진행되며, 이 저장소는 보관(archive)용입니다.
> 🎮 통합 플레이 사이트: https://littleanti.github.io/hangul_game/

# 🧩 음절 조립소 (Syllable Assembly)

흩어진 자모(초성·중성·종성)를 직접 조합해 한글 음절을 만드는 웹 기반 파닉스 게임입니다.

![version](https://img.shields.io/badge/version-1.0.0-FF7757)
![license](https://img.shields.io/badge/license-MIT-6BCAB8)

## 🎮 주요 기능

- **🌱🌿🌳🔥 4단계 레벨**: 받침 없음 / 쌍자음 / 홑받침 / 겹받침 — 한글 결합 난이도 점진 상승
- **🖱 드래그 앤 드롭**: Pointer Events API 기반 자모 블록 → 슬롯 끌어다 놓기
- **👆 탭-탭 모드**: 자모 블록 탭 → 슬롯 탭 순서로 자동 배치 (드래그 대체)
- **✏️ 오답 수정 모드**: 틀린 자모 즉시 피드백 → 해당 슬롯만 초기화 후 재배치
- **🎲 문제 수 선택**: 5 / 10 / 15 / 20 문제
- **🔊 TTS 발음 듣기**: 자모 단독 음가 + 완성된 음절 발음 (Web Speech API)
- **🔠 동적 슬롯 레이아웃**: 모음 형태(수직/수평)에 따라 dock grid-template 자동 전환
- **🪢 종성 슬롯 토글**: `hasJong` 음절일 때만 받침 슬롯 표시
- **📱 회전 안내 화면**: 세로 모드(폰)에서 가로 모드로 전환 안내
- **💫 조립 피드백**: `pop-in` 애니메이션으로 조합 진행 음절 미리보기
- **🏆 별 적립**: 라운드 정답 시 별 누적, 종료 시 합계 표시
- **💾 설정 자동 저장**: 레벨 / 탭 모드 / 오답 수정 / 문제 수 localStorage 저장
- **📦 PWA 오프라인**: Service Worker로 오프라인 캐시 지원

## 🚀 빠른 시작

### 1. 로컬 개발 서버 실행

ES Modules를 사용하므로 `file://`로 열면 CORS 오류가 납니다. 반드시 로컬 서버로 실행해주세요.

**방법 1: npm script (권장)**
```bash
npm run dev
# → http://localhost:4322
```

**방법 2: VSCode Live Server 확장**
1. VSCode에서 Live Server 확장 설치
2. `index.html` 우클릭 → "Open with Live Server"

**방법 3: Python 기본 서버**
```bash
python3 -m http.server 4322
```

### 2. 브라우저에서 열기

- `http://localhost:4322`

### 3. 게임 시작

1. 시작 화면에서 **레벨 1 / 2 / 3 / 4** 중 하나를 선택합니다
   - 🌱 레벨 1 — 받침 없음 · 홑자음 (가, 노, 미 등)
   - 🌿 레벨 2 — 받침 없음 · 쌍자음 (까, 따, 뽀 등)
   - 🌳 레벨 3 — 받침 있음 · 홑받침 (강, 봄, 산 등)
   - 🔥 레벨 4 — 받침 있음 · 겹받침 (닭, 흙, 값 등)
2. 상단 목표 음절(🔊 탭 시 발음)을 확인합니다
3. 하단 자모 팔레트에서 필요한 자모를 **드래그하거나 탭**해 슬롯에 배치합니다
4. 모든 슬롯이 채워지면 자동으로 정답을 검증합니다
5. 세부 설정(문제 수, 탭 모드 등)은 **⚙️ 설정**에서 조정할 수 있습니다

## 📁 프로젝트 구조

```
syllable-assembly/
├── index.html                  # 진입 HTML (start/settings/play/end/rotate)
├── package.json                # 개발 서버 스크립트
├── manifest.webmanifest        # PWA 매니페스트
├── service-worker.js           # PWA 오프라인 캐시
├── favicon.svg / icon.svg
├── README.md                   # 이 파일
├── LICENSE
├── AGENTS.md
├── docs/                       # 기획 문서
│   ├── PRD.md                  #   제품 요구사항
│   ├── TRD.md                  #   기술 요구사항
│   └── PLAN.md                 #   개발 계획
└── src/
    ├── css/                    # 스타일
    │   ├── tokens.css          #   디자인 토큰 (변수)
    │   ├── base.css            #   리셋 + 공통 애니메이션
    │   ├── layout.css          #   dock / 슬롯 / 팔레트 레이아웃
    │   ├── blocks.css          #   자모 블록 스타일
    │   └── screens.css         #   화면별 스타일
    ├── data/
    │   ├── jamo.js             # 🔤 자모 메타데이터
    │   └── lessons.js          # 📚 레벨별 음절 풀 (여기 편집!)
    └── js/                     # 로직 모듈
        ├── main.js             #   진입점 + 이벤트 바인딩
        ├── config.js           #   상수 (ROUND_COUNT 등)
        ├── state.js            #   전역 상태 (board/target/queue)
        ├── storage.js          #   localStorage
        ├── hangul.js           #   조합/분해/모음 형태/자모 발음
        ├── utils.js            #   범용 유틸
        ├── lesson.js           #   레벨별 음절 풀 + 오답 블록
        ├── layout.js           #   모음 형태에 따른 dock 배치
        ├── pointer.js          #   드래그 앤 드롭 (Pointer Events API)
        ├── tap.js              #   탭-탭 모드
        ├── audio.js            #   Web Speech API TTS
        ├── ui.js               #   화면전환, 회전 감지
        └── game.js             #   게임 로직 (startRound/handleSuccess)
```

## 📚 음절 추가하기

음절을 추가/수정하려면 `src/data/lessons.js` 파일을 편집하면 됩니다.

```js
// 레벨 1 — 받침 없음, 홑자음 초성
export const SYLLABLES_NO_JONG = [
  '가', '나', '다', '라', '마', '바', '사',
  // ...
];

// 레벨 3 — 홑받침
export const SYLLABLES_WITH_JONG = [
  '강', '봄', '산', '집', '꿀',
  // ...
];
```

레벨 3/4는 `lesson.js > initLesson()`에서 `Math.round(roundCount * 0.7)` 비율로 두 풀을 혼합합니다.
새로운 자모를 노출하려면 `src/data/jamo.js`의 `CHO_META` / `JUNG_META` / `JONG_META`를 함께 갱신하세요.

## 🔧 아키텍처

### 화면 상태 머신
```
start ──→ settings ──→ play ──→ end
  │           │          ↑       │
  ↓           ↓          │       ↓
rotate ←──(세로 진입)────┘   (다시하기)
```

### 핵심 데이터 흐름
```
SYLLABLES_* (data/lessons.js)
  ↓ 레벨별 풀 + 70/30 혼합
  ↓ 셔플 + slice(roundCount)
state.lessonQueue
  ↓
startRound() → decompose() → 타겟 자모 분해
  ↓
buildPalette() → 정답 자모 + 오답 자모 셔플
  ↓
사용자 배치 → onJamoPlaced() → compose() → 검증
  ↓
정답: handleSuccess() → 별 +1 → advanceLesson()
오답: handleFailure() → skipLesson() (수정 모드는 슬롯만 초기화)
  ↓ 반복
endGame() → 총 별 합계 + 다시하기
```

### 한글 조합·분해 원리

한글 유니코드 범위: `가(0xAC00) ~ 힣(0xD7A3)` — 19 × 21 × 28 = 11,172자

```js
// 조합 (compose)
코드 = 0xAC00 + (초성 × 588) + (중성 × 28) + 종성
// 588 = 21(중성) × 28(종성)

// 분해 (decompose)
offset = 코드 - 0xAC00
초성 = Math.floor(offset / 588)
중성 = Math.floor((offset % 588) / 28)
종성 = offset % 28
```

예: `강` → 초성 `ㄱ`(0), 중성 `ㅏ`(0), 종성 `ㅇ`(21) → `0xAC00 + 0×588 + 0×28 + 21 = 0xAC15`

## 🎨 디자인 시스템

색상은 `src/css/tokens.css`에서 CSS 변수로 관리됩니다. `1_chosung_quiz`의 디자인 시스템을 계승합니다.

| 용도 | 변수 | 색상 |
|---|---|---|
| 배경 | `--cream` | `#FFF6E4` |
| 주요 강조 | `--coral` | `#FF7757` |
| 성공/진행 | `--mint` | `#6BCAB8` |
| 경고/하이라이트 | `--yellow` | `#FFD166` |
| 오답 | `--red` | `#E84545` |
| 텍스트 | `--navy` | `#2D3047` |

폰트: `Jua` (제목·버튼), `Gowun Dodum` (본문)

## 🌐 브라우저 호환성

| 기능 | 요구사항 |
|---|---|
| ES Modules | Chrome 61+, Firefox 60+, Safari 11+ |
| Pointer Events API | Chrome 55+, Firefox 59+, Safari 13+ |
| Web Speech API (TTS) | Chrome, Safari, Edge (Firefox는 음성 제한적) |
| Service Worker (PWA) | 모든 현대 브라우저 |
| localStorage | 모든 현대 브라우저 |

플레이 화면은 가로 모드 전용 — 세로 모드 진입 시 회전 안내 화면이 표시됩니다.

## 🛠 확장 아이디어

- 직접 단어 입력 모드 (음절이 아닌 2~3음절 단어 조립)
- 자모 발음 카드 도감 (수집 요소)
- 시간 제한 모드 (라운드별 카운트다운)
- 학습자 진척도 그래프 (레벨·정답률 추적)
- 멀티 프로필 지원 (가족이 공유하는 기기)

## 📄 라이선스

MIT © Wondeuk Yoon
