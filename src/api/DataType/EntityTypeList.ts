import EntityType from "./EntityType";
import list from "./EntityTypeList.json";

const entityType: EntityType[] = list.map(v => new EntityType(v.bukkitId, v.minecraftId, v.legacyIds));

/**
 * All EntityTypes
 */
export default entityType;
