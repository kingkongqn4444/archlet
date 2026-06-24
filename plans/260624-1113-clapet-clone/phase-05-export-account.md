# Phase 5 — Export & Account

## Context Links
- Brainstorm § 7
- React Flow `toPng/toSvg` helpers (html-to-image)

## Overview
- Priority: P1
- Status: pending
- Depends: Phase 1 + Phase 2
- Export diagram to PNG/SVG/PDF; account management (profile, change email/password, delete user, sessions revoke).

## Key Insights
- Export client-side trước (html-to-image) — KISS, không cần Workers Puppeteer.
- PDF: dùng `jspdf` embed PNG. Quality OK cho diagram đơn giản.
- Upload result lên R2 chỉ khi user click "Get permanent link" — đa số chỉ cần download.
- Account routes mirror Better Auth endpoints — chủ yếu wire UI.

## Requirements
**Functional:**
- Export PNG (transparent background option)
- Export SVG (giữ vector, sharp)
- Export PDF (landscape, fit diagram)
- "Get permanent link" upload R2, trả URL signed
- Account page: profile name/email, change email (verify mới), change password, delete account, list active sessions + revoke

**Non-functional:**
- Export 50-node diagram < 3s
- R2 upload < 5s

## Architecture
```
apps/web/src/features/
  ├─ export/
  │   ├─ export-dialog.tsx       Choose format + options
  │   ├─ export-png.ts
  │   ├─ export-svg.ts
  │   ├─ export-pdf.ts
  │   └─ upload-r2.ts            POST /export upload helper
  └─ account/
      ├─ account-page.tsx        Layout tabs
      ├─ profile-tab.tsx
      ├─ change-email-tab.tsx
      ├─ change-password-tab.tsx
      ├─ sessions-tab.tsx
      └─ danger-zone-tab.tsx     Delete account

apps/api/src/routes/
  ├─ exports.ts                  POST /export/:diagramId (upload R2 signed URL)
  └─ account.ts                  Wire Better Auth endpoints
```

## Data Model (D1 migration `0004_exports.sql`)
```sql
CREATE TABLE exports (
  id TEXT PRIMARY KEY,
  diagram_id TEXT NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL,
  format TEXT NOT NULL,           -- png|svg|pdf
  r2_key TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL     -- TTL 7 ngày
);
CREATE INDEX idx_exports_owner ON exports(owner_id, created_at DESC);
```

## Implementation Steps
1. Install `html-to-image`, `jspdf`.
2. Export helpers:
   - `export-png.ts`: `htmlToPng(ref.current, { backgroundColor: opts.transparent ? null : '#fefcf6' })`.
   - `export-svg.ts`: `htmlToSvg(ref.current)`.
   - `export-pdf.ts`: render PNG → jspdf landscape → save blob.
3. ExportDialog: format radio + options (transparent, scale 1x/2x/3x). "Download" + "Get permanent link" buttons.
4. R2 upload flow:
   - Frontend POST `/api/export/:diagramId` body `{ format }` → Worker generate signed PUT URL → frontend PUT blob to R2 → POST confirm → Worker insert row + return signed GET URL (TTL 7 days).
   - Alternative: client upload qua Worker fetch (simpler, no signed URL). Choose v1: simple fetch.
5. Cron Worker xóa R2 objects expired (Wrangler cron trigger daily).
6. Account page tabs:
   - **Profile**: input name, save.
   - **Change email**: input new email + current password → Better Auth `/change-email`.
   - **Change password**: current + new → Better Auth `/change-password`.
   - **Sessions**: list active từ `/list-sessions`, "Revoke" button per row + "Revoke all others".
   - **Danger zone**: Delete account → confirm modal "Type EMAIL to confirm" → `/delete-user` (cascade D1 deletes projects/diagrams/exports).
7. Tất cả mutations qua TanStack Query, toast feedback.

## Todo List
- [ ] Install html-to-image + jspdf
- [ ] Export PNG/SVG/PDF helpers
- [ ] ExportDialog UI
- [ ] R2 binding wrangler.toml
- [ ] POST /export endpoint + R2 upload
- [ ] Cron Worker cleanup expired exports
- [ ] Migration exports table
- [ ] Account page layout + tabs
- [ ] Profile tab
- [ ] Change email tab (Better Auth wire)
- [ ] Change password tab
- [ ] Sessions tab (list + revoke)
- [ ] Delete account flow
- [ ] Smoke test export 3 formats + account flows

## Success Criteria
- Export PNG/SVG/PDF từ canvas 20 node → file đẹp, sharp
- Permanent link trả R2 URL accessible 7 ngày
- Change password → logout other sessions
- Delete account → tất cả D1 rows + R2 objects xóa hết

## Risk Assessment
| Risk | Likelihood | Mitigation |
|---|---|---|
| html-to-image fail với CSS phức tạp | Med | Test với mọi node type, fallback inline styles |
| R2 quota nổ | Low | TTL 7 days + cron cleanup |
| Delete account không cascade | Med | Foreign key ON DELETE CASCADE + test |

## Security Considerations
- Signed R2 GET URL hết hạn 7 ngày
- Change email cần password (Better Auth mặc định)
- Delete account = irreversible, require typed confirmation
- Audit log delete account → Sentry breadcrumb (no PII)

## Next Steps
→ Phase 6: polish, landing, observability
