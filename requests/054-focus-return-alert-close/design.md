# Design 054: returnFocusTo, focusContext(), focusItem(), 44 px alert close

- **Status:** ready (changed in review r1)
- **Spec:** [spec.md](spec.md) — AC-1 … AC-20. Kit 3.33.1 (c3d20c5); expected release 3.34.0 (minor).
- **Change note (review r1, 2026-11-06):** D-5 added. The × glyph in dark is 1.15–1.39:1 (WCAG 1.4.11; 018 S2, open since 3.13.1 and never queued). It is fixed here, because 054 makes this very × a 44 px target. AC-15's "glyph looks as before" now covers the geometry, hit area, hover box and ring; the glyph colour changes in the 66 baseline shots that show a ×. See §2, §5 and §9.

## 1. Approach

Extend four components, with no new visuals and no new markup. Only template reference variables are added, and they render nothing.
- **Focus return** follows the `focusTitle()` precedent (next-step-card 3.33): a plain public method or input, `afterNextRender`, and the `:focus-visible` heuristics decide the ring. Neither the CDK trap nor `autoCapture` changes. The modal adds one focus step *after* the trap's restore.
- **Alert close** follows the kit's hit-area pattern (table action `::before`, NC chips): a transparent `::before` centred on the button. The box, padding, margin and paint stay as they are.
- Measured today in Chromium, where `HTMLElement.click()` opens without focusing, as WebKit does: every close path (Escape, ×, backdrop, „Abbrechen“) leaves `body` active in *Default*, *Bottom sheet* and *Preview… (3.3)*. A focused opener gets the focus back (`tmp/story-shots/054/modal-today.log`).

**Decisions (assumptions, no owner question):**
- D-1: a custom-element target hands the focus to its first focusable descendant. `lc-button`'s `clicked` carries no event, so `viewChild('t', { read: ElementRef })` yields the `<lc-button>` host, and without this rule AC-6 would need consumer DOM queries.
- D-2: both methods defer to after the next render themselves (AC-9: "called right after `contextName` changed"), unlike `focusTitle()`, which is synchronous.
- D-3: the alert hit area uses CSS `44px`, not the rem token (§2).
- D-4: `ConfirmOptions.returnFocusTo`, so the service path has the same fix. It is optional and not a break.
- D-5 (r1): `.lc-alert__close` gets `color: inherit`, so the glyph takes the variant's `--color-text-primary` instead of the UA `buttontext` black. `inherit` changes light the least (#000 → #111827). The modal and toast × use text-secondary, which would visibly lighten the light ×.

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input | `lc-modal` `returnFocusTo` | `HTMLElement \| null` | `null` | Element that gets the focus back after the dialog closed (3.34), instead of the one that had it at open. Set it to the trigger: WebKit (Safari, every iOS browser) doesn't focus a tapped button, so the captured element is `body`. Applied after the next render, once the dialog has left the DOM and the focus trap has restored its captured element. This holds on every close: ×, Escape, backdrop, `open` false, `closeModal()`, and destroying an open modal. A custom-element host that can't take focus (`<lc-button>`) hands it to its first focusable descendant. Ignored when the element is no longer in the document or can't take focus; the captured element then keeps it. `null`: as before. `@default null` |
| input | `lc-confirm-dialog` `returnFocusTo` | `HTMLElement \| null` | `null` | Passed to `lc-modal` (3.34). The focus returns after confirm, cancel, Escape and ×. Set it to the trigger. `null`: as before. `@default null` |
| option | `ConfirmOptions.returnFocusTo?` | `HTMLElement \| null` | unset | (D-4) Element that gets the focus back after the dialog closed (3.34); see `lc-modal` `returnFocusTo`. |
| method | `HeaderComponent.focusContext()` | `(): void` | — | Moves the focus to the context button after the next render (3.34), so a `contextName` set just before is already in its name. Call it right after the choice, or when the sheet that changes the context closes. Does nothing while the button isn't shown (no `contextName`, or up to 640 px with `contextPlacement="inline"`). A second call before that render replaces the first. |
| method | `ListComponent.focusItem(id, part = 'row')` | `(id: string, part?: ListItemPart): void` | `part 'row'` | Moves the focus into the row of the first item with this `id` after the next render (3.34). `'row'`: the row's button (`clickable`) or link (`href`). `'action'`: its built-in action button. Does nothing for an unknown `id`, for a row without that part (a plain row, a disabled row for `'row'`, no `action`, an `lcListItem` template's own controls), or when the list is destroyed first. A second call before that render replaces the first. |
| type | `ListItemPart` | `'row' \| 'action'` | — | The part of a row that `focusItem()` focuses. Exported from `@lifecorner/angular-ui-kit/list`. |
| CSS hook | none | — | — | The alert hit area is private (`.lc-alert__close::before`). |

