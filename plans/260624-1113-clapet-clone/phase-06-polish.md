# Phase 6 — Polish

## Context Links
- Brainstorm § 9 (risks), § 10 (success metrics)

## Overview
- Priority: P2
- Status: pending
- Depends: tất cả phase trước
- Landing page, telemetry, dark mode polish, SEO, CSP hardening, performance pass, soft launch ready.

## Key Insights
- PostHog identify với user_id sau login → funnel "signup → first diagram → AI use".
- Sentry source maps upload trong CI (Pages + Workers).
- Landing page render same React app — route `/` chứa marketing copy + screenshot + CTA.
- CSP hardening = sao chép gần đúng từ clapet headers (đã decode được).

## Requirements
**Functional:**
- Landing page với hero, features, screenshot demo, pricing (Free BYOK forever), CTA
- OG image preview cho social share
- SEO: meta tags, sitemap, robots.txt
- 404 page friendly
- Dark mode coverage 100%
- Loading skeletons cho list pages
- Empty states cho zero-project / zero-diagram

**Non-functional:**
- Lighthouse Perf > 90, A11y > 95, SEO > 95
- p75 LCP < 1.8s
- Cookie consent banner (EU)

## Implementation Steps
1. **Landing page**:
   - Hero: title + subtitle + CTA "Start free — BYOK"
   - Features grid (4-6 cards): AI generate, 3 levels, share, export, BYOK no cost, dark mode
   - Demo screenshot (canvas của Phase 1)
   - Pricing section single column "Free forever, BYOK"
   - FAQ accordion (shadcn)
   - Footer: privacy, terms, contact
2. **OG image**: design 1200x630 PNG, ship trong `apps/web/public/og.png`.
3. **SEO**:
   - `index.html` meta tags (title, description, OG, Twitter card)
   - Per-route dynamic title via `react-helmet-async`
   - `sitemap.xml`, `robots.txt`
4. **CSP hardening** (`apps/web/public/_headers` cho Pages):
   ```
   Content-Security-Policy: default-src 'self';
     script-src 'self' https://us-assets.i.posthog.com;
     connect-src 'self' https://api.archlet.app https://api.openai.com https://api.anthropic.com https://api.deepseek.com https://sentry.io https://us.i.posthog.com;
     img-src 'self' data: blob:;
     style-src 'self' 'unsafe-inline';
     frame-ancestors 'none';
     ...
   ```
   Override cho `/e/*`: `frame-ancestors *`.
5. **PostHog**:
   - `identify(userId, { email })` sau login
   - Custom events: `diagram_created`, `ai_generated`, `share_created`, `export_downloaded`
   - Funnel dashboard in PostHog
6. **Sentry source maps**: GitHub Actions step `sentry-cli sourcemaps upload`.
7. **Cookie consent**: shadcn AlertDialog, simple accept/reject (PostHog conditional load).
8. **404 / error boundary**: friendly page, link về `/d`.
9. **Loading + empty states**: project list, diagram list, share list.
10. **Performance pass**:
    - Route code split (React.lazy)
    - Bundle analyzer, drop unused shadcn components
    - React Flow nodes memoize
    - Image lazy load trên landing
11. **Accessibility pass**: keyboard nav qua mọi shadcn component, aria-labels icon buttons, focus visible.
12. **Final smoke**: Lighthouse audit, fix < 90 perf issues.

## Todo List
- [ ] Landing page UI
- [ ] OG image asset
- [ ] SEO meta + sitemap + robots
- [ ] CSP _headers cho Pages
- [ ] PostHog identify + custom events + funnel
- [ ] Sentry source maps upload trong CI
- [ ] Cookie consent banner
- [ ] 404 page + error boundary
- [ ] Loading skeletons + empty states
- [ ] Route code splitting + bundle audit
- [ ] React Flow memoize
- [ ] Accessibility audit
- [ ] Lighthouse > 90/95/95

## Success Criteria
- Landing page convert > 5% click "Start free"
- Lighthouse 4 categories đạt target
- Zero CSP violations trong Sentry sau 1 tuần
- PostHog funnel "signup → first AI generate" hiển thị conversion rate
- Bundle < 500KB gzipped

## Risk Assessment
| Risk | Likelihood | Mitigation |
|---|---|---|
| CSP block PostHog/Sentry | Med | Test staging trước, có monitoring CSP-report endpoint |
| Bundle bloat khi merge tất cả phases | Med | Bundle analyzer mỗi PR, set 500KB budget CI |
| Landing copy yếu | Med | Iterate dựa trên PostHog session replay |

## Security Considerations
- CSP strict, không inline scripts
- Privacy: PostHog `mask_all_text: false` (chấp nhận), `session_recording.maskTextSelector` cho input fields
- Sentry `beforeSend` strip API keys khỏi breadcrumbs
- Cookie banner GDPR-compliant

## Next Steps
- Soft launch on Product Hunt / X
- Monitor Sentry + PostHog tuần đầu
- V2 backlog: realtime collab, server AI proxy + billing, mobile, version history
