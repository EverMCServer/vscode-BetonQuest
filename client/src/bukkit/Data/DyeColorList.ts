import DyeColor from "../DataType/DyeColor";
import list from "./DyeColorList.json";

/**
 * All Bukkit's DyeColors
 */
const DYE_COLOR_LIST: DyeColor[] = list.map(v => new DyeColor(v.bukkitId, v.color, v.fireworkColor));

export default DYE_COLOR_LIST;
