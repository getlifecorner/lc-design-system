# Design 055: lc-textarea / lc-combobox focus(), backlog sweep (9 rows)

- **Status:** ready
- **Spec:** [spec.md](spec.md) — AC-1 … AC-15. Kit 3.34.0 (main 91e23e1); expected release 3.35.0 (minor).

## 1. Approach

Extend seven components; only the alert (AC-13) and the combobox focus ring (D-3) change pixels. Everything else is API, docs or stories.
- **`focus()`** follows `focusTitle()` (next-step-card 3.33): a plain, synchronous public method on the native field, so the requester's `viewChild(…).focus()` works. Both fields style focus with `:focus` / `:focus-within`, not `:focus-visible`, so a call from code shows the same indicator as Tab (measured, §5).
- **`returnFocusTo`** copies `lc-modal` 3.34 (design 054 §2 internals): after the trap's own restore, `afterNextRender` with the `EnvironmentInjector`, `untracked` reads, and the custom-element → first focusable descendant rule.
- **Alert** follows the 3.12 link drop (own row below the text, natural width, text indent) in a container-query band, so the 3.13.1 narrow layout and the 3.3 stacked layout keep their rules.

**Measured today (Chromium, `.click()` without focus = a WebKit tap):** sidenav drawer opened by the header hamburger, then Escape → `body`; with a focused trigger → the trigger. Gallery: thumbnail `.click()`, then ×, Escape or backdrop → **the thumbnail** (3/3), because the gallery captures `event.currentTarget`, not `document.activeElement`.

