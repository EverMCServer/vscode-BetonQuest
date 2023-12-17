/**
 * Bukkit's Material
 */
export default class Material {
    private bukkitId: string; // e.g. STONE
    private numberId?: number; // e.g. 22948

    constructor(bukkitId: string, numberId?: number) {
        this.bukkitId = bukkitId.toUpperCase();
        this.numberId = numberId;
    }

    getBukkitId() {
        return this.bukkitId;
    }

    getNumberId() {
        return this.numberId;
    }

    // Match if the Material contains the given pattern
    isIdMatched(pattern: string): boolean {
        const regexp = new RegExp(`${pattern}`, 'i');

        return regexp.test(this.bukkitId);
    }

}
