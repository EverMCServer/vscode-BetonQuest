/**
 * Minecraft's Block States
 */

type Type = "enum" | "bool" | "int" | "direction";

export default class BlockState {
    /**
     * The name of the property
     */
    private name: string;
    /**
     * The type of the property
     */
    private type: Type;
    /**
     * The number of possible values
     */
    private num_values: number;
    /**
     * The possible values of the property
     */
    private values?: unknown[];

    constructor(
        name: string,
        type: Type,
        num_values: number,
        values?: unknown[]
    ) {
        this.name = name;
        this.type = type;
        this.num_values = num_values;
        if (values) {
            this.values = values;
        }
    }

    getName() {
        return this.name;
    }

    getType() {
        return this.type;
    }

    getNumValues() {
        return this.num_values;
    }

    getValues() {
        return this.values;
    }
}