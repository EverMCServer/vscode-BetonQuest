import Material from "./Material";
import list from "./MaterialList.json";

const materialList: Material[] = list.map(v => new Material(v.bukkitId, v.numberId));

/**
 * All Materials
 */
export default materialList;
