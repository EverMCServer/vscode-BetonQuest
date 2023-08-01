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
  // eslint-disable-next-line @typescript-eslint/naming-convention
  NPC_options?: Record<string, ConversationYamlOptionModel>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  player_options?: Record<string, ConversationYamlOptionModel>;
}
