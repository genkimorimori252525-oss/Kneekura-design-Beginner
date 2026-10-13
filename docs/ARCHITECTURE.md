# Architecture — goal-first design catalog

## Separation of concerns

1. **External reference catalog** (current): sites, repos, tags, stack, license state and provenance. No upstream code mirrored.
2. **Use-case mapping** (current): project purpose → candidate sources + UX/performance checks.
3. **Owned design system** (future, only as needed): original tokens, components and documentation maintained here. Original vs adapted provenance must be explicit.
4. **Preview lab** (future): showcase *owned or authorized* examples, test interactions, accessibility and regressions.
5. **Optional distribution** (future): a shadcn-compatible Registry for the owned React subset, not for unlicensed third-party works. JavaFX has its own packaging.

## Why this architecture

The shadcn/ui Registry and Tween UI show the value of machine-readable component manifests. Morphin Registry separates `registry.json`, `items/`, and `files/`. We borrow their **organizational idea**, not source code.

A curated reference catalog must remain distinct from a source-code distribution registry: a permissive license for use inside an app may not permit repackaging UI pieces as another library.

## Data contracts

- `catalog/sources.json`: `schema_version`, `checked_at`, `sources[]`.
- Each source: stable `id`, source URLs, `kind`, `stack[]`, `tags[]`, `license{state,label,evidence}`, `adoption`, `notes`, `verified_on`.
- `license.state`: `permissive_verified` | `restricted` | `unverified` | `site_claim_only` | `service_terms` | `spec_reference`.
- `adoption`: `review-upstream` (permission still checked at installation time) or `reference-only`.
- `catalog/use-cases.json`: objective, relevant stable source IDs, practical validation criteria.

## Retrieval workflow for Codex

1. Identify product, stack, user/task goals and current UI.
2. Read `AGENTS.md`. Run `node tools/catalog.mjs search <intent>` or filter by stack/tag.
3. Choose **at most a few** candidates and check the source's live docs and terms.
4. Compare against existing behavior. If no material issue exists, leave it unchanged.
5. Prototype in isolation and measure before adopting; test both layout and actual interaction.
6. Record the selected source and decision. Never overwrite a stable component for aesthetic novelty alone.

## Deliberately not in v1

No wholesale cloning, scraping, external service/API tokens, expensive framework bootstrapping, automated downloads, style lock-in, mandatory MCP, or image assets without permission.

## Design system extensions

If multiple projects develop consistent needs, introduce owned tokens in DTCG-compatible JSON and adapters to CSS/JavaFX. If preview and tests become necessary, Storybook + visual/regression tooling can be evaluated independently of this light index.
