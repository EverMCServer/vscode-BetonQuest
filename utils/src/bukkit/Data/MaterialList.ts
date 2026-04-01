import BlockState from "../DataType/BlockState";
import Material from "../DataType/Material";
import list from "./MaterialList.json";

type BlockStateType = ConstructorParameters<typeof BlockState>[1];

const isBlockStateType = (value: unknown): value is BlockStateType => {
    return value === "enum" || value === "bool" || value === "int" || value === "direction";
};

const toBlockStateType = (value: unknown): BlockStateType => {
    if (isBlockStateType(value)) {
        return value;
    }

    throw new Error(`Invalid block state type in MaterialList.json: ${String(value)}`);
};

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
    },
    v.blockStates?.map(s => new BlockState(s.name, toBlockStateType(s.type), s.num_values, s.values))
));

export default MATERIAL_LIST;
