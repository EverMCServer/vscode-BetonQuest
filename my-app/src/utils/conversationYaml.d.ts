interface YamlConversationOption {
  text?: string;
  pointer?: string;
  pointers?: string;
  condition?: string;
  conditions?: string;
  event?: string;
  events?: string;
}

interface YamlModel {
  first: string;
  quester: string;
  NPC_options?: Record<string, YamlConversationOption>;
  player_options?: Record<string, YamlConversationOption>;
}
