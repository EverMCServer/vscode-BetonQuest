/**
 * Bukkit's DyeColor
 */
export default class DyeColor {
    private bukkitId: string; // e.g. WHITE
    private color: string; // e.g. #F9FFFE
    private fireworkColor: string; // e.g. #F0F0F0

    constructor(bukkitId: string, color: string, fireworkColor: string) {
        this.bukkitId = bukkitId.toUpperCase();
        this.color = color.toUpperCase();
        this.fireworkColor = fireworkColor.toUpperCase();
    }

    getBukkitId() {
        return this.bukkitId;
    }

    getColor() {
        return this.color;
    }

    getFireworkColor() {
        return this.fireworkColor;
    }

    // Match if the DyeColor contains the given pattern
    isIdMatched(pattern: string): boolean {
        const regexp = new RegExp(`${pattern}`, 'i');

        return regexp.test(this.bukkitId);
    }

}
