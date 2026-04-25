# 음절 조립소

자모(초성·중성·종성)를 드래그하거나 탭해서 한글 음절을 조립하는 파닉스 게임입니다.

## 플레이

👉 [https://littleanti.github.io/syllable_assembly](https://littleanti.github.io/syllable_assembly)

## 레벨

| 레벨 | 받침 | 자음 종류 |
|------|------|----------|
| 1 | 없음 | 홑자음 |
| 2 | 있음 | 홑자음 |
| 3 | 없음 | 쌍자음 포함 |
| 4 | 있음 | 쌍자음 + 겹받침 |

## 조작 방법

- **드래그 모드** — 자모 블록을 슬롯으로 끌어다 놓기
- **탭탭 모드** — 자모 블록을 탭하면 자동으로 슬롯에 배치

## 실행

```bash
npx serve -p 3001
```

## 기술 스택

- Vanilla JS (ES Modules), HTML, CSS
- 빌드 도구 없음 (No build step)
- PWA (오프라인 지원)

## 라이선스

MIT © Wondeuk Yoon
