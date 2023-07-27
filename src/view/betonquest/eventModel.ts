
export default interface IEvent {
    kind: string, // e.g. "tag"
    options: IEventOption[],
}

interface IEventOption {
    kind: string,
    value: string,
}
