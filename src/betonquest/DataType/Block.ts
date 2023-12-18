import Material from "../../bukkit/DataType/Material";
import MATERIAL_LIST from "../../bukkit/Data/MaterialList";

/**
 * BetonQuest's Block
 * 
 * Reference: https://docs.betonquest.org/2.0-DEV/Documentation/Scripting/Data-Formats/#block-selectors
 */
export default class Block {

    // General properties
    private bukkitMaterial: Material;

    constructor(
        bukkitId: string,
    ) {
        this.bukkitMaterial = this.getMaterialByBukkitId(bukkitId.toUpperCase());
    }

    getMaterial(): Material {
        return this.bukkitMaterial;
    }

    getMaterialID(): string {
        return this.bukkitMaterial.getBukkitId();
    }

    setMaterial(bukkitMaterial: Material) {
        this.bukkitMaterial = bukkitMaterial;
    }

    setMaterialName(bukkitId: string) {
        this.bukkitMaterial = this.getMaterialByBukkitId(bukkitId);
    }

    private getMaterialByBukkitId(bukkitId: string): Material {
        return MATERIAL_LIST.find(e => e.getBukkitId() === bukkitId) || new Material(bukkitId);
    }
};
