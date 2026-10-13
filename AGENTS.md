# Kneekura Design Beginner — Agent Rules

Goal: Find and evaluate **useful** visual patterns for the consuming project, not blindly restyle it.

1. Read `catalog/use-cases.json`, then search `catalog/sources.json`. Select by user goal and actual target stack.
2. **Do not copy third-party source, screenshots, fonts, or templates into this repository.** Metadata and original commentary only, unless a separately reviewed rights record authorizes inclusion.
3. A project's README saying "MIT" is not sufficient: check the actual LICENSE / item terms. `restricted`, `unverified`, `site_claim_only`, `service_terms` and `spec_reference` mean reference-only by default.
4. Installing or adapting code **in a consumer project** is a distinct action: review exact rights, dependencies, upstream version, licenses, security, and platform compatibility first.
5. Keep native UI native: JavaFX is not React. Refer to visual principles without claiming source portability.
6. Prefer existing working UI when adequate. For any proposed revision, distinguish verified defect, potential risk, and optional improvement. No cosmetic change solely to manufacture an issue.
7. Preserve working behavior; check responsiveness, keyboard/screen-reader access, focus, contrast, reduced motion, performance, and visual consistency.
8. Do not add design kits, runtime dependencies, MCP services, automatic scrapers, or previews unless actually needed. No credential storage in this repository.
9. Run `node tools/catalog.mjs validate` and `node tools/catalog.mjs self-test` after catalog changes.
10. Keep entries factual, sourced, concise, and dated. Do not invent project maturity, license permissions, or unsupported features.
