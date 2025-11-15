import NetRquest from "../index";

interface IDataType<T = any> {
  message: string;
  data: T;
  status: string;
}

export function getDicts() {
  return NetRquest.get<IDataType>({
    url: "/dicts",
  });
}

export function queryWord(word: string, dictId: number) {
  return NetRquest.get<IDataType>({
    url: `/dicts/${dictId}/${word}`,
  });
}
