import EntityType from "../../bukkit/DataType/EntityType";
import ENTITY_TYPE_LIST from "../../bukkit/Data/EntityTypeList";

/**
 * BetonQuest's Entity
 * 
 * Reference: https://docs.betonquest.org/2.0-DEV/Documentation/Scripting/Building-Blocks/Events-List/#clear-entities-clear
 */
export default class Entity {

    // General properties
    private entityType: EntityType;

    constructor(
        bukkitId: string,
    ) {
        this.entityType = this.getEntityTypeByBukkitId(bukkitId.toUpperCase());
    }

    getEntityType(): EntityType {
        return this.entityType;
    }

    getEntityTypeName(): string {
        return this.entityType.getBukkitId();
    }

    setEntityType(entityType: EntityType) {
        this.entityType = entityType;
    }

    setEntityTypeName(bukkitId: string) {
        this.entityType = this.getEntityTypeByBukkitId(bukkitId);
    }

    private getEntityTypeByBukkitId(bukkitId: string): EntityType {
        return ENTITY_TYPE_LIST.find(e => e.getBukkitId() === bukkitId) || new EntityType(bukkitId);
    }
};
