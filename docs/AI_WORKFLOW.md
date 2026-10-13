# AI workflow — inspecting, choosing, implementing and verifying design

## 1. Inspect before styling

Read current screens and their implementation, target framework/version, user's desired outcome, and performance/accessibility constraints. Determine if there is a **verified** usability defect, credible risk, or merely aesthetic curiosity.

If the existing design is adequate, produce `NO_CHANGE_NEEDED` and do not modify code. The AI is not rewarded for finding imaginary faults.

## 2. Locate individual components and reusable ideas

- Search source catalog: `node tools/catalog.mjs recommend ai-chat --target react-web --json`.
- Browse 12 component needs: `node tools/design-select.mjs components --genre chat --json`.
- Keep **source technical compatibility** (code can run?) distinct from **visual inspiration** (can an idea be recreated natively?).
- Before copying external code into an actual application, re-check upstream rights for that component/version/dependency. Do not mirror third-party packages here.

## 3. Write a machine-readable project brief

Clone/adapt an `examples/brief-*.json` into a new, factual brief. Specify exact target, genre, desired tone/density/motion/contrast, non-negotiable effort/motion/contrast constraints, `current_ui_sufficient`, and intent tags.

`node tools/design-select.mjs shortlist <brief> --json`

Read reasons, tradeoffs, and vetoes. **Rule-based rankings only filter candidates**.

## 4. AI makes the choice

When visual inspection is available, run `node tools/serve-gallery.mjs` and inspect `http://127.0.0.1:4173/` with the permitted browser/screenshot workflow. Use the working demos to inspect hierarchy, density, affordances, and failure states. Compare the alternatives against the **real target UI**.

Without a browser/screenshot tool, do not claim to have seen a design; use metadata and mark selection `PROVISIONAL_SELECTION`.

An AI agent must explicitly choose a pattern, justify why it fits, name what is sacrificed and note alternatives. The AI may override metadata score ranking. Use the `choose` command to write an immutable decision receipt and `verify` it. No model API key is required: the AI operating in the coding tool is the decision maker.

## 5. Implement only what is needed

Borrow visual structure or original source only when allowed; keep code in the consuming project's native runtime. Browser concepts are **not ready-made** JavaFX/Minecraft/Android components. Preserve behavior, perform real responsiveness/focus/reduced-motion/error testing, verify performance and revert regressions.

## 6. Report evidence and uncertainty

Say whether the receipt is SELECTED, PROVISIONAL_SELECTION, or NO_CHANGE_NEEDED. Provide the brief, chosen ID, evaluated alternatives, real observations, technical and license limitations, verified tests, and what remains uncertain.

## Example

A Forge 1.20.1 UI cannot directly import Fabric-only LibGui code. However, a selected `graph-linear` visual layout can guide a **new Forge-native implementation** if a real UI task justifies it.

Do not let "can imagine the look" become "verified to work in Forge".
