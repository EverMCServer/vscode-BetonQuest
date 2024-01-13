# BetonQuest Visual Editor

[![VS Marketplace](https://img.shields.io/visual-studio-marketplace/v/EverMC.betonquest?color=brightgreen&label=VS%20Marketplace&logo=visual-studio-code&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=EverMC.betonquest)
[![License](https://img.shields.io/badge/license-AGPL--3.0-blue?style=flat-square)](https://github.com/EverMCServer/vscode-BetonQuest/blob/main/LICENSE)


A GUI based editor for [BetonQuest](https://github.com/BetonQuest/BetonQuest) scripting.

![conversation editor](assets/screenshot-conversation-light.jpg)

## Features

### Edit `Conversations` with drag-and-drop:
![demo](assets/screenshot-demo-conversation-new-option.gif)

### Build `Events` on click of a button:
![demo](assets/screenshot-demo-new-event.gif)

### Feature Roadmap
- ✅ Web extension support. Just go to https://vscode.dev and try it.
- ✅ Edit `Conversations` with an interactive flowchart UI.
- ✅ The legacy **1.x file structure** \[[1](https://betonquest.org/1.12/User-Documentation/Reference/#packages)\] \[[2](https://betonquest.org/1.12/User-Documentation/Conversations/)\] support.
- ✅ The new **2.0 file structure** \[[1](https://betonquest.org/2.0/Documentation/Scripting/Packages-%26-Templates/)\] \[[2](https://betonquest.org/2.0/Tutorials/Syntax/Quest-Packages/)\] support.
- ✅ Formated `Events` Editors with built-in [documentation](https://betonquest.org/2.0/Documentation/Overview/) support.
- ✅ Formated `Conditions` Editors
- ✅ Formated `Objectives` Editors
- ✅ Formated `Events`, `Conditions`, `Objectives` Editors for the **1.x file structure**
- ✅ Supports [Variables](https://betonquest.org/2.0/Documentation/Scripting/Building-Blocks/Variables-List) in `Events`, `Conditions`, `Objectives` Editors.
- ⬜ i18n support.
- ⬜ [Journal](https://betonquest.org/2.0/Documentation/Features/Journal/) editing.
- ⬜ [Items](https://betonquest.org/2.0/Documentation/Features/Items/) editing.
- ⬜ [Intergrated plugins](https://betonquest.org/2.0/Documentation/Scripting/Building-Blocks/Integration-List/) support.
- ⬜ Package configuration.
- ⬜ [Menu](https://betonquest.org/2.0/Documentation/Features/Menus/Menu/) editing.
- and more. Please [suggest](https://github.com/EverMCServer/vscode-BetonQuest/issues).
- ⬜ [Global Variables](https://betonquest.org/2.0/Documentation/Scripting/Building-Blocks/Variables-List/#global-variables) support.

## Limitations

- `Conversations` Editor does not support [cross-conversation pointers](https://betonquest.org/2.0/Documentation/Features/Conversations/#cross-conversation-pointers) at this moment.
- [Global Variables](https://betonquest.org/2.0/Documentation/Scripting/Building-Blocks/Variables-List/#global-variables) conflict with this extension. Please consider convert your scripts before using this extension. Support for Global Variables may be added in the far future.

## Extension Settings

- Translation Selection - The translation selection for conversation flowchart. Default to 'en'.

## Known Issues

Please report your issues on https://github.com/EverMCServer/vscode-BetonQuest/issues

- Zoom-in and out is limited to certain degrees.
- (2.0 related) Conversation's tabs are not properly switched when clicked on the YAML file.
- (2.0 related) Conversation's tabs are switched to the first one when the YAML edited.
- `notify` Event is not fully supported at this moment.

## Release Notes

### 0.2.3
- Add Events / Objectives / Conditions editing for 1.x!
- Supports Variables in Events, Conditions, Objectives Editors
- Fix sider drag not working when cursor leaves window
- Fix variaous mistakes on Events, Objectives and Conditions editing

### 0.2.2

- Conditions editing for 2.0! (1.0 is on the way)
- Fix various bugs on Events and Objectives editing

### 0.2.1

- Objectives editing for 2.0! (1.0 is on the way)
- Fix various bugs on Events editing

(For more detailes, please check [CHANGELOG.md](CHANGELOG.md))
