# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v55.0.0/ before writing any code.

---

# Shared Document-Driven Workflow Policy

This project uses Len's **Document-Driven Development** workflow (`Spec → Design → Create Test → Generate Code → Optimize/Bugfix`).

## 1. Entry Point & Authority
1. Before implementing any code, read [docs/SPEC_INDEX.md](docs/SPEC_INDEX.md), root [HANDOFF.md](HANDOFF.md), and every approved document it links.
2. Len holds final authority over product requirements, architecture, and scope. Do not implement unapproved features or silently alter approved behavior.

## 2. The 5-Stage Engineering Loop
Every feature (`FEAT-NNN`) and bugfix progresses through five sequential stages:

1. **Stage 1 — Spec (`docs/features/FEAT-NNN-name.md`)**:
   - Define purpose, scope, user flows (including loading, empty, offline, error, and permission-denied states), and numbered requirements (`REQ-001`, `REQ-002`, ...) with observable pass/fail acceptance criteria.
2. **Stage 2 — Design (`docs/product/*` & `docs/plans/FEAT-NNN-implementation.md`)**:
   - Define component boundaries, data contracts, and a phased implementation plan linking every task and verification check to `FEAT-NNN/REQ-NNN`.
   - Record Len's explicit chat approval in [HANDOFF.md](HANDOFF.md) before executing implementation phases.
3. **Stage 3 — Create Test (`src/**/__tests__/*.test.ts`)**:
   - Write automated unit/integration tests targeting the `REQ-NNN` acceptance criteria before or alongside implementation so every requirement is verifiable.
4. **Stage 4 — Generate Code (`src/**`)**:
   - Write minimal, clean, strictly-typed TypeScript/React Native code that satisfies the tests and spec without speculative bloat.
5. **Stage 5 — Optimize & Bugfix (`docs/evidence/FEAT-NNN-verification.md`)**:
   - Refactor for clarity and simplicity, fix edge-case bugs, run all verification gates (`npm test`, `npm run lint`, `npx tsc --noEmit`), record actual results in the verification log and [HANDOFF.md](HANDOFF.md), and commit the phase checkpoint.

## 3. Recovery & Three-Attempt Limit
- Count fix-and-check attempts for the same failing requirement or gate (maximum 3 attempts).
- If a problem is not resolved after 3 attempts, stop, preserve uncommitted edits, record the exact error and attempts in [HANDOFF.md](HANDOFF.md), and report the blocker to Len.
