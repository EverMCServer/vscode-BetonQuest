# BetonQuest Visual Editor

A GUI based editor for [BetonQuest 2.0](https://github.com/BetonQuest/BetonQuest) scripting.

![conversation editor](assets/screenshot-conversation-light.jpg)

## Features

### Conversations Editor

Edit `Conversations` with an interactive flowchart UI:
![demo](assets/screenshot-demo-conversation.gif)

Create and link options with drag-and-drop:
![demo](assets/screenshot-demo-conversation-new-option.gif)


### Feature Roadmap
- [x] Edit `Conversations` with an interactive flowchart UI.
- [ ] Basic `Events`, `Conditions`, `Objectives` Editors with fully [documentation](https://docs.betonquest.org/2.0-DEV/Documentation/Overview/) support.
- [x] The legacy **1.x file structure** \[[1](https://docs.betonquest.org/1.12/User-Documentation/Reference/#packages)\] \[[2](https://docs.betonquest.org/1.12/User-Documentation/Conversations/)\] support.
- [ ] The new **2.0 file structure** \[[1](https://docs.betonquest.org/2.0-DEV/Documentation/Scripting/Packages-%26-Templates/)\] \[[2](https://docs.betonquest.org/2.0-DEV/Tutorials/Syntax/Quest-Packages/)\] support.
- [ ] [Journal](https://docs.betonquest.org/2.0-DEV/Documentation/Features/Journal/) editing.
- [ ] [Items](https://docs.betonquest.org/2.0-DEV/Documentation/Features/Items/) editing.
- [ ] [Intergrated plugins](https://docs.betonquest.org/2.0-DEV/Documentation/Scripting/Building-Blocks/Integration-List/) support.
- [ ] Package configuration.
- [ ] [Menu](https://docs.betonquest.org/2.0-DEV/Documentation/Features/Menus/Menu/) editing.
- and more. Please [suggest](https://github.com/EverMCServer/vscode-BetonQuest/issues).

## Limitations

- The new **2.0 file structure** \[[1](https://docs.betonquest.org/2.0-DEV/Documentation/Scripting/Packages-%26-Templates/)\] \[[2](https://docs.betonquest.org/2.0-DEV/Tutorials/Syntax/Quest-Packages/)\] is not supported currently due to [various difficulties](https://github.com/EverMCServer/vscode-BetonQuest/issues/5) (more helps needed!). If you are using such a format, you should convert your files manually before importing them into your server:
```yaml
conversations:
  MyNPC: # Name of your npc
    # Paste the content of a legacy conversation file here.
    # Don't forget the indention: just select the content and `tab` twice.
```

- `Conversations` Editor does not support [cross-conversation pointers](https://docs.betonquest.org/2.0-DEV/Documentation/Features/Conversations/#cross-conversation-pointers) at this moment.

## Extension Settings

- Translation Selection - The translation selection for conversation flowchart. Default to 'en'.

## Known Issues

Please report your issues on https://github.com/EverMCServer/vscode-BetonQuest/issues

- The new *2.0 file structure* is not supported at this moment due to [various difficulties](https://github.com/EverMCServer/vscode-BetonQuest/issues/5). If you are scripting with the new file format, you may consider [manually convert your files](https://github.com/EverMCServer/vscode-BetonQuest/issues/5#issuecomment-1694207893) before loading them onto your server.
- Zoom-in and out is limited to certain degrees.
- Lines in Yaml files are re-ordered while editing.
- Original comments in Yaml files are erased while editing.

## Release Notes

### 0.0.9
- Sync cursor position when a node is clicked
- Fix flowchart is not being updated when undo/redo
- Preserve nodes selection if possible
- Fix viewport be moved while typing

### 0.0.8
- Conversation optiosn can now be fast-located with cursor on yaml documents
- Fix "Open Conversation Flowchart" button does not show up in Windows

### 0.0.7

- Various bugs fix

(For more detailes, please check [CHANGELOG.md](CHANGELOG.md))
