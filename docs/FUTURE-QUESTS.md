# Future Quest Guidance

**Type:** project
**Created:** 2026-05-26

## Core Principle: Spec-Driven Development

All feature work MUST begin with a spec. No spec, no code.

## Spec Process

### Before Starting a Quest

1. **Create a spec file** at `docs/specs/SPEC-NNN-<slug>.md` using the template at `docs/specs/SPEC-TEMPLATE.md`
2. **Assign the next sequential ID** — check existing specs for the highest NNN
3. **Fill in all sections** — objective, background, affected components, implementation plan, test plan, acceptance criteria
4. **Get spec reviewed** — have the spec approved before writing code

### During a Quest

- **Reference the spec** — keep it open while working
- **Update status** — mark tasks as completed
- **Note deviations** — if implementation diverges from plan, document why in the spec

### After a Quest

1. **Mark spec as `completed`** with completion date
2. **Update wiki pages** if:
   - Architecture changed (new component, new pattern, new layer)
   - Build/test setup changed (new scripts, new webpack config)
   - Development conventions changed (new naming rules, new patterns)
3. **Add KB entries** if:
   - You introduced a new system or protocol
   - You discovered non-obvious behavior worth documenting
   - You solved a tricky problem future devs might hit
   - You added a new data flow or integration point
4. **Do NOT update docs for:**
   - Obvious code changes (adding a method, fixing a typo)
   - Git history already covers it
   - In-progress work details

## Wiki Maintenance Rules

### When to Update Wiki

| Trigger | Action |
|---|---|
| New sub-project or package added | Update [01-project-overview](wiki/01-project-overview.md) repo structure |
| New editor/provider/service added | Update [02-architecture](wiki/02-architecture.md) |
| New coding pattern adopted | Update [03-coding-paradigm](wiki/03-coding-paradigm.md) |
| New build script or test setup | Update [04-build-and-test](wiki/04-build-and-test.md) |
| New development workflow | Update [05-development-guide](wiki/05-development-guide.md) |

### When NOT to Update Wiki

- Adding/removing individual functions or classes (too granular)
- Bug fixes (covered by git)
- Refactoring that doesn't change architecture
- Dependency version bumps

## Knowledge Base Maintenance

### What Belongs in KB

KB entries capture **non-obvious knowledge** — things you'd tell a new team member verbally:

- System internals that require context to understand
- Protocol contracts between components
- Data flow through the system
- Design decisions and their rationale
- Gotchas, edge cases, and workarounds

### What Does NOT Belong in KB

- Things derivable from reading the code
- API documentation (that's what JSDoc/TS types are for)
- Build instructions (that's the wiki)
- Feature plans (that's specs)

## Spec History

Completed specs live in `docs/specs/` permanently. They serve as:
- Historical record of what was built and why
- Reference for future related work
- Onboarding material (read past specs to understand project evolution)

Never delete completed specs. If a spec is abandoned, mark it `abandoned` with a reason — don't delete it.

## File Naming

| Type | Pattern | Example |
|---|---|---|
| Spec | `SPEC-NNN-<kebab-case-slug>.md` | `SPEC-002-add-autocomplete.md` |
| Wiki | `NN-<kebab-case-slug>.md` | `06-performance-profiling.md` |
| KB | `<kebab-case-slug>.md` | `ast-system.md` |

## Summary Checklist

After every feature quest:
- [ ] Spec written and saved in `docs/specs/`
- [ ] Spec marked `completed`
- [ ] Wiki updated (if architectural changes)
- [ ] KB updated (if new non-obvious knowledge)
- [ ] Docs README updated (if new files added to wiki/KB)
