# Medssi Engineering Rulebook

These are the default engineering practices for this repository and should be followed for all feature work unless explicitly overridden.

## 1) End-to-End Feature Flow

- Always implement in this order: `schema/db -> database actions -> app api routes -> services/api hooks -> screen/component hooks -> jsx`.
- Keep API handlers thin and move business logic to typed database actions.
- Keep UI components focused on rendering and user interaction, not data orchestration.

## 2) Folder and Component Structure

- Place each screen in `screens/<feature>/screen.tsx` with logic in `screens/<feature>/hook.ts`.
- For each screen component, use strict separation:
  - `<component>.tsx` for UI
  - `hook.ts` for component logic/helpers
  - `index.ts` for exports
- Add a root `components/index.ts` barrel per screen module.
- Reusable shared components belong in common/elements-level folders, not duplicated per screen.

## 3) UI and Design Standards

- Follow design specs strictly using `@repo/ui` primitives and `@repo/tailwind-config` tokens.
- Implement all states: loading, empty, error, success, disabled, and pending.
- Use skeletons/spinners for loading and toasts for clear user feedback.
- Keep shells reusable (top bar, bottom navigation, settings entry).

## 4) API and Validation Standards

- Validate request data at the API boundary (Zod schemas for query/body where possible).
- Return consistent JSON response shapes and correct status codes.
- Enforce auth checks in protected routes.
- For search/list pages, implement server-side search and pagination (not client-only filtering).

## 5) Data and Prisma Standards

- Keep Prisma operations type-safe; avoid unsafe/raw SQL unless absolutely required.
- Respect schema correctness (primary keys, foreign keys, unique constraints).
- Keep database-side naming and enum usage consistent across schema, actions, and API outputs.

## 6) React Query and Hook Standards

- Use React Query for data fetching, mutation, cache invalidation, and refetch control.
- Debounce user search input inside hooks, not in JSX.
- Use dedicated reusable hooks for cross-screen behavior (e.g., infinite scroll).

## 7) Error Handling and Feedback

- Use centralized API error handling utilities.
- Surface recoverable failures via toasts/messages.
- Keep form-level and field-level errors explicit and user-readable.

## 8) Storage and Upload Standards

- Use shared storage package integrations (e.g., `@repo/supabase`) instead of ad-hoc clients.
- Follow deterministic folder conventions (example: `patient_<patient_id>`).
- Persist upload metadata and initialize processing state explicitly (`pending` when required).

## 9) Monorepo and Config Standards

- Keep shared concerns in `packages/*` and app-specific wiring in `apps/*`.
- Add env keys to existing env files only (`.env` / `.env.example`), do not create random env files.
- Prefer shared package abstractions for cross-app concerns (auth, sentry, storage, utils).

## 10) Quality Gates

- After meaningful edits, run relevant typecheck/lint checks for touched scopes.
- Do not revert unrelated user changes.
- Keep changes small, composable, and consistent with existing naming/export patterns.

