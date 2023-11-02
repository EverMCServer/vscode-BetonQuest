/* eslint-disable @typescript-eslint/naming-convention */
import _en from './data/en.json';
const en = _en as TTranslation;
import _zh_CN from './data/zh-CN.json';
const zh_CN = _zh_CN as TTranslation;

const defaultLocale = "en"; // default to "en"
let locale = defaultLocale;

type TTranslation = { [key: string]: string };

// Translation table
const translations: { [key: string]: { [key: string]: string } } = {
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

// Languages come from
// https://minecraft.fandom.com/wiki/Language
export const allLanguages = [
    {
        value: 'af',
        label: 'Afrikaans (af)'
    },
    {
        value: 'ar',
        label: 'اللغة العربية (ar)'
    },
    {
        value: 'ast',
        label: 'Asturianu (ast)'
    },
    {
        value: 'az',
        label: 'Azərbaycanca (az)'
    },
    {
        value: 'ba',
        label: 'Башҡортса (ba)'
    },
    {
        value: 'be',
        label: 'Беларуская (be)'
    },
    {
        value: 'bg',
        label: 'Български (bg)'
    },
    {
        value: 'br',
        label: 'Brezhoneg (br)'
    },
    {
        value: 'bs',
        label: 'Bosanski (bs)'
    },
    {
        value: 'ca',
        label: 'Català (ca)'
    },
    {
        value: 'cs',
        label: 'Čeština (cs)'
    },
    {
        value: 'cy',
        label: 'Cymraeg (cy)'
    },
    {
        value: 'da',
        label: 'Dansk (da)'
    },
    {
        value: 'de',
        label: 'Deutsch (de)'
    },
    {
        value: 'el',
        label: 'Ελληνικά (el)'
    },
    {
        value: 'en',
        label: 'English (en)'
    },
    {
        value: 'eo',
        label: 'Esperanto (eo)'
    },
    {
        value: 'es',
        label: 'Español (es)'
    },
    {
        value: 'et',
        label: 'Eesti (et)'
    },
    {
        value: 'eu',
        label: 'Euskara (eu)'
    },
    {
        value: 'fa',
        label: 'فارسی (fa)'
    },
    {
        value: 'fi',
        label: 'Suomi (fi)'
    },
    {
        value: 'fil',
        label: 'Filipino (fil)'
    },
    {
        value: 'fo',
        label: 'Føroyskt (fo)'
    },
    {
        value: 'fr',
        label: 'Français (fr)'
    },
    {
        value: 'fra',
        label: 'Fränggisch (fra)'
    },
    {
        value: 'fur',
        label: 'Furlan (fur)'
    },
    {
        value: 'fy',
        label: 'Frysk (fy)'
    },
    {
        value: 'ga',
        label: 'Gaeilge (ga)'
    },
    {
        value: 'gd',
        label: 'Gàidhlig (gd)'
    },
    {
        value: 'gl',
        label: 'Galego (gl)'
    },
    {
        value: 'haw',
        label: 'ʻŌlelo Hawaiʻi (haw)'
    },
    {
        value: 'he',
        label: 'עברית (he)'
    },
    {
        value: 'hi',
        label: 'हिन्दी (hi)'
    },
    {
        value: 'hr',
        label: 'Hrvatski (hr)'
    },
    {
        value: 'hu',
        label: 'Magyar (hu)'
    },
    {
        value: 'hy',
        label: 'Հայերեն (hy)'
    },
    {
        value: 'id',
        label: 'Bahasa Indonesia (id)'
    },
    {
        value: 'ig',
        label: 'Igbo (ig)'
    },
    {
        value: 'io',
        label: 'Ido (io)'
    },
    {
        value: 'is',
        label: 'Íslenska (is)'
    },
    {
        value: 'it',
        label: 'Italiano (it)'
    },
    {
        value: 'ja',
        label: '日本語(ja)'
    },
    {
        value: 'jbo',
        label: 'la .lojban. (jbo)'
    },
    {
        value: 'ka',
        label: 'ქართული (ka)'
    },
    {
        value: 'kk',
        label: 'Қазақша (kk)'
    },
    {
        value: 'kn',
        label: 'ಕನ್ನಡ (kn)'
    },
    {
        value: 'ko',
        label: '한국어 (ko)'
    },
    {
        value: 'kw',
        label: 'Kernewek (kw)'
    },
    {
        value: 'la',
        label: 'Latina (la)'
    },
    {
        value: 'lb',
        label: 'Lëtzebuergesch (lb)'
    },
    {
        value: 'li',
        label: 'Limburgs (li)'
    },
    {
        value: 'lol',
        label: 'LOLCAT (lol)'
    },
    {
        value: 'lt',
        label: 'Lietuvių (lt)'
    },
    {
        value: 'lv',
        label: 'Latviešu (lv)'
    },
    {
        value: 'mk',
        label: 'Македонски (mk)'
    },
    {
        value: 'mn',
        label: 'Монгол (mn)'
    },
    {
        value: 'ms',
        label: 'Bahasa Melayu (ms)'
    },
    {
        value: 'mt',
        label: 'Malti (mt)'
    },
    {
        value: 'nds',
        label: 'Platdüütsk (nds)'
    },
    {
        value: 'nl',
        label: 'Nederlands (nl)'
    },
    {
        value: 'nn',
        label: 'Norsk nynorsk (nn)'
    },
    {
        value: 'no',
        label: 'Norsk Bokmål (no)'
    },
    {
        value: 'oc',
        label: 'Occitan (oc)'
    },
    {
        value: 'pl',
        label: 'Polski (pl)'
    },
    {
        value: 'pt',
        label: 'Português (pt)'
    },
    {
        value: 'qya',
        label: 'Quenya (qya)'
    },
    {
        value: 'ro',
        label: 'Română (ro)'
    },
    {
        value: 'ru',
        label: 'Русский (ru)'
    },
    {
        value: 'ry',
        label: 'Руснацькый (ry)'
    },
    {
        value: 'se',
        label: 'Davvisámegiella (se)'
    },
    {
        value: 'sk',
        label: 'Slovenčina (sk)'
    },
    {
        value: 'sl',
        label: 'Slovenščina (sl)'
    },
    {
        value: 'so',
        label: 'Af-Soomaali (so)'
    },
    {
        value: 'sq',
        label: 'Shqip (sq)'
    },
    {
        value: 'sr_cs',
        label: 'Srpski (sr_cs)'
    },
    {
        value: 'sr_sp',
        label: 'Српски (sr_sp)'
    },
    {
        value: 'sv',
        label: 'Svenska (sv)'
    },
    {
        value: 'ta',
        label: 'தமிழ் (ta)'
    },
    {
        value: 'th',
        label: 'ไทย (th)'
    },
    {
        value: 'tl',
        label: 'Tagalog (tl)'
    },
    {
        value: 'tlh',
        label: 'tlhIngan Hol (tlh)'
    },
    {
        value: 'tr',
        label: 'Türkçe (tr)'
    },
    {
        value: 'tt',
        label: 'Татарча (tt)'
    },
    {
        value: 'uk',
        label: 'Українська (uk)'
    },
    {
        value: 'val',
        label: 'Català (val)'
    },
    {
        value: 'vec',
        label: 'Vèneto (vec)'
    },
    {
        value: 'vi',
        label: 'Tiếng Việt (vi)'
    },
    {
        value: 'yi',
        label: 'ייִדיש (yi)'
    },
    {
        value: 'yo',
        label: 'Yorùbá (yo)'
    },
    {
        value: 'cn',
        label: '简体中文 (cn)'
    },
    {
        value: 'hk',
        label: '繁體中文 (hk)'
    },
    {
        value: 'tw',
        label: '繁體中文 (tw)'
    },
    {
        value: 'zlm',
        label: 'بهاس ملايو (zlm)'
    }
];
