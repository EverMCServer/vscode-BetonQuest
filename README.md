# BetonQuest Visual Editor

[![VS Marketplace](https://img.shields.io/visual-studio-marketplace/v/EverMC.betonquest?color=brightgreen&label=VS%20Marketplace&logo=visual-studio-code&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=EverMC.betonquest)
[![License](https://img.shields.io/badge/license-AGPL--3.0-blue?style=flat-square)](https://github.com/EverMCServer/vscode-BetonQuest/blob/main/LICENSE)


A GUI based editor for [BetonQuest 2.0](https://github.com/BetonQuest/BetonQuest) scripting.

![conversation editor](assets/screenshot-conversation-light.jpg)

## Features

### Edit `Conversations` with drag-and-drop:
![demo](assets/screenshot-demo-conversation-new-option.gif)

### Build `Events` on click of a button:
![demo](assets/screenshot-demo-new-event.gif)

### Feature Roadmap
- [x] Web extension support. Just go to https://vscode.dev and try it.
- [x] Edit `Conversations` with an interactive flowchart UI.
- [x] The legacy **1.x file structure** \[[1](https://betonquest.org/1.12/User-Documentation/Reference/#packages)\] \[[2](https://betonquest.org/1.12/User-Documentation/Conversations/)\] support.
- [x] The new **2.0 file structure** \[[1](https://betonquest.org/2.0/Documentation/Scripting/Packages-%26-Templates/)\] \[[2](https://betonquest.org/2.0/Tutorials/Syntax/Quest-Packages/)\] support.
- [x] Formated `Events` Editors with built-in [documentation](https://betonquest.org/2.0/Documentation/Overview/) support.
- [x] Formated `Conditions` Editors
- [x] Formated `Objectives` Editors
- [ ] `Events`, `Conditions`, `Objectives` Editors for the **1.x file structure**
- [ ] Support [Variables](https://betonquest.org/2.0/Documentation/Scripting/Building-Blocks/Variables-List) in `Events`, `Conditions`, `Objectives` Editors.
- [ ] [Journal](https://betonquest.org/2.0/Documentation/Features/Journal/) editing.
- [ ] [Items](https://betonquest.org/2.0/Documentation/Features/Items/) editing.
- [ ] [Intergrated plugins](https://betonquest.org/2.0/Documentation/Scripting/Building-Blocks/Integration-List/) support.
- [ ] Package configuration.
- [ ] [Menu](https://betonquest.org/2.0/Documentation/Features/Menus/Menu/) editing.
- and more. Please [suggest](https://github.com/EverMCServer/vscode-BetonQuest/issues).

## Limitations

- `Conversations` Editor does not support [cross-conversation pointers](https://betonquest.org/2.0/Documentation/Features/Conversations/#cross-conversation-pointers) at this moment.
- `Events`, `Conditions`, `Objectives` Editors do not support the **1.x file structure** yet.
- Loading `Events` / `Conditions` / `Objectives` with variables might be rest to default values.

## Extension Settings

- Translation Selection - The translation selection for conversation flowchart. Default to 'en'.

## Known Issues

Please report your issues on https://github.com/EverMCServer/vscode-BetonQuest/issues

- Zoom-in and out is limited to certain degrees.
- (2.0 related) Conversation's tabs are not properly switched when clicked on the YAML file.
- (2.0 related) Conversation's tabs are switched to the first one when the YAML edited.
- `Events`, `Conditions`, `Objectives` Editor does not fully supprot [variables](https://betonquest.org/2.0/Documentation/Scripting/Building-Blocks/Variables-List/). Loading arguments with variables might be rest to default values.

## Release Notes

### 0.2.2

- Conditions editing for 2.0! (1.0 is on the way)
- Fix various bugs on Events and Objectives editing

### 0.2.1

- Objectives editing for 2.0! (1.0 is on the way)
- Fix various bugs on Events editing

### 0.2.0
- Events editing for 2.0! (1.0 is on the way)
