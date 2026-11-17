# Design 063: lazy tree rows, chart gaps and dashes, one-line textarea, alert dialog and hooks, menu sections, number string mode, icon size hook, theme scopes

- **Status:** ready · **Spec:** [spec.md](spec.md), AC-1 to AC-33 · **Measured on:** the 10:37 Storybook build (3.42.0), logs `tmp/story-shots/063/d1–d4.log`

## 1. Approach

All eight items extend existing components. No new component and no new entry point.

| Item | Extends | Pattern followed |
|---|---|---|
| A lazy tree rows | `lc-table` tree mode | The same chevron, keys and `rowToggle`. "Expandable" now means loaded children **or** a truthy `hasChildrenKey` field |
| B gaps, dashes | `lc-line-chart` | `null` splits a series into segments, each drawn with the existing `linearPath`/`smoothPath` (`internal/chart` paths unchanged). The dash is a stroke-width multiple, like the existing grid `3 3` |
| C one line, footer | `lc-textarea` | lc-input already renders its footer only on demand. One-line mode drops the 4–7 rem floor |
| D role, hooks, yellow | `lc-alert`, themes | The hooks follow the badge/chip pattern: a private `--_lc-alert-*` on the variant and a public `var(--lc-alert-*, …)` that the kit never declares, so a value on an ancestor wins. Accents live in tokens.json and are mirrored in both themes |
| E sections | `lc-menu`, `MenuItem` | `children` makes an item a section, as in `NavigationItem`. The heading uses the sidenav section-title recipe |
| F string mode | `lc-number-input` | The existing sanitiser, locale separator and steppers, with decimal arithmetic on strings (BigInt) |
| G 18 px | `lc-icon` | A size hook in the style of `--lc-*` hooks. It is not inherited (private `@property` registration, as accordion, device frame and toast do) |
| H light scope | `_theme-light/-dark.scss` | `.lc-header--light` already re-declares the full colour set. The scope classes join those selector lists, so the CSS grows by about 0 kB |

## 2. Public API

