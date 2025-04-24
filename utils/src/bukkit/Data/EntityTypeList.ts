import EntityType from "../DataType/EntityType";
import list from "./EntityTypeList.json";

/**
 * All Bukkit's EntityTypes
 */
const ENTITY_TYPE_LIST: EntityType[] = list.map(v => new EntityType(v.bukkitId, v.minecraftId));

export default ENTITY_TYPE_LIST;
