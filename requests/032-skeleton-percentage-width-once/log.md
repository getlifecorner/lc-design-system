# Log 032: lc-skeleton applies a percentage width twice

## Owner decisions

none

## Handoffs

| Time | From → to | Status | Reason | Task |
|---|---|---|---|---|
| 2026-11-02 13:11 | dispatcher → spec-writer | new | Start of the request | Write the spec for this request |
| 2026-11-02 13:13 | spec-writer → ui-ux-designer | done | A fix that changes no look or API still needs the designer's story and shot baselines, and the build then follows. | Design the API and visuals for AC-1…9 of request 032. The API is unchanged and the look must not change; the design is the story with the two skeletons at 60 % / 30 % in a space-between row at 360 px, plus baseline shots for the AC-4 hash comparison. |
| 2026-11-02 13:23 | ui-ux-designer → web-developer | done | The design, the prototype that proves the approach and the AC-4 baselines are ready, and no question remains for the spec or the owner. | Implement design.md for request 032: put the width only on the host with an inline width: 100% on the fill, cover AC-1…9 with the spec and story changes in §2/§8 (new story percentage-widths, the Table Rows Loading row fix, JSDoc and argTypes), and draft the changelog entry from the points in §1. |
