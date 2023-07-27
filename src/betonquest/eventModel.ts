
export default interface IEvent {
    kind: string, // e.g. "tag"
    options: IEventOption[],
}



interface IEventOption {
    kind: string, // "string" "number" "boolean" "location" "minecraft_block" "items"
    must: boolean,
    value: string,
}


