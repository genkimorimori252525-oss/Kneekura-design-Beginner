# Selection engine — AI picks the design, rules only prepare the evidence

## What is implemented

- **15 original concepts** across 5 genres (chat, navigation, dashboards, node-graphs, forms). Descriptions, palettes, densities, movement, intended tone, qualitative cost estimates, tradeoffs.
- **12 component needs** linking user-facing UI functions to the conceptual designs and external research-source IDs. Those links do **not** claim a particular upstream code file exists.
- **Deterministic feasibility + scoring** over a project brief. Hard gates (genre, motion ceiling, effort ceiling, requested contrast tier, target visual-concept family) reject inappropriate candidates. Scores are explainable for tone/density/motion/contrast/intent/cost.
- **Original browser preview gallery** (vanilla HTML/CSS/JS). Browse, inspect functional demos, compare two variants. Runs locally with `node tools/serve-gallery.mjs`; binds to 127.0.0.1, loads no remote fonts, UI source or services.
- **AI-selected decision receipt** (`decisions/*.json`) records the chosen ID, detailed rationale, tradeoff, current brief digest, alternatives, whether the agent genuinely reviewed visual pixels, and outcome. `verify` ensures the choice remains feasible.

## Strict distinction between scoring and actual AI judgment

A scoring algorithm only ranks metadata. It **does not** see screenshots, know the real app, predict aesthetics or prove usability. The AI agent (Codex/other) must independently compare options using relevant code, app constraints and preview when possible; then the agent supplies `--design` and evidence.

Outcome states:

- `SELECTED`: the agent attested to viewing an actual preview and provided specific observations. This is an **agent claim**, not machine-verified visual or accessibility evidence.
- `PROVISIONAL_SELECTION`: the AI chose from metadata/references but **did not inspect** the visual example; continue reviewing before production implementation.
- `NO_CHANGE_NEEDED`: existing UI is sufficient; no redesign should be made. The brief's `current_ui_sufficient` flag is determined after inspecting the real app.

An agent is free to pick any **eligible** candidate regardless of score order, provided it records a real reason and tradeoff. If none qualifies, do not force a selection.

## Input brief

Use `examples/brief-agent-workspace.json` as a starting format:

```json
{
  "schema_version": 1,
  "id": "agents-workspace-graph",
  "project": "Kneekura multi-agent workbench",
  "goal": "Display node status with predictable relationships and no excessive motion.",
  "target": "react-web",
  "genre": "node-graphs",
  "current_ui_sufficient": false,
  "desired": {"tone": "technical", "density": "dense", "motion": "none", "contrast": "high"},
  "constraints": {"max_effort": "medium", "max_motion": "subtle", "minimum_contrast": "high"},
  "intent_tags": ["agents", "pipeline", "debugging"]
}
```

Supported `target` IDs are in `catalog/targets.json`; genres for visual concepts are `chat`, `navigation`, `dashboards`, `node-graphs`, `forms`. Importantly, `target` controls the native application for **eventual implementation**, not the demo's technology. Browser demos are not direct React/JavaFX/Android/Forge imports.

## Commands

```bash
node tools/design-select.mjs validate
node tools/design-select.mjs patterns --genre node-graphs --json
node tools/design-select.mjs components --genre node-graphs --json
node tools/design-select.mjs shortlist examples/brief-agent-workspace.json --json
node tools/serve-gallery.mjs --port 4173
node tools/gallery-smoke.mjs
```

The first two choices below are **examples**, not requests to mutate another app:

```bash
node tools/design-select.mjs choose examples/brief-agent-workspace.json --design graph-linear --reason "Stage labels and deterministic left-to-right layout match the diagnostics workflow." --tradeoff "A linear layout cannot show complex branches clearly." --review metadata --out decisions/agent-graph-provisional.json

node tools/design-select.mjs verify decisions/agent-graph-provisional.json

node tools/design-select.mjs choose examples/brief-agent-workspace.json --no-change --reason "Inspection of the target UI showed that the existing screen already satisfies the required tasks." --out decisions/retain-existing.json
```

The no-change example is meaningful **only when the actual brief matches what the agent observed**. Do not falsely assert the project is already adequate.

For an inspected screenshot/demo:
`--review preview --evidence "Specific observable visual details from the actual local preview (24+ chars)"`.

**Selection receipts are write-once**; the command rejects overwriting an existing file. Re-evaluation should create a new named receipt. `verify` checks the brief's SHA-256 and technical feasibility, preventing silently stale choices from being treated as current.

## Evaluation limitations

- Palette foreground/background and muted/surface readability are checked using WCAG contrast-ratio arithmetic when `validate` runs. Contrast alone does **not** guarantee accessibility.
- Preview components use original HTML/CSS/JS and may have interactions (chat send, navigation, node inspection, demo settings), but are **not production-ready** or proven cross-device implementations.
- Relative implementation effort is a **qualitative design estimate**, not a measured number of developer hours or frame time.
- A visual-review flag is an honest AI-agent attestation, not a screenshot proof.
- Selected style does not authorize importing third-party source. The external research catalog applies distinct licensing and runtime judgments.
- Do not add an API dependency merely to run the selector. Codex itself is the reasoning agent; CLI and gallery are local aids.

## Development next

For repeated real projects, capture project-specific validation receipts after native implementation, compare usability/performance metrics, and add evidence-based component profiles. Avoid building a giant unused UI kit.