**Default rendering and behaviour unchanged.** Template refs (`#contextButton`, `#listEl`) are not rendered, so the prerendered HTML is identical (AC-19). The modal schedules nothing while `returnFocusTo` is `null`, so there is no extra tick (AC-4). The 264 baseline shots of unchanged stories in `tmp/story-shots/054/baseline` (main c3d20c5, 360/1024/1280, L/D) cover 25 alert, error-display and density stories (150 shots), 6 header (36), 9 list (54) and 2 modal + 2 confirm stories (24).

### Internals (binding for the developer)

| Where | Rule |
|---|---|
| modal: state | `private shown = false`. `showModal()` sets it `true`. At the end of `hideModal()` (existing code unchanged before it): `if (!this.shown) return; this.shown = false; if (untracked(this.returnFocusTo)) this.scheduleFocusReturn()`. **`untracked` is required:** `hideModal()` runs inside the open effect, and a tracked read would re-run `showModal()` when the input changes. That re-push moves the modal above a nested overlay (`OverlayStackService.push` re-orders). |
| modal: timing | `afterNextRender(() => …, { injector: inject(EnvironmentInjector) })`. The order is: effect → template refresh removes the `@if` view → `CdkTrapFocus.ngOnDestroy` restores the captured element (CDK 22.2, synchronous) → render hooks → ours, the last focus write in that task. Use the **environment** injector, because a node injector cancels the hook on destroy and `ConfirmService` destroys the dialog while it is open (`cleanup()` inside `cancelled.emit`). Destroy order: the trap's `ngOnDestroy` runs before the modal's, which calls `hideModal()`. |
| modal: callback | Read `const t = this.returnFocusTo()` now, so a trigger re-rendered meanwhile is taken from a fresh `viewChild`. `if (this.shown \|\| !t?.isConnected) return` covers a reopen and a gone element. Then `t.focus()`. If `t.ownerDocument.activeElement !== t && t.localName.includes('-')`, call `t.querySelector<HTMLElement>(FOCUSABLE)?.focus()`. `FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'`. No `instanceof HTMLElement`, which is SSR-safe; `afterNextRender` never runs on the server. |
| confirm | `[returnFocusTo]="returnFocusTo()"` on its `lc-modal`. Service: `if (opts.returnFocusTo) componentRef.setInput('returnFocusTo', opts.returnFocusTo)`. |
| header | `#contextButton` on `button.lc-header__context-info`. `private readonly contextButton = viewChild<ElementRef<HTMLButtonElement>>('contextButton')`. `focusContext()`: `this.pending?.destroy(); this.pending = afterNextRender(() => { this.pending = undefined; this.contextButton()?.nativeElement.focus(); }, { injector: this.injector })` (the existing node `injector`). No visibility check (jsdom has no layout). A `display: none` button ignores `focus()`, measured at 360 in *Full Featured*. |
| list | `#listEl` on `div[role=list]`. Inject `Injector`. In the callback: `index = (this.items() ?? []).findIndex(i => i.id === id)`; `row = listEl.children.item(index)` (each `@for` pass renders exactly one element child). `'row'` → `row.querySelector('a.lc-list__item, .lc-list__item[role="button"]:not([aria-disabled="true"])')`, which matches no plain row because `querySelector` skips the element itself. `'action'` → `row.querySelector('.lc-list__action-area button')`. Then `?.focus()`. The pending-ref replacement works as in the header. |
| alert SCSS | Inside the existing `.lc-alert__close {` block, so the `css.indexOf('\n.lc-alert__close {')` pin in `alert.narrow.spec.ts` holds: add `color: inherit;` (D-5, r1), `position: relative;` and `&::before { content: ''; position: absolute; inset: min(0px, calc((100% - 44px) / 2)); }`. Use CSS px, not `--size-min-touch-height`: that token is 88 px at 200 %, and with the 36 px box ((88 − 36) / 2 = 26 against 16 px of free gap, computed) it would cover the action by 10 px. |

## 3. Anatomy and layout

lc-modal, lc-confirm-dialog, lc-header and lc-list have no visual change; the baseline hashes prove it. The alert close, prototyped by CSS injection, measured with an `elementFromPoint` scan in steps of 0.5 px:

### 360 px (*Dismissible*, alert 328 × 118.5, padding 16, border 1)

