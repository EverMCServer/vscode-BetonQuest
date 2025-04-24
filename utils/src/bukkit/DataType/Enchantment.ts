/**
 * Bukkit's Enchantment
 */
export default class Enchantment {
    private bukkitId: string; // e.g. PROTECTION_FALL
    private minecraftId?: string; // e.g. efficiency

    constructor(bukkitId: string, minecraftId?: string) {
        this.bukkitId = bukkitId.toUpperCase();
        this.minecraftId = minecraftId?.toLowerCase();
    }

    getBukkitId() {
        return this.bukkitId;
    }

    getMinecraftId() {
        return this.minecraftId;
    }

    // Match if the EntityType contains the given pattern
    isIdMatched(pattern: string): boolean {
        const regexp = new RegExp(`${pattern}`, 'i');

        return regexp.test(this.bukkitId)
            || (this.minecraftId ? regexp.test(this.minecraftId) : false);
    }

}
