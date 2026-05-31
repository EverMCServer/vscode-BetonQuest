# Spec: Project Documentation & Knowledge Base Initialization

**Spec ID:** `SPEC-001`
**Created:** 2026-05-26
**Status:** in-progress

## Objective

Generate comprehensive project documentation (wiki), knowledge base, and establish a spec-driven development workflow for all future quests on the vscode-BetonQuest extension.

## Background

The vscode-BetonQuest project is a mature VS Code extension (~0.5.6) with a monorepo architecture spanning extension host, LSP server, React webviews, and shared utilities. It currently lacks:
- Project-level documentation (no CLAUDE.md, no README beyond package.json)
- A spec-driven development process
- A knowledge base for accumulated project insights
- Any wiki-style reference for onboarding

## Deliverables

### 1. Wiki Documentation (`./docs/wiki/`)

| File | Content |
|---|---|
| `01-project-overview.md` | High-level project description, architecture diagram, technology stack, repository structure |
| `02-architecture.md` | Deep dive into each subsystem (extension host, LSP server, webview, utils), data flow, messaging patterns |
| `03-coding-paradigm.md` | Coding patterns, conventions, naming, file organization, inheritance hierarchies, generic patterns |
| `04-build-and-test.md` | Build pipeline (TypeScript → Webpack), scripts, testing setup, packaging |
| `05-development-guide.md` | How to add features, debug, common tasks, editor lifecycle |

### 2. Knowledge Base (`./docs/kb/`)

| File | Content |
|---|---|
| `ast-system.md` | How the two-version AST system works (V1 vs V2), parser architecture, node tree |
| `webview-messaging.md` | Extension ↔ Webview communication protocol |
| `lsp-custom-requests.md` | Custom LSP request/response contracts |
| `bukkit-data-types.md` | Minecraft/Bukkit data type system |
| `i18n-system.md` | Internationalization architecture |

### 3. Spec Process (`./docs/specs/`)

- This spec saved as `SPEC-001-documentation-init.md`
- Template spec for future quests

### 4. Docs Index (`./docs/README.md`)

- Navigation hub for all documentation

## Guidance for Future Quests

### Spec Requirement
All feature work MUST begin with a spec saved to `./docs/specs/SPEC-NNN-<slug>.md`. The spec must include:
- Objective and background
- Affected files/components
- Implementation plan
- Test plan
- Rollback considerations

### Post-Quest Documentation Updates
After completing a feature quest:
1. Update affected wiki pages if architecture/patterns changed
2. Add KB entries if new systems, protocols, or non-obvious knowledge was introduced
3. Archive the spec with status `completed`

### Wiki Maintenance
- Wiki files reflect current state, not history
- KB files capture "why" and "how" — the kind of knowledge that isn't obvious from code
- Specs capture "what was planned vs. what was done" — immutable after completion

## Acceptance Criteria
- [x] All wiki files created with comprehensive content
- [x] All KB files created with detailed technical reference
- [x] Docs index README created
- [x] Spec template created
- [x] This spec saved in specs directory
