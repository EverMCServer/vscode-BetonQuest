# BetonQuest IntelliSense and GUI Editor

[![VS Marketplace](https://img.shields.io/visual-studio-marketplace/v/EverMC.betonquest?color=brightgreen&label=Release&logo=visual-studio-code&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=EverMC.betonquest)
[![VS Marketplace](https://img.shields.io/visual-studio-marketplace/v/EverMC.betonquest?color=ff9000&label=Pre-Release&logo=visual-studio-code&style=flat-square&include_prereleases)](https://marketplace.visualstudio.com/items?itemName=EverMC.betonquest)
[![License](https://img.shields.io/badge/license-AGPL--3.0-blue?style=flat-square)](https://github.com/EverMCServer/vscode-BetonQuest/blob/main/LICENSE)


IntelliSense and GUI editor for [BetonQuest](https://github.com/BetonQuest/BetonQuest) scripting.

![conversation editor](assets/screenshot-conversation-light.jpg)

## How to use

### Local installation
It is the recommended setup for daily developments.
1. Download and install [VSCode](https://code.visualstudio.com/).
1. Install this extension from [Marketplace](https://marketplace.visualstudio.com/items?itemName=EverMC.betonquest).
1. Open the whole `BetonQuest` folder with VSCode.

### Web editing
For a quick trial. It works on your tablet and even a cellphone!
1. Goto [https://vscode.dev](https://vscode.dev).
1. Click on the Extensions tab on the left.
1. Search `EverMC.betonquest` and install it
1. Open the whole `BetonQuest` folder with VSCode.

## IntelliSense Showcase
(See the screenshot above)

## GUI Editor Showcase

### Edit `Conversations` with drag-and-drop:
![demo](assets/screenshot-demo-conversation-new-option.gif)

### Build `Events` on click of a button:
![demo](assets/screenshot-demo-new-event.gif)

### Locate `Conditions` has never been so easy:
![demo](assets/screenshot-demo-goto.gif)

### Theme:
![demo](assets/screenshot-demo-theme.gif)

## Feature Roadmap
- ✅ Web extension support! Just go to https://vscode.dev and install it through the Extensions tab.
- IntelliSense
    - ✅ Right click and Go To Definitions / References of `Pointers`, `Events`, `Conditions`, `Objectives`.
    - ✅ Code semantic highlight.
    - ⬜ Hint / errors translation.
    - ⬜ Semantic highlight and references for instructions.
    - ⬜ (WIP) Code completion.
- GUI editor
    - ✅ GUI editor for `Conversations`, `Events`, `Conditions`, `Objectives` with built-in [documentation](https://betonquest.org/2.1/Documentation/Overview/) support.
    - ⬜ [Journal](https://betonquest.org/2.1/Documentation/Features/Journal/) editing.
    - ⬜ [Items](https://betonquest.org/2.1/Documentation/Features/Items/) editing.
    - ⬜ (WIP) [Integrated plugins](https://betonquest.org/2.1/Documentation/Scripting/Building-Blocks/Integration-List/) support.
    - ⬜ Advanced Variable editor.
    - ⬜ Package configuration.
    - ⬜ [Menu](https://betonquest.org/2.1/Documentation/Features/Menus/Menu/) editing.
    - and more. Please [suggest](https://github.com/EverMCServer/vscode-BetonQuest/issues).
    - ⬜ [Global Variables](https://betonquest.org/2.1/Documentation/Scripting/Building-Blocks/Variables-List/#global-variables) support.
- ✅ Click and jump between the code / flowchart / editor.
- ✅ i18n support.
    - English
    - Simplified Chinese 简体中文
    - Japanese 日本語 (contributed by shanaOP [@dusty01534](https://github.com/dusty01534))

## Limitations

- Code semantic highlight colors is subject to be changed anytime during development.
- `Conversations` GUI editor does not support [cross-conversation pointers](https://betonquest.org/2.1/Documentation/Features/Conversations/#cross-conversation-pointers) at this moment.
- [Global Variables](https://betonquest.org/2.1/Documentation/Scripting/Building-Blocks/Variables-List/#global-variables) conflicted with this extension. Please consider convert your scripts before using this extension. Support for Global Variables may be added in the far future.

## Extension Settings

- Translation Selection - The translation selected for conversation flowchart. Default to 'en'.

## Known Issues

Please report your issues on https://github.com/EverMCServer/vscode-BetonQuest/issues

- Zoom-in and out is limited to certain degrees.
- (2.0 related) Conversation's tabs are not properly switched when clicked on the YAML file.
- (2.0 related) Conversation's tabs are switched to the first one when the YAML edited.
- `notify` Event is not fully supported at this moment.

## About Translations

Currently only English and Simplified Chinese are available. If you want to contribute your translation, here are the instructions:

1. [Fork this project](https://github.com/EverMCServer/vscode-BetonQuest/fork) and clone it down.

1. Search and install a [VSCode's Language Pack](https://code.visualstudio.com/docs/getstarted/locales) extension from the [marketplace](https://code.visualstudio.com/docs/editor/extension-marketplace) of which you want to translate. Then reload your VSCode.

1. There are only 3 files you need to change:

    - Copy `utils/src/i18n/data/en.json` to `utils/src/i18n/data/[locale_code].json` then translate it.

        The `[locale_code]` part is referer to the list [here](https://code.visualstudio.com/docs/getstarted/locales#_available-locales). If the locale contains a dash `-`, please convert it to an underscore `_`.

    - Copy `package.nls.json` to `package.nls.[locale-code].json` then translate it.

        This time you should not convert any dash to underscore.

    - Add new imports on `utils/src/i18n/i18n.ts`:

        ```typescript
        import en from './data/en.json';
        import zh_cn from './data/zh_cn.json';
        // ...
        import locale_code_with_underscore from './data/[locale_code_with_underscore].json'; // New

        // Translation table
        const translations: Map<string, TTranslation> = new Map([
            ["en", en as TTranslation],
            ["zh-cn", zh_cn as TTranslation],
            // ...
            ["[locale-code-with-dash]", locale_code_with_underscore as TTranslation], // New
        ]);

        // ...
        ```

1. If you want to test run the project. You need to install [Node.js](https://nodejs.org/en/download) and do `npm install`. After that just reload your VSCode then hit `F5`.

1. Push your codes

1. Submit a [Pull Request](https://github.com/EverMCServer/vscode-BetonQuest/pulls) onto the `main` branch. Once everything checked your work will be merged.

Helps on translating this extension are welcomed. Please consider submitting your Pull Request onto the repository. 🥺


## Release Notes

### 0.5.x pre-release

- Add Language Server for BetonQuest v1 and v2 scripts
- Add Definitions and References searching
- Add Semantic Highlight
- Add Code Completions (wip)
- Add Citizens integrations
- Fix various bugs

### 0.4.1

- Fully supports Japanese 日本語に完全対応 (contributed by shanaOP [@dusty01534](https://github.com/dusty01534))

### 0.4.0

- Add "goto" support, now you can jump between the code and the editor when clicking on an Events / Objectives / Conditions
- Adjust flowchart style to better suite VSCode's color theme
- Fix missing translation

(For more detailes, please check [CHANGELOG.md](CHANGELOG.md))
