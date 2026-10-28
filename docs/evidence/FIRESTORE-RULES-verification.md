# Firestore security rules verification

Created: 2026-10-22T20:20:00+08:00
Approval: On 2026-10-22, Len answered "yes add firestore security rules" to ARCHITECTURE Q2 and HANDOFF next action 3.
Branch: `feat/ui-redesign`

## What was added

| File | Purpose |
| --- | --- |
| `firestore.rules` | The rules. |
| `firebase.json` | Points the Firebase CLI at the rules. Runs the Firestore emulator on port 8181, because Len's machine has `httpd` on 8080. |
| `.firebaserc` | Default project `gasup365` (from `src/firebaseservices/firebase.ts`). |
| `firestore/rules.test.ts`, `jest.rules.config.js` | 10 emulator tests. They use the Firebase JS SDK's `mockUserToken`, so no new dependency. |
| `package.json` script `test:rules` | Runs the tests in `npx firebase-tools@15.18.0 emulators:exec` against the demo project `demo-gasup365`, so they never touch the real database. Needs Java. |

## What the rules allow

The rules allow exactly what the app writes today:
- **`markers`**: signed-in users can read them all and create new ones.
  - A new marker must have `latitude`, `longitude`, `title`, `prices` and `timestamp`, and no unknown fields.
  - Coordinates must be in range. The title must be 1–200 characters.
  - `prices` may only contain `diesel`, `unleaded` and `premium`. Each is `null` or a number greater than 0 and below 1000, and at least one must be set.
  - `timestamp` must be the server time. An optional `userId` must be the writer's own (ready for FEAT-003).
  - Nobody can update or delete a marker.
- **`users/{uid}`**: users can read only their own profile. They can create it once, with exactly the fields sign-up writes, `points: 0`, `updates: 0` and `role: 'Community Member'`. Updates and deletes are closed until FEAT-003 defines how points change.
- **Everything else**: denied.

Behaviour change for the app: the Review screen accepts any positive price, but the rules reject 1000 or more. A typo like `6190` now fails with the "couldn't save" dialog instead of being saved.

## Checks (2026-10-22, Git Bash and PowerShell, Node 24.14.0, Java 24.0.2)

| Check | Command | Result |
| --- | --- | --- |
| Rules tests | `npm run test:rules` | Pass: 1 suite, 10 tests (run 3 times) |
| Unit tests | `npm test` | Pass: 6 suites, 27 tests (the rules suite is not picked up) |
| Lint | `npm run lint` | Pass: 0 problems |
| Typecheck | `npx tsc --noEmit` | Pass: 0 errors |

## Not done

- **Not deployed.** The live project still has whatever rules are set in the Firebase console. To deploy, Len (or another owner of the `gasup365` project) runs `npx firebase-tools@15.18.0 login`, then `npx firebase-tools@15.18.0 deploy --only firestore:rules`.
- Not checked against the live app after deploying. After deploying, sign up a new account and share a price once to confirm.

## Known issue

On Windows, `emulators:exec` leaves the emulator's Java process listening on port 8181 after the tests finish. The next run then fails with "port taken". Stop the process first, for example in PowerShell: `Get-NetTCPConnection -LocalPort 8181 -State Listen | % { Stop-Process -Id $_.OwningProcess }`.
