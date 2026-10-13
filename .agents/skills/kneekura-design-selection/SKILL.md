---
name: kneekura-design-selection
description: Use when an AI coding agent must choose, compare, or reject UI design ideas for a Kneekura project while preserving the target runtime and behavior.
---

# Kneekura Design Selection — AI is the decision maker

This skill operates in this repository. It requires **no external model/API service**. The invoking coding agent decides from evidence, not the CLI.

## Start

1. Inspect the actual destination application's UI code, runtime and version. Identify the user's goal, functional checks, actual deficits and constraints. If the existing UI is sufficient, do not force a redesign.
2. Read `AGENTS.md`, `catalog/targets.json` and `docs/SELECTION_ENGINE.md`.
3. Find components by task:
   `node tools/catalog.mjs recommend ai-chat --target react-web --json`
   `node tools/design-select.mjs components --genre chat --json`
4. Create a factual **non-sensitive** project brief based on `examples/brief-agent-workspace.json`. Remember: this GitHub repository is currently public; do not record private user/project secrets.
5. Run:
   `node tools/design-select.mjs shortlist examples/brief-agent-workspace.json --json`
6. Compare alternatives in their intended context, their tradeoffs and actual destination UI. Optional authorized visual inspection: `node tools/serve-gallery.mjs`, browse `http://127.0.0.1:4173/`. The original browser concepts are NOT drop-in native components.

## Make an actual model decision

Choose an **eligible** concept as the LLM agent, even if it is not the highest-ranked item, and justify the decision. Explain at least one real drawback and the rejected alternatives. If no option fits, do not force a choice.

- If pixels were genuinely inspected, use `--review preview --evidence "actual observation"`. Output may be `SELECTED`; this is an agent attestation, not machine proof.
- If you inspected only metadata, use `--review metadata`. Output is `PROVISIONAL_SELECTION`.
- If the existing UI meets goals, use `--no-change` and explain why; output is `NO_CHANGE_NEEDED`.

Record with `node tools/design-select.mjs choose <brief> --design <id> --reason "..." --tradeoff "..." --review metadata --out decisions/<name>.json`, then `node tools/design-select.mjs verify decisions/<name>.json`.

## Next: minimum native implementation

In the actual target repo, implement only warranted changes. Preserve all original behaviors. Test keyboard/focus, responsive layout, reduced-motion support and performance. For Forge/Fabric/Android/JavaFX, reimplement visual ideas using native controls rather than importing incompatible browser code.

Never confuse a technical shortlisting score with an AI aesthetic review. Never invent preview observations, source licensing, or verified performance. Do not copy external library source into this research repo.
