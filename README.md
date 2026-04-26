# 음절 조립소

자모(초성·중성·종성)를 드래그하거나 탭해서 한글 음절을 조립하는 파닉스 게임입니다.

## 플레이

👉 [https://littleanti.github.io/syllable_assembly](https://littleanti.github.io/syllable_assembly)

## 레벨

| 레벨 | 설명 |
|------|------|
| 🌱 레벨 1 | 받침 없음 — 홑자음 초성 |
| 🌿 레벨 2 | 받침 있음 — 홑자음 초성 + 홑받침 |
| 🌳 레벨 3 | 쌍자음 초성 70% + 홑자음 초성 30% |
| 🔥 레벨 4 | 겹받침 70% + 홑받침 30% |

## 조작 방법

- **드래그 모드** — 자모 블록을 슬롯으로 끌어다 놓기
- **탭-탭 모드** — 자모 블록 탭 → 슬롯 탭 순서로 배치 (설정에서 켜기)

## 설정

- **문제 수** — 게임당 5 / 10 / 15 / 20 문제 선택
- **탭-탭 모드** — 드래그 대신 탭으로 자모 선택
- **오답 수정 모드** — 틀린 자모를 즉시 피드백하고 다시 배치 가능

## 실행

```bash
npm run dev      # port 3002 (serve)
npm run live     # port 3002 (live-server, 파일 변경 시 자동 새로고침)
```

## 파일 구조

```
index.html
src/
  css/
    tokens.css      — 색상·크기 변수
    base.css        — 리셋 및 공통 애니메이션
    layout.css      — dock, 슬롯, 자모 팔레트 레이아웃
    blocks.css      — 자모 블록 스타일
    screens.css     — 화면별 스타일 (시작·설정·플레이·결과)
  js/
    main.js         — 진입점, 이벤트 바인딩
    game.js         — 게임 흐름 제어
    lesson.js       — 레벨별 음절 풀 생성
    ui.js           — DOM 업데이트 헬퍼
    hangul.js       — 한글 조합·분해 알고리즘
    layout.js       — 모음 형태에 따른 dock 배치
    pointer.js      — 드래그 앤 드롭 (Pointer Events API)
    tap.js          — 탭-탭 모드
    audio.js        — 음성 합성 (Web Speech API)
    state.js        — 전역 게임 상태
    config.js       — 상수 (기본 문제 수, 오답 블록 수 등)
    storage.js      — localStorage 저장/불러오기
    utils.js        — shuffle, pickExcluding 등 유틸
  data/
    jamo.js         — 자모 메타데이터
    lessons.js      — 레벨별 음절 목록
```

## 기술 스택

- Vanilla JS (ES Modules), HTML, CSS
- 빌드 도구 없음 (No build step)
- PWA (오프라인 지원)

## 라이선스

MIT © Wondeuk Yoon
