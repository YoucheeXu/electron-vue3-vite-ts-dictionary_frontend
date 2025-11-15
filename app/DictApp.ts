import * as fs from "fs";
import * as path from "path";

// import { clearInterval } from "timers";

import { ElectronApp } from "./ElectronApp";
import type { ITabInfo } from "../src/stores/dict/types";
import { UsrProgress } from "./components/UsrProgress";

export class DictApp extends ElectronApp {
  protected _tabsInfo: ITabInfo[] = [];
  protected _defaultTabId: number = -1;
  protected _usrProgress!: UsrProgress;
  // private _dictSysMenu: string[] | any = [""];

  constructor(startPath: string) {
    super(startPath);
    console.log(`dictApp: ${startPath}`);
  }

  public async ReadAndConfigure(binPath: string, cfgFile: string): Promise<boolean> {
    const bRet = await super.ReadAndConfigure(binPath, cfgFile);

    const dictAppCfg = this._cfg.Dictionary;

    const tabsCfg = dictAppCfg.Tabs;
    for (const tabCfg of tabsCfg) {
      this._tabsInfo.push({
        tabId: tabCfg.TabId as number,
        label: tabCfg.Label as string,
        dictId: tabCfg.DictId as number,
      });
    }
    this._defaultTabId = dictAppCfg.TabId as number;

    const user = dictAppCfg.User;
    const progressFile = this._usrsDict.get(user);
    if (!progressFile) {
      return false;
    }
    this._usrProgress = new UsrProgress();
    await this._usrProgress.Open(path.join(binPath, progressFile), "New");
    if ((await this._usrProgress.ExistTable("New")) == false) {
      this._usrProgress.NewTable("New");
    }

    return bRet;
  }

  public async Run(argvs: any, bDev: boolean) {
    await super.Run(argvs, bDev);
    // if (argvs.typ == "c") {
    // //     this._curDictId = "dict1";
    // //     dictbase = this.getDictBase(this._curDictId);
    //     const dictbase = this._dictMap.get("Google");
    //     let wordsLst = argvs.word.split(" ");
    //     for (let wd of wordsLst) {
    //         await this.QueryWord2(wd);
    //     }

    //     this.WaitAsyncTasksFnshd(async () => {
    //         await this.Quit();
    //     })
    // }
  }

  public getTabsInfo() {
    return this._tabsInfo;
  }

  public getDefaultTabId() {
    return this._defaultTabId;
  }

  /*
    // only for command line
    public async QueryWord(word: string): Promise < void> {
        this.log('info', `word = ${word};`);

        let retDict = -1;
        let dict = "";
        let retAudio = -1;
        let audio = "";

        [retDict, dict] = await dictbase.query_word(word);
        [retAudio, audio] = await this._audioBase.query_audio(word);

        if(retDict < 0) {
            this.Record2File(this._miss_dict, "Dict of " + word + ": " + dict + "\n");
        } else if(retDict == 0) {
            this.log('info', dict);
        }

        if (retAudio < 0) {
            this.Record2File(this._miss_audio, "Audio of " + word + ": " + audio + "\n");
        } else if (retAudio == 0) {
            this.log('info', audio);
        }

        if (retDict < 0 || retAudio < 0) {
            this.Record2File(this._miss_audio, "\n");
        }
    }
    */

  public MarkNew(word: string, bNew: string): void {
    if (bNew === "true") {
      this._usrProgress.InsertWord(word).then(() => {
        console.log(word + " has been marked as new.");
      });
    } else {
      this._usrProgress.DelWord(word).then(() => {
        console.log(word + " has been removed mark of new.");
      });
    }
  }

  public TopMostOrNot(): void {
    var bTop = this._win.isAlwaysOnTop();
    this._win.setAlwaysOnTop(!bTop);
  }

  /*
    public WaitAsyncTasksFnshd(cb: () => void) {
        this.log('info', "Start to quit Dictionary");
        let timerID = setInterval(async () => {
            if (this._dQueue.IsFnshd()) {
                console.info("Finshed to download all files.");
                clearInterval(timerID);
                this.log('info', "Wait 2s to quit.");
                setTimeout(() => {
                    cb();
                }, 2000);
            }
        }, 2000)
    }
    */
}
