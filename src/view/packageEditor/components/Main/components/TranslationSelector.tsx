import * as React from "react";

import { Space, Select, Divider, Button } from 'antd';
import { vscode } from "../../../../components/vscode";
import { allLanguages } from "../../../../../i18n/i18n";

interface Props {
    enabled: boolean,
    selectedTranslation?: string,
    allTranslations: string[], // Languages detected from conversation yaml
}

export default function translationSelector(props: Props): React.JSX.Element {

    const [name, setName] = React.useState("");
    const [items, setItems] = React.useState(allLanguages.filter(e=>!props.allTranslations.every(f=>f!==e.value)));

    React.useEffect(() => {
        // Get all translations from props
        let translations = props.allTranslations.map(f => {
            return {
                value: f,
                label: f
            };
        });
        // Replace display name by language list
        translations.map(e => {
            e.label = allLanguages.find(f => e.value === f.value)?.label || e.label;
        });
        setItems(translations);
    }, [props.allTranslations]);

    function onTranslationChange(value: string) {
        // Send translation selection to vscode extension.
        vscode.postMessage({
        type: "set-betonquest-translationSelection",
        content: value,
        });
        return;
    }

    function preventEvent(e: React.MouseEvent) {
        // e.preventDefault();
        e.stopPropagation();
    }

    const onNameChange = (value: string) => {
        setName(value);
    };

    const addItem = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        if (!name) {
            return;
        }
        if (items.find((e) => e.value === name)) {
            return;
        }
        const item = allLanguages.find(e => e.value === name);
        if (!item) {
            return;
        }
        setItems([...items, item]);
        setName("");
    };

    return (
        <Select
        value={props.selectedTranslation}
        onChange={onTranslationChange}
        style={!props.enabled?{display:"none"}:{}}
        size="small"
        showSearch
        popupMatchSelectWidth={false}
        placeholder="language"
        // dropdownAlign={{points:['tr', 'br']}}
        // dropdownStyle={{alignItems: "right"}}
        dropdownRender={(menu) => (
            <>
            {menu}
            <Divider style={{ margin: "8px 0" }} />
            <Space style={{ padding: "0 4px 4px" }} onMouseDown={preventEvent}>
                <Button style={{height: "auto", padding:"0px 6px"}} type="text" onClick={addItem}>
                +
                </Button>
                <Select
                popupMatchSelectWidth={false}
                placeholder="New Translation"
                size="small"
                showSearch
                value={name||undefined}
                onChange={onNameChange}
                filterOption={(input, option) =>
                    (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={allLanguages.filter(e=>items.every(f=>f.value!==e.value))}
                />
            </Space>
            </>
        )}
        filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        options={items}
        />
    );
}