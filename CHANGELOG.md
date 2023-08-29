# Change Log

All notable changes to the "BetonQuest" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.10] - TBD

### Added
- Better supports for translation detection and selection

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

## [Unreleased]
