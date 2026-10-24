QPT v62 — static-first navigation/hero build.

Targeted fixes:
- Homepage theme and hero image are established before the stylesheet paints.
- Homepage hero image is preloaded.
- Fonts are requested before the main stylesheet to reduce late layout/paint changes.
- Header/nav/hero transitions and animations are disabled.
- Header and hero heights are fixed at first render.
