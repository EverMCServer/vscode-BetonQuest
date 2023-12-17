import Material from "../../api/DataType/Material";
import MATERIAL_LIST from "../../api/DataType/MaterialList";
import Enchantment from "./Enchantment";

/**
 * BetonQuest's Item
 * 
 * Reference: https://docs.betonquest.org/2.0-DEV/Documentation/Features/Items/
 */
export default class Item {

    // General properties
    private material: Material;
    private questItem: boolean;
    private name?: string;
    private lore?: string;
    private enchantments: Enchantment[];
    private unbreakable?: boolean;
    private customModelData?: string;
    private noCustomModelData?: boolean;
    private flags?: string[];

    // Books' Properties, when material = .+_BOOK.*
    private title?: string;
    private author?: string;
    private text?: string;

    // Potions
    // Heads
    // Leather armor
    // Fireworks
    // Firework charges
    // TODO...

    // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/item/QuestItem.java#L91
    constructor(
        bukkitId: string,
        isQuestItem: boolean,
        name?: string,
        lore?: string,
        enchantments?: Enchantment[],
        unbreakable?: boolean,
        customModelData?: string,
        noCustomModelData?: boolean,
        flags?: string[],
        ) {
        this.material = this.getMaterialByBukkitId(bukkitId.toUpperCase());
        this.questItem = isQuestItem;
        this.name = name;
        this.lore = lore;
        this.enchantments = enchantments || [];
        this.unbreakable = unbreakable;
        this.customModelData = customModelData;
        this.noCustomModelData = noCustomModelData;
        this.flags = flags;
    }

    toString(): string {
        return this.material.getBukkitId();
    }

    getMaterial(): Material {
        return this.material;
    }

    isQuestItem(): boolean {
        return this.questItem;
    }

    setQuestItem(isQuestItem: boolean) {
        this.questItem = isQuestItem;
    }

    // TODO...

    private getMaterialByBukkitId(bukkitId: string): Material {
        return MATERIAL_LIST.find(e => e.getBukkitId() === bukkitId) || new Material(bukkitId);
    }
};
