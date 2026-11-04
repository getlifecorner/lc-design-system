# Log 049: Overlay panel language (datepicker, date-range-picker, combobox)

## Owner decisions

## Handoffs

Times come from `date '+%Y-%m-%d %H:%M'` when the row is written, never estimated.

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-04 23:27 | spec-writer → ui-ux-designer | done | The need is a testable accessibility bug fix that the kit does not cover, and it needs a short design and story plan before the build. | Design the API and visuals for AC-1…11. The change is a `lang` attribute on the datepicker panel and the combobox dropdown, with no new inputs. Define where the value comes from (closest `[lang]`, else `locale`) and how it is SSR-safe. Add a story with a `lang="de"` wrapper for AC-8 and AC-9, and the baseline measurements. |
| 2026-11-04 23:47 | ui-ux-designer → web-developer | done | The design is complete, needs no owner decision, and the `lang` prototype is hash-identical to the baselines (28/28 opened, 124/124 at rest). | Implement design.md (patch 3.30.2): `closestLang` in `internal/a11y`, `panelLang` computed + `[attr.lang]` on the datepicker, combobox and date-range-picker panel roots (§1), the two *Panel Language* stories (§8) and the unit tests for AC-1…AC-6 (§9); list the combobox dropdown width and the other CDK overlays as known limits. |
| 2026-11-04 23:58 | web-developer → ui-ux-designer | done | All gates are green on 77225f2 (libs/tools unchanged in 4e82620), and the build matches the design except one story-text deviation, which needs the designer's agreement. | Review request 049 (stories form-datepicker--panel-language, form-combobox--panel-language; Label (DE) docs text) against design.md; shots in tmp/story-shots/049/build-new, compare runs build (124/124) and build-open (28/28) are done. Decide on build.md deviation 1 (combobox story text without "else `locale`"). |
| 2026-11-05 00:03 | ui-ux-designer → release-manager | done | All AC pass with measured evidence and no must-fix is open; deviation 1 is agreed and design.md §8 corrected. | Prepare the release for request 049 (patch 3.30.2, changelog draft in build.md); route review F-1 (lc-select and likely other CDK overlays without the host's lang, WCAG 3.1.2) as queue, F-2 and F-3 as backlog. |
