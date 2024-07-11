# Change Log

All notable changes to the "BetonQuest" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.5.0 pre-release]

- Add Language Server for BetonQuest v1 and v2 scripts
- Add Definitions and References searching
- Add Semantic Highlighting

## [0.4.1] - 2024-02-22

### Added
- Fully supports Japanese 日本語に完全対応 (contributed by shanaOP [@dusty01534](https://github.com/dusty01534))

## [0.4.0] - 2024-01-25

### Added
- Add "goto" support, now you can jump between the code and the editor when clicking on an Events / Objectives / Conditions
- Adjust flowchart style to better suite VSCode's color theme

### Fixed
- Fix missing translation

## [0.3.0] - 2024-01-16

### Added
- i18n supported!
- Fully supports Simplified Chinese 完全支持简体中文
- Optimize initial loading speed
- Minimize extension

### Fixed
- Removes the `thunder` option from the `weather` Event BetonQuest/BetonQuest/pull/2671

## [0.2.3] - 2024-01-11

### Added
- Add Events / Objectives / Conditions editing for 1.x!
- Supports Variables in Events, Conditions, Objectives Editors

### Fixed
- Fix sider drag not working when cursor leaves window
- Fix variaous mistakes on Events, Objectives and Conditions editing

## [0.2.2] - 2024-01-05

### Added
- Conditions editing for 2.0! (1.0 is on the way)

### Fixed
- Fix various bugs on Events and Objectives editing

## [0.2.1] - 2023-12-29

### Added
- Objectives editing for 2.0! (1.0 is on the way)

### Fixed
- Fix various bugs on Events editing

## [0.2.0] - 2023-12-24

### Added
- Events editing for 2.0! (1.0 is on the way)

## [0.1.6] - 2023-11-28

### Added
- Suggest YAML extension pack for grammar chacking

### Fixed
- The extension is not activated under web envrionment

## [0.1.5] - 2023-11-27

### Added
- Web extension supported! Just go to https://vscode.dev and try it

## [0.1.4] - 2023-11-24

### Fixed
- Fix wrong connections caused by free-hanging nodes

## [0.1.3] - 2023-11-23

### Fixed
- Fix document sync causing tabs switched to the first one
- Fix yaml new option wrapped with "{}"

## [0.1.2] - 2023-11-22

### Added
- Detect YAML errors when loading a Package into Editor
- Detect YAML errors when loading a Conversation into Editor

### Fixed
- Fix "event" vs "events" detection
- Fix creating Conversation on empty "conversations" key

## [0.1.1] - 2023-11-18

### Fixed
- Fix could not create new conversations with an empty YAML file

## [0.1.0] - 2023-11-10

### Added
- 2.0 formated Conversation support!
- Rework the Legacy Conversation Editor completely
- Comments and line orders are now kept the same when editing
- Logic support for line connection / re-connection / modification

### Fixed
- Fix various bugs on the Legacy Conversatino Editor related to connection and deletion

## [0.0.10] - 2023-08-31

### Added
- Better supports for translation detection and selection
- "stop", "final_events", "interceptor" editing

### Changed
- Optimize zoom

### Fixed
- Vscode's events are not being properly unregistered
- Fix translation selection be reverted when editing yml directly

## [0.0.9] - 2023-08-28

### Added
- Sync cursor position when a node is clicked

### Fixed
- Fix flowchart is not being updated when undo/redo
- Preserve nodes selection if possible
- Fix viewport be moved while typing

## [0.0.8] - 2023-08-24

### Added
- Conversation optiosn can now be fast-located with cursor on yaml documents

### Fixed
- Fix "Open Conversation Flowchart" button does not show up in Windows

## [0.0.7] - 2023-08-23

### Fixed
- Fix conversation pointers duplicated with "pointers" and "pointer"
- Fix Events and Conditions could not be removed from the flowchart completely
- Fix new conversation option not respects to translation setting
- Fix yaml multilingual status is not detected correctelly
- Fix conversation crashed when missing "text"
- Fix newly created node overwrites exists auto created nodes

## [0.0.6] - 2023-08-21

### Fixed
- Fix extension is not being activated when VSCode is started the first time

## [0.0.5] - 2023-08-18

### Fixed
- Fix translation selection is reverted when switching between conversation editors

## [0.0.4] - 2023-08-16

### Added
- Avoid flowchart flickering while editing YAML by delaying the docuemnt update

### Fixed
- Focus lost the first time typing
- Focus lost typing too fast

## [0.0.3] - 2023-08-14

### Added
- Translation selection
- Configuration to set your default translation selection

### Changed
- The Conversation Flowchart is now activated by the Text Editor's tool-bar located on the top right corner

## [0.0.2] - 2023-07-30

### Fixed
- Fix editing on graph is not sync to files
- Fix editor display name

## [0.0.1] - 2023-07-28

### Added
- Initial release
- Initial Conversation's editor
