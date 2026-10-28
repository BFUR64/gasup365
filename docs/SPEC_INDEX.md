# Specification index

Created: 2026-10-21T10:55:54+08:00
Updated: 2026-10-22T20:01:25+08:00

| Category | ID | Current path | Revision | Status | Replaces |
| --- | --- | --- | --- | --- | --- |
| Handoff | HANDOFF | [../HANDOFF.md](../HANDOFF.md) | 2 | Awaiting approval | Revision 1 |
| Evidence | RECON-001 | [RECON_REPORT.md](RECON_REPORT.md) | 3 | Baseline Audit + verification addendum + post-redesign status | Revision 2 |
| Product | PROD-OVERVIEW | [product/OVERVIEW.md](product/OVERVIEW.md) | 2 | Draft | Revision 1 |
| Product | PROD-ARCH | [product/ARCHITECTURE.md](product/ARCHITECTURE.md) | 2 | Draft | Revision 1 |
| Product | PROD-DATA | [product/DATA_MODEL.md](product/DATA_MODEL.md) | 2 | Draft | Revision 1 |
| Product | PROD-CONSTRAINTS | [product/CONSTRAINTS.md](product/CONSTRAINTS.md) | 3 | Draft | Revision 2 |
| Design | DESIGN-001 | [design/CLAUDE_DESIGN_SPEC.md](design/CLAUDE_DESIGN_SPEC.md) | 1 | Superseded by DESIGN-002 | None |
| Design | DESIGN-002 | [design/CLAUDE_DESIGN_HANDOFF.md](design/CLAUDE_DESIGN_HANDOFF.md) | 1 | Draft; delivered to Claude Design and implemented | DESIGN-001 Revision 1 |
| Evidence | FIRESTORE-RULES | [evidence/FIRESTORE-RULES-verification.md](evidence/FIRESTORE-RULES-verification.md) | 1 | Rules written and tested in the emulator; not deployed | None |
| Evidence | UI-REDESIGN | [evidence/UI-REDESIGN-verification.md](evidence/UI-REDESIGN-verification.md) | 1 | Implemented; Len tested on a phone 2026-10-22 | None |

No feature specs (`docs/features/`) or implementation plans (`docs/plans/`) exist yet. The backlog (FEAT-001 to FEAT-005) is listed in [product/OVERVIEW.md](product/OVERVIEW.md).

## Document-Driven Development Lifecycle

All features in this repository follow Len's 5-stage document-driven workflow:

1. **Spec (`docs/features/FEAT-NNN-name.md`)**: Define purpose, scope, user flows (including loading, empty, offline, error, and permission-denied states), and `REQ-NNN` requirements with observable pass/fail criteria.
2. **Design (`docs/product/ARCHITECTURE.md`, `docs/product/DATA_MODEL.md`, & `docs/plans/FEAT-NNN-implementation.md`)**: Define component boundaries, data contracts, and a phased implementation plan mapped to `FEAT-NNN/REQ-NNN` IDs. Requires explicit chat approval from Len recorded in [../HANDOFF.md](../HANDOFF.md).
3. **Create Test (`src/**/__tests__/*.test.ts(x)` & `docs/evidence/FEAT-NNN-verification.md`)**: Write failing or characterization unit/integration tests directly targeting the approved `REQ-NNN` acceptance criteria before or alongside feature implementation.
4. **Generate Code (`src/**`)**: Implement the minimum, clean code required to satisfy the tests and spec within the approved phase scope.
5. **Optimize / Bugfix (`docs/evidence/FEAT-NNN-verification.md` & Phase Checkpoint)**: Refactor for simplicity (Ponytail audit/review), resolve edge-case bugs, run `npm test`, `npm run lint`, and `npx tsc --noEmit`, record verification evidence, and create the phase commit.
