# BetonQuest Visual Editor

[![VS Marketplace](https://img.shields.io/visual-studio-marketplace/v/EverMC.betonquest?color=brightgreen&label=VS%20Marketplace&logo=visual-studio-code&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=EverMC.betonquest)
[![License](https://img.shields.io/badge/license-AGPL--3.0-blue?style=flat-square)](https://github.com/EverMCServer/vscode-BetonQuest/blob/main/LICENSE)


A GUI based editor for [BetonQuest 2.0](https://github.com/BetonQuest/BetonQuest) scripting.

![conversation editor](assets/screenshot-conversation-light.jpg)

## Features

### Conversations Editor

Edit `Conversations` with an interactive flowchart UI:
![demo](assets/screenshot-demo-conversation.gif)

Create and link options with drag-and-drop:
![demo](assets/screenshot-demo-conversation-new-option.gif)


### Feature Roadmap
- [x] Web extension support. Just go to https://vscode.dev and try it.
- [x] Edit `Conversations` with an interactive flowchart UI.
- [ ] Basic `Events`, `Conditions`, `Objectives` Editors with fully [documentation](https://docs.betonquest.org/2.0-DEV/Documentation/Overview/) support.
- [x] The legacy **1.x file structure** \[[1](https://docs.betonquest.org/1.12/User-Documentation/Reference/#packages)\] \[[2](https://docs.betonquest.org/1.12/User-Documentation/Conversations/)\] support.
- [x] The new **2.0 file structure** \[[1](https://docs.betonquest.org/2.0-DEV/Documentation/Scripting/Packages-%26-Templates/)\] \[[2](https://docs.betonquest.org/2.0-DEV/Tutorials/Syntax/Quest-Packages/)\] support.
- [ ] [Journal](https://docs.betonquest.org/2.0-DEV/Documentation/Features/Journal/) editing.
- [ ] [Items](https://docs.betonquest.org/2.0-DEV/Documentation/Features/Items/) editing.
- [ ] [Intergrated plugins](https://docs.betonquest.org/2.0-DEV/Documentation/Scripting/Building-Blocks/Integration-List/) support.
- [ ] Package configuration.
- [ ] [Menu](https://docs.betonquest.org/2.0-DEV/Documentation/Features/Menus/Menu/) editing.
- and more. Please [suggest](https://github.com/EverMCServer/vscode-BetonQuest/issues).

## Limitations

- `Conversations` Editor does not support [cross-conversation pointers](https://docs.betonquest.org/2.0-DEV/Documentation/Features/Conversations/#cross-conversation-pointers) at this moment.

## Extension Settings

- Translation Selection - The translation selection for conversation flowchart. Default to 'en'.

## Known Issues

Please report your issues on https://github.com/EverMCServer/vscode-BetonQuest/issues

- Zoom-in and out is limited to certain degrees.
- (2.0 related) Conversation's tabs are not properly switched when clicked on the YAML file.
- (2.0 related) Conversation's tabs are switched to the first one when the YAML edited.

## Release Notes

### 0.1.6

- Suggest YAML extension pack for grammar chacking
- The extension is not activated under web envrionment

### 0.1.5
- Web extension supported! Just go to https://vscode.dev and try it

### 0.1.4
- Fix wrong connections caused by free-hanging nodes

(For more detailes, please check [CHANGELOG.md](CHANGELOG.md))
