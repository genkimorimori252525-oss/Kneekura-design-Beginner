# AI decision procedure (design is selected for the project, not the reverse)

## Required input (inspect repository first)

Target application, user task, current screen/component, actual UI runtime + version, and constraints (performance, accessibility, dependencies, preservation of behavior).

## Deterministic workflow

1. Resolve the `target` from `catalog/targets.json` (if the project has multiple UI frontends, evaluate each separately).
2. Match user goal to `catalog/use-cases.json` and narrower UI genre to `catalog/genres.json`.
3. Run `node tools/catalog.mjs recommend <use-case> --target <target> --json`.
4. For a candidate, read `catalog/compatibility.json`: 
   - `direct`: code matches target runtime (actual version and integration still require checking);
   - `adapt`: needs wrapper/conversion;
   - `incompatible`: **do not import source code**, but `visual=medium/high` means visual ideas may be implemented independently;
   - `unverified`: research first;
   - `tool-only`: not an application UI component.
5. Check `catalog/sources.json` for **distinct license/catalog storage handling**. `reference-only` does NOT prohibit all local private use; it prohibits copying it into this publicly visible research repo without documented rights.
6. Compare candidates with the existing working UI. If function and user experience already meet objectives, output `NO_CHANGE_NEEDED` and stop.
7. If work is justified, implement a minimal scoped change in the actual target project's native stack, verify visually and functionally, and report evidence.

## Minimum machine-readable decision record

```json
{
  "target": "minecraft-forge-gui",
  "genre": "minecraft-ui",
  "candidate_id": "fabric-libgui",
  "code_compatibility": "incompatible",
  "visual_reuse": "high",
  "decision": "visual-reference-only",
  "reason": "Fabric-specific GUI code does not run directly under Forge",
  "next_step": "Use Forge's native screen/rendering APIs if a change is genuinely necessary"
}
```

This example is a *sample decision record*, not a claim that any change is required.

## Hard constraints

- Never declare that incompatible code is installable as-is.
- Never treat a permissive visual layout as automatic permission to mirror copyrighted assets.
- Do not introduce framework-wide rewrites, style changes, preview sites, or a private/public GitHub toggle solely to improve the design catalog.
- Report verified defects, risks, and optional improvements separately. Avoid changing a healthy design only because the user asked to look for improvements.
