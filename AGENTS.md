# Kneekura Design Beginner — AI Operating Rules

**Primary consumer: AI coding agents. Purpose: personal design research and better UI decisions, NOT a component product or distribution registry.**

1. Identify the target project and inspect its **actual** UI stack, runtime, version, design constraints, and current behavior before retrieving design patterns. Ask only when this cannot be determined.
2. Match `catalog/use-cases.json` (user goal), `catalog/genres.json` (component purpose), `catalog/targets.json` (runtime), then `catalog/compatibility.json` (code fit vs visual-reference fit). Query with `node tools/catalog.mjs recommend <use-case> --target <target> --json`.
3. **Never confuse compatibility axes:** `code=incompatible` prevents direct importing of that runtime's code, but `visual=high/medium` permits original native reimplementation of the design idea. `code=direct` is a technical claim, not license authorization. `code=unverified` must not be treated as direct.
4. **No blind UI rewriting.** Project outcome outranks user-pleasing overcorrection. Distinguish (a) verified functional defect, (b) plausible risk, (c) optional style improvement. `NO_CHANGE_NEEDED` is a valid final recommendation.
5. **Original application source and design research are separate.** This publicly visible research repo stores metadata and original notes, not unverified third-party components, commercial assets, screenshots, or fonts. `reference-only` is a catalog-storage policy; personal consumption of an upstream library is determined by actual terms per item.
6. Protect current functionality. Prototype only the minimum necessary; validate mobile/desktop scaling, keyboard/focus/touch access, text contrast, reduced motion, startup/runtime performance, compatibility with the current stack, and regressions.
7. Do not assume React equals Vue/JavaFX/Android/Forge; Compose != Views; Minecraft Forge != Fabric. Do not offer ports that are not verified.
8. The owner plans to make this repository private later; do not change visibility or add required credentials. CI may run while public. Avoid external APIs and keep the catalog runnable with Node.js alone.
9. Run `node tools/catalog.mjs validate` and `node tools/catalog.mjs self-test` after edits. Keep source IDs and target IDs stable; update genres, compatibility and use-case refs together.
10. Record any uncertain availability/license/version as `unverified`; never invent compatibility or permissions.
