# Architecture — AI-driven personal design research

The repository is a temporary-public **personal research index**, not a package distribution site. The owner will decide when to make it private; CI is deliberately lightweight.

## Separate layers

1. **External source intelligence**: 20 repositories/sites in `catalog/sources.json`, with `catalog/compatibility.json` containing 160 technical-vs-visual platform assessments, `catalog/targets.json` and `catalog/genres.json`.
2. **Component needs**: `catalog/component-needs.json` (12 explicit UI functions, required behaviors, related external sources). Links signal where to research, **not confirmed upstream component names/paths**.
3. **Original design space**: `catalog/design-patterns.json` (15 first-party browser concept definitions and eight first-party color palettes, visible tradeoffs and qualitative effort).
4. **Feasibility/evidence**: `tools/design-select.mjs` rejects candidates violating hard constraints, ranks metadata with explicit score breakdown and builds reproducible shortlists.
5. **Visual study**: `gallery/` plus localhost-only `tools/serve-gallery.mjs` renders and compares original prototypes. No remote code, tracking, external images, JS/CDN fonts or API required.
6. **Actual AI selection**: Codex / coding agent reasons over the current destination UI, the evidence packet and preview *when accessible*. It records chosen design + observations/unknowns via `choose`, checked by `verify`. No LLM runtime embedded in this index.
7. **Native implementation & measurement**: occurs only in the actual consuming repo. This index cannot guarantee CSS demos work in React/JavaFX/Forge/Android.

## Pipeline

`INSPECT_DESTINATION → IDENTIFY_COMPONENT_NEED → CHECK_RUNTIME → BUILD_BRIEF → HARD_FILTER → METADATA_SHORTLIST → OPTIONAL_VISUAL_REVIEW → AI_DECISION → RECEIPT → NATIVE_PROTOTYPE → REAL_TESTS`

If existing UI already meets the task, terminate at `NO_CHANGE_NEEDED`. If all designs are excluded, report a coverage gap; never silently relax the user's hard constraints.

## Privacy and security

The gallery binds only to 127.0.0.1 and serves an explicit allowlist of public, original static files. CSP blocks external scripts and remote connections. Decision records contain task descriptions, not secrets. Do not put private access keys or proprietary app source into the public catalog.

## Source ownership vs intended platform

Original demo source is vanilla browser code, and the catalogue marks it as `browser-preview-only`. The designs are **platform-agnostic ideas**, not drop-in packages for eight platforms. The external compatibility matrix refers to *external sources*, which is a separate concept.

## Scope control

A design is adopted only if it solves a real requirement. Effort estimates and visual-rubric ratings are approximate; no claim of objective aesthetic superiority. Correctness, usability and runtime safety come first.
