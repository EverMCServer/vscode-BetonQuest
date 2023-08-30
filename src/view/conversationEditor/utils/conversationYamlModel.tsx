export class ConversationYamlOptionModel implements IConversationYamlOptionModel {
  text?: string | TextMultilingualModel;
  pointer?: string;
  pointers?: string;
  condition?: string;
  conditions?: string;
  event?: string;
  events?: string;

  // constructor(public text?: string | TextMultilingalModel, public pointer?: string, public pointers?: string, public condition?: string, public conditions?: string, public event?: string, public events?: string) {}

  getText(translation: string): string {
    if (!this.text) {
      return '';
    } else if (this.isValueMultilingualModel(this.text!)) {
      return this.text[translation] || '';
    } else {
      return this.text || '';
    }
  }

  setText(text: string, translation?: string) {
    // Assign a multilingual model if it is undifined
    if (!this.text && translation) {
      this.text = {} as TextMultilingualModel;
    }
    // Set the text
    if (this.isValueMultilingualModel(this.text!) && translation) {
      this.text[translation] = text;
    } else {
      this.text = text;
    }
  }

  isTextMultilingual(): boolean {
    return this.isValueMultilingualModel(this.text!);
  }

  isValueMultilingualModel(value: string | TextMultilingualModel): value is TextMultilingualModel {
    return typeof value === 'object';
  }
}

export interface IConversationYamlOptionModel {
  text?: string | TextMultilingualModel;
  pointer?: string;
  pointers?: string;
  condition?: string;
  conditions?: string;
  event?: string;
  events?: string;
}

export interface TextMultilingualModel {
  // en: string,
  // es: string,
  // pl: string,
  // fr: string,
  // cn: string,
  // de: string,
  // nl: string,
  // hu: string,
  [lang: string]: string,
}

export default class ConversationYamlModel implements IConversationYamlModel {
  quester: string | TextMultilingualModel = "";
  first: string = "";
  stop?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  final_events?: string;
  interceptor?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  NPC_options?: Record<string, ConversationYamlOptionModel>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  player_options?: Record<string, ConversationYamlOptionModel>;

  // constructor(
  //   public quester: string = "",
  //   public first: string = "",
  //   stop?: string,
  //   // eslint-disable-next-line @typescript-eslint/naming-convention
  //   NPC_options?: Record<string, ConversationYamlOptionModel>,
  //   // eslint-disable-next-line @typescript-eslint/naming-convention
  //   player_options?: Record<string, ConversationYamlOptionModel>
  // ) {}

  getQuester(translation: string): string {
    if (this.isValueMultilingualModel(this.quester)) {
      return this.quester[translation] || '';
    } else {
      return this.quester || '';
    }
  }

  setQuester(text: string, translation: string) {
    if (this.isValueMultilingualModel(this.quester)) {
      this.quester[translation] = text;
    } else {
      this.quester = text;
    }
  }

  isQuesterMultilingual(): boolean {
    return this.isValueMultilingualModel(this.quester!);
  }

  isValueMultilingualModel(value: string | TextMultilingualModel): value is TextMultilingualModel {
    return typeof value === 'object';
  }

  getStop(): string {
    return this.stop || 'false';
  }

  setStop(text: string) {
    this.stop = text;
  }

}

interface IConversationYamlModel {
  quester: string | TextMultilingualModel;
  first: string;
  stop?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  NPC_options?: Record<string, ConversationYamlOptionModel>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  player_options?: Record<string, ConversationYamlOptionModel>;
}
