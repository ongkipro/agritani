# Release Manifest — agritani

Release-ID: agritani-v1.3.0-2026-10-01
Base: 44a3f24
Environment: production
Declared-Risk: R2
Rollback-Ref: a6995e3a-8f39-4cd2-822f-0137bf5ec02f
Rollback-Command: npx wrangler rollback a6995e3a-8f39-4cd2-822f-0137bf5ec02f
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
