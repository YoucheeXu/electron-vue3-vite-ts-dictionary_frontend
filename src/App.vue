<template>
  <ElConfigProvider :locale="locale">
    <RouterView v-slot="props">
      <KeepAlive>
        <component :is="props.Component" />
      </KeepAlive>
    </RouterView>
  </ElConfigProvider>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
// import en from "element-plus/es/locale/en.mjs";
import { useDictStore } from "@/stores/dict/dictStore";
import type { ITabInfo } from "@/stores/dict/types";

const locale = zhCn;

const dictStore = useDictStore();
const dictState = dictStore.dictState;

// window.electron.ipcRenderer.invoke('app', 'log', "info", "App Vue");

dictStore.getTabsInfoAct().then((tabs: ITabInfo[]) => {
  dictState.tabsInfo = tabs;
  console.log(`Startup: ${JSON.stringify(dictState.tabsInfo)}`);
});
</script>

<style scoped></style>
