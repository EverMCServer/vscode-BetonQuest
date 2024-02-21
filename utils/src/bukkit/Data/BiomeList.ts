import Biome from "../DataType/Biome";
import list from "./BiomeList.json";

/**
 * All Bukkit's PotionEffectTypes
 */
const BIOME_LIST: Biome[] = list.map(v => new Biome(v.bukkitId));

export default BIOME_LIST;
