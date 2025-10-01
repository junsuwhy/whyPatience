# Tasks: Desktop Solitaire Web Application

**Input**: Design documents from `/specs/001-game-rules-md/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → Extract: React 18+, TypeScript, React DnD, styled-components
2. Load design documents:
   → data-model.md: 7 entities → model tasks
   → contracts/: 3 files → contract test tasks
   → quickstart.md: 10 flows → integration tests
3. Generate tasks by category:
   → Setup: Vite project, dependencies, TypeScript config
   → Tests: contract tests, integration tests
   → Core: types, models, game engine, components
   → Integration: storage, drag-and-drop, animations
   → Polish: unit tests, accessibility, performance
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Setup

- [x] T001 Create React project structure with Vite and TypeScript configuration
- [x] T002 Install dependencies: React 18+, React DnD, styled-components, TypeScript, Jest, Playwright
- [x] T003 [P] Configure ESLint, Prettier, and TypeScript strict mode (Constitution: Code Quality Excellence)

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: Per Constitution Principle II (TDD), these tests MUST be written and MUST FAIL before ANY implementation**

- [x] T004 [P] Contract test for GameEngineContract in tests/contract/test_game_engine.test.ts
- [x] T005 [P] Contract test for StorageContract in tests/contract/test_storage.test.ts
- [x] T006 [P] Contract test for UI component interfaces in tests/contract/test_ui_components.test.tsx
- [x] T007 [P] Integration test for new game setup flow in tests/integration/test_new_game.test.ts
- [x] T008 [P] Integration test for basic card movement in tests/integration/test_card_movement.test.ts
- [x] T009 [P] Integration test for foundation building in tests/integration/test_foundation.test.ts
- [x] T010 [P] Integration test for stock pile operations in tests/integration/test_stock_pile.test.ts
- [x] T011 [P] Integration test for game victory flow in tests/integration/test_victory.test.ts
- [x] T012 [P] Integration test for undo functionality in tests/integration/test_undo.test.ts
- [x] T013 [P] Integration test for local storage persistence in tests/integration/test_persistence.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Type Definitions

- [x] T014 [P] Card types and enums in src/types/card.ts
- [x] T015 [P] Game state types in src/types/game-state.ts
- [ ] T016 [P] Position and movement types in src/types/position.ts
- [ ] T017 [P] User preferences types in src/types/preferences.ts

### Game Engine and Models

- [ ] T018 [P] Card model with validation in src/models/card.ts
- [ ] T019 [P] TableauColumn model in src/models/tableau-column.ts
- [ ] T020 [P] FoundationPile model in src/models/foundation-pile.ts
- [ ] T021 [P] StockPile model in src/models/stock-pile.ts
- [ ] T022 [P] GameState model in src/models/game-state.ts
- [ ] T023 [P] Move model and history in src/models/move.ts
- [ ] T024 Game engine core logic in src/services/game-engine.ts
- [ ] T025 Game validation rules in src/services/game-validation.ts
- [ ] T026 Storage service implementation in src/services/storage.ts

### React Components

- [ ] T027 [P] Card component with drag/drop in src/components/Card/Card.tsx
- [ ] T028 [P] TableauColumn component in src/components/TableauColumn/TableauColumn.tsx
- [ ] T029 [P] FoundationPile component in src/components/FoundationPile/FoundationPile.tsx
- [ ] T030 [P] StockPile component in src/components/StockPile/StockPile.tsx
- [ ] T031 [P] GameControls component in src/components/GameControls/GameControls.tsx
- [ ] T032 [P] GameStatistics component in src/components/GameStatistics/GameStatistics.tsx
- [ ] T033 [P] SettingsModal component in src/components/SettingsModal/SettingsModal.tsx
- [ ] T034 GameBoard main component in src/components/GameBoard/GameBoard.tsx
- [ ] T035 App root component with providers in src/App.tsx

### Custom Hooks and Services

- [ ] T036 [P] useGameState hook in src/hooks/useGameState.ts
- [ ] T037 [P] useDragAndDrop hook in src/hooks/useDragAndDrop.ts
- [ ] T038 [P] useLocalStorage hook in src/hooks/useLocalStorage.ts
- [ ] T039 [P] useGameStatistics hook in src/hooks/useGameStatistics.ts

## Phase 3.4: Integration

- [ ] T040 Connect GameBoard to game engine service
- [ ] T041 Integrate React DnD with card components
- [ ] T042 Add card animation system with styled-components
- [ ] T043 Implement keyboard navigation and accessibility
- [ ] T044 Connect storage service to components
- [ ] T045 Add game state persistence and restoration

## Phase 3.5: Quality & Performance (Constitution Compliance)

- [ ] T046 [P] Unit tests for game validation rules in tests/unit/test_validation.test.ts
- [ ] T047 [P] Unit tests for card models in tests/unit/test_models.test.ts
- [ ] T048 [P] Unit tests for storage service in tests/unit/test_storage.test.ts
- [ ] T049 [P] Unit tests for custom hooks in tests/unit/test_hooks.test.ts
- [ ] T050 [P] E2E tests with Playwright in tests/e2e/solitaire.spec.ts
- [ ] T051 Performance optimization: React.memo, useMemo, useCallback
- [ ] T052 Accessibility audit and ARIA labels implementation
- [ ] T053 Cross-browser testing and compatibility fixes
- [ ] T054 Bundle size optimization and code splitting
- [ ] T055 Run all quickstart.md scenarios and validate performance (<2s load, 60fps)

## Dependencies

- Setup (T001-T003) before all other phases
- Tests (T004-T013) before implementation (T014-T039)
- Types (T014-T017) before models and components
- Models (T018-T023) before services (T024-T026)
- Components depend on types and models
- Integration (T040-T045) after core implementation
- Performance/testing (T046-T055) after integration

## Parallel Example

```
# Launch type definitions together:
Task: "Card types and enums in src/types/card.ts"
Task: "Game state types in src/types/game-state.ts"
Task: "Position and movement types in src/types/position.ts"
Task: "User preferences types in src/types/preferences.ts"

