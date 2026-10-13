# Sources, licences, and the temporary public repository

**Intended use: personal hobby/research with AI agents. No distribution of a component kit, no commercial UI library.** The repository is currently public for development/CI; the owner intends to make it private later.

## Distinguish three independent questions

1. **Technical fit:** can code run on a specific target stack? See `catalog/compatibility.json`.
2. **Design-reference value:** can its layout/color/motion ideas guide a new implementation? Same file, separate field.
3. **Rights and storage:** can a component/source/asset be used locally or copied into *this GitHub repo*? See upstream item-specific licences and `catalog/sources.json`.

Being private later does not retroactively authorize publishing third-party source now; neither public nor private status alone overrides actual licence terms.

**`reference-only` means no copying that source into this public research catalog without confirmed rights.** It does not imply that all personal installation, local execution, or independent design inspiration is forbidden. `review-upstream` means the identified upstream licence appears to support use subject to its terms; still verify actual item, version and dependencies before adoption.

## Important source findings (2026-10-13)

- **ScrollX UI:** the actual `LICENSE.md` has Commons Clause restrictions on redistribution and competing libraries; README's brief MIT statement is incomplete. Local use may be permitted under specific conditions. Do not mirror into this research repo.
- **React Bits:** MIT + Commons Clause; verify the actual use conditions per item.
- **Morphin Registry:** no applicable license file located, and the README says no LICENSE is present. No assumption of redistribution rights.
- **Viora UI:** public repo presently offers mostly README information. The actual component licensing/source availability is not verified.
- **DesignPass:** site advertises MIT for free items but the GitHub repo contains a blank placeholder; verify specific files/items.
- **MaterialFX:** LGPL-3.0, not equivalent to MIT. Using it privately and distributing a derivative have different obligations.
- **Material Components for Android Views:** Apache-2.0 but maintenance mode; do not recommend it as the default new Android UI stack without checking context.

The catalog itself consists of original descriptions, categorization, source URLs and reasoning, not bundled third-party UI code/assets. Do not commit downloaded fonts, screenshots, icons, or commercial templates unless provenance and rights are reviewed.

## Safe local adoption workflow

Check the upstream licence for the exact source/version, then inspect transitive dependencies, ensure target compatibility, preserve required notices where applicable, and implement in the **consuming project**, not this research catalog. Not legal advice.
