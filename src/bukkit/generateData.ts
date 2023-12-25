// Script to generate all available DataType lists

import * as fs from "fs";

import EntityType from "./DataType/EntityType";
import Material from "./DataType/Material";
import Enchantment from "./DataType/Enchantment";
import PotionEffectType from "./DataType/PotionEffectType";

// Config
const OUTPUT_DIR = __dirname + "/Data";

const BUKKIT_ENTITY_TYPE_SOURCE = 'https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/raw/src/main/java/org/bukkit/entity/EntityType.java?at=refs%2Fheads%2Fmaster';
const BUKKIT_MATERIAL_SOURCE = 'https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/raw/src/main/java/org/bukkit/Material.java?at=refs%2Fheads%2Fmaster';
const BUKKIT_ENCHANTMENT_SOURCE = 'https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/raw/src/main/java/org/bukkit/enchantments/Enchantment.java?at=refs%2Fheads%2Fmaster';
const BUKKIT_POTION_EFFECT_TYPE_SOURCE = 'https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/raw/src/main/java/org/bukkit/potion/PotionEffectType.java?at=refs%2Fheads%2Fmaster';

(async () => {
    console.log("Generating EntityTypeList.json ...");
    const pathEntityTypeList = OUTPUT_DIR + "/EntityTypeList.json";
    await generateEntityTypeList(pathEntityTypeList);

    console.log("Generating MaterialList.json ...");
    const pathMaterialList = OUTPUT_DIR + "/MaterialList.json";
    await generateMaterialList(pathMaterialList);

    console.log("Generating EnchantmentList.json ...");
    const pathEnchantmentList = OUTPUT_DIR + "/EnchantmentList.json";
    await generateEnchantmentList(pathEnchantmentList);

    console.log("Generating PotionEffectTypeList.json ...");
    const pathPotionEffectTypeList = OUTPUT_DIR + "/PotionEffectTypeList.json";
    await generatePotionEffectTypeList(pathPotionEffectTypeList);

    console.log("All data succesfully generated.");
})();

