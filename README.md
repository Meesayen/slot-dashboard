# Slots Dashboard

A small web dashboard for tracking and managing Spoak's "feature slots" — isolated staging
environments where a feature branch is deployed for targeted QA.

## Why I built it

At Spoak we develop features on long-lived branches that need real-world QA before merging.
Sharing a single staging environment led to conflicts: two features would overwrite each other
and it was never clear what was actually deployed where.

Feature slots (`feature1`, `feature2`, `feature3` ) solve
this by giving each feature its own deploy target. The dashboard centralizes the state of
every slot — who claimed it, which feature and branch is on it, and which ones are free — so
the team can coordinate without stepping on each other's toes.

## How it works

### Frontend

Vue 3 + TypeScript + Vite (Tailwind v3). The main view (`src/components/Slots.vue`) renders
a grid of `SlotCard`s, one per slot. A slot is either **available** (green) or **taken**
(red), and a taken slot shows the feature name and the profile of whoever claimed it. Users
signed in can claim a free slot or free one they own. State updates in real time through a
Supabase subscription on the `slots` table.

### Backend

Vercel serverless functions under `api/` (Node) talk to Supabase with the service role key:

- `GET /api/slots` — list all slots with their claimant profile.
- `POST /api/slot/:slot` — claim a slot (sets `claimed_by`, `feature`, `branch`, `available=false`).
- `POST /api/slot/:slot/free` — release a slot (clears claimant/feature/branch, `available=true`).

### Data model

Supabase (Postgres) tables:

- `slots`: `id`, `name`, `slotId`, `available`, `feature`, `branch`, `is_preprod`, `order`,
  `claimed_by` (FK → `profiles`).
- `profiles`: `id`, `username`, `email`, `nickname`, `avatar_url` (used for auth/identity).

### Companion CLI

A companion CLI lives in `cli/`. It is used to actually
deploy a branch onto a slot and keeps slot assignment in sync with the dashboard by calling
the dashboard API (`/api/slots`, `/api/slot/:slot`, `/api/slot/:slot/free`):

- `ship` — deploy a branch to a slot (interactive picker or `--preprod` for preprod).
- `free` — release slots claimed by you.
- `promote` — promote preprod to production.
