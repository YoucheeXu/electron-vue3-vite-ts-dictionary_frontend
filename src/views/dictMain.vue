<template>
  <titlebar @quit="handleQuit" @minimize="handleMinimize" />
  <inputPanel
    ref="childInputRef"
    @query-word="handleQueryWord"
    @query-next="handleQueryNext"
    @query-prev="handleQueryPrev"
  />
  <wordPanel
    ref="childWordRef"
    :word="wordRef"
    :audio-u-r-l="audioURLRef"
    :b-new="bNewRef"
    :level="levelRef"
    :n-stars="nStarsRef"
  />
  <dictPanel ref="childDictRef" :dict-u-r-l="dictURLRef" @switch-tab="handleSwitchTab" />
  <bottomPanel />
</template>

<script setup lang="ts">
import { ref } from "vue";

// import { clearInterval } from "timers";

import { useDictStore } from "@/stores/dict/dictStore";

import titlebar from "@/components/dictTitlebar.vue";
import inputPanel from "@/components/dictInputPanel.vue";
import wordPanel from "@/components/dictWordPanel.vue";
import dictPanel from "@/components/dictDictPanel.vue";
import bottomPanel from "@/components/dictBottomPanel.vue";

const dictStore = useDictStore();
const dictState = dictStore.dictState;

const handleMinimize = () => {
  dictStore.minimizeAct();
};

const handleQuit = () => {
  dictStore.quitAct();
};

const childInputRef = ref<InstanceType<typeof inputPanel> | null>(null);

const childWordRef = ref<InstanceType<typeof wordPanel> | null>(null);
const wordRef = ref("");
const audioURLRef = ref("");
const bNewRef = ref(false);
const levelRef = ref("");
const nStarsRef = ref(0);

const childDictRef = ref(null);
const dictURLRef = ref("");

const pronounce = () => {
  const childWord = childWordRef.value;
  childWord?.play();
};

const queryWord = async (word: string) => {
  const dictId = dictState.curDictId;
  console.log(`query ${word} in ${dictId}`);
  console.log(`current word: ${dictState.curWord} tab: ${dictState.curDictId}`);

  if (word == dictState.curWord && dictId == dictState.curDictId) {
    pronounce();
    return;
  }
  console.log(`word: ${word}, tabId: ${dictId}`);
  dictStore
    .queryWordAct(word, dictId)
    .then(([dictURL, audioURL, bNew, level, nStars]: [string, string, boolean, string, number]) => {
      wordRef.value = word;
      dictURLRef.value = dictURL;
      audioURLRef.value = audioURL;
      bNewRef.value = bNew;
      levelRef.value = level;
      nStarsRef.value = nStars;
      pronounce();
    });
  dictState.curWord = word;
  // dictState.curDictId = dictId;
};

// TO-DO: status of QueryPrev button
const handleQueryWord = async () => {
  if (childInputRef.value) {
    const childInput = childInputRef.value;
    const word = childInput.word;
    // const tabId = childDictRef.value.editableTabsValue;
    queryWord(word);
  }
};

// TO-DO: status of button
const handleQueryNext = async () => {
  dictStore.getNextWordAct().then((word: string) => {
    queryWord(word);
  });
};

// TO-DO: status of button
const handleQueryPrev = async () => {
  dictStore.getPrevWordAct().then((word: string) => {
    queryWord(word);
  });
};

const handleSwitchTab = (dictId: number) => {
  console.log(`switch to tab ${dictId}`);
  if (childInputRef.value) {
    dictState.curDictId = dictId;
    const word = childInputRef.value.word as string;
    if (word.length > 1) {
      queryWord(word);
    }
  }
  dictState.curDictId = dictId;
};
</script>

<style lang="less" scoped></style>
