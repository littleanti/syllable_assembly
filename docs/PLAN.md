# 🗂️ PLAN — 공감각적 음절 조립 게임

> 개발 계획 및 진행 상태
> Last updated: 2026-05-05
> Status: **M7 — 코드 구현 완료, 실기기 테스트 대기**

## 📌 현재 상태

M0–M6 구현 완료. M7 코드 측 작업(반응형 CSS, PWA 아이콘, will-change, 버그 수정) 완료.
실기기 테스트(iPad, 갤럭시 탭, 보급형 폰) 및 만 4~6세 사용성 검증이 남아 있다.

본 게임은 부모 `AGENTS.md`(2026-04-25)의 7단계 로드맵 중 **2단계(브릿지)** 에 해당.

선행: `1_chosung_quiz` (구현 완료) — 단어 인출 학습자 졸업 가정
후행: `3_word_network` (구현 완료) — 본 게임 산출 음절을 단어로 확장

## 🧭 마일스톤 개요

| 마일스톤 | 상태 | 핵심 산출 |
|---|---|---|
| M0 | ✅ 완료 | PRD.md / TRD.md / PLAN.md |
| M1 | ✅ 완료 | `hangul.js` — compose/decompose/getVowelShape/jamoToPhoneme |
| M2 | ✅ 완료 | `pointer.js` — DragManager + 자성 스냅 + spring-back |
| M3 | ✅ 완료 | `audio.js` — Web Audio API + iOS AudioContext unlock |
| M4 | ✅ 완료 | 전체 게임 루프 (10라운드, 무받침) — 실사용자 테스트 통과 |
| M5 | ✅ 완료 | 받침 토글 + 부분 정답 격려 (F14·F17) |
| M6 | ✅ 완료 | 탭모드(F12) + 교정모드 + 라운드수 선택 + 진척도 저장(F18) |
| M7 | 🔄 진행 중 | 반응형 CSS·PWA 아이콘·will-change 완료 / **실기기 테스트 대기** |
| M8 | ⏳ 예정 | 발음 평가, IndexedDB SRL, 부모 대시보드 |

## ✅ M0 — 문서 합의 (완료)

- [x] PRD.md 작성 (제품 요구사항, 시나리오, P0/P1/P2)
- [x] TRD.md 작성 (스택, 알고리즘, 모바일 정책, 테스트 전략)
- [x] PLAN.md 작성 (본 문서)
- [ ] 부모/교사 1차 리뷰 (시나리오 S1~S4 현실성 검증)
- [ ] 시각적 은유 테마 디폴트 결정 (우주선/냄비/가마솥)
- [ ] 자모 발음 음원 소스 결정 (녹음 / 합성 / Web Speech)
- [ ] 만 4~6세 사용성 테스트 대상 1차 확보 계획

## 🧮 M1 — 한글 엔진

| # | 작업 | 산출물 | 우선순위 |
|---|---|---|---|
| 1 | 디렉터리 골격 생성 | TRD §2.1 구조 그대로 | P0 |
| 2 | `hangul.js` — `compose(cho, jung, jong)` | 0xAC00 공식 | P0 |
| 3 | `hangul.js` — `decompose(syllable)` | 역공식, 비한글 입력 가드 | P0 |
| 4 | `data/jamo.js` — 자모 메타 테이블 | 초/중/종 인덱스 + 색상 + 음가 키 | P0 |
| 5 | `VOWEL_SHAPE` 분류 (수직/수평/복합) | TRD §3.2 | P0 |
| 6 | 단위 검증 스크립트 (수동, console) | 19×21×28 매트릭스 + NFC 동등성 | P0 |
| 7 | 합법 음절 화이트리스트 데이터 | 빈도 상위 약 500자 | P1 (M5 이전) |

종료 기준: `compose(0,0,0) === '가'`, `decompose('갑') → {0, 0, 17}` 같은 예시가 콘솔 검증 통과.

## 🖱️ M2 — 입력 코어

| # | 작업 | 비고 |
|---|---|---|
| 1 | `pointer.js` — 통합 Pointer Events 핸들러 | down/move/up/cancel + setPointerCapture |
| 2 | 자성 스냅 — 거리 계산, 슬롯 활성화 | SNAP_PX = 20dp |
| 3 | 합법성 게이트 (자음→초성, 모음→중성, 받침→종성) | 위반 시 spring-back |
| 4 | `touch-action: none` + viewport meta | 스크롤·줌 충돌 방지 |
| 5 | 폴백 — 구형 iOS Touch/Mouse 듀얼 | iOS 12 이하 (선택) |
| 6 | 실기기 1차 점검 — iPad, 갤럭시 탭 | M2 종료 게이트 |

종료 기준: 빈 슬롯 보드에 자모 6종을 드래그해 합법 위치에만 흡착되는 것을 두 디바이스에서 영상으로 확인.

## 🔊 M3 — 오디오 코어

