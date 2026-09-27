# Expansion Plan: Math Games Suite

This document outlines the plan to expand the current multiplication-only game into a full suite of arithmetic games, featuring a component-based architecture, advanced learning capabilities, and granular leaderboards.

## 1. Architecture Evolution (Component-Based Tech Stack)

To improve maintainability and scalability, the project will move from a monolithic `main.js` to a modular, component-based architecture using ES Modules.

### Core Pattern: Component-Based System
- **`BaseComponent` Class**: A foundational class handling lifecycle methods (`mount`, `unmount`, `render`) and state updates.
- **State Management (`GameState`)**: A centralized state container to manage:
    - Current user
    - Selected game type (sum, subtraction, multiplication, division)
    - Selected mode (bullet, blitz, rapid)
    - Selected level (1, 2, 3)
    - Current score and game status
- **Router/View Manager**: A lightweight system to navigate between screens (e.g., `Welcome` $\rightarrow$ `GameSelect` $\rightarrow$ `ModeLevelSelect` $\rightarrow$ `Game`).

## 2. Game Expansion & Generative Logic

The math logic will be reorganized using the **Strategy Pattern**.

### The Math Engine
- **`BaseGenerator`**: An abstract class defining the interface for all math generators.
- **Concrete Generators**:
    - `MultiplicationGenerator`
    - `AdditionGenerator`
    - `SubtractionGenerator`
    - `DivisionGenerator` (Logic implemented to ensure whole number results/clean division).

### Learning Engine (Error-Driven Reinforcement)
A new system to ensure users master their mistakes:
1.  **Error Detection**: When a user's input deviates from the correct answer, the system flags it.
2.  **`LearningService`**:
    - **Record**: Stores the failed question (e.g., `5 * 4 = 20`, user typed `24`) in the user's profile.
    - **Inject**: During question generation, the generator has a weighted probability to select a question from the user's "failed history" to enforce learning.

## 3. Data Schema Update (Persistence)

`localStorage` will be restructured to support the new features.

### Granular Leaderboards
Leaderboard entries will now use a composite key: `game_mode_level`.
- Example keys: `multiplication_bullet_1`, `sum_rapid_2`.

### Learning Data Store
A new key `math_game_learning_data` will store errors:
```json
{
  "username": {
    "multiplication": [
      { "a": 5, "b": 4, "answer": 20, "timestamp": 1678901234 }
    ],
    "addition": []
  }
}
```

## 4. UI/UX Flow Implementation

The user journey will be expanded as follows:

1.  **Welcome Screen**: Language selection and Username entry.
2.  **Game Selection**: Choose between Multiplication, Sum, Subtraction, or Division.
3.  **Mode & Level Selection**: Select time mode and difficulty. 
    - *Feature*: A **"Back" button** allows users to return to Game Selection if they change their minds.
4.  **Gameplay**: The active math session.
5.  **Results Screen**: Final score and personal record notifications.
6.  **Leaderboard Screen**: Multi-level filtering (Filter by Game $\rightarrow$ Mode $\rightarrow$ Level).

## 5. Implementation Roadmap

### Phase 1: Core Infrastructure
- [ ] Implement `src/core/Component.js` and `src/core/GameState.js`.
- [ ] Update `src/data.js` for composite leaderboard keys and learning storage.
- [ ] Refactor `src/main.js` into an `App` entry point.

### Phase 2: The Math Engine
- [ ] Create `src/logic/generators/` directory.
- [ ] Implement `BaseGenerator.js` and all concrete generators.
- [ ] Implement `LearningService.js` for error tracking and injection.

### Phase 3: UI Components
- [ ] Develop `src/ui/` components (Menu, Game, Leaderboard, etc.).
- [ ] Update `index.html` with a clean application mount point.
- [ ] Implement navigation/routing logic.

### Phase 4: Finalization
- [ ] Full translation support for all new elements.
- [ ] End-to-end testing of the "Learning Loop".
- [ ] UI/UX polish.
