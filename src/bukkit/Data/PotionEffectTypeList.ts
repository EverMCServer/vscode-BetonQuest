import PotionEffectType from "../DataType/PotionEffectType";
import list from "./PotionEffectTypeList.json";

/**
 * All Bukkit's PotionEffectTypes
 */
const POTION_EFFECT_TYPE_LIST: PotionEffectType[] = list.map(v => new PotionEffectType(v.bukkitId, v.minecraftId));

export default POTION_EFFECT_TYPE_LIST;
