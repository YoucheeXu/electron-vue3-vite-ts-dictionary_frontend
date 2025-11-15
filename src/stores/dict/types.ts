export interface ITabInfo {
  tabId: number;
  label: string;
  dictId: number;
}

export interface IDictState {
  tabsInfo: ITabInfo[];
  curDictId: number;
  curWord: string;
}

export interface IDictInfo {
  id: number;
  title: string;
}

export interface IDictDetail {
  cover: string;
  desc: string;
  name: string;
}

export interface IWordDetail {
  audio_url: string;
  dict_url: string;
  is_new: boolean;
  level: string;
  stars: number;
}
