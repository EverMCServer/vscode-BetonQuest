import Enchantment from "./Enchantment";
import list from "./EnchantmentList.json";

const enchantmentList: Enchantment[] = list.map(v => new Enchantment(v.bukkitId, v.minecraftId, v.legacyIds));

/**
 * All Enchantments
 */
export default enchantmentList;
