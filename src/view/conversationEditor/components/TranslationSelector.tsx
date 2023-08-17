import * as React from "react";

import { Space, Select } from 'antd';
import { vscode } from "../utils/vscode";

// Default languages come from
// https://github.com/BetonQuest/BetonQuest/blob/b4ce01ed301ca78fbd8663b1102b6064c2803e86/src/main/resources/messages.yml
let defaultLanguages = [
    {
        value: 'en',
        label: 'English (en)',
    },
    {
        value: 'es',
        label: 'Español (es)',
    },
    {
        value: 'pl',
        label: 'Polski (pl)',
    },
    {
        value: 'fr',
        label: 'Français (fr)',
    },
    {
        value: 'cn',
        label: '简体中文 (cn)',
    },
    {
        value: 'de',
        label: 'Deutsch (de)',
    },
    {
        value: 'nl',
        label: 'Nederlands (nl)',
    },
    {
        value: 'it',
        label: 'Italiano (it)',
    },
    {
        value: 'hu',
        label: 'Magyar (hu)',
    },
    {
        value: 'vi',
        label: 'Tiếng Việt (vi)',
    },
];

function onTranslationSearch() {}
function onTranslationChange(value: string) {
    // Send translation selection to vscode extension.
    // ...
    vscode.postMessage({
        type: "set-betonquest-translationSelection",
        content: value,
    });
    return;
}

interface Props {
    enabled: boolean,
    selectedLanguage?: string,
    languages?: string[], // Languages detected from conversation yaml
}

export default function translationSelector(props: Props): React.JSX.Element {
    // const [translationEnabledWithSwitch, setTranslationEnabledWithSwitch] = React.useState(false);
    // const [switchOnOff, setSwitchOnOff] = React.useState(false);

    return (<Space>
    {/* <Switch
        size="small"
        defaultChecked={switchOnOff}
        onChange={(checked: boolean) => {
            setTranslationEnabledWithSwitch(checked);
            setSwitchOnOff(checked);
        }}
    /> */}
    <Select
        style={!props.enabled?{display: "none"}:{}}
        value={props.selectedLanguage}
        size="small"
        // disabled={props.enabled?!false:!translationEnabledWithSwitch}
        showSearch
        placeholder="Select a translation"
        optionFilterProp="children"
        onChange={onTranslationChange}
        onSearch={onTranslationSearch}
        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
        options={defaultLanguages}
    />
    </Space>);
}