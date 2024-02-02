/**
 * Bukkit's PotionEffectType
 */
export default class PotionEffectType {
    private bukkitId: string; // e.g. FAST_DIGGING
    private minecraftId?: string; // e.g. haste

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

    // Match if the PotionEffectType contains the given pattern
    isIdMatched(pattern: string): boolean {
        const regexp = new RegExp(`${pattern}`, 'i');

        return regexp.test(this.bukkitId)
            || (this.minecraftId ? regexp.test(this.minecraftId) : false);
    }

}
