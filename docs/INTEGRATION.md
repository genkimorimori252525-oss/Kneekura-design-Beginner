# Codex and external-project integration

The owner uses multiple separate Kneekura repositories. This design index is a **research dependency for the AI agent**, not an npm/JAR runtime dependency of every project.

## Inside Kneekura-design-Beginner

- Codex reads the root `AGENTS.md` and can read `.agents/skills/kneekura-design-selection/SKILL.md`.
- Some cloud environments may not automatically surface repository-local skills; in that case, refer to the skill file explicitly rather than assuming auto-discovery.
- Start with `node tools/design-select.mjs shortlist examples/brief-agent-workspace.json --json` and compare the original gallery with `node tools/serve-gallery.mjs`.

## When Codex is working on a different Kneekura repository

Give that agent the path/URL of this design repository and ask it to:

1. Inspect the target application's actual UI and define its runtime and problem.
2. Open this repository's `AGENTS.md`, `docs/SELECTION_ENGINE.md`, and `catalog/component-needs.json`.
3. Consult the catalogs and run the selection CLI in the design repository's working directory if cloned locally.
4. Perform visual review if browser access exists; otherwise mark the choice **provisional**.
5. Implement only the justified UI changes **in the consumer repo**, and test them there. No cross-repo code copying is required.

### Example handoff prompt

> Design selection should use Kneekura-design-Beginner as an AI knowledge base. Inspect this project's actual screen and runtime first. Search the component needs, source compatibility and original patterns. Produce an explicit, justified design decision (or NO_CHANGE_NEEDED), not just a list of links. Do not claim visual inspection unless screenshots were actually viewed. Keep implementation native and minimal, verify real behavior.

### Privacy note

This repo remains public until the owner changes visibility. Do not paste sensitive project/user data, private source code, unpublished screenshots or credentials into briefs/decision receipts here. Use sanitized, generic task descriptions for cross-repo research.

No mandatory paid service, external LLM API, or auto-generated screenshots is added here.
