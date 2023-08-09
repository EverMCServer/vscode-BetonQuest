export interface ConversationYamlOptionModel {
  text?: string | TextMultilingalModel;
  pointer?: string;
  pointers?: string;
  condition?: string;
  conditions?: string;
  event?: string;
  events?: string;
}

interface TextMultilingalModel {
  // en?: string,
  // es?: string,
  // pl?: string,
  // fr?: string,
  // cn?: string,
  // de?: string,
  // nl?: string,
  // hu?: string,
  [lang: string]: string,
}

export default interface ConversationYamlModel {
  quester: string;
  first: string;
  stop?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  NPC_options?: Record<string, ConversationYamlOptionModel>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  player_options?: Record<string, ConversationYamlOptionModel>;
}
