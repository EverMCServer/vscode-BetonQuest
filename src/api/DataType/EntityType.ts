export default class EntityType {
    private bukkitId: string; // e.g. ENDER_CRYSTAL
    private minecraftId: string; // e.g. end_crystal
    private legacyIds: string[]; // e.g. ['ender_crystal']

    constructor(bukkitId: string, minecraftId: string, legacyIds: string[]) {
        this.bukkitId = bukkitId.toUpperCase();
        this.minecraftId = minecraftId.toLowerCase();
        this.legacyIds = legacyIds.map(v => v.toLowerCase());
    }

    getBukkitId() {
        return this.bukkitId;
    }

    getMinecraftId() {
        return this.minecraftId;
    }

    getLegacyId() {
        return this.legacyIds;
    }

    // Match if the EntityType contains the given pattern
    isIdMatched(pattern: string): boolean {
        const regexp = new RegExp(`${pattern}`, 'i');

        return regexp.test(this.bukkitId)
            || regexp.test(this.minecraftId)
            || this.legacyIds.some(v => regexp.test(v));
    }

}
