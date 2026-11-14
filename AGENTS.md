<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules (AÏDA)

- Navigation lives only in `src/config/navigation.ts`; sidebar, mobile drawer, bottom tabs and top-bar titles all read from it, so adding a module = one entry + one route file.
- App modules are routes under `src/routes/app.*` rendered inside the `/app` layout; admin screens use `app.admin.*`, keeping one shell.
- All fictitious content comes from `src/data/demo.ts` (IDs prefixed `DEMO-`) and every block showing it carries `<DemoBadge />`; never present demo data as real.
- Features that need the future backend (saving, biometrics, AI analysis) stay visibly disabled or call `notifyNotConnected()`; never simulate success or invent results.
- Auth is real Supabase email/password: `/app` (ssr: false) guards every private page with `supabase.auth.getUser()` and redirects to `/connexion`; one `onAuthStateChange` listener lives in `__root.tsx`. Why: the session lives in browser storage, so the server cannot gate SSR.
- Roles and profile shown in the UI come only from the `getMyAccess` server function (`src/lib/auth/`), which reads `user_roles` and `farm_memberships` with the caller's token; `app.admin.tsx` re-fetches it on every admin visit. Never derive roles from browser data or signup metadata.
- `src/lib/auth/attach-auth.ts` is the client function middleware that sends the bearer token to `requireSupabaseAuth` server functions (registered in `src/start.ts`).
- Shared UI building blocks live in `src/components/aida/`, layout chrome in `src/components/layout/`; page titles/meta come from `pageHead()` in `src/lib/seo.ts`.
- Database access goes through `src/lib/db/` (browser Supabase client + RLS); services throw `AidaDbError` via `unwrap()` so UI never shows success on a Supabase error.
- RLS helper functions (`has_role`, `is_farm_member`, `has_farm_permission`, `animal_farm_id`, `can_read_animal`) live in the `private` schema so they are not callable through the API; policies and new SQL must reference them as `private.*`.
- Farm permissions are a fixed catalog resolved by `private.has_farm_permission()` from the member's role (agents: explicit `permissions[]`); change permissions there, not in individual policies.
- History tables (events, health records/interventions, movements, ownerships, audit_log) are append-only: corrections are new rows with `corrects_id` + `correction_reason`; farm changes go through `transfer_animal()` only.
- `animal_identifiers.biometric_reference` has no grant for `authenticated`; always select explicit columns (`IDENTIFIER_COLUMNS`).