| # | 작업 | 비고 |
|---|---|---|
| 1 | `audio.js` — AudioContext 래퍼 | iOS 자동재생 unlock |
| 2 | 자모 사운드 사전 디코딩 캐시 | LRU, 메모리 ≤ 3MB |
| 3 | 결합 즉시 재생 — 지연 < 100ms 측정 | `performance.now()` |
| 4 | 합성 톤 폴백 (사운드 미준비 시) | OscillatorNode |
| 5 | 음소거 시 시각 자막 폴백 | 결합 직후 큰 글자 펄스 |

종료 기준: iOS Safari·Chrome Android 양쪽에서 첫 시작 후 모든 자모 발음 재생 OK + 결합 음절 발음 OK.

## 🎮 M4 — MVP 게임 루프 (F1~F11)

| # | 기능 | 의존 마일스톤 |
|---|---|---|
| 1 | 시작 화면 + 가로 모드 안내 (F1, F2) | — |
| 2 | 자모 도크 + 색상 분류 (F3) | M1 |
| 3 | 시각적 은유 캔버스 1테마 (F4) | — |
| 4 | 드래그 + 자성 스냅 (F5) | M2 |
| 5 | 모음 형태 분기 슬롯 (F6) | M1 |
| 6 | 즉시 청각 피드백 (F7) | M3 |
| 7 | 음절 완성 보상 애니메이션 (F8) | — |
| 8 | 잘못된 조합 거부 + spring-back (F9) | M2 |
| 9 | 진행률 + 별 스티커 (F10) | — |
| 10 | 종료 화면 + 다시하기 (F11) | — |
| 11 | `lesson.js` — 받침 없는 음절 큐 | M1 |

종료 기준: 받침 없는 음절(가, 고, 누 등) 10개를 1분 이내 완주 가능. 4세 사용자 시범에서 부모 개입 ≤ 1회.

## 🔡 M5 — 받침 + 복합 모음 (F13, F14)

| # | 작업 |
|---|---|
| 1 | 종성 슬롯 동적 추가 (수직/수평형 모두) |
| 2 | 받침 색상(노랑) 블록 도크 추가 |
| 3 | 받침 단계 토글 — 학습자 진척도 기반 자동 진입 |
| 4 | 복합 모음(ㅘ, ㅝ, ㅢ) 결합 시각화 — 단계 1: 가로형 처리 |
| 5 | 합법 음절 화이트리스트 적용 (이상 결합 차단) |

종료 기준: `갑`, `눈`, `과`, `의` 결합 동작 검증. 불법 조합(예: ㄲ+ㅏ+ㅄ 같은 비빈도 음절)은 화이트리스트에서 제외되어 출제되지 않음.

## 🎶 M6 — 확장 기능 (✅ 완료)

| 기능 | 설명 | 상태 |
|---|---|---|
| F12 탭-탭 모드 | TapManager — 자모 탭 → 슬롯 자동 배치 (드래그와 동시 지원) | ✅ 완료 |
| 교정 모드 (correctionMode) | 자모 배치 즉시 정오 판정 — toggle-correction 설정, OFF 시 모두 채운 후 일괄 검사 | ✅ 완료 |
| 라운드 수 선택 | 5/10/15/20문제 chip 선택 (COUNT_OPTIONS) | ✅ 완료 |
| F14 받침 단계 토글 | 레벨 3/4에서 종성 슬롯 자동 추가 (setJongVisible) | ✅ 완료 |
| F17 부분 정답 격려 | showPartialFeedback("거의 다 됐어요! 받침을 놓아요 👇") | ✅ 완료 |
| F18 진척도 영속화 | localStorage 2sa:progress 키 — level/correctionMode/roundCount/stars 저장 | ✅ 완료 |
| F15 리듬 모드 | 4/4박자 BGM + 비트 가중치 | 🔲 미구현 (M8 이후) |
| F16 자모 범위 설정 | jamoFilter — 교사·부모용 부분집합 | 🔲 미구현 (M8 이후) |
| F19 테마 선택 | 우주선/냄비/가마솥 토글 | 🔲 미구현 (단일 테마 고정) |

종료 기준: 기능 단위 수동 체크리스트 통과 + 모든 확장 토글이 MVP 흐름을 깨지 않음. ✅ 완료

## 🧪 M7 — 모바일 QA + 출시

### 디바이스 매트릭스 (TRD §8 동기화)
- [ ] iPad Mini (iOS 15+)
- [ ] iPad Pro 12.9"
- [ ] 갤럭시 탭 A8 (Android 12+)
- [ ] iPhone SE (Landscape 가독성)
- [ ] 보급형 안드로이드 (2GB RAM)

### 출시 체크리스트
- [ ] PWA 매니페스트 (icons 192/512, theme color, orientation: landscape)
- [ ] Service Worker 캐시 — `app-shell` + `audio` 분리
- [ ] Lighthouse 모바일 PWA 스코어 ≥ 90
- [ ] 첫 로드 < 3초 (3G 시뮬레이션)
- [ ] 사용자 시범 (만 4·5·6세 각 2명) 완주 가능 확인

## 🔭 M8 — v2+ 로드맵 (아이디어)