```
┌──────────────────────────────────────────────┐ alert border box
│                                     5 ┌┄┄┄┄┄┐│ ::before 44 × 44, no paint
│  ⓘ  Cookie Consent       gap 12 → ┊ ┌───┐ ┊│ close 28 × 28 = icon 20 + 2 × 4 padding
│     We use cookies … policy.  8 ┊ │ × │ ┊│ layout box 20 × 20 (margin −4)
│                          body ⇥┊ └───┘ ┊│ hit edge touches body/title box (0 px)
│                                       └┄┄┄┄┄┘│ 5 px to top and right border
│  …                                           │ alert height 118.5 before = after
└──────────────────────────────────────────────┘
narrow (< 16rem, padding 12, *Narrow Column* 240): hit 1 px inside the border;
overlaps the message row's top 3.5 px (its half-leading, no glyph) over 32.5 px
```

### From 1024 px (*Link Action*, alert 992 × 78; 1280: 1248 × 78)

```
│ ⓘ Title / message …… │ link (44 high) │8│ × 28 │ 13 │   visual gap link → × = 8
│                       │ hit area edge ─┘ 0 px overlap (scan 0.5)
```

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| close box | 28 × 28 (200 %: 36 × 36) | — | icon `sm` 20 px + `--spacing-1` |
| hit area | 44 × 44 at 100 % and 200 %, centred | — | `44px` (CSS px, see §2) |
| hit to border | default 5 px inside; narrow 1 px inside; compact + narrow: 3 px outside (computed) | — | `--lc-density-padding-*` |
| hit to action/link | 0 px (touching) at 1024/1280; link below at ≤ 360 (−48 px) | — | gap `--spacing-3` |

## 4. States

| Component | State | Behaviour |
|---|---|---|
| modal | `returnFocusTo` null | 3.33.1 exactly (CDK restore only, no hook). |
| modal | set, connected, focusable | The element gets the focus on every close path and when the modal is destroyed while open. |
| modal | disconnected / removed while open / `disabled` / hidden | No throw; the captured element keeps the focus (focused opener → opener; WebKit tap → `body`, as today). |
| modal | captured ≠ target, both connected | Both are focused in one task (CDK, then ours); screen readers announce the last. |
| modal | reopened before the render / nested modal | The callback returns (`shown`). A target inside an outer open modal is focused normally. |
| header | no `contextName` / inline ≤ 640 / destroyed before render | Nothing (no button, `display: none`, hook cancelled). |
| header | `contextName` changed, then called | After the render, the button is focused with the new name in `aria-label`. |
| list | unknown id, plain row, disabled row (`'row'`), no action, custom template | Nothing, no throw. Duplicate ids: the first item. |
| list | `items` replaced, then called in the same tick | Resolved after the render against the new rows. |
| list | `size` sm/md/lg, dividers, badges, `selected`, horizontal | Same lookup; ring: row inset `box-shadow`, action `lc-button` outline. |
| alert × | rest / hover / focus-visible / active | Box, hover fill and ring as before. Hover is now *triggered* within 44 × 44 and paints the same 28 px box. The glyph colour is text-primary (D-5, r1). Forced colours keep `ButtonText` (6/6 FC shots identical). |
| alert × | 200 % text | Box 36, hit 44 (*Narrow Layout*: 36 → 44). |
| overflow | long German compounds | No new text. Existing DE stories are hash-compared. |

## 5. Theming

No colour changes and no new tokens. The existing rings that the new methods land on were measured (`tmp/story-shots/054/rings-today.log`, WCAG formula on composited backgrounds):

| Element | Light | Dark | Contrast (computed) |
|---|---|---|---|
| list row ring (inset 2 px, `--color-primary-500`) on the `selected` row | `#208497` | `#84c7d4` | 4.06 / 9.44 |
| same on a plain row | `#208497` | `#84c7d4` | 4.37 / 9.13 |
| list action ring (`lc-button` outline 2 px, offset 2) | `#208497` | `#84c7d4` | 4.37 / 9.13 |
| header context ring (below / inline) | `#208497` | `#84c7d4` | 4.37 / 9.95 (below), 9.13 |
| alert × ring | unchanged | unchanged | 16/16 focused shots hash-identical |
| alert × glyph (r1, D-5), rest / hover tint | `--color-text-primary` #111827 (was #000) | #f1f6f8 (was #000) | L min 13.66 / 9.59 (error), D min 13.90 / 9.45 (warning); before D 1.15–1.39 / 1.26–2.04. All 4 variants, composited (`r1-success-probe.log`) |

