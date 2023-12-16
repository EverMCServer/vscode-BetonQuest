// Script to generate all available DataType lists

import EntityType from "./DataType/EntityType";
import * as fs from "fs";
import Material from "./DataType/Material";
import Enchantment from "./DataType/Enchantment";

// Config
const OUTPUT_DIR = __dirname;

const BUKKIT_ENTITY_TYPE_SOURCE = 'https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/raw/src/main/java/org/bukkit/entity/EntityType.java?at=refs%2Fheads%2Fmaster';
const BUKKIT_MATERIAL_SOURCE = 'https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/raw/src/main/java/org/bukkit/Material.java?at=refs%2Fheads%2Fmaster';
const BUKKIT_ENCHANTMENT_SOURCE = 'https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/raw/src/main/java/org/bukkit/enchantments/Enchantment.java?at=refs%2Fheads%2Fmaster';

const pathEntityTypeList = OUTPUT_DIR + "/DataType/EntityTypeList.json";
generateEntityTypeList(pathEntityTypeList);

const pathMaterialList = OUTPUT_DIR + "/DataType/MaterialList.json";
generateMaterialList(pathMaterialList);

const pathEnchantmentList = OUTPUT_DIR + "/DataType/EnchantmentList.json";
generateEnchantmentList(pathEnchantmentList);

// Bukkit's EntityTypes
// https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/browse/src/main/java/org/bukkit/entity/EntityType.java
function generateEntityTypeList(savePath: string) {
    fetch(BUKKIT_ENTITY_TYPE_SOURCE).then(response => {
        response.text().then(text => {
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
        });
    }).catch(reason => {
        throw new Error(`Unexpeted error while fetching Bukkit's EntityType: ${reason}`);
    });
}

// Bukkit's Materials
// https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/browse/src/main/java/org/bukkit/Material.java
function generateMaterialList(savePath: string) {
    fetch(BUKKIT_MATERIAL_SOURCE).then(response => {
        response.text().then(text => {
            // Cache matched results
            const cache: {
                bukkitId: string,
                bukkitNumberId: number
            }[] = [];

            // RegExp to extract all Bukkit's MATERIAL IDs
            const patternExtract = /(?:^|,)\s*([a-z_\d]+)\s*\(\s*(\d+)\s*(?:,|\))/gmi;
            let array1: RegExpExecArray | null;
            while ((array1 = patternExtract.exec(text)) !== null) {
                if (array1[1] && array1[2]) {
                    cache.push({ bukkitId: array1[1], bukkitNumberId: parseInt(array1[2]) });
                }
            }

            // Create the Material list
            const materialList: Material[] = cache.map(v => new Material(v.bukkitId, v.bukkitNumberId));


            if (materialList.length < 1) {
                throw new Error(`Unexpeted error while parsing Bukkit's Material with url: ${BUKKIT_MATERIAL_SOURCE} body: ${text}.`);
            }

            fs.writeFileSync(savePath, JSON.stringify(materialList));
        });
    }).catch(reason => {
        throw new Error(`Unexpeted error while fetching Bukkit's Material: ${reason}`);
    });
}

// Bukkit's Enchantments
// https://hub.spigotmc.org/stash/projects/SPIGOT/repos/bukkit/browse/src/main/java/org/bukkit/enchantments/Enchantment.java
function generateEnchantmentList(savePath: string) {
    fetch(BUKKIT_ENCHANTMENT_SOURCE).then(response => {
        response.text().then(text => {
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
                throw new Error(`Unexpeted error while parsing Bukkit's Enchantment with url: ${BUKKIT_ENTITY_TYPE_SOURCE} body: ${text}.`);
            }

            fs.writeFileSync(savePath, JSON.stringify(enchantmentList));
        });
    }).catch(reason => {
        throw new Error(`Unexpeted error while fetching Bukkit's Enchantment: ${reason}`);
    });
}
