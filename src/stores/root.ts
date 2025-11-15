import { defineStore } from "pinia";
export interface IRootState {
  baseURL: string;
  timeout: number;
}

export const useRootStore = defineStore("rootState", () => {
  const rootState: IRootState = {
    baseURL: "http://127.0.0.1:5000",
    timeout: 1000,
  };
  return { rootState };
});
