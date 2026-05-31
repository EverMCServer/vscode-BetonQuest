# Spec Template

**Spec ID:** `SPEC-NNN`
**Created:** YYYY-MM-DD
**Status:** draft | in-progress | completed | abandoned

## Objective

One paragraph describing what this feature/fix accomplishes and why it's needed.

## Background

- What problem does this solve?
- What's the current state?
- Are there any related specs or issues?

## Affected Components

| Component | Files | Nature of Change |
|---|---|---|
| Extension | `extension/src/...` | New provider / command / handler |
| Server | `server/src/...` | New AST node / service / handler |
| Webview | `webview/src/...` | New editor / component / feature |
| Utils | `utils/src/...` | New type / model / data |

## Implementation Plan

### Step 1: <Title>
- [ ] Specific file changes
- [ ] What to add/modify/remove

### Step 2: <Title>
- [ ] ...

## API / Contract Changes

List any changes to:
- LSP custom request/response types
- Webview postMessage protocol
- Shared types in `utils/src/lsp/`
- VS Code configuration settings

## Test Plan

- [ ] Manual test: <scenario>
- [ ] Unit test: <what>
- [ ] Integration test: <what>
- [ ] Edge case: <what>

## Rollback / Risk

- What could go wrong?
- How to revert if needed?
- Backwards compatibility concerns?

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
