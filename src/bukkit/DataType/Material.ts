/**
 * Bukkit's Material
 */
export default class Material {
    private bukkitId: string; // e.g. STONE
    private numberId?: number; // e.g. 22948

    private block?: boolean;
    private edible?: boolean;
    private record?: boolean;
    private solid?: boolean;
    private air?: boolean;
    private transparent?: boolean;
    private flammable?: boolean;
    private burnable?: boolean;
    private fuel?: boolean;
    private occluding?: boolean;
    private item?: boolean;
    private interactable?: boolean;

    constructor(
        bukkitId: string,
        numberId?: number,
        flags?: {
            block?: boolean,
            edible?: boolean,
            record?: boolean,
            solid?: boolean,
            air?: boolean,
            transparent?: boolean,
            flammable?: boolean,
            burnable?: boolean,
            fuel?: boolean,
            occluding?: boolean,
            item?: boolean,
            interactable?: boolean,
        }
        ) {
        this.bukkitId = bukkitId.toUpperCase();
        this.numberId = numberId;

        if (flags) {
            this.block = flags.block;
            this.edible = flags.edible;
            this.record = flags.record;
            this.solid = flags.solid;
            this.air = flags.air;
            this.transparent = flags.transparent;
            this.flammable = flags.flammable;
            this.burnable = flags.burnable;
            this.fuel = flags.fuel;
            this.occluding = flags.occluding;
            this.item = flags.item;
            this.interactable = flags.interactable;
        }
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

    isBlock() {
        return this.block;
    }

    isEdible() {
        return this.edible;
    }

    isRecord() {
        return this.record;
    }

    isSolid() {
        return this.solid;
    }

    isAir() {
        return this.air;
    }

    isTransparent() {
        return this.transparent;
    }

    isFlammable() {
        return this.flammable;
    }

    isBurnable() {
        return this.burnable;
    }

    isFuel() {
        return this.fuel;
    }

    isOccluding() {
        return this.occluding;
    }

    isItem() {
        return this.item;
    }

    isInteractable() {
        return this.interactable;
    }
}
