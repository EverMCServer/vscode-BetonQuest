# Wiki Index

Welcome to the vscode-BetonQuest developer documentation. This wiki serves as the comprehensive hand manual for understanding, maintaining, and extending the codebase.

## File Map

| File | Description |
|---|---|
| [01-project-overview.md](01-project-overview.md) | Project introduction, domain concepts, feature matrix, extension contributions, compatibility |
| [02-architecture.md](02-architecture.md) | Full system architecture: Extension Host, LSP Server, Webview React Apps, Shared Utils, data flow walkthroughs |
| [03-coding-paradigm.md](03-coding-paradigm.md) | Coding conventions, design patterns, error handling, performance, testing conventions |
| [04-build-and-test.md](04-build-and-test.md) | Build pipeline, webpack configs, test architecture, CI/CD, data generation |
| [05-development-guide.md](05-development-guide.md) | Practical task guides, debugging, common pitfalls, FAQ, glossary |
| [06-api-reference.md](06-api-reference.md) | Complete API reference for `betonquest-utils`: data models, Bukkit types, YAML utilities, i18n, LSP contracts, UI components |
| [07-diagnostics-reference.md](07-diagnostics-reference.md) | All diagnostic codes (BQ-0001 through BQ-4002) with triggers, examples, and fixes |
| [08-ast-node-reference.md](08-ast-node-reference.md) | Full catalog of AST node types (V1 and V2) with hierarchy, lifecycle, and YAML mappings |
| [09-webview-component-catalog.md](09-webview-component-catalog.md) | React component catalog: shared components, editors, UI inputs, style system |
| [10-troubleshooting-and-faq.md](10-troubleshooting-and-faq.md) | Common issues, diagnostic procedures, known limitations |

## Reading Paths

### New Developer (first time on the project)

1. [01-project-overview.md](01-project-overview.md) — understand what the project is and key BetonQuest concepts
2. [02-architecture.md](02-architecture.md) — understand how the system is built
3. [04-build-and-test.md](04-build-and-test.md) — get the project building
4. [05-development-guide.md](05-development-guide.md) — start contributing

### Feature Developer (adding a new capability)

1. [05-development-guide.md](05-development-guide.md) — find the task guide for your feature type
2. [02-architecture.md](02-architecture.md) — understand the subsystem you're modifying
3. Relevant reference file ([06](06-api-reference.md), [07](07-diagnostics-reference.md), [08](08-ast-node-reference.md), or [09](09-webview-component-catalog.md)) — API/component details
4. [03-coding-paradigm.md](03-coding-paradigm.md) — follow conventions

### Debugger (fixing a bug)

1. [10-troubleshooting-and-faq.md](10-troubleshooting-and-faq.md) — check for matching symptoms
2. [02-architecture.md](02-architecture.md) §5 — data flow walkthroughs to trace the issue
3. [05-development-guide.md](05-development-guide.md) §2 — debugging techniques

### Reviewer (code review)

1. [03-coding-paradigm.md](03-coding-paradigm.md) — conventions to check
2. [02-architecture.md](02-architecture.md) §6 — design decisions (is the change consistent?)

## Related Documentation

The [../kb/](../kb/) directory contains deep-dive knowledge base entries on specific subsystems:

- [ast-system.md](../kb/ast-system.md) — AST architecture rationale and internals
- [bukkit-data-types.md](../kb/bukkit-data-types.md) — Bukkit data flow from source to TypeScript
- [i18n-system.md](../kb/i18n-system.md) — Internationalization architecture
- [lsp-custom-requests.md](../kb/lsp-custom-requests.md) — Custom LSP request/response contracts
- [webview-messaging.md](../kb/webview-messaging.md) — Webview postMessage protocol details

The [../specs/](../specs/) directory contains feature specifications (spec-driven development).

---

*Last updated: 2026-05-26*
