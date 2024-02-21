import Material from "../DataType/Material";
import list from "./MaterialList.json";

/**
 * All Bukkit's Materials
 */
const MATERIAL_LIST: Material[] = list.map(v => new Material(
    v.bukkitId,
    v.numberId,
    {
        block: v.block,
        edible: v.edible,
        record: v.record,
        solid: v.solid,
        air: v.air,
        transparent: v.transparent,
        flammable: v.flammable,
        burnable: v.burnable,
        fuel: v.fuel,
        occluding: v.occluding,
        gravity: v.gravity,
        item: v.item,
        interactable: v.interactable
    }
    ));

export default MATERIAL_LIST;
