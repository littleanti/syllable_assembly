<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-05-05 -->

# docs

## Purpose
`2_syllable_assembly` 게임의 기획 및 설계 문서. 실제 코드에는 영향을 주지 않으며, 제품 요구사항·기술 설계·개발 계획을 기록한다. 본 게임은 **구현 완료** 상태이며, 본 문서들은 설계 근거 자료로 보존된다.

## Key Files

| File | Description |
|------|-------------|
| `PRD.md` | 제품 요구사항 문서 (Product Requirements Document) |
| `TRD.md` | 기술 설계 문서. §8에 수동 테스트 체크리스트 포함 |
| `PLAN.md` | 개발 계획 및 진행 상황 (마일스톤 기반) |

## For AI Agents

### Working In This Directory
- 본 게임은 **구현 완료** 상태 — 코드가 SoT(Source of Truth)이며 문서는 참고용.
- 부모 `../AGENTS.md` 의 게임 메커닉/모바일 정책이 설계 근거이며, 구현 세부사항은 `../src/` 참조.
- 자모 결합 알고리즘, 모음 형태 분기 같은 핵심 공식은 TRD §3에 명시 (실제 구현은 `src/js/hangul.js`).
- 수동 테스트 체크리스트는 `TRD.md` §8을 기준으로 한다.
- 자동화 테스트 런너 없음 — 새 기능 추가 시 TRD에 체크리스트 항목도 추가 권장.
- 인접 단계(`../1_chosung_quiz/docs/`, `../3_word_network/docs/`)와 데이터/컴포넌트 호환성 유지.
- **시리즈 공통 UI**: `TRD.md §11 홈·설정·완료 화면 디자인 시스템`과 `PLAN.md` 디자인 일관성 체크리스트에 start/settings/end-screen 규격이 명시됨.

<!-- MANUAL: -->
