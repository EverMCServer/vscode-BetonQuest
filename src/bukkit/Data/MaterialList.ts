import Material from "../DataType/Material";
import list from "./MaterialList.json";

/**
 * All Bukkit's Materials
 */
const MATERIAL_LIST: Material[] = list.map(v => new Material(v.bukkitId, v.numberId));

export default MATERIAL_LIST;
