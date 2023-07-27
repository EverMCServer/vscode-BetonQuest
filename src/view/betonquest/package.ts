
export interface IPackage{
    conversations: Map<string, string>, // "file name" => "yaml content"
    conditions: Map<string, string>,
    events: Map<string, string>,
    objectives: Map<string, string>,
}