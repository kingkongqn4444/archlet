# Screenshots capture guide

All README screenshots live in `.github/assets/` (NOT `docs/` — keeps repo tidy and GitHub renders them inline).

## Capture checklist (10 screenshots, ~15 min)

Run `pnpm dev`, open http://localhost:5173, sign up, then capture each scene below.

### Recommended setup
- Browser: Chrome/Edge, window 1440x900
- Dark mode ON (toolbar 🌙 icon) — looks more polished in screenshots
- DevTools closed
- Use `Cmd+Shift+4` (macOS) or Snipping Tool (Windows); export PNG

### 1. `hero.png` — main hero (1600×900)
- Load template **"Netflix Streaming"** (LibraryBig → Netflix)
- Click 🪄 **Run** in simulator (live req/s flow visible)
- Full-window capture; show canvas + toolbar + side palette
- Used at top of README

### 2. `ai-refactor.png` — AI Refactor panel (1280×800)
- Drop template "URL Shortener"
- Click 🪄 Wand2 icon → modal opens
- Type: "Make this production-ready at 10M users"
- Hit Run → wait for ~3 changes → capture WITH changes log visible
- Show: goal textarea + preset chips + green/amber changes

### 3. `cloud-picker.png` — Cloud Services picker (1280×800)
- Click ☁️ Cloud icon (side palette, after Patterns)
- Type "sage" in search → see SageMaker filter
- Switch facet to "AWS" → 108 services
- Click category "ml-ai" facet
- Capture modal with header + facets + 3-col card grid

### 4. `estimator.png` — Estimator modal (1100×800)
- Top toolbar 🧮 Calculator icon
- Storage tab: leave defaults but bump DAU to 100M
- Show full result list ("With indexes (recommended)" highlighted)

### 5. `templates-gallery.png` — Templates modal (1280×800)
- Toolbar LibraryBig icon
- Show grid of ~6 template cards (URL Shortener, Twitter, Netflix, etc.)
- Search bar visible (empty)

### 6. `learn-flyout.png` — Learn flyout (1100×800)
- Side palette → 📖 BookOpen icon (bottom)
- Flyout opens with 28 chapters
- Capture showing 5-6 chapter cards with key-concept chips

### 7. `learn-viewer.png` — Chapter viewer drawer (1280×800)
- From Learn flyout, click chapter **"URL Shortener"**
- Drawer opens with rendered markdown + an image visible
- Show header (chapter num + title + close)

### 8. `mentor-chat.png` — Mentor sidebar (700×900)
- Right side mentor panel open
- 1-2 messages visible (user question + AI response)
- Footer shows "anthropic · claude-sonnet-4-6"

### 9. `properties-panel.png` — properties panel with Cloud Service banner (700×900)
- Drop "SageMaker" from Cloud picker
- Click the node → properties panel right
- Show cyan banner with brand icon + name + cloud + category + docs link

### 10. `dark-light.png` — split dark vs light (1600×900)
- Optional. Capture in dark mode, then light mode → composite in any image tool

## File naming + format

- PNG, ≤500KB each (compress via `tinypng.com` or `pngquant`)
- Filenames lowercase-hyphen-only (e.g. `cloud-picker.png`)
- Save to `.github/assets/`

## Verify after capture

```bash
ls .github/assets/    # should list ~10 PNGs
```

Then push and check the rendered README on github.com.

## Optional polish

- **OpenGraph image** (`og-image.png`, 1200×630) — for social sharing previews
- **Demo video** — record a 30s screen capture with [OBS](https://obsproject.com) or [Loom](https://loom.com), upload to YouTube, embed link in README
