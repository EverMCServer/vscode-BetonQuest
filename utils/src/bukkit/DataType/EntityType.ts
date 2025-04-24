/**
 * Bukkit's EntityType
 */
export default class EntityType {
    private bukkitId: string; // e.g. ENDER_CRYSTAL
    private minecraftId?: string; // e.g. end_crystal

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
