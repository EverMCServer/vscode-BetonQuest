export interface ConversationYamlOptionModel {
  text?: string;
  pointer?: string;
  pointers?: string;
  condition?: string;
  conditions?: string;
  event?: string;
  events?: string;
}

export default interface ConversationYamlModel {
  first: string;
  quester: string;
  npcOptions?: Record<string, ConversationYamlOptionModel>;
  playerOptions?: Record<string, ConversationYamlOptionModel>;
}
