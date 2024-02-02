/**
 * Location
 * 
 * e.g. "123;45;-678;world_the_end"
 */
export default class Location {

    // TODO

    private str: string;

    constructor(str: string) {
        this.str = str;
    }

    toString(): string {
        return this.str;
    }

    fromString(str: string): void {
        this.str = str;
    }
};
