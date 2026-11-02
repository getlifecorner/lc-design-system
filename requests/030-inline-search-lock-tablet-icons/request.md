# Request 030: Inline magnifying-glass, lock and device-tablet icons; search-input and log-viewer register their glyph

- **From:** life-os
- **Received:** 2026-11-02
- **Gap IDs:** BA-6, BA-7
- **Referenced files:** /Users/eric/Documents/Projekte/life-cockpit/life-os/.claude/worktrees/004-connect-bank-accounts/specs/004-connect-bank-accounts/kit-gaps.md (section "Found in `/lifecorner-prove`", lines 20–27)
- **Kit version at intake:** 3.21.1

## Requirement (verbatim)

Narrowing given with the file:

> BA-6 and BA-7 (section 'Found in /lifecorner-prove'): lc-search-input draws magnifying-glass that is not inline and not registered, so it shows the placeholder; add magnifying-glass, lock and device-tablet (Tabler outline) to the inline set and let lc-search-input and lc-log-viewer register magnifying-glass themselves.

File content (lines 20–27):

## Found in `/lifecorner-prove` (2026-11-02)

Owner decision 2026-11-02: **kit first**, with a local stopgap so 004 can close. The app registers its glyphs with `provideLcIcons(APP_ICONS, { unregistered: 'placeholder' })` (`apps/cockpit/src/app/app.config.ts:71`), so a glyph outside the kit's inline set shows the placeholder "?" instead of being drawn. Kit 3.19.2 exports no `ICON_MAGNIFYING_GLASS`, `ICON_LOCK` or `ICON_DEVICE_TABLET`.

| Gap | Component | What is missing | Proposal | Where it is used | Interim until the release |
|---|---|---|---|---|---|
| BA-6 | `lc-search-input` (and `lc-log-viewer`) | The kit's own components draw `magnifying-glass`, which is not in the inline set and which they do not register, so the search field shows "?" | Add `magnifying-glass` to the inline set and let the components that draw it register it themselves (as the kit's other components do) | Bank picker search (bank-accounts boards 8–10, `libs/ui/finances/src/connect-page/connect.page.ts:109`) | A local `magnifying-glass` definition (Tabler outline) in `APP_ICONS` |
| BA-7 | `lc-icon` (inline set) | `lock` (and `device-tablet`, Settings → devices) | Add both Tabler outline icons to the inline set, unaliased (no network fetch) | `lock`: the health lock line „Nur für dich“ (bank-accounts W11, boards 12/14; `account.page.ts:162,430,475`, `account-settings.page.ts:215`); `device-tablet`: Settings → devices | A local `lock` definition in `APP_ICONS`; `device-tablet` stays as it is |