# Launch model creation together:
Task: "Card model with validation in src/models/card.ts"
Task: "TableauColumn model in src/models/tableau-column.ts"
Task: "FoundationPile model in src/models/foundation-pile.ts"
Task: "StockPile model in src/models/stock-pile.ts"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Follow React best practices with hooks and functional components
- Use TypeScript strict mode throughout
- Maintain 60fps performance target
- Ensure WCAG 2.1 AA accessibility compliance

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:
   - game-engine-interface.ts → T004 contract test [P]
   - storage-interface.ts → T005 contract test [P]
   - ui-component-interfaces.ts → T006 contract test [P]
2. **From Data Model**:
   - Card → T018 model creation task [P]
   - TableauColumn → T019 model creation task [P]
   - FoundationPile → T020 model creation task [P]
   - StockPile → T021 model creation task [P]
   - GameState → T022 model creation task [P]
   - Move → T023 model creation task [P]
3. **From User Stories (quickstart.md)**:
   - Flow 1: New Game Setup → T007 integration test [P]
   - Flow 2: Basic Card Movement → T008 integration test [P]
   - Flow 3: Foundation Building → T009 integration test [P]
   - Flow 4: Stock Pile Operations → T010 integration test [P]
   - Flow 5: Game Victory → T011 integration test [P]
   - Flow 6: Undo Functionality → T012 integration test [P]
   - Flow 7: Local Storage Persistence → T013 integration test [P]

4. **Ordering**:
   - Setup → Tests → Types → Models → Services → Components → Integration → Quality
   - TDD: All tests before implementation
   - Dependencies prevent parallel execution where files are shared

## Validation Checklist

_GATE: Checked by main() before returning_

- [x] All contracts have corresponding tests (T004-T006)
- [x] All entities have model tasks (T018-T023)
- [x] All tests come before implementation (T004-T013 → T014+)
- [x] Parallel tasks truly independent (different files marked [P])
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Game engine and UI components covered
- [x] Storage and persistence handled
- [x] Performance and accessibility requirements included
