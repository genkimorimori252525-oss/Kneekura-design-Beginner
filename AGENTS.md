# AGENTS.md — Kneekura Design Beginner / AI-owned design decisions

This is a personal hobby/research workspace, **not a public UI distribution kit**. The owner may change repository visibility later. The primary user of this knowledge is a coding **AI agent**, not a human shopping a component catalog.

## Mandatory design-decision sequence

1. **Inspect the destination project first.** Identify actual UI runtime/version, affected screen, behavioral invariants, accessibility/performance constraints. Do not guess. Determine whether the existing UI already meets the task. If yes, a documented `NO_CHANGE_NEEDED` is preferred.
2. Search external sources by need: `node tools/catalog.mjs recommend <use-case> --target <target> --json`. Cross-check `catalog/component-needs.json`, `catalog/genres.json`, `catalog/compatibility.json`.
3. For an actual visual choice, write a small project brief matching `examples/brief-agent-workspace.json`. Run `node tools/design-select.mjs shortlist <brief> --json`. Treat scores as **metadata-only preprocessing**. They do **not** measure beauty, screenshots, actual UX, or fit to the current project.
4. Examine a few possible designs and their weaknesses. For authorized/original concepts, run `node tools/serve-gallery.mjs` and inspect `http://127.0.0.1:4173/` **only if** browser/screenshot tools are available. If no visual inspection can occur, label the decision `PROVISIONAL_SELECTION`; never falsely claim to have seen a preview.
5. **The LLM agent makes the final choice** by comparing task outcome, visual hierarchy, existing app, cost, operation, and alternatives. Use `node tools/design-select.mjs choose <brief> --design <id> --reason "..." --tradeoff "..." --review metadata|preview [--evidence "..."] --out decisions/<name>.json`, then `verify`. Alternatively choose `--no-change` with substantive reason. Scores NEVER make the decision automatically.
6. Validate whether using an upstream source is permissible. `code=direct` is merely technical suitability, **not a license**, and the origin of local prototypes is wholly separate from third-party source rights. This currently public index only contains original code and descriptions, not mirrored external UI packages/assets.
7. Implement only justified changes in the target repository and its native UI stack. Preserve behavior; test real keyboard/focus/touch states, responsive scaling, motion reduction, contrast, and runtime cost. Report test evidence and limitations; do not claim demo behavior proves production readiness.

## Hard refusal to misclassify

- Never import Fabric-specific LibGui into Forge directly, or browser React code directly into JavaFX/Android.
- Never mix Android Compose and legacy Views without explicit interop.
- Browser mockups are **visual concepts**, not production-ready components or cross-runtime implementation.
- Never fabricate screenshots, license permission, accessibility test results, or score confidence.
- Never rewrite a functioning UI to manufacture a defect. Distinguish VERIFIED_DEFECT, RISK, OPTIONAL_CHANGE, and NO_CHANGE_NEEDED.
- If the technical/visual evidence does not support a clear winner, document uncertainty rather than pretending an objective "best" exists.

## Checks on repository changes

```bash
node tools/catalog.mjs validate
node tools/catalog.mjs self-test
node tools/design-select.mjs validate
node tools/design-select.mjs self-test
node tools/gallery-smoke.mjs
```

Keep data IDs stable and all references consistent. Do not change GitHub visibility, create mandatory API/paid-service dependencies, or commit unlicensed third-party UI/imagery. Keep user authorization and target project's constraints central.