### P2
- [ ] **발음 평가**: Web Speech API + Levenshtein → 학습자 발화 채점
- [ ] **IndexedDB SRL**: 에빙하우스 곡선 기반 자모/음절 재출제 큐
- [ ] **수집 도감**: 완성 음절 컬렉션, 받침 결합 단어 도전 과제
- [ ] **부모 대시보드**: 시간/정답률/취약 자모 시각화 (별도 PC 친화 화면)
- [ ] **다크 모드 + 폰트 크기 조절**: 접근성 강화

### P3 (실험)
- [ ] **TTS 음성 합성**: Web Speech API 폴백 (오디오 자산 누락 시)
- [ ] **3단계 호환 데이터 스키마**: `2sa:syllables` → `3wn:words` 큐 자동 전달
- [ ] **클래스룸 모드**: 교사 PC에서 학생 태블릿 진척도 LAN 미러링

## 🔄 기술 부채 / 개선점 (예상)

| 항목 | 우선순위 | 메모 |
|---|---|---|
| TypeScript 마이그레이션 | Medium | state 모델 커지면 |
| Vitest 단위 테스트 | Medium | `compose/decompose` 우선 |
| Playwright 모바일 E2E | Low | 실기기 검증 보조용 |
| Vite 빌드 도구 | Low | Service Worker precache 자동화 시 |
| i18n | Low | 한국어 학습 외국인 영어 UI |
| Canvas 렌더 | 매우 낮음 | DOM/CSS 60fps 미달 시에만 |

## 🎯 브랜치 전략 (제안)

```
main                 # 배포 안정 버전 (M7 이후)
├── dev              # 통합 개발 브랜치
    ├── feat/m1-hangul-engine
    ├── feat/m2-pointer-snap
    ├── feat/m3-audio-core
    ├── feat/m4-mvp-loop
    ├── feat/m5-jongseong
    └── feat/m6-rhythm-mode
```

커밋 컨벤션: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `perf:`, `a11y:`

## 📝 릴리즈 노트

### v0.1.0 — M1~M4 (Walking Skeleton)
- 받침 없는 음절 10종 결합 가능 (SYLLABLES_L1)
- DragManager 자성 스냅 + spring-back
- Web Audio API (speech synthesis) — 자모/음절 발음
- 시작/플레이/종료 화면

### v0.2.0 — M5
- 받침(종성) 지원 — 레벨 3/4 (SYLLABLES_L3_SINGLE/L4_COMPLEX)
- 부분 정답 격려 메시지 (showPartialFeedback)
- 복합 모음 가로형 처리 (단계 1)

### v1.0.0 (현재) — M6
- TapManager — 탭-탭 입력 모드 (F12)
- 교정 모드 (correctionMode) — 즉시 거부/일괄 검사 선택
- 레벨 1~4 시스템 (받침 없음 → 겹받침 단계적 진입)
  - L1: 받침 없음 (SYLLABLES_L1)
  - L2: 쌍자음 초성 (SYLLABLES_L2_SINGLE/L2_DOUBLE, 85:15 비율)
  - L3: 홑받침 (SYLLABLES_L3_SINGLE/L3_DOUBLE)
  - L4: 겹받침 (SYLLABLES_L4_COMPLEX, 50:50 비율)
- 라운드 수 선택 (5/10/15/20, COUNT_OPTIONS)
- 진척도 localStorage 저장 (2sa:progress 키)
- Service Worker 등록 (PWA 기초)

### v2.0.0 (예정) — M7
- PWA 매니페스트 완성 (icons 192/512, orientation: landscape)
- 반응형 CSS 최적화
- 실기기 매트릭스 통과 (iPad/갤럭시 탭/보급형 폰)

## 📚 참고 문서

- 부모 `../AGENTS.md` — 7단계 로드맵, 모바일 정책, 포트 컨벤션
- 본 디렉토리 `../AGENTS.md` — 게임 메커닉 1차 출처
- `docs/PRD.md` — 제품 요구사항
- `docs/TRD.md` — 기술 설계, 수동 테스트 체크리스트
- 인접: `../../1_chosung_quiz/docs/` — 동일 패턴 참조

---

## 디자인 일관성 체크리스트 (홈·설정·완료 화면)

시작·설정·완료 화면 구현 전·후 아래 항목을 확인한다 (기준: `1_chosung_quiz`).

- [ ] 제목에 `font-family: 'Jua', sans-serif` 적용
- [ ] 설명·본문에 `font-family: 'Gowun Dodum', sans-serif` 적용
- [ ] `tokens.css` CSS 변수 팔레트 — 1단계 기준 색상·배경·간격 동일 적용
- [ ] 큰 라운드 버튼 스타일 (`1_chosung_quiz/src/css/components.css` 참조)
- [ ] 배경 색상 `--color-bg` 동일 사용
- [ ] 게임 완료 화면(end-screen)에도 동일 폰트·색상·버튼 스타일 적용
- [ ] 1단계 홈·설정·완료 화면과 나란히 놓고 시각적 통일감 육안 확인
