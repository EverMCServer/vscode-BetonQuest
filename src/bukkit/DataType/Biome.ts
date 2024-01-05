/**
 * Bukkit's Biome
 */
export default class Biome {
    private bukkitId: string; // e.g. PROTECTION_FALL

    constructor(bukkitId: string) {
        this.bukkitId = bukkitId.toUpperCase();
    }

    getBukkitId() {
        return this.bukkitId;
    }

    // Match if the EntityType contains the given pattern
    isIdMatched(pattern: string): boolean {
        pattern = pattern.replace(' ', '_');
        const regexp = new RegExp(`${pattern}`, 'i');

        return regexp.test(this.bukkitId);
    }

}