## 6. Accessibility

- **2.4.3 Focus Order:** the focus returns to the trigger, the context button or the row part. **2.4.7:** the ring follows `:focus-visible`. After a pointer close Chromium shows none; after Escape or Tab it does. Nothing is forced.
- **Announcements:** none added. The screen reader reads the focused control's name: the context button with the new `contextName`, the action by `actionAriaLabel`.
- **2.5.5 / 2.5.8:** alert × 44 × 44 at 100 % and 200 %. It touches neighbours without overlapping them. The close is the upper layer (last in DOM, positioned) where boxes touch, and in compact narrow alerts it reaches 3 px past the border.
- **forced-colors:** the `::before` has no paint; 6/6 FC shots are hash-identical. The list row keeps its `Highlight` outline rule.
- **Reduced motion:** nothing is animated. The modal has no close animation (the `@if` removes it), so "after the close transition" means after the render that removes the dialog.
- **Keyboard:** no new stops, no `tabindex` changes. `focus()` scrolls the target into view (as the CDK restore does).

## 7. Texts

No new built-in strings (AC-18). Story strings:

| Story | EN | DE (shown) |
|---|---|---|
| modal *Focus return* | — | „Fassung umbenennen“, „Monatsstand wählen“, „Abbrechen“, „Speichern“, „Übernehmen“, × „Schließen“ |
| confirm *Focus return* | — | „Fassung löschen“, „Fassung löschen?“, „August 2026 · Fassung 1 wird für alle gelöscht.“, „Löschen“, „Abbrechen“, × „Schließen“ |
| header *Focus Context* | — | as *Context Below*; sheet „Monatsstand wählen“, rows from `snapshotChoices`, × „Schließen“ |
| list *Focus Item* | — | „Verlauf“, „Details“ (named „Details zu <label>“), „Gewählt“, „Ersetzt“, „Schließen“ |
| alert *Close Target* | — | „Hinweis schließen“, the requester's „Den gewählten Entwurf gibt es nicht mehr, gezeigt wird September 2026 · Fassung 1.“ |

## 8. Stories

All are `lang="de"`. Every new argType gets a `description` and `table.defaultValue`. `returnFocusTo` goes into the modal and confirm meta argTypes with `control: false` and summary `null`. Triggers are `lc-button`s with `(click)="t = $any($event.currentTarget); open = true"`: `clicked` carries no event, and the host is a custom element, so the descendant rule applies.

| Story | Expected ID | Args / content | Shows |
|---|---|---|---|
| Focus return (3.34) | `feedback-modal--return-focus-to` | trigger A „Fassung umbenennen“ → `center` sm modal (Abbrechen / Speichern). Trigger B „Monatsstand wählen“ → `auto` sheet (Übernehmen / Abbrechen, lg, full width). Each has `[returnFocusTo]` set to its trigger. | AC-1/2/5 at 360 (sheet) and 1280 |
| Focus return (3.34) | `feedback-confirmdialog--return-focus-to` | trigger „Fassung löschen“ (danger) → destructive, `buttonSize="lg"`, `placement="auto"`, `[returnFocusTo]`, confirmed/cancelled close it | AC-7 |
| Focus Context (3.34) | `navigation-header--focus-context` | header 1 = the *Context Below* requester header; header 2 = default bar, `inline`, `userName="Johanna Müller"`, with the German labels of header 1; both `[contextName]="month"`. `(contextClick)="opener = h1/h2; sheetOpen = true"`. One `auto` sheet with `lc-list [clickable]` of `snapshotChoices`. `(itemClick)="month = $event.label; sheetOpen = false; opener.focusContext()"` and the modal `(openChange)="sheetOpen = $event; $event ? null : opener.focusContext()"` | AC-8…10. Needs `moduleMetadata` imports of modal and list. |
| Focus Item (3.34) | `data-display-list--focus-item` | `#historyList`: 3 snapshot rows, md, dividers, badge + `selected` on row 1, `action: 'Details'`, `actionAriaLabel`, `actionVariant="outline"`, `actionSize="lg"`. `#choiceList`: `snapshotChoices`, `size="sm"`, `clickable`, dividers. A click opens one `auto` sheet; its close (openChange false and the footer „Schließen“) calls `opener.focusItem(detail.id, part)`. Props are named `historyItems` and `choiceItems`, never like a member. | AC-11/13 |
| Close Target (3.34) | `feedback-alert--close-target` | dismissible alerts with `closeAriaLabel="Hinweis schließen"`: title + icon (requester note); no title; `showIcon=false`; button action „Erneut versuchen“; link action; `actionsLayout="stacked"` (2 buttons); a 240 px column with one default alert and one inside `data-density="compact"` | AC-14 |