// Bukkit's EntityTypes
// https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/browse/src/main/java/org/bukkit/entity/EntityType.java
async function generateEntityTypeList(savePath: string) {
    try {
        const response = await fetch(BUKKIT_ENTITY_TYPE_SOURCE);
        const text = await response.text();
        // Cache matched results
        const cache: {
            bukkitId: string,
            minecraftId: string,
            legacyIds: string[]
        }[] = [];

        // RegExp to extract all Bukkit's EntityType IDs
        const patternExtract = /(?:^|,)\s*([a-z_]+)\s*\(\s*"([a-z_]+)"\s*,\s*[a-z\.\s]+class/gmi;
        let array1: RegExpExecArray | null;
        while ((array1 = patternExtract.exec(text)) !== null) {
            if (array1[1] && array1[2]) {
                cache.push({ bukkitId: array1[1], minecraftId: array1[2], legacyIds: [] });
            }
        }

        // RegExp to extract legacy IDs
        const patternExtractLegacy = /(?:^|;)\s*NAME_MAP\s*\.\s*put\s*\(\s*"([a-z_]+)"\s*,\s*([a-z_]+)\s*\)\s*;/gmi;
        let array2: RegExpExecArray | null;
        while ((array2 = patternExtractLegacy.exec(text)) !== null) {
            if (array2[1] && array2[2]) {
                cache
                    .find(e => e.bukkitId === array2![2])
                    ?.legacyIds.push(array2[1]);
            }
        }

        // Create the EntityType list
        const entityTypeList: EntityType[] = cache.map(v => new EntityType(v.bukkitId, v.minecraftId, v.legacyIds));

        if (entityTypeList.length < 1) {
            throw new Error(`Unexpeted error while parsing Bukkit's EntityType with url: ${BUKKIT_ENTITY_TYPE_SOURCE} body: ${text}.`);
        }

        fs.writeFileSync(savePath, JSON.stringify(entityTypeList));
    } catch (reason) {
        throw new Error(`Unexpeted error while fetching Bukkit's EntityType: ${reason}`);
    }
}

// Bukkit's Materials
// https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/browse/src/main/java/org/bukkit/Material.java
async function generateMaterialList(savePath: string) {
    try {
        const response = await fetch(BUKKIT_MATERIAL_SOURCE);
        const text = await response.text();
        // Cache matched results
        const cache: {
            bukkitId: string,
            bukkitNumberId: number

            flags: {
                block?: boolean,
                edible?: boolean,
                record?: boolean,
                solid?: boolean,
                air?: boolean,
                transparent?: boolean,
                flammable?: boolean,
                burnable?: boolean,
                fuel?: boolean,
                occluding?: boolean,
                gravity?: boolean,
                item?: boolean,
                interactable?: boolean,
                [key: string]: any
            }
        }[] = [];

        // RegExp to extract all Bukkit's MATERIAL IDs
        const patternExtract = /(?:^|,)\s*([a-z_\d]+)\s*\(\s*(\d+)\s*(?:,|\))/gmi;
        let array1: RegExpExecArray | null;
        while ((array1 = patternExtract.exec(text)) !== null) {
            if (array1[1] && array1[2]) {
                cache.push({ bukkitId: array1[1], bukkitNumberId: parseInt(array1[2]), flags: {} });
            }
        }

        // RegExp to extract flags, "isBlock" etc.
        const flagsString = ["block", "edible", "record", "solid", "air", "transparent", "flammable", "burnable", "fuel", "occluding", "gravity", "item", "interactable"];
        for (let i = 0; i < flagsString.length; i++) {
            const flag = flagsString[i];
            console.log(`  Converting flag "${flag}" ...`);
            const [textFlags] = text.match(new RegExp(`public boolean (?:i|ha)s${flag}\s*\(.*?\)\s*\{.*?switch\s*\(.+?\)\s*\{(.+?)\}`, "mis")) ?? [""];
            const patternExtractFlag = /\s*case\s+([a-z_]+)/gi;
            while ((array1 = patternExtractFlag.exec(textFlags)) !== null) {
                if (array1[1]) {
                    const material = cache.find(e => e.bukkitId === array1![1]);
                    if (material) {
                        material.flags[flag] = true;
                    }
                }
            }
        }

        // Create the Material list
        const materialList: Material[] = cache.map(v => new Material(v.bukkitId, v.bukkitNumberId, v.flags));

        if (materialList.length < 1) {
            throw new Error(`Unexpeted error while parsing Bukkit's Material with url: ${BUKKIT_MATERIAL_SOURCE} body: ${text}.`);
        }

        fs.writeFileSync(savePath, JSON.stringify(materialList));
    } catch (reason) {
        throw new Error(`Unexpeted error while fetching Bukkit's Material: ${reason}`);
    };
}

// Bukkit's Enchantments
// https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/browse/src/main/java/org/bukkit/enchantments/Enchantment.java
async function generateEnchantmentList(savePath: string) {
    try {
        const response = await fetch(BUKKIT_ENCHANTMENT_SOURCE);
        const text = await response.text();
        // Cache matched results
        const cache: {
            bukkitId: string,
            minecraftId: string,
            legacyIds: string[]
        }[] = [];

        // RegExp to extract all Bukkit's Enchantment IDs
        const patternExtract = /(?:^|;)\s*public\s*static\s*final\s*Enchantment\s*([a-z_]+)\s*=\s*getEnchantment\s*\(\s*"([a-z_]+)"\s*\)\s*;/gmi;
        let array1: RegExpExecArray | null;
        while ((array1 = patternExtract.exec(text)) !== null) {
            if (array1[1] && array1[2]) {
                cache.push({ bukkitId: array1[1], minecraftId: array1[2], legacyIds: [] });
            }
        }

        // RegExp to extract legacy IDs
        const patternExtractLegacy = /(?:^|;)\s*case\s*"([a-z_]+)"\s*:\s*return\s*"([a-z_]+)"\s*;/gmi;
        let array2: RegExpExecArray | null;
        while ((array2 = patternExtractLegacy.exec(text)) !== null) {
            if (array2[1] && array2[2]) {
                cache
                    .find(e => e.minecraftId === array2![2])
                    ?.legacyIds.push(array2[1]);
            }
        }

        // Create the Enchantment list
        const enchantmentList: Enchantment[] = cache.map(v => new Enchantment(v.bukkitId, v.minecraftId, v.legacyIds));

        if (enchantmentList.length < 1) {
            throw new Error(`Unexpeted error while parsing Bukkit's Enchantment with url: ${BUKKIT_ENCHANTMENT_SOURCE} body: ${text}.`);
        }

        fs.writeFileSync(savePath, JSON.stringify(enchantmentList));
    } catch (reason) {
        throw new Error(`Unexpeted error while fetching Bukkit's Enchantment: ${reason}`);
    };
}

// Bukkit's PotionEffectTypes
// https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/raw/src/main/java/org/bukkit/potion/PotionEffectType.java
async function generatePotionEffectTypeList(savePath: string) {
    try {
        const response = await fetch(BUKKIT_POTION_EFFECT_TYPE_SOURCE);
        const text = await response.text();
        // Cache matched results
        const cache: {
            bukkitId: string,
            minecraftId: string,
        }[] = [];

        // RegExp to extract all Bukkit's PotionEffectType IDs
        const patternExtract = /public\s*static\s*final\s*PotionEffectType\s*([A-Z_]+).+?(?:'|")([^'"]+)/gmi;
        let array1: RegExpExecArray | null;
        while ((array1 = patternExtract.exec(text)) !== null) {
            if (array1[1] && array1[2]) {
                cache.push({ bukkitId: array1[1], minecraftId: array1[2] });
            }
        }

        // Create the PotionEffectType list
        const potionEffectTypeList: PotionEffectType[] = cache.map(v => new PotionEffectType(v.bukkitId, v.minecraftId));

        if (potionEffectTypeList.length < 1) {
            throw new Error(`Unexpeted error while parsing Bukkit's PotionEffectType with url: ${BUKKIT_POTION_EFFECT_TYPE_SOURCE} body: ${text}.`);
        }

        fs.writeFileSync(savePath, JSON.stringify(potionEffectTypeList));
    } catch (reason) {
        throw new Error(`Unexpeted error while fetching Bukkit's PotionEffectType: ${reason}`);
    };
}
