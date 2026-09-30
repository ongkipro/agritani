# Release Manifest — agritani

Release-ID: agritani-v1.2.0-2026-09-30
Base: ee4886e
Environment: production
Declared-Risk: R2
Rollback-Ref: bb4a8793-6099-44b0-b935-721fb0ab4181
Rollback-Command: npx wrangler rollback bb4a8793-6099-44b0-b935-721fb0ab4181
Backup-Proof: NOT_REQUIRED
Status: READY

## Contract

This file defines the current release boundary. It is repository truth for release-specific metadata and MUST describe only the release currently being prepared.

- `Base` is the last deployed/accepted commit and must be an ancestor of `HEAD`.
- `Declared-Risk` is the human/agent-declared release risk (`R0`–`R4`).
- `Rollback-Ref` is the commit to restore if deployment fails; normally it equals `Base`.
- `Rollback-Command` is an explicit supported repository/runbook command, not an assertion such as `true`. Do not put secrets here.
- `Backup-Proof` is `NOT_REQUIRED` unless migration risk requires a structured `backup://`, `snapshot://`, or artifact reference.
- Set `Status: READY` only after the release scope is frozen for production gating.
