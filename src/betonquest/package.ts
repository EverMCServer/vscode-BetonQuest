import IEvent from "./eventModel";

export interface IPackage{
    conversations: Map<string, string>, // "file name" => "yaml content"
    conditions: Map<string, string>,
    events: Map<string, IEvent>,
    objectives: Map<string, string>,

    // main:
}