import BukkitEnchantment from "../../bukkit/DataType/Enchantment";
import ENCHANTMENT_LIST from "../../bukkit/Data/EnchantmentList";

/**
 * BetonQuest's Enchant, for serving Item
 * 
 * Reference: https://docs.betonquest.org/2.0-DEV/Documentation/Features/Items/
 */
export default class Enchantment {

    // General properties
    private enchantment: BukkitEnchantment;
    private level: number;

    constructor(
        bukkitId: string,
        level: number
    ) {
        this.enchantment = this.getEnchantmentByBukkitId(bukkitId.toUpperCase());
        this.level = level;
    }

    getEnchantment(): BukkitEnchantment {
        return this.enchantment;
    }

    getEnchantmentName(): string {
        return this.enchantment.getBukkitId();
    }

    setEnchantment(enchantment: BukkitEnchantment) {
        this.enchantment = enchantment;
    }

    setEnchantmentName(bukkitId: string) {
        this.enchantment = this.getEnchantmentByBukkitId(bukkitId);
    }

    getLevel(): number {
        return this.level;
    }

    setLevel(level: number) {
        this.level = level;
    }

    private getEnchantmentByBukkitId(bukkitId: string): BukkitEnchantment {
        return ENCHANTMENT_LIST.find(e => e.getBukkitId() === bukkitId) || new BukkitEnchantment(bukkitId);
    }
};