**Decisions (assumptions, no owner question):**
- D-1 (AC-14, gallery): **no `returnFocusTo` on `lc-gallery`.** Its lightbox opens only from its own thumbnails, and the focus already returns to the clicked or tapped one in WebKit too (measured above), so the input would have no job. The JSDoc says so, and a unit test pins it (thumbnail `.click()` without focus, then ×/Escape/backdrop → the thumbnail). The rule becomes: an overlay the page opens takes `returnFocusTo` (modal, confirm, drawer, sidenav); the gallery returns to its own trigger.
- D-2 (AC-8): **no change to the rail `title`.** On the collapsed rail `.lc-sidenav__nav-label` is `display: none`, so a non-badged item's name comes *from* `title` (removing it gives the name `""`, 5/5 items in *Collapsed Icon Rail*). The accname algorithm doesn't use a tooltip that gave the name as the description. Dropping it would leave these links unnamed (4.1.2). The developer records the CDP AX tree as expected in §9.
- D-3 (AC-5): **the combobox gets the 2 px focus ring** of select, datepicker and (since 3.33, 052 AC-14) textarea. Today a `focus()` on it shows a 1 px border hue change plus the 20 % halo (1.28 L / 1.50 D). The error focus already has the ring. 8 baseline shots change (§9).
- D-4 (AC-13): the threshold is **30rem inside the border** (alerts < 482 px at 100 %, < 962 px at 200 %), the width where the default `md` button "Erneut versuchen" (167 px) plus the × leave the message 200 px (measured 199.0 at a 480 px alert; body = alert − 281 px, so 201 at 482). The dropped button keeps its **natural width**, as the link (3.12) and the narrow layout (3.13.1) do. A full-width band between 16rem and 30rem would make it jump at 258 px. "Reusing the stacked layout" = its mechanism (`order: 1`, full-width row, 4 px margin, text indent).
- D-5 (AC-12): also *Service Call* (same defect: the meta's `position`/`duration` do nothing there). The two meta argTypes get their missing `table.defaultValue`.
- D-6 (AC-7): **documented limit, no CSS fix.** "99+" (37.4 px) must end at the entry's edge: measured offsets are −3.2 px docked and −3.4 px floating from the pill centre. Moving it right would pass the bar's edge again (052).

**Follow-ups found (for `release.md` → Open items, backlog):** F-1 `lc-header` `hamburgerClick` is `output<void>`, so a page can't hand the hamburger to `lc-sidenav` `returnFocusTo` without querying `.lc-header__hamburger button`. F-2 `lc-combobox` has no `announceError` (its error is always `role="alert"`), so a focus moved to it after a 422 reads the error twice. 054-n2 stays (WebKit not installed).

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| method | `TextareaComponent.focus(options?)` | `(options?: FocusOptions) => void` | — | Moves the focus into the native `<textarea>` (3.35), e.g. when a form opens with this field first, or to the field with the error after a rejected save (422) (WCAG 2.4.3). `options` as for `HTMLElement.focus()` (`{ preventScroll: true }`). Shows the same focus ring as a user's focus. A disabled field takes no focus (it stays where it is); a read-only one does. Call it once the field has rendered, e.g. `afterNextRender(() => this.note().focus(), { injector })` with `note = viewChild.required(TextareaComponent)` and the page component's `injector = inject(Injector)`. In an `lc-modal` that opens with the field, that call runs after the dialog moved the focus to its first control. Does nothing before the component has rendered. |
| method | `ComboboxComponent.focus(options?)` | same | — | Moves the focus into the field's `<input>` (3.35), for the same uses. Like a user's focus it opens the list when `openOnFocus` is `true` and there is something to show; with `false` the list stays closed (`aria-expanded="false"`). A disabled field takes no focus. Then the same two sentences on timing as above (`month = viewChild.required(ComboboxComponent)`). |
| input | `lc-drawer` `returnFocusTo` | `HTMLElement \| null` | `null` | Element that gets the focus back after the drawer closed (3.35), instead of the one that had it at open. Set it to the trigger: WebKit (Safari, every iOS browser) doesn't focus a tapped button, so the captured element is `body`. Applied when the panel has left the DOM after its 250 ms slide-out, once the focus trap has restored its captured element. Holds on ×, Escape, backdrop, `open` false, and when the drawer is destroyed while open. A custom-element host that can't take focus (`<lc-button>`) hands it to its first focusable descendant. Ignored when the element is no longer in the document or can't take focus; the captured element then keeps it. `null`: as before. `@default null` |
| input | `lc-sidenav` `returnFocusTo` | `HTMLElement \| null` | `null` | Drawer mode only (`mode="drawer"`, or `docked` below `mobileBreakpoint`): the same as `lc-drawer`, applied after the next render once the panel has left the DOM. Holds on ×, Escape, backdrop, an item or brand tap on a phone (they close it through `closed`), `isOpen` false, and when the sidenav is destroyed while open. Then the same last three sentences. `@default null` |
| JSDoc | `lc-gallery` class | — | — | Append to the focus sentence: "the clicked or tapped thumbnail, also in WebKit, where a tap doesn't focus it, so the gallery needs no `returnFocusTo` (3.35)." |
| JSDoc | `lc-bottom-nav` `moreBadge` | — | — | Append: "Known limit (3.35, 052-n3): '99+' on the last entry of a five-entry bar at 360 px starts 3.2 px (docked) / 3.4 px (floating) left of the pill centre and covers two of the More glyph's three dots; the label and the read badge text still name the entry." |
| JSDoc | `lc-toast-outlet` class (line 43) | — | — | "Bottom stacks show the newest toast nearest the edge (3.33). A top stack shows its assertive region (error, warning) above its polite one (success, info), each oldest first, so a newer error sits above an older success (3.35, 053-n2)." Same sentence in the meta docs §7. |
| JSDoc | `lc-alert` `actionsLayout` + class | — | — | `inline`: add "from 16rem to 30rem inside the border (alerts of 258–481 px at 100 % text, 514–961 px at 200 %) a button action takes its own row below the text, lined up with it, at its natural width (3.35)". |
| CSS hook / type | none | — | — | No new hook, token or type. |

**Defaults unchanged:** both methods and inputs do nothing until used; `returnFocusTo` `null` schedules nothing. The template DOM of every component stays as it is (AC-6). Pixel changes are limited to the 6 alert and 8 combobox shots in §9.

### Internals (binding for the developer)

| Where | Rule |
|---|---|
| textarea / combobox | `focus(options?: FocusOptions): void { this.textareaElement()?.nativeElement.focus(options); }` (combobox: `inputEl`). No `openOnFocus` code: `onInputFocus()` already decides. No readonly input on the combobox (AC-3 applies to the textarea). |
| shared helper | Move `FOCUSABLE` and the descendant fallback out of `modal.component.ts` into `@lifecorner/angular-ui-kit/internal/overlay` (`focus-return.ts`, e.g. `focusReturnTarget(target: HTMLElement): void`). The modal calls it; its specs stay unchanged. |
| drawer | `private readonly environmentInjector = inject(EnvironmentInjector)`. In the close timer, after `_visible.set(false)` and `unlockScroll()`: `if (untracked(this.returnFocusTo)) this.scheduleFocusReturn()`. `ngOnDestroy`: when `_visible()` was true, the same. Callback: `const t = this.returnFocusTo(); if (this.open() \|\| !t?.isConnected) return; focusReturnTarget(t)`. A reopen inside the 250 ms clears the timer, so nothing is scheduled. |
| sidenav | `private readonly drawerOpen = computed(() => this.isOpen() && this.effectiveMode() === 'drawer')`; `private drawerShown = false`. Effect: `open = drawerOpen()`, then `untracked`: open → `drawerShown = true`; else if `drawerShown` → `false` and schedule when `returnFocusTo()` is set. `ngOnDestroy` the same. Callback guard `if (this.drawerShown \|\| !t?.isConnected) return`. Environment injector as above. |
| combobox SCSS (D-3) | `.lc-combobox__input-wrapper:focus-within`: `border-color: var(--color-primary-500); outline: 2px solid var(--color-primary-500); outline-offset: 0; box-shadow: none;` (the halo goes). The error block keeps its outline. Forced colours: add `.lc-combobox__input-wrapper:focus-within` to the selector list of the existing `outline-color: Highlight` rule; keep the error selector in it, because `theme-contrast.spec.ts` (039 `rings`, AC-3) looks it up by name. Add the row `['combobox', '.lc-combobox__input-wrapper:focus-within', primary, '0']` to that table (a new assertion, none edited). |
| alert SCSS (AC-13) | New block after the 3.12 link block: `@container lc-alert (16rem <= width < 30rem)` with `.lc-alert:not(.lc-alert--actions-stacked) .lc-alert__container:has(> .lc-alert__action:not(:empty)):not(:has(> .lc-alert__action > #{$text-link}))` → `flex-wrap: wrap`; its `> .lc-alert__body` → `flex: 1 1 0`; its `> .lc-alert__action` → `order: 1; flex: 1 1 100%; align-self: auto; min-width: 0; margin-top: var(--spacing-1)`. Plus `.lc-alert--with-icon:not(.lc-alert--actions-stacked) .lc-alert__container:not(:has(> .lc-alert__action > #{$text-link})) > .lc-alert__action` → `padding-inline-start: calc(24px + var(--spacing-3))`. **Why a band:** the `:has()` makes these (0,6,1), which would beat the narrow layout's (0,6,0) action rule. The prelude doesn't match the `alert.narrow.spec.ts` pins (`(width < 16rem)` once, `\n.lc-alert__body {`, no `hyphens` outside). No word-breaking declarations. Prototype = `tmp/story-shots/055/alert-proto-measure.js`. |
| toast gap spec (AC-10) | Delete the length + sha1 test. Narrow the global checks to the outlet's rules: `.lc-toast-outlet__stack` (padding 16 + top `calc(16 − 8)`, no `gap`), `.lc-toast-outlet__region` (no padding, margin, gap, `:empty`/`:has` selector), `.lc-toast-outlet__region > lc-toast` (exactly `margin-top: var(--spacing-2)`). Break check: a temporary unrelated rule (`.lc-toast-outlet__probe { color: inherit; }`) passes; `--spacing-3` in the gap rule fails. |

## 3. Anatomy and layout

### 360 px — alert with an inline button (*With Action*, *Close Target* row 4, alert 328, padding 16, border 1)

```
before (3.34)                                after (3.35)
┌ 328 ───────────────────────────────┐      ┌ 328 ───────────────────────────────┐
│ ⓘ  Laden │[Erneut     ] │ × │      │      │ ⓘ  Laden fehlgeschlagen         ×  │ row 1: icon 24 · 12 · body · 12 · × 20
│    fehl- │[versuchen  ] │   │      │      │    Die Vorhaben-Liste konnte nicht │ body 226 wide (258 without ×)
│    ge…   │ 144.3        │   │      │      │    geladen werden.                 │ 14/21 message
│ body 69.7 (101.7 without ×), 220 high │   │    ↕ 12 gap + 4 margin = 16        │
└────────────────────────────────────┘      │    [ Erneut versuchen ] 144.3×35.5 │ row 2 at x 69 = text x, natural width
                                            └────────────────────────────────────┘ alert 149 high (157 / 220 before)
```

### From 1024 px

Unchanged at 100 % text (992 / 1248 alerts are past 30rem; 96 of 102 alert shots hash-identical). At 200 % text the band is 514–961 px, so *Narrow Layout* at 1024 (alert 960) drops its button too, as its link already does below 36rem.

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| alert band | content 256–479.99 px at 100 % | — | `16rem`, `30rem` (container query) |
| dropped action | margin-top 4 + container gap 12; indent 36 with icon, 0 without | button as projected | `--spacing-1`, `--spacing-3`, `24px` icon |
| combobox ring | 2 px solid, offset 0, outside the 1 px border; field 328 × 42 at 360 | — | `--color-primary-500` |
| *Focus on Open* sheet (< 640) / dialog | modal `placement="auto"`, `size="md"`, body pad 24: field 312 wide in a 360 sheet | textarea md 16/24, label 14/500 | modal and field tokens as today |

Drawer, sidenav, textarea, gallery, bottom-nav, toast-outlet and tag-input: no layout change.

## 4. States

| Component | State | Behaviour |
|---|---|---|
| textarea / combobox `focus()` | before render · disabled · readonly (textarea) | no-op, no throw · focus stays · focus taken |
| combobox `focus()` | `openOnFocus` true / false · no options and query < `minChars` | list opens, `aria-expanded="true"` / closed, `"false"`, no listbox · stays closed (`openIfAny`) |
| both | error | error ring (2 px, error colour) as today; `aria-invalid`, `aria-describedby` unchanged |
| combobox ring | rest · hover · focus · × focused · disabled | border as today · text-secondary border · 2 px ring · ring on the field + the ×'s own ring (as the error state today) · no focus |
| drawer | `returnFocusTo` null · set · disconnected · reopened < 250 ms · destroyed open | 3.34 · target after the slide-out · captured element keeps it · nothing scheduled · target after the render |
| sidenav | docked · drawer closed by × / Escape / backdrop / item / brand · drawer → docked (viewport grows) | nothing · target · target, a hidden one ignores `focus()` |
| alert | 16–30rem with button(s) · link · `stacked` · < 16rem · no action | own row · 3.12 rules · 3.3 rules · 3.13.1 rules · unchanged (no wrap) |
| overflow | long German label in the dropped row | wraps inside the button (`.btn` `white-space: normal`, `break-word`); row width 258 at 360 |

## 5. Theming

No new token. Measured with the WCAG formula in the browser (`tmp/story-shots/055/focus-measure.js`, after `.focus()`):

| Element | Light | Dark | Contrast (computed) |
|---|---|---|---|
| textarea ring after `focus()` (2 px, `--color-primary-500`) vs page | `#208497` | `#84c7d4` | 4.37 / 9.95; `:focus-visible` true |
| combobox today after `focus()`: 1 px border / 20 % halo | `#208497` | `#84c7d4` | border 4.37 / 9.95, halo 1.28 / 1.50 (036) |
| combobox ring (D-3) vs page · vs modal ends (`--gradient-surface`) | `#208497` | `#84c7d4` | 4.37 / 9.95 · min 4.18 / 7.58 (surface-2 end, 037) |
| combobox error ring after `focus()` | `#9d0e0e` | `#f7a1a1` | 8.39 / 9.48 (unchanged) |
| alert | unchanged colours | | the 6 differing shots move boxes only |

## 6. Accessibility

- **2.4.3:** `focus()` lets a form start in its first field and return to the invalid one; `returnFocusTo` returns to the trigger after the drawer/sidenav close (WebKit). **2.4.7 / 1.4.11:** every field the methods reach shows a 2 px ring ≥ 4.18:1 (D-3).
- **Roles and names (AC-15):** unchanged everywhere; AC-8 changes nothing (D-2). No `tabindex` changes, no new stops.
- **Announcements:** none added. In the 422 pattern the focus reads the error through `aria-describedby`; the story sets `[announceError]="false"`, so it isn't read twice (F-2 for the combobox).
- **forced-colors:** combobox ring `Highlight`; the alert band paints nothing. **Reduced motion:** nothing animated; the drawer's 250 ms is a timer, as today.
- **Targets:** no target changes; the dropped alert button keeps its height (sm 35.5, as before).

## 7. Texts

No new built-in strings. Story strings (all `lang="de"` except the EN alert):

| Story | DE (shown) |
|---|---|
| textarea *Focus on Open* | „Oktober 2026 freigeben“ (trigger and title), „1 Warnung: Kostenstelle 4711 hat keinen Plan.“, label „Vermerk“, helper „Begründet die Warnung, höchstens 500 Zeichen.“, error „Bitte schreiben Sie einen Vermerk.“, „Freigeben“, „Abbrechen“, × „Schließen“ |
| combobox *Focus on Open* (both) | „Monat einfrieren“ (trigger and title), label „Monat“, placeholder „Monat suchen …“, options Oktober 2026 „Noch nicht eingefroren“, September 2026 „Entwurf vorhanden“, August 2026 „Fassung 1 freigegeben“, Juli 2026 „Fassung 2 freigegeben“; „Keine Treffer“, „Auswahl löschen“, „Einfrieren“, „Abbrechen“, „Schließen“ |
| drawer *Focus return* | „Filter“ (trigger, heading), „Filter schließen“, „Nur offene Vorgänge“, „Anwenden“, „Zurücksetzen“ |
| sidenav *Focus return* | trigger `ariaLabel` „Navigation öffnen“, `ariaLabel` „Hauptnavigation“, „Navigation schließen“, items Übersicht, Monatsstand, Kostenstellen, Einstellungen |
| alert *Inline Action, Narrow* | as §8; EN alert „Connection lost“, „We couldn't reach the server.“, „Try again“, „Dismiss“ |

## 8. Stories

Demo components live in the story files (as in toast-outlet). Triggers are `lc-button`s passing `$any($event.currentTarget)`; open methods run `afterNextRender(() => this.field()?.focus(), { injector })` with the demo's `inject(Injector)`. Demo stories that ignore the meta args set `parameters.controls` (`disable: true`, or `include` the one working arg), so no dead control shows (053-n3).

| Story | Expected ID | Args / content | Shows |
|---|---|---|---|
| Focus on Open (3.35) | `form-textarea--focus-on-open` | trigger → `lc-modal placement="auto" size="md"` `[returnFocusTo]` + `[closeOnBackdropClick]="false"`; textarea `required`, `rows` 4, `maxLength` 500, `showCharacterCount`, `[announceError]="false"`. „Freigeben“ with empty text sets the error, then focuses the field after the render; with text it closes. `play` (story view): `.click()` the trigger's `<button>` | AC-1, AC-4, AC-5 |
| Focus on Open (3.35) | `form-combobox--focus-on-open` | `openOnFocus` arg `false` (argType: boolean, description, `table.defaultValue` `'true'` = the input's default; `controls.include: ['openOnFocus']`); same modal pattern; `play` as above | AC-2, AC-4, AC-5: list closed |
| Focus on Open, List Opens (3.35) | `form-combobox--focus-on-open-list-opens` | the same with `openOnFocus: true` | list open above the sheet |
| Inline Action, Narrow (3.35) | `feedback-alert--inline-action-narrow` | `lang="de"` column, gap 16: error „Laden fehlgeschlagen“ + sm „Erneut versuchen“ + × „Hinweis schließen“; warning „Entwurf nicht gespeichert“ + md „Jetzt speichern“, no ×; info, no title, „Für Oktober 2026 gibt es eine neue Fassung.“ + lg „Neue Fassung ansehen“ + ×; `lang="en"` error with sm „Try again“ + ×; then the first alert in boxes of 481 and 482 px (`max-width: 100%`) | AC-13: band at 360, inline from 1024, threshold |
| Focus return (3.35) | `feedback-drawer--return-focus-to` | trigger „Filter“ → `heading="Filter"`, `[returnFocusTo]`, `(closed)` closes; body: one lc-checkbox, „Anwenden“ (closes), „Zurücksetzen“ | AC-14 |
| Focus return (3.35) | `navigation-sidenav--return-focus-to` | `layout: 'fullscreen'`; bar with icon-only trigger „Navigation öffnen“; `mode="drawer"` DE items, `[returnFocusTo]`, `(closed)` closes | AC-14 |
| Keyboard Focus (changed) | `form-tag-input--keyboard-focus` | `render` with `lang="de"` on `lc-tag-input`, args bound; description adds the hyphen („Kostenstellenverant-/wortung“, chip 186 × 45.2) | AC-9 |
| More Badge, Three Characters (text) | `navigation-bottom-nav--more-badge-three-characters` | description adds the D-6 limit sentence | AC-7 |
| outlet *Offsets*, *Bottom Stack Order*, *Stack Spacing*, *Service Call* | unchanged IDs | `argTypes: { position: { table: { disable: true } }, duration: { table: { disable: true } } }` | AC-12 |

`returnFocusTo` joins the drawer and sidenav meta argTypes with `control: false`, a description and `table.defaultValue` `null`. *With Action* and the `actionsLayout` argType text mention the band.

## 9. Verification

Baselines (main 91e23e1, 800 ms wait): `tmp/story-shots/055/baseline` = A: 17 alert stories, 360/1024/1280 L/D, `--full` (102); B: combobox 14, drawer 6, sidenav (drawer-mode, text-brand-drawer-german, responsive-mobile, collapsed-icon-rail, collapsed-rail-badges), toast-outlet 7, tag-input 9, bottom-nav more-badge-three-characters, 360/1280 L/D (168). **Unstable at rest (two runs):** drawer filter-panel 360 L + 1280 L, large-form 1280 L, sidenav drawer-mode 1280 D, text-brand-drawer-german 360 D + 1280 D, collapsed-rail-badges 360 L; check those by measure, not hash.

| AC | How | Expected value |
|---|---|---|
| 1, 3 | unit: `viewChild(TextareaComponent).focus()`; before render; disabled; readonly; `preventScroll` passed | `activeElement` = inner textarea; no throw; unchanged; textarea |
| 2, 3 | unit, `openOnFocus` true/false, disabled | open + `aria-expanded="true"` / closed, `"false"`, no listbox |
| 1, 2 (pattern) | stories at 360/1280: after `play`, and again after „Abbrechen“ + reopen | `activeElement` = the field (not the modal ×); combobox `aria-expanded` false / true; list painted above the sheet (`elementFromPoint` on an option) |
| 4 | Storybook argTypes / controls panel of the 3 stories | description + `defaultValue`; textarea no controls, combobox only `openOnFocus` |
| 5 | `focus-measure.js` on the new stories 360/1280 L/D | outline 2 px `#208497` / `#84c7d4`, ≥ 4.18 / 7.58 vs the sheet |
| 6, 15 | existing specs unchanged; compare B | B: 8 differ = `proto-b` (combobox panel-language, opens-above ×4), 4 differ tag keyboard-focus (`proto-tag` 186 × 45.2), 7 unstable, the rest identical |
| 7 | grep JSDoc + story text | D-6 sentence with −3.2 / −3.4 |
| 8 | CDP `Accessibility.getFullAXTree` on *Collapsed Icon Rail* (or the dom-accessibility-api probe of D-2), recorded in `build.md` | rail links: name = label from `title`, no description; badged: "<label> <value>" (3.33); no change |
| 9 | compare B | keyboard-focus 4/4 differ; chip 186 × 45.2, two lines with a hyphen at 360 |
| 10 | spec run + the two break checks of §2 | pass / pass / fail |
| 11 | grep `toast-outlet.component.ts` and the stories meta | new sentence in both; order spec unchanged |
| 12 | controls panel of the 4 stories | no `position` / `duration` rows |
| 13 | compare A; `alert-proto-measure.js` geometry; new story at 360/1024/1280 L/D | A: 96 identical, 6 differ (with-action 360 L/D, close-target 360 L/D, narrow-layout 1024 L/D) = `proto-alert` 6/6. At 360 body 258 (no ×) / 226 (×), button x 69 = text x, row 16 below the body, alert 149. 481 box dropped, 482 inline. `scrollWidth − clientWidth` 0 in DE and EN |
| 14 | unit per component (paths of §2; disconnected target; reopen < 250 ms; destroy while open; `<x-trigger><button>`); gallery WebKit test (D-1); stories at 360/1280: trigger `<button>.click()` (no focus), then × / Escape / backdrop / „Anwenden“ / item | `activeElement` = the trigger's `<button>` (today `body`); gallery → thumbnail |

**Risks (memory):** CDK's initial focus is an `afterNextRender` on the root injector, so a page hook on the *environment* injector runs before it and loses; with the component's node injector it runs after (Angular 22 adds view-bound hooks at the end of the view's refresh): the stories prove it. `:has()` weight (0,6,1) vs the narrow (0,6,0). Story IDs come from export names (052). At most 2 parallel story-shots runs (046). Brace-free measures (036).
