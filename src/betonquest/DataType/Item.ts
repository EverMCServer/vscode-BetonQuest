/**
 * BetonQuest's Item
 * 
 * Document: https://docs.betonquest.org/2.0-DEV/Documentation/Features/Items/
 */
export default class Item {

    // General properties
    private isQuestItem: boolean;
    private material: string;
    private name?: string;
    private lore?: string;
    // private enchants?: Enchants;
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
        isQuestItem: boolean,
        material: string,
        name?: string,
        lore?: string,
        // enchants: Enchants,
        unbreakable?: boolean,
        customModelData?: string,
        noCustomModelData?: boolean,
        flags?: string[],
        ) {
        this.isQuestItem = isQuestItem;
        this.material = material;
        this.name = name;
        this.lore = lore;
        // this.enchants = enchants;
        this.unbreakable = unbreakable;
        this.customModelData = customModelData;
        this.noCustomModelData = noCustomModelData;
        this.flags = flags;
    }

    toString(): string {
        return this.material;
    }

    fromString(material: string): void {
        this.material = material;
    }
};
