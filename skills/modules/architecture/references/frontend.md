# Frontend architecture specialization

Use this reference when the change affects the shape of modules in the UI, rather than just styling.

## Required decisions

1. Which component owns the state and interface truth.
2. Which component renders state and which one mutates it.
3. Which component holds failures during loading, empty, error and permission paths.
4. Where accessibility rules live when a scheduler, browser or service worker is involved.
5. How state transitions are invalidation guarded.

## Guidance

- Treat container/parent as owning the state, and leaf components as local rendering.
- Avoid hidden side effects in a leaf. If a transition cannot be local, move it out.
- Prefer a single state shape for a loop, not one shape per page.
- Make transition counters and timing explicit where a transition affects user choice.
- Keep error handling near the module that can recover.

## Verification

1. One successful flow.
2. One loading state.
3. One permission-denied state.
4. One invalid input.
5. One failing state in a non-critical route.
6. One visual model of boundary composition, not a full mock.
