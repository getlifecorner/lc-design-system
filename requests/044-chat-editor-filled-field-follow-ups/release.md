# Release 044: @lifecorner/angular-ui-kit 3.27.2

- **Version:** 3.27.2 (patch, previous 3.27.1; spec: no API change)
- **Release commit:** on `fix/3.27.2-chat-editor-filled-field-follow-ups`, fast-forwarded to `main` (see the dispatcher reply for the hash)

## Gates

| Gate | Result |
|---|---|
| Unit tests (`--ci`) | 231 suites, 5484 passed, 8 skipped (build.md, gate commit eba7ac1; `git diff --stat eba7ac1 -- libs tools` shows only this release's CHANGELOG and `package.json`) |
| Lint | 0 errors, 162 warnings (= main; build.md) |
| Production build | 122 entries; rerun here 11.9 s; `dist/.../package.json` = 3.27.2 |
| Tool tests | 22 pass (build.md) |
| Storybook build | 1034 stories (+6; build.md) |
| Consumer check Angular 22 | PASS, 95 prerender checks (+1 `aria-pressed`; build.md). 21.x rows run in CI on `main` |
| Package contents (`npm pack --dry-run`) | 426 files, 1.3 MB packed, 6.3 MB unpacked (3.27.1: 426, 1.3 MB, 6.2 MB). No component specs or stories; the `src/styles/*.spec.ts` files are the known glob accident; `icon-names.json` present |

## Open items

| ID | Finding | Source | Route |
|---|---|---|---|
| 044-n1 | `lc-textarea` focus (outline and filled) is a border hue change plus a 20 % halo, while select and datepicker add a 2 px solid ring. Not an AA failure (focused border 3.96:1 L / 9.55:1 D on the fill) | review.md N1 | backlog |
| 044-n2 | Pending chat chip: the size label "240.0 KB" is not localised and wraps in the 256 px chip (pre-existing) | review.md N2 | backlog |
| 044-n3 | NC filters and log pills: the pressed mark in forced colours is a 2 px `Highlight` outline, the same shape as the focus ring (the RTE got a different one in D-2) | review.md N3 | backlog |

No `queue` items.

## Release through the pipeline

1. `git switch main && git merge --ff-only <branch>`, then `git push origin main`, and wait for CI
2. The annotated tag `v3.27.2` on the release commit, pushed alone: starts `publish-npm.yml`
3. Public once the npm stage is approved with 2FA (`npm stage approve <id>`)

## For the requester

- **Install:** `npm install @lifecorner/angular-ui-kit@3.27.2` (public after the owner's approval)
- **Closes:** F-28, F-29, F-31 (043 follow-ups)
- **Use it:** nothing to change. Update the package; the chat remove target, the rich-text editor `aria-pressed` and the filled-field border come with it.

```html
<lc-textarea variant="filled" label="Notes" />
<lc-select variant="filled" label="Country" [options]="countries" />
```

- **Stories:** `components-chat--pending-attachments`, `components-chat--pending-attachments-english`, `editors-rich-text-editor--pressed-mode`, `form-select--filled-states`, `form-textarea--filled-states`, `form-datepicker--filled-states`