## 9. Verification

Measures for the review: open with `trigger.querySelector('button').click()` (no focus, the WebKit case) and wait 400 ms after each step, as in `modal-today.log`. The hit scan is the one in `proto-measure.log`.

| AC | How | Expected value |
|---|---|---|
| 1, 2, 3, 4 | unit (`modal.return-focus.spec.ts`): `body` active at open; ×, Escape, backdrop, `setInput('open', false)`, `closeModal()`, `[(open)]` host; disconnected and removed-while-open target with a focused opener; a `<x-trigger><button>` host; destroy while open; reopen; `push` called once when the input changes while open. Existing focus test unchanged. | `activeElement` = target / inner button / opener; no throw |
| 5 | story `feedback-modal--return-focus-to` at 360 and 1280: A + Escape, A + Speichern, B + ×, B + backdrop | `activeElement` = that trigger's `<button>` (today: `body`) |
| 6 | Playwright WebKit (`webkit-2370` is in `~/Library/Caches/ms-playwright`; no new devDependency): the story, tap or click the trigger, then Schließen / Escape / „Abbrechen“. Otherwise a manual Safari check recorded in `build.md`. | the trigger's `<button>` |
| 7 | unit per path (confirm, cancel, Escape, ×) plus `ConfirmService` with the option. Story: confirm + Abbrechen and + Löschen at 360 and 1280. | `activeElement` = trigger `<button>` |
| 8, 9 | unit (`header.focus-context.spec.ts`): with/without `contextName`; `contextName` changed then called; destroyed before render. Story: header 1 at 360 / 641 / 1280, header 2 at 641 / 1280: context `.click()`, then row „August 2026 · Fassung 2“ `.click()`; the Escape path too. | `activeElement` = that header's `.lc-header__context-info`; `aria-label` contains „August 2026 · Fassung 2“ |
| 10 (and 4, 13) | `--compare=tmp/story-shots/054/baseline` of the header (36), list (54) and modal/confirm (24) baseline stories; `focus()` on the inline context button at 360 | 114/114 identical; `display: none`, focus not moved (measured) |
| 11, 12 | unit (`list.focus-item.spec.ts`): `'row'` on clickable and href, `'action'`; unknown id, plain row, disabled row, no action, custom template, replaced items | target focused; otherwise `activeElement` unchanged, no throw |
| 13 | story at 360 L/D: history row 2 „Details“ `.click()` + Escape; choice row 3 `.click()` + Schließen. `:focus-visible` and the ring as in §5. | action `<button>` / row `[role=button]` focused; ring 4.06–4.37 (L), ≥ 9.13 (D) |
| 14 | hit scan on `feedback-alert--close-target`, *Dismissible*, *Link Action*, *Narrow Column*, *Narrow Layout* at 320 / 360 / 1024 / 1280 | box 28 × 28 (36 at 200 %), hit ≥ 43.5 × 43.5; compact narrow ≤ 3 px past the border |
| 15 | `--compare=tmp/story-shots/054/baseline` on the 25 alert, error-display and density stories (150 shots); hit-vs-action overlap from the scan | r1 with D-5: 84 identical (no ×), and 66 differ, which are exactly the shots with a × (11 stories × 3 widths × 2 themes). `--compare=tmp/story-shots/054/r1-ink-proto` 150/150; FC `--compare=fc0` 6/6. Geometry touching (action right = hit left, 1215.00 at 1280). The hit test gives the × the action's last < 1 px (right − 0.75 → ×, right − 1 → action). Heights equal |
| 16 | Storybook argTypes and the 5 stories above | every argType has `description` + `defaultValue` |
| 17 | FC and dark shots of the new stories; AX: no live region added | unchanged |
| 18 | DE stories at 360: `scrollWidth − clientWidth` of the header and sheet rows | 0 |
| 19 | `check-angular-majors.mjs` | passes, HTML unchanged |
| 20 | changelog (Added ×3 + `ConfirmOptions`, Fixed: alert 28 → 44 target, values above; Known: drawer, sidenav, gallery; compact narrow +3 px); manifest lists `returnFocusTo` | present |

**Risks (from earlier rounds):** the `untracked` read; the environment injector; the `indexOf` pin; story props named like members (043 r2); story IDs come from export names (052); at most 2 parallel story-shots runs (046); the developer's focus measure blurs at the end, so shoot focus separately (036).
