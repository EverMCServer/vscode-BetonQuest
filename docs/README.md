# vscode-BetonQuest Documentation

## Directory Map

```
docs/
├── README.md                    # This file — navigation hub
├── wiki/                        # Project wiki (structural reference, always current)
│   ├── 01-project-overview.md   # What this project is, tech stack, repo structure
│   ├── 02-architecture.md       # Deep dive: extension, LSP server, webview, utils
│   ├── 03-coding-paradigm.md    # Patterns, conventions, naming, file organization
│   ├── 04-build-and-test.md     # Build pipeline, scripts, packaging, CI
│   └── 05-development-guide.md  # Common tasks, debugging, contribution guide
├── kb/                          # Knowledge base (non-obvious knowledge, "why" not "what")
│   ├── ast-system.md            # Two-version AST parser architecture
│   ├── webview-messaging.md     # Extension ↔ Webview postMessage protocol
│   ├── lsp-custom-requests.md   # Custom LSP request/response contracts
│   ├── bukkit-data-types.md     # Minecraft/Bukkit data type system
│   └── i18n-system.md           # Internationalization architecture
└── specs/                       # Spec history (immutable after quest completion)
    ├── SPEC-001-documentation-init.md  # This documentation quest
    └── SPEC-TEMPLATE.md         # Template for future specs
```

## Quick Navigation

### I'm new to the project — where do I start?
Read the wiki in order:
1. [Project Overview](wiki/01-project-overview.md) — what and why
2. [Architecture](wiki/02-architecture.md) — how it works
3. [Coding Paradigm](wiki/03-coding-paradigm.md) — how we write code
4. [Build & Test](wiki/04-build-and-test.md) — how to build and run
5. [Development Guide](wiki/05-development-guide.md) — how to contribute

### I need to understand a specific system
Check the [knowledge base](kb/):
- [AST System](kb/ast-system.md) — how parsing and IntelliSense work
- [Webview Messaging](kb/webview-messaging.md) — how editors talk to VS Code
- [LSP Custom Requests](kb/lsp-custom-requests.md) — custom protocol contracts
- [Bukkit Data Types](kb/bukkit-data-types.md) — Minecraft type wrappers
- [i18n System](kb/i18n-system.md) — translation architecture

### I'm planning a feature
1. Read the relevant wiki + KB pages for the affected subsystems
2. Create a spec using [SPEC-TEMPLATE.md](specs/SPEC-TEMPLATE.md)
3. Save to `specs/SPEC-NNN-<slug>.md`

### I just finished a feature
1. Mark the spec as `completed`
2. Update any wiki pages if architecture/patterns changed
3. Add KB entries for new non-obvious knowledge

## Documentation Conventions

- **Wiki** = current state reference. Updated when the code changes.
- **KB** = "why" and "how" knowledge. Captures insights that aren't obvious from reading code.
- **Specs** = feature plans. Immutable after completion (historical record).
- Link between related files using markdown `[link](path.md)`.