| Kind | Name | Type | Default | Description (JSDoc) |
|---|---|---|---|---|
| input (table) | `hasChildrenKey` | `string \| undefined` | `undefined` | Row field that marks a tree row as expandable before its children are loaded. When the field is truthy, the row shows the chevron with `aria-expanded="false"` and opens without children. The first open emits `rowToggle`, and the page then adds the children to `data`. The row starts collapsed whatever `defaultExpanded` says. A row whose loaded children are removed returns to this state. Announce the loading in the page (`role="status"`); the table shows no loading state. |
| type field | `LineChartSeries.data` | `(number \| null)[]` | — | One value per label. `null` means no value: no point, and the line breaks there. A lone value between two gaps is drawn as a dot, also with `showDots` false. `NaN` and `undefined` are drawn as 0, as before. |
| type field | `LineChartSeries.dashed` | `boolean?` | `false` | Draws the series dashed, in its colour: dashes 3 × and gaps 2 × `strokeWidth` (6/4 px at the default 2), in the plot and in the legend swatch. To join a forecast to the actuals, repeat the last actual value at the forecast's first index. |
| input (textarea) | `rows`, `minRows` | unchanged | `3`, `3` | JSDoc addition: `rows` 1, or `minRows` 1 with `autoResize`, is the one-line mode. The field is one line plus padding (md 50 px), with no 4–7 rem floor, and with `autoResize` it grows to `maxRows`, then scrolls. |
| input (alert) | `role` | `AlertRole \| undefined` | `undefined` | Role of the alert. Unset: `alert` for error and warning, `status` otherwise (as before). `alertdialog` is a blocking question. It is named by the title (`aria-labelledby`) and described by the message (`aria-describedby`), it is not a live region, focus moves to it when it shows, and focus returns to the element that had it when the alert hides or is destroyed. Put the decisions in `slot="action"`. |
| type | `AlertRole` | `'alert' \| 'status' \| 'alertdialog'` | — | Exported from `@lifecorner/angular-ui-kit/alert`. |
| CSS hook | `--lc-alert-bg` | colour | variant tint (info `rgba(59,101,136,.16)`, success `rgba(142,164,117,.12)`, warning `rgba(225,160,64,.14)`, error `rgba(157,14,14,.14)`) | The background. On the alert or any ancestor. |
| CSS hook | `--lc-alert-border` | colour | variant border (info `.42`, success `.40`, warning `.42`, error `.45` of the same hue) | The 1 px border. |
| CSS hook | `--lc-alert-fg` | colour | `var(--color-text-primary)` | Title and message ink. |
| CSS hook | `--lc-alert-icon` | colour | `--lc-alert-fg` if that is set, else `var(--color-on-<variant>-subtle)` | The icon ink ("icon colour follows"). |
| token | `--color-accent-yellow` | colour | light `#867200`, dark `#e8c547` | A yellow between warning and neutral, for severity scales. It works as an ink, border or mark, and its tint is 16 % (`color-mix(in srgb, var(--color-accent-yellow) 16%, transparent)`). No alert variant uses it. tokens.json `color.accent.yellow` `#867200` and `color.accent.yellow-bright` `#E8C547` (the dark theme's value). |
| type field | `MenuItem.children` | `MenuItem[]?` | — | Makes the item a section. Its `label` is a heading that cannot be focused or activated, and `children` are its items, in a group named by the heading. One level: `children` of a member are ignored. On a section, `icon`, `href`, `variant`, `disabled` and `metadata` are ignored, and `dividerAfter` draws the divider after the whole group. |
| type field | `MenuItem.indentChildren` | `boolean?` | `false` | Indents the section's items by one step (md 16, sm 12, lg 20 px). |
| input (number) | `valueType` | `NumberInputValueType` | `'number'` | `'string'` keeps the typed decimal as text. The model (forms) and `stringValueChange` carry a string with `.` as the separator (`"1.50"`, a 20-digit id), and `null` when the field has no digit. No value passes through a double. The steppers add `step` in decimal and keep the larger scale (`"1.50"` + 0.5 → `"2.00"`). Blur clamps an out-of-range value to `min`/`max` at the value's scale and never rewrites a value in range. `locale` only changes the shown separator („1,50“). `valueChange` (number) does not emit in this mode. |
| type | `NumberInputValueType` | `'number' \| 'string'` | — | Exported. |
| output | `stringValueChange` | `string \| null` | — | The value in `valueType="string"` mode, on every change. |
| CSS hook (r1) | `--lc-number-input-value-width` | length | the size's width (xs 3rem, sm 3.5rem, md 4rem, lg 4.5rem) | Width of the value box between the steppers, on the `lc-number-input` or any ancestor. Size it for the longest value, e.g. `calc(7ch + 0.5rem)` for „1250,00“ or `calc(20ch + 0.5rem)` for a 20-digit id (the digits are tabular, so 1ch is one digit). |
| CSS hook | `--lc-icon-size` | length | the `size` (xs 16, sm 20, md 24, lg 32, xl 40 px) | Box size of one icon, e.g. `18px` for a dense rail. Set it on the `lc-icon` element (a class or a selector). It does not inherit, so a value on a container does not reach the icons inside. The svg's `width`/`height` attributes keep the `size`, and the drawn box follows the hook. |
| SCSS mixin | `light-theme-tokens` | — | — | Public counterpart of `dark-theme-tokens`: every light token (colours, spacing, type). `:root, :root.light` include it, and its output is unchanged. `-light-theme-colors` stays. |
| global class | `.lc-theme-light` / `.lc-theme-dark` | — | — | Theme scope: the full light or dark colour set on any element and its subtree (the same values as `:root.light` / `:root.dark`), plus `color: var(--color-text-primary)` and `color-scheme`. Scopes nest. They set no background: components paint their own. |

**Defaults unchanged:** A without `hasChildrenKey` "expandable" = `children.length > 0` · B numbers only and no `dashed`: one segment = the same `d`, same summary, no dash attribute or class · C the floor stays for `rows`/`minRows` ≥ 2; the removed empty footer is the one visible change, **−8 px host height** (the wrapper gap; default md 141 → 133, every size −8), goes to *Changed* · D `role` unset = computed role, hooks resolve to today's values (§5) · E no `children` = the same items DOM · F `valueType` `'number'` · G hook unset = same px · H the `:root` rules only gain `--color-accent-yellow`.
**Fixes that come along (invisible at rest, hash-neutral):** A chevron hit area (§6) · B forced-colours legend swatches (§6) · C auto-resize: the computed height adds the 2 px border (the field is `border-box`, `scrollHeight` excludes it), and a field capped at `maxRows` scrolls (`overflow-y: auto`; today `hidden` makes the rest unreachable).

## 3. Anatomy and layout

### 360 px

```
A  Budgets mit Planposten (caption)               sm: td pad 8/12, 12 px text
   ┌ 328 ─────────────────────────────────────┐
   │ Budget             Plan (€)      Ist (€) │
   │ ▸ IT-Betrieb        120.000      98.400  │  lazy, aria-expanded=false
   │ ▾ Lizenzen           80.000      81.200  │  opened, no children yet: same height, no extra row
   │   ▸ (children appear here when the page adds them, x +20 per level)
   │   Beratung           20.000      15.000  │  not expandable: text at the chevron slot +20
   └──────────────────────────────────────────┘  chevron 20×20 at x = cell pad (12); hit 32×36 (sm)
   Planposten werden geladen …   ← the page's role=status, not the table's

B  Kosten in Tsd. €
   55┤                           ●╌╌●╌╌●     Prognose: dashed 6/4, butt caps, primary-500
   50┤ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─       Plan: solid, secondary-500
   45┤   ●──●──●──●──●──●──●──●──●           Ist: solid, primary-500, ends at Okt
     Jan Feb Mär … Okt Nov Dez               plot 328 wide (PL 40, PR 10)
     ── Plan   ── Ist   ╌╌ Prognose          swatch 16×3, dashed = 6 on, 4 off, 6 on

C  Nachricht                                  label 14/500
   ┌──────────────────────────────┐ ┌────┐
   │ Nachricht schreiben …        │ │ ➤  │    md field 50 = 24 lh + 2×12 pad + 2 border; button lg icon-only 45.6 (r1)
   └──────────────────────────────┘ └────┘    grows +24 per line to maxRows 5 (146), then scrolls; button bottom = field bottom
   one line: xs 36 · sm 43 · md 50 · lg 57 px; no footer row, no 8 px gap and (r1) no 6 px line gap below: hosts 65/72/79/86

D  ┌ (!) Ungespeicherte Änderungen ──────────┐  role=alertdialog, tabindex=-1, focused ring 2 px
   │     Das Fenster hat ungespeicherte …     │  actionsLayout=stacked: < 576 px one per line,
   │     [ Abbrechen                       ]  │  full width, 8 px apart (existing rule)
   │     [ Trotzdem schließen              ]  │
   └──────────────────────────────────────────┘
   ┌ (●) In Aufnahme – Ihr Vorgang …  ────────┐  hooks: violet tint, border, icon
   ┌ (!) Mittel – Wartung geplant …   ────────┐  hooks: yellow tint 16 %, border and icon

E  ┌ min 220 ──────────────────┐  panel pad 8 (md)
   │ DIESE ANSICHT             │  heading 12/600, uppercase, .05em, lh 18; pad 8/16/4 = 30 px
   │ [□] Spalten anpassen      │  item 44 (pad 12/16), icon x+16, label x+48
   │ [□] Ansicht zurücksetzen  │
   │───────────────────────────│  divider (dividerAfter on the section) 1 px, margin 8
   │ EXPORTIEREN               │
   │     [□] Als CSV-Datei     │  indentChildren: pad-inline-start 32 (md) · 24 (sm) · 40 (lg)
   └───────────────────────────┘  sm: heading pad 4/12/2 = 24 px; long words wrap in the label
```

### From 1024 px

Component-level layouts: only widths change. Table columns widen (tree content 609 px at md, 1280); the chart plot fills its 500 px host; the textarea field widens; from 576 px the alert's stacked actions sit side by side; the menu panel stays at its min-width of 220.

| Element | Spacing / size | Type | Token |
|---|---|---|---|
| A chevron and indent | 20 × 20, indent `indentSize` 20 | — | as today |
| B dash | `3·sw 2·sw`, `stroke-linecap: butt` on dashed paths only | — | constant `chartDashArray(sw)` in `internal/chart` |
| B legend dashed swatch | 16 × 3, `repeating-linear-gradient(90deg, currentColor 0 6px, transparent 6px 10px)`, `color` = the series colour | — | — |
| C one-line field | min-height 0 and (r1) `display: block`, so the host ends at the field (the inline-block `<textarea>` left a 6 px line gap; multi-line modes keep it, AC-15). `rows` attribute 1 also with `autoResize`, so SSR is one line (HTML's default is 2) | size font and line height | `--line-height-base` |
| E heading | see the wireframe | `--font-size-xs`, `--font-weight-semibold` | `--color-text-secondary` |
| G icon box | `width/height: var(--_lc-icon-size, <size px>)`, `:host { --_lc-icon-size: var(--lc-icon-size) }`, `@property --lc-icon-size { syntax: '*'; inherits: false }` | — | — |

## 4. States

| Item | States |
|---|---|
| A | **Lazy collapsed:** chevron right, row semibold (`--group` as parent rows). **Lazy open, no children:** chevron down, `aria-expanded="true"`, no extra row. **Children added:** rendered indented with no second `rowToggle`. **Children removed:** lazy again, chevron stays, expansion as last set. **Hover and focus:** as today. Filter and sort keep the row and its chevron. **Long German names:** wrap in `__tree-content` (existing `min-width: 0`). |
| B | **All `null`:** no path, no dots, legend entry stays, summary "(12 points with no value)". **All series `null`:** scale [0, 1], as for empty data. **Lone value:** dot r 3. **Filled with gaps:** one area per segment. **Dashed + smooth:** the dash follows the curve. **Hover dot** r 5, as today. |
| C | **One line, empty:** one line. **Typing:** grows up to `maxRows`, then `overflow-y: auto`. **Error, helper, counter:** footer appears; error replaces helper, as today. **Disabled and readonly:** as today. |
| D | **alertdialog:** host `:focus-visible` ring (`focus-ring` mixin, 2 px, offset 2). **Dismiss:** focus returns. **Hidden then shown again:** focus moves in again. **Hook colours:** the × hover keeps the variant tint. |
| E | **Heading:** no hover, no focus, `cursor: default`. **Disabled member:** as today (skipped, opacity .5). **Danger member:** as today. **Empty section** (`children: []`): heading only, no group role. **Long German heading:** wraps (no nowrap). |
| F | **Typing `1,5` (DE):** shows „1,5“, model `"1.5"`. **`-` or `,` alone:** model `null`. **Blur in range:** text unchanged. **Out of range:** clamp at the scale (`12.50`, max 10 → `"10.00"`). **Disabled and invalid:** as today. |
| G | **Hook unset:** today's px. **Hook on a container:** no effect (documented). Firefox < 128 has no `@property`, so the hook inherits there. |
| H | Scopes nest: a `.lc-theme-dark` trigger inside a `.lc-theme-light` menu inside a `.lc-theme-dark` rail. |

## 5. Theming

| Element | Light | Dark | Contrast (computed, `d2`/`d3`) |
|---|---|---|---|
| B Ist / Prognose `--color-primary-500` | `#208497` | `#84c7d4` | 4.37 on white · 9.95 on bg `#0a121b`, 9.13 on surface |
| B Plan `--color-secondary-500` | `#7097af` | `#afc7cf` | 3.12 on white · 10.66 on bg (dashes ≥ 3:1) |
| D alert hooks at rest = today | text `#111827`, icons on-*-subtle `#27445c`/`#5f7150`/`#855a22`/`#6b0909` | `#f1f6f8`, `#b8cee0`/`#a9bb93`/`#e1a040`/`#f7a1a1` | unchanged (measured `d1`) |
| D `--color-accent-yellow` (new) | `#867200` (hue 51°) | `#e8c547` (hue 47°) | L: 4.75 on white, 4.55 on `#f9fafb`, 3.87 on its 16 % tint `#ece8d6`; text-primary on the tint 14.46. D: 10.29 on surface, 11.22 on bg, 8.54 on raised, 9.64 on floating, (r1) 7.26 on its 16 % tint over surface, 8.13 over bg; text-primary on the tint 11.20 (12.53 over bg) |
| D story violet (consumer values) | icon/border `--color-accent-violet` `#4e3f84`, bg 12 % | `#a38fc4`, bg 18 % | L: 8.87 on white, 7.30 on the tint, text 14.61 · D: 5.99 on surface, 4.51 on the tint, text 11.94 (accent-purple `#866aa0` is only 3.10, so it is not used) |
| E heading `--color-text-secondary` on the panel gradient | `#4b5563` on `#fff`→`#f9fafb` | `#c4d2d9` on `#1a2c3a`→`#101c26` | 7.56 / 7.23 · 9.26 / 11.16 |
| H light panel in a dark scope | items `#111827` on `#fff` | — | 17.74 (the panel must equal a light-page menu: measured at review) |

The new token `--color-accent-yellow` is in tokens.json, both theme files, colors.mdx (*Accent Colors*: a 6th tile and one sentence on the per-theme value and the tint recipe) and `theme-contrast.spec.ts` (block "3.43 (request 063)"): text-primary on the 16 % tint over the surface ≥ 4.5, and yellow on the surface and on its tint ≥ 3, in both palettes.

## 6. Accessibility

| Item | Semantics, keys, targets |
|---|---|
| A | `aria-expanded` on the row and the chevron follows "expandable". Keys as the existing tree: → expands a collapsed lazy row (one `rowToggle`); → on an open lazy row without children does nothing (no first child, no `preventDefault`); ← collapses; Enter emits `rowClick` and Space selects, unchanged. `[(expandedIds)]` also lists open lazy ids (`nextExpandedIds` takes ids with children ∪ lazy ids). **Chevron hit area (every tree row):** a transparent `::before`, start −12 px, end 0 (never over the content, so a link there keeps its clicks), block −12 px (md/lg) or −8 px (sm). That gives 32 × 44 (md/lg) and 32 × 36 (sm, within the ≥ 37 px row), paint unchanged. 2.5.8 (24 px) is met; the dense-table exception to 44 px is as for the select cell (043). |
| B | `role="img"` + `aria-label` summary. With gaps: `<name> (<n> points, <k> with no value, <min> to <max>)`; singular `1 point`; all null `<name> (<total> points with no value)`. The dash is never the only cue: the legend names each series. Forced colours: the legend swatches get `forced-color-adjust: none` (measured `d4`: today the swatch background is forced to Canvas, `#fff`/`#000`, and vanishes; the SVG strokes keep their colours). |
| C | `aria-describedby` and `role="alert"` on the error, unchanged. No footer means no empty node. |
| D | `alertdialog`: name from the title id (fallback `ariaLabel`), description from the content id, `aria-live` removed, no `aria-modal`, host `tabindex="-1"`. Focus moves to the host in `afterNextRender` when it shows (initial render with `visible` included; browser only), which reads the title and message, and Tab reaches the actions. The opener is remembered and restored on hide or destroy if focus is inside the alert or on `<body>` and the opener is connected. No Escape handling (a non-modal question; the actions decide). Forced colours: the 1 px solid border stays (measured `d4`: CanvasText, 1 px; a hook value is forced the same way). |
| E | `<div role="group" aria-labelledby="<heading id>">`. The heading `<div id aria-hidden="true">` is visible text that names the group but is not read twice. Roving focus runs over the flat list of actions in visual order across sections, skipping headings and disabled items, with wrap-around (Arrow, Home, End). lc-menu has **no type-ahead** today, so there is nothing to skip, and this request adds none. Items keep 44 px at md. |
| F | No new controls; steppers and labels as today. The `<input>` stays `type="text"`, `inputmode` follows the step (`numeric` for an id). |
| G | Decorative or labelled as today. The hook changes the size only. |
| H | `color-scheme` lets native controls follow the scope. The contrast of a light panel equals a light page. |

Reduced motion: no new motion (the alert's existing fade, the menu's slide).

## 7. Texts

| Key / input | EN default | DE (verified in the stories) |
|---|---|---|
| chart summary, gap part | `<n> points, <k> with no value` · `<n> points with no value` | through `ariaLabel`: „Liniendiagramm, Kosten in Tausend Euro: Plan (12 Werte, 40 bis 50), Ist (10 Werte, 2 ohne Wert, 38 bis 52), Prognose (3 Werte, 9 ohne Wert, 52 bis 55)“. No chart has a locale input; `ariaLabel` is the existing label input |
| table `expandRowAriaLabel` / `collapseRowAriaLabel` | (existing defaults are German: `Aufklappen:` / `Einklappen:`) | the EN story sets `Expand:` / `Collapse:`. The German default stays (changing it would change behaviour); the release-manager routes it to the backlog |
| number steppers | `Decrease value` / `Increase value` | „Wert verringern“ / „Wert erhöhen“ |
| alert, menu, textarea, icon | no new built-in text | story texts below |

## 8. Stories

| Story | Expected ID | Args / content | Shows |
|---|---|---|---|
| Tree Lazy Rows | `data-display-table--tree-lazy-rows` | md, EN, `hasChildrenKey="hasPlanItems"`, the page adds 3 children 500 ms after `rowToggle` and writes "Loading plan items…" / "3 plan items loaded" to a `role=status` | AC-1 to AC-4 |
| Tree Lazy Rows (DE) | `data-display-table--tree-lazy-rows-de` | **sm**, caption „Budgets mit Planposten“, rows IT-Betrieb, Lizenzen, Hardware (lazy), Beratung (no plan items); status „Planposten werden geladen …“ | AC-6 |
| Gaps And Forecast | `charts-line-chart--gaps-and-forecast` | EN, 12 months, Plan, Actual `[38,41,43,null,45,null,44,49,50,52,null,null]` (lone May), Forecast `[null×9,52,54,55]` dashed, legend, height 240 | AC-7 to AC-10 |
| Gaps And Forecast (DE) | `charts-line-chart--gaps-and-forecast-de` | Jan–Dez, Ist `[38,41,43,40,45,47,44,49,50,52,null,null]`, Prognose dashed, German `ariaLabel` (§7), caption „Kosten in Tsd. €“ | AC-12 |
| One Line | `form-textarea--one-line` | xs–lg with `rows=1`, one with `minRows=1 autoResize maxRows=5` and 7 lines of prefilled text (capped, scrolls) | AC-13 |
| One Line Chat (DE) | `form-textarea--one-line-chat-de` | composer: label „Nachricht“, placeholder „Nachricht schreiben …“, `rows=1 autoResize maxRows=5`, lc-button icon-only **`size="lg"`** (r1: 45.6 px ≥ 44) „Senden“ beside it, end-aligned | AC-13, AC-14 |
| Blocking Question | `feedback-alert--blocking-question` | EN, opener button "Close window"; `role="alertdialog"`, warning, title "Unsaved changes", actions Cancel / Close anyway, stacked | AC-16 |
| Blocking Question (DE) | `feedback-alert--blocking-question-de` | „Fenster schließen“ → „Ungespeicherte Änderungen“, „Abbrechen“ / „Trotzdem schließen“ | AC-16 |
| Custom Colors (DE) | `feedback-alert--custom-colors-de` | „In Aufnahme“ (violet via hooks, §5) and „Mittel – Wartung geplant“ (yellow: bg 16 % tint, border and icon `--color-accent-yellow`), theme-specific values in the story's own styles | AC-18, AC-20 |
| Sections (DE) | `navigation-menu--sections-de` | „Diese Ansicht“ (2 items, `dividerAfter`) + „Exportieren“ (`indentChildren`, 2 items, one disabled), open | AC-24 to AC-26 |
| Light Panel In Dark Scope | `navigation-menu--light-panel-in-dark-scope` | `.lc-theme-dark` rail (240 × 320) → `lc-menu.lc-theme-light` → trigger `.lc-theme-dark`, open, DE labels | AC-28 |
| String Mode | `form-number-input--string-mode` | EN, "Amount" `"1.50"` step 0.5, "Case number" `"12345678901234567890"` with (r1) `--lc-number-input-value-width: calc(20ch + 0.5rem)`, model shown in an `<output>` | AC-21 |
| String Mode (DE) | `form-number-input--string-mode-de` | `locale="de-DE"`: „Betrag“ „1,50“; invalid (`error` „Bitte einen Betrag von 0 bis 1.000 eingeben.“); disabled; (r1) the three fields with `--lc-number-input-value-width: calc(7ch + 0.5rem)` | AC-22, AC-23 |
| Size Hook | `components-icon--size-hook` | a dense rail of 5 rows, icons `size="sm"` with `style="--lc-icon-size: 18px"`, next to sm (20) and xs (16) references; a wrapper with the hook showing it does not inherit | AC-27 |

Every new story has argTypes with `description` and `table.defaultValue` for the new inputs (AC-32).

## 9. Verification

| AC | How | Expected value |
|---|---|---|
| 1–4 | unit (table spec) | AC-1: arrow and row `aria-expanded="false"` even with `defaultExpanded` true. AC-2: one emit; open with 0 children gives the same `tr` count; after `data` grows, the children are at depth 1 with no second emit. AC-3: → ← keys; → on an open childless row is a no-op. AC-4: preloaded children follow `defaultExpanded`, and after removal the chevron stays. `expandedIdsChange` contains a lazy id |
| 2, 6 | story `-de` 360/1280 L/D + measure | lazy row height = sibling root row height (±0.5) before and after opening, before children; `tr` count +3 after 500 ms; child content x = parent content x + 20; `scrollWidth` 360; axe 0; chevron hit 32 × 36 by `elementFromPoint` |
| 5, 11, 17, 22 | existing specs unmodified | green; the baseline hashes of all table, line-chart, alert, menu, number-input and icon stories identical |
| 7–10 | unit (chart spec) | `d` has one `M` per segment; the lone point gives 1 dot with `showDots` false; scale from finite values only; all-null: 0 paths, no throw; summary strings as in §6; dashed path `stroke-dasharray="6 4"`, `butt` |
| 9, 12 | story 360/1280 L/D + measure | computed `strokeDasharray` `6px, 4px` on Prognose; the dashed swatch background is a gradient; contrast as in §5; axe 0 |
| 13 | story `one-line` 360 | field heights xs 36 / sm 43 / md 50 / lg 57 (±0.5); `min-height` `0px`; the capped field is 146 at md with `overflow-y: auto`; (r1) hosts 65/72/79/86/175 (field bottom = host bottom); *One Line Chat (DE)*: button 45.6 × 45.6, button bottom = field bottom at one line and after 3 lines (field 98) |
| 21, 23 (r1) | string stories 360 | every value `input`: `scrollWidth` ≤ `clientWidth`; case number box 210, control 292; page 360; without the hook the number-input baseline stories stay hash-identical |
| 14 | unit | no `.lc-textarea-footer` without helper, counter or visible error; present with each; `aria-describedby` and the error `role` as before |
| 15 | baseline compare + measure | textarea stories with footer content are hash-identical; the others differ only by the host −8 px (field heights equal: md 98, sizes story 64/80/96/112). Also expected to differ: `form-input--required-asterisk`, `form-input--error-summary` (if its textarea has no footer content) and `design-tokens-density--*` with a textarea |
| 16 | unit + axe on both stories | role, labelledby/describedby ids, no `aria-live`; `document.activeElement` = host after opening; = opener after dismiss, after `visible=false` and after destroy |
| 18 | unit (computed style) | the hook on an ancestor wins for bg, border, fg and icon; without hooks the values match `d1` |
| 19 | theme-contrast spec | the values in §5 |
| 20 | story 360 L/D + `--forced-colors` | contrast as in §5; FC border width 1, colour not transparent |
| 21 | unit | `"1.50"` + 0.5 → `"2.00"`; a 20-digit id round-trips and +1 → `…891`; `"12.50"` with max 10 → `"10.00"`; DE „1,5“ → `"1.5"`; CVA writeValue/onChange strings; `valueChange` silent |
| 23 | story 360 + axe | no overflow; axe 0 |
| 24, 25 | unit | group, labelledby and heading not focusable; arrows, Home and End skip headings and cross sections; disabled skipped; `itemClick` gives the member; flat items give the same DOM as before (existing specs) |
| 26 | story 360/1280 L/D + axe | heading 30 px tall, indented label x = flat label x + 16; axe 0 |
| 27 | unit + story measure | box and svg drawn 18 × 18 with the hook; xs–xl 16/20/24/32/40 (as `d1`); a wrapper with the hook leaves its icons at their size; no `style` attribute written by lc-icon |
| 28, 29 | scss spec + story | every colour property of `:root.light` equals `.lc-theme-light`'s (same for dark); the compiled `:root` rules differ from 3.42 only by the yellow line; story: item ink on the panel 17.74, panel bg `#fff` |
| 30, 31 | story-shots over the new stories | 360/1024/1280 L/D, `scrollWidth` = width; keyboard by unit tests |
| 32 | review + compat | JSDoc `@default`, argTypes, changelog names usm-x and kosten-2026-11-17, "no API break"; compat 21/22 green |
| 33 | compat prerender | `EXPECT_IN_HTML`: a lazy row chevron `aria-expanded="false"`, a textarea without `lc-textarea-footer`, the icon template present; the icon size is CSS (hook) |

**Assumptions:** lc-line-chart has no tooltip, so AC-8's tooltip clause has nothing to change (the legend lists series, not values; an all-null series keeps its legend entry) · only `null` is a gap (NaN and `undefined` keep today's 0; the spec "coerces NaN / undefined" stays, AC-11) · one-line mode is `rows === 1` or `autoResize && minRows === 1`, so no other combination changes · `alertdialog` focuses the host, not an action (the kit cannot know the least destructive one).

**Change note r1 (2026-11-17, review round 1):** my design was wrong in three places. (1) The composer button was 40 px (below 44) and I missed the textarea's 6 px line gap: one-line mode now gets `display: block` and the story an `lg` button (build Deviation 1, option c). (2) A 20-digit id in a 4 rem value box is clipped (`scrollWidth` 203 in 64): new hook `--lc-number-input-value-width`. (3) §5 quoted an 18 % dark tint; the recipe is 16 % (build Deviation 4). Prototype measures: `tmp/story-shots/063/r1-proto.log`, `r1-num.log`.

**Baselines:** `tmp/story-shots/063/baseline/`, 476 shots (360/1280, L/D) from the 10:37 build: table 28, line chart 6, menu 5, header theme 4, sidenav dark 2, button menu trigger 1, density 4, textarea 17, alert 18, number input 12, icon 17, input 4, combobox 1.
