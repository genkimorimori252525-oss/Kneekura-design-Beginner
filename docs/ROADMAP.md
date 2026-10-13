# Roadmap

## v0.1 — Reference library (current)

- Seed six sources from the original screenshot plus additional high-value design systems.
- Record exact sites, repository links, tech stacks, use cases, license evidence and copying policy.
- Provide dependency-free search and automatic schema/integrity checks.
- Give AI agents a goal-first adoption workflow.

## v0.2 — Better discovery (only if useful)

- Add **individual components/patterns**, not just library-level entries, each with source version, proof link, preview permission and usage cost.
- Add project-aware filtering: React, vanilla web, JavaFX, Android, performance budget, accessibility needs.
- Allow explicit acceptance/rejection notes to avoid re-evaluating rejected approaches.

## v0.3 — Owned showcase and validation

- Build an isolated gallery for original or authorized components.
- Verify keyboard and screen-reader behavior, reduced motion, layout overflow, contrast and runtime performance.
- Consider Storybook/Playwright only when a real UI exists and tests pay for their maintenance.

## v1.0 — Optional distributable design kit

- Create original design tokens and platform adapters only after repeated use demonstrates need.
- Publish owned React elements as a shadcn-compatible registry; keep native desktop UI separately.
- Optionally index curated metadata through a local search server/MCP, without bundling upstream proprietary assets.

**Non-goals**: inflated component counts, unnecessary rewrites, scraping all design sites, or making every project depend on this repository at runtime.
