export default class List {
    private name: string;
    private kind: string;
    private options: string[];
    
    constructor (name: string, contentString: string) {
        this.name = name;
        this.kind = "";
        this.options = [];
        this.setContent(contentString);
    }
    // constructor (yamlPair: Pair<string, string>) {
    //     this.name = yamlPair.key;
    //     this.kind = "";
    //     this.options = [];
    //     this.setContent(yamlPair.value || "");
    // }

    setContent(content: string) {
        const cont = content.split(" ");
        if (cont.length) {
            this.kind = cont[0];
            if (cont.length>1) {
                this.options = cont.slice(1);
            }
        }
    }

    getName(): string {
        return this.name;
    }

    toString(): string {
        return this.kind + " " + this.options.join(" ");
    }

    getKind(): string {
        return this.kind;
    }

    getOptions(): string[] {
        return this.options;
    }
}