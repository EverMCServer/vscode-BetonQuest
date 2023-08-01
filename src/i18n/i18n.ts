/* eslint-disable @typescript-eslint/naming-convention */
import _en from './data/en.json';
const en = _en as TTranslation;
import _zh_CN from './data/zh-CN.json';
const zh_CN = _zh_CN as TTranslation;

const defaultLocale = "en"; // default to "en"
let locale = defaultLocale;

type TTranslation = {[key: string]: string};

// Translation table
const translations : {[key: string]: {[key: string]: string}} = {
    "en": en,
    "zh_CN": zh_CN,
};

// Set language code, e.g. "en", "zh-CN"
// Language codes are defined as IETF language tag with ISO 639‑1 & ISO 3166‑1 standards https://en.wikipedia.org/wiki/IETF_language_tag
export function setLocale(languageCode: string) {
    languageCode = languageCode.replace("-", "_");
    if (languageCode.startsWith("en_")) {
        languageCode = "en";
    }

    if (["en", "zh_CN"].includes(languageCode)) {
        locale = languageCode;
    }
}

// Get translation by key
export default function L(key: string): string {
    if (translations[locale][key]) {
        return translations[locale][key];
    } else {
        return translations[defaultLocale][key];
    }
}
