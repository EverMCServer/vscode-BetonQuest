// Script to generate all available DataType lists

import * as fs from "fs";

import EntityType from "../utils/src/bukkit/DataType/EntityType";
import Material from "../utils/src/bukkit/DataType/Material";
import Enchantment from "../utils/src/bukkit/DataType/Enchantment";
import PotionEffectType from "../utils/src/bukkit/DataType/PotionEffectType";
import DyeColor from "../utils/src/bukkit/DataType/DyeColor";
import path from "path";
import Biome from "../utils/src/bukkit/DataType/Biome";

// Config
const OUTPUT_DIR = path.join(path.dirname(__dirname), "./utils/src/bukkit/Data");
console.log("OUTPUT_DIR:", OUTPUT_DIR);

const BUKKIT_ENTITY_TYPE_SOURCE = 'https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/raw/src/main/java/org/bukkit/entity/EntityType.java?at=refs%2Fheads%2Fmaster';
const BUKKIT_MATERIAL_SOURCE = 'https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/raw/src/main/java/org/bukkit/Material.java?at=refs%2Fheads%2Fmaster';
const BUKKIT_ENCHANTMENT_SOURCE = 'https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/raw/src/main/java/org/bukkit/enchantments/Enchantment.java?at=refs%2Fheads%2Fmaster';
const BUKKIT_POTION_EFFECT_TYPE_SOURCE = 'https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/raw/src/main/java/org/bukkit/potion/PotionEffectType.java?at=refs%2Fheads%2Fmaster';
const BUKKIT_DYE_COLOR_SOURCE = 'https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/raw/src/main/java/org/bukkit/DyeColor.java?at=refs%2Fheads%2Fmaster';
const BUKKIT_BIOME_SOURCE = 'https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/raw/src/main/java/org/bukkit/block/Biome.java?at=refs%2Fheads%2Fmaster';

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

    console.log("Generating DyeColorList.json ...");
    const pathDyeColorList = OUTPUT_DIR + "/DyeColorList.json";
    await generateDyeColorList(pathDyeColorList);

    console.log("Generating BiomeList.json ...");
    const biomeList = OUTPUT_DIR + "/BiomeList.json";
    await generateBiomeList(biomeList);

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
            minecraftId: string
        }[] = [];

        // RegExp to extract all Bukkit's EntityType IDs
        const patternExtract = /(?:^|,)\s*([a-z_]+)\s*\(\s*"([a-z_]+)"\s*,\s*[a-z\.\s]+class/gmi;
        let array1: RegExpExecArray | null;
        while ((array1 = patternExtract.exec(text)) !== null) {
            if (array1[1] && array1[2]) {
                cache.push({ bukkitId: array1[1], minecraftId: array1[2] });
            }
        }

        // Create the EntityType list
        const entityTypeList: EntityType[] = cache.map(v => new EntityType(v.bukkitId, v.minecraftId));

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
            minecraftId: string
        }[] = [];

        // RegExp to extract all Bukkit's Enchantment IDs
        const patternExtract = /(?:^|;)\s*public\s*static\s*final\s*Enchantment\s*([a-z_]+)\s*=\s*getEnchantment\s*\(\s*"([a-z_]+)"\s*\)\s*;/gmi;
        let array1: RegExpExecArray | null;
        while ((array1 = patternExtract.exec(text)) !== null) {
            if (array1[1] && array1[2]) {
                cache.push({ bukkitId: array1[1], minecraftId: array1[2] });
            }
        }

        // Create the Enchantment list
        const enchantmentList: Enchantment[] = cache.map(v => new Enchantment(v.bukkitId, v.minecraftId));

        if (enchantmentList.length < 1) {
            throw new Error(`Unexpeted error while parsing Bukkit's Enchantment with url: ${BUKKIT_ENCHANTMENT_SOURCE} body: ${text}.`);
        }

        fs.writeFileSync(savePath, JSON.stringify(enchantmentList));
    } catch (reason) {
        throw new Error(`Unexpeted error while fetching Bukkit's Enchantment: ${reason}`);
    };
}

// Bukkit's PotionEffectTypes
// https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/browse/src/main/java/org/bukkit/potion/PotionEffectType.java
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

// Bukkit's DyeColors
// https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/browse/src/main/java/org/bukkit/DyeColor.java
async function generateDyeColorList(savePath: string) {
    try {
        const response = await fetch(BUKKIT_DYE_COLOR_SOURCE);
        const text = await response.text();
        // Cache matched results
        const cache: {
            bukkitId: string,
            color: string,
            fireworkColor: string,
        }[] = [];

        // RegExp to extract all Bukkit's DyeColors names and RGB
        const patternExtract = /^\s*([A-Z_]+).*?Color\.fromRGB\(0x([0-9A-F]+?)\).+?Color\.fromRGB\(0x([0-9A-F]+?)\)/gmi;
        let array1: RegExpExecArray | null;
        while ((array1 = patternExtract.exec(text)) !== null) {
            if (array1[1] && array1[2] && array1[3]) {
                cache.push({ bukkitId: array1[1], color: array1[2], fireworkColor: array1[3] });
            }
        }

        // Create the DyeColors list
        const dyeColorList: DyeColor[] = cache.map(v => new DyeColor(v.bukkitId, v.color, v.fireworkColor));

        if (dyeColorList.length < 1) {
            throw new Error(`Unexpeted error while parsing Bukkit's DyeColor with url: ${BUKKIT_DYE_COLOR_SOURCE} body: ${text}.`);
        }

        fs.writeFileSync(savePath, JSON.stringify(dyeColorList));
    } catch (reason) {
        throw new Error(`Unexpeted error while fetching Bukkit's DyeColor: ${reason}`);
    };
}

// Bukkit's Biomes
// https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/browse/src/main/java/org/bukkit/block/Biome.java
async function generateBiomeList(savePath: string) {
    try {
        const response = await fetch(BUKKIT_BIOME_SOURCE);
        const text = await response.text();
        // Cache matched results
        const cache: {
            bukkitId: string,
        }[] = [];

        // RegExp to extract all Bukkit's Biome names
        const patternExtract = /^\s*Biome\s+([A-Z_]+).*;/gm;
        let array1: RegExpExecArray | null;
        while ((array1 = patternExtract.exec(text)) !== null) {
            if (array1[1]) {
                cache.push({ bukkitId: array1[1] });
            }
        }

        // Create the Biome list
        const biomeList: Biome[] = cache.map(v => new Biome(v.bukkitId));

        if (biomeList.length < 1) {
            throw new Error(`Unexpeted error while parsing Bukkit's Biome with url: ${BUKKIT_BIOME_SOURCE} body: ${text}.`);
        }

        fs.writeFileSync(savePath, JSON.stringify(biomeList));
    } catch (reason) {
        throw new Error(`Unexpeted error while fetching Bukkit's Biome: ${reason}`);
    };
}
