# Architecture — private-use, AI-first research index

**Consumer**: AI coding agents maintaining the owner's Kneekura projects. The repository happens to be public during setup/CI; it is not a distribution vehicle. Future private setting will be managed by the owner.

## Data plane (machine-first)

- `catalog/sources.json`: known external repositories/websites, licences, stack tags, human-readable notes.
- `catalog/genres.json`: semantic UI genres and every source's purpose memberships.
- `catalog/targets.json`: **eight concrete runtime platforms**. Never combine Android Compose/Views or Minecraft Forge/Fabric.
- `catalog/compatibility.json`: exhaustive source×platform matrix. **Two separate judgments**: implementation-code compatibility and visual inspiration value. This avoids a false binary compatible/incompatible outcome.
- `catalog/use-cases.json`: user/project tasks mapped to evidence-backed candidate source IDs.

## Agent query plane

`node tools/catalog.mjs validate` validates referential integrity across all files.

`node tools/catalog.mjs search --genre chat --target react-web --code direct` narrows technical candidates.

`node tools/catalog.mjs search --target javafx-desktop --code incompatible` shows sources usable only as visual ideas when `visual=medium/high`.

`node tools/catalog.mjs recommend ai-chat --target javafx-desktop --json` makes a use-case-specific, ranked, structured selection with catalog-handling and technical caveats. Rankings are **candidate ordering**, not approval to copy code.

## Separation of concerns

1. Reference descriptions and AI metadata here; no bulk third-party source mirroring.
2. Research target code inside its own project before any UI change.
3. Use verified licences for local adoption; copying code into a publicly accessible catalog is a **separate** permission question.
4. If later useful, build a **private** original-design playground or token library. Neither a public product nor a general UI distribution registry is a goal.
5. Keep costly dependencies optional; catalogs and checks use built-in Node.js only.

## Compatibility semantics

- `direct`: target runtime matches the library (not automatic license approval).
- `adapt`: runtime-aware wrapping, conversion, or migration is necessary.
- `incompatible`: cannot directly import source; visual inspiration may still be valuable.
- `unverified`: usable source/code is unverified.
- `tool-only`: agent/developer service, not a runtime component.

Visual value is `high`, `medium`, `low`, or `none` and must **never** override technical code incompatibility.

## Missing capabilities are visible, not hidden

There is no verified directly usable Forge-native component library in this initial catalog. The Fabric-specific LibGui is explicitly incompatible as Forge code but may provide visual/UI layout insights. Add Forge references only after source verification; never infer that another mod loader is supported.

## Re-evaluation policy

Sources can change licences, package names, availability, versions and support. Recheck actual upstream docs before implementation; record changed evidence, dates, and technical assumptions. If the user only asks to evaluate a design and the existing screen is adequate, `NO_CHANGE_NEEDED` is the preferred outcome.
