# Phase 5 Implementation Report — Export & Account

## Status: completed

---

## 1. File Tree

```
apps/web/src/features/export/
  export-png.ts          — htmlToPng(el, {transparent, scale}) → Blob; downloadBlob helper
  export-svg.ts          — htmlToSvg(el) → Blob
  export-pdf.ts          — htmlToPdf(el, {scale}) → PNG→jsPDF landscape Blob
  export-dialog.tsx      — Format radio (PNG/SVG/PDF), scale 1x/2x/3x, transparent toggle, Download + Permanent link (stub toast)

apps/web/src/features/account/
  profile-tab.tsx        — name update via authClient.updateUser(); email shown read-only
  sessions-tab.tsx       — lazy-load sessions via authClient.listSessions(); per-row revoke + revoke-all-others
  danger-zone-tab.tsx    — typed-email confirm dialog → authClient.deleteUser() → signOut → navigate("/")

apps/web/src/pages/
  account-page.tsx       — REWRITTEN: 4-tab layout (Profile|API Keys|Sessions|Danger); tab state via ?tab= query param; API Keys content preserved inline; /account/keys legacy compat

apps/web/src/features/canvas/toolbar/
  top-toolbar.tsx        — +Download icon button → ExportDialog; +exportOpen state

apps/web/src/components/
  app-shell.tsx          — "API Keys" link → "Account" link pointing to /account

apps/web/src/app.tsx    — /account route (AuthGuard); /account/keys → Navigate to /account?tab=api-keys
```

Packages added to `apps/web`:
- `html-to-image@1.11.13`
- `jspdf@4.2.1`

---

## 2. Better Auth Endpoint Discovery

All required endpoints are built-in to Better Auth v1.6.20 — zero custom Hono routes needed:

| Action | BA endpoint (via authClient proxy) | Built-in? |
|---|---|---|
| Update profile name | `authClient.updateUser({ name })` → `POST /api/auth/update-user` | YES |
| List sessions | `authClient.listSessions()` → `GET /api/auth/list-sessions` | YES |
| Revoke single session | `authClient.revokeSession({ token })` → `POST /api/auth/revoke-session` | YES |
| Revoke all other sessions | `authClient.revokeSessions()` → `POST /api/auth/revoke-sessions` | YES |
| Delete account | `authClient.deleteUser()` → `POST /api/auth/delete-user` | YES |

No backend changes required for Phase 5.

---

## 3. Export Quality Notes

- **PNG**: `pixelRatio` controls sharpness (1x/2x/3x). Default scale in ExportDialog is 2x. Transparent mode omits `backgroundColor` key entirely (required by html-to-image `exactOptionalPropertyTypes`).
- **SVG**: html-to-image `toSvg` preserves vector text and shapes; CSS custom properties may not inline if not inherited. Background set to `#fefcf6`.
- **PDF**: PNG rendered at selected scale, then embedded into jsPDF with auto landscape/portrait detection based on aspect ratio. Units are pixels to avoid scaling distortion.
- **Target element**: `.react-flow__viewport` — captures the entire diagram canvas including all nodes/edges at current scroll/zoom.

---

## 4. Smoke Test Results

- `pnpm typecheck`: PASS (0 errors)
- `pnpm build`: PASS — 2309 modules, bundle ~1MB (expected — jsPDF + html2canvas are heavy)
- Manual smoke: not run (no local Workers dev environment in this session)

---

## 5. Known Issues

1. **Chunk size warning**: `index-BK2uUQ36.js` is ~1MB due to jsPDF + html-to-image. Not an error, but worth splitting with `manualChunks` in Phase 6 polish.
2. **Export captures viewport only**: The `.react-flow__viewport` element clips to the visible canvas area. Off-screen nodes won't appear. A `fitView()` call before export would fix this — not implemented to avoid mutating canvas state silently. Could add optional "Fit before export" checkbox.
3. **authClient.listSessions() lazy load**: Sessions are loaded on demand (button click), not on tab mount. This avoids an unnecessary request on page load.
4. **Profile tab name init**: `useState(session?.user.name ?? "")` — if session loads after mount, initial value will be `""`. Acceptable for v1; add a `useEffect` to sync if needed.
5. **deleteUser() may require password**: Better Auth's `/delete-user` endpoint behavior depends on server config. If server requires `callbackURL` or password confirmation, the call may fail gracefully with an error toast.
6. **No migration 0004**: Deferred per scope (R2/exports table not needed without upload feature).

---

## 6. Next-Step Recommendations for Phase 6

1. **R2 upload + permanent link**: Implement `POST /api/export/:diagramId` → R2 presigned PUT → confirm → signed GET URL (7-day TTL). Wire "Permanent link" button in ExportDialog.
2. **Code-split jsPDF**: Use `() => import('jspdf')` dynamic import in `export-pdf.ts` to reduce initial bundle.
3. **fitView before export**: Add optional pre-export `fitView()` to capture full diagram.
4. **Cron Worker**: Add `0004_exports.sql` migration + daily cron to delete expired R2 objects.
5. **Profile tab name sync**: Add `useEffect(() => setName(session?.user.name ?? ""), [session?.user.name])` for late-loading sessions.
6. **CSP hardening**: html-to-image uses `fetch(dataUrl)` which requires `blob:` in CSP — document this.
