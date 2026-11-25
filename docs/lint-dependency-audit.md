# Lint dependency audit

25 November 2026

## Scope and evidence

The lockfile audit reported seven moderate entries, all deriving from one minimatch advisory through the development-only typescript-eslint dependency chain. This is not seven distinct runtime vulnerabilities and is not evidence of a live-site attack.

GitHub reviewed advisory: https://github.com/advisories/GHSA-g3hv-75wg-m249 . It lists versions from7.0.0 before11.0.1 as affected by pattern-processing resource amplification. The recorded lockfile used minimatch10.2.6 under typescript-estree.

## Targeted change

Update the direct development dependency typescript-eslint from8.72.2 to8.74.0 and regenerate only its dependency subtree through npm install. Its minimatch resolves to11.0.9. No overrides, audit force, major ESLint/TypeScript upgrades, runtime dependency updates, application changes, content edits or hosting changes.

The resulting npm audit reports zero known vulnerabilities at the time of the check. This is a point-in-time dependency advisory result, not a security certification.

## Verification

Check all changed package records are development-only and runtime versions remain unchanged. Run a clean install, full tests, lint, typecheck, content validation and static export budget checks. Require exact-head Pages preview and readable Arabic/English smoke checks before guarded normal merge; check exact-merge production and canonical afterward.
