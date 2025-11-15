// ElectronApp.ts
import * as fs from "fs";
import * as path from "path";
import * as log4js from "log4js";

import { BrowserWindow, app } from "electron";
// import { globalVar } from "./utils/globalInterface";

// import * as logger from '@/electron/utils/log';

export abstract class ElectronApp {
  private _name: string = "";

  protected _cfgFile: string = "";
  protected _cfg: any;
  protected _bCfgModfied = false;

  protected _bDebug = false;
  protected _logger!: log4js.Logger;

  protected _win!: BrowserWindow;

  protected _usrsDict: Map<string, string> = new Map();

  constructor(readonly _startPath: string) {
    console.clear();
    // globalVar.app = this;
  }

  public set name(name: string) {
    this._name = name;
  }

  public get name() {
    return this._name;
  }

  protected async ReadAndConfigure(binPath: string, cfgFile: string): Promise<boolean> {
    // console.log(`CfgFile: ${this._cfgFile}`);
    // const _this = this;
    // if (fs.existsSync(cfgFile) == false) {
    //     console.error(_this._cfgFile + " doesn't exist");
    //     // logger.error(null, 'ElectronApp', `CfgFile: ${cfgFile} doesn't exist`);
    //     return false;
    // };
    this._cfgFile = path.join(binPath, cfgFile).replace(/\\/g, "/");
    try {
      this._cfg = JSON.parse(fs.readFileSync(this._cfgFile).toString());
    } catch (e) {
      console.error(`Fail to read ${this._cfgFile} because ${(e as Error).message}`);
    }

    const debugCfg = JSON.parse(JSON.stringify(this._cfg[this.name].Debug));
    this._bDebug = debugCfg.bEnable;
    let debugLvl = "INFO";
    if (this._bDebug == true) {
      debugLvl = "DEBUG";
    }

    const logFile = path.join(this._startPath, debugCfg.file);
    console.info("logFile: " + logFile);

    // %r time in toLocaleTimeString format
    // %p log level
    // %c log category
    // %h hostname
    // %m log data
    // %d date, formatted - default is ISO8601, format options are: ISO8601, ISO8601_WITH_TZ_OFFSET, ABSOLUTE, DATE, or any string compatible with the date-format library. e.g. %d{DATE}, %d{yyyy/MM/dd-hh.mm.ss}
    // %% % - for when you want a literal % in your output
    // %n newline
    // %z process id (from process.pid)
    // %f full path of filename (requires enableCallStack: true on the category, see configuration object)
    // %f{depth} path’s depth let you chose to have only filename (%f{1}) or a chosen number of directories
    // %l line number (requires enableCallStack: true on the category, see configuration object)
    // %o column postion (requires enableCallStack: true on the category, see configuration object)
    // %s call stack (requires enableCallStack: true on the category, see configuration object)
    // %x{<tokenname>} add dynamic tokens to your log. Tokens are specified in the tokens parameter.
    // %X{<tokenname>} add values from the Logger context. Tokens are keys into the context values.
    // %[ start a coloured block (colour will be taken from the log level, similar to colouredLayout)
    // %] end a coloured block
    log4js.configure({
      appenders: {
        consoleAppender: {
          type: "console",
          layout: {
            type: "pattern",
            pattern: "%d{yyyy-MM-dd hh:mm:ss} %-5p [%l@%f{1}] - %m",
          },
        },
        dictLogs: {
          type: "file",
          filename: logFile,
          category: this.name,
          layout: {
            type: "pattern",
            pattern: "%d{yyyy-MM-dd hh:mm:ss} %-5p [%l@%f{1}] - %m",
          },
        },
      },
      categories: {
        default: { appenders: ["consoleAppender", "dictLogs"], level: debugLvl, enableCallStack: true },
      },
    });
    this._logger = log4js.getLogger("dictLogs");
    // globalVar.Logger = this._logger;

    // read all users
    for (const usrCfg of this._cfg.Users) {
      const name = usrCfg.Name;
      // const levels = usrCfg.Target;
      const progressFile = usrCfg.Progress;
      this._usrsDict.set(name, progressFile);
      console.log(`User: ${name}, file: ${progressFile}`);
    }

    return true;
  }

  // public GetWindow(): BrowserWindow {
  //     return this._win;
  // }

  public async CreateWindow(
    bShow: boolean,
    bDev: boolean,
    width: number,
    height: number,
    bFullScreen: boolean,
  ): Promise<void> {
    // Create the browser window.
    this._win = new BrowserWindow({
      icon: path.join(this._startPath, "assets/favicon.ico"),
      width: width,
      height: height,
      fullscreen: bFullScreen,
      show: bShow,
      frame: false,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        // contextIsolation: false,
        preload: path.join(this._startPath, "output/build/electron/preload.js"),
      },
    });

    if (bShow) {
      // const bDev = import.meta.env.DEV;
      const bDev = process.env.NODE_ENV == "development";
      let URL = `file://${path.join(__dirname, "../index.html")}`;
      if (bDev) {
        URL = "http://localhost:3920";
      }

      this._win.loadURL(URL);

      if (bDev) {
        // Open the DevTools.
        this._win.webContents.openDevTools({ mode: "detach" });
      }
    }

    // const _this = this;
    // Emitted when the window is closed.
    this._win.on("closed", () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      // _this._win = null;
    });
  }

  public async Run(argvs: any, bDev: boolean) {
    console.log(`StartPath: ${this._startPath}`);
    const binPath = path.join(this._startPath, "public").replace(/\\/g, "/");
    if ((await this.ReadAndConfigure(binPath, "Dictionary.json")) == false) {
      // this.log('error', 'Fail to read and configure');
      console.error(`Fail to read and configure: ${this._cfgFile}`);
      return;
    }

    let bShow = true;
    if (argvs.typ == "c") {
      bShow = false;
    }

    const guiCfg = JSON.parse(JSON.stringify(this._cfg[this._name]["GUI"]));
    // let guiCfg = {
    //     Width: 701,
    //     Height: 548,
    //     bFullScreen: false
    // }
    await this.CreateWindow(bShow, bDev, guiCfg.Width, guiCfg.Height, guiCfg.bFullScreen);

    // this._dQueue = new DownloardQueue(this._win);
  }

  public log(lvl: string, msg: string): void {
    if (lvl == "info") {
      // logger.info(null, 'ElectronApp', msg);
      this._logger.info(msg);
    } else if (lvl == "error") {
      // logger.error(null, 'ElectronApp', msg);
      this._logger.error(msg);
    }
    return;
  }

  /*
    // Info:
    //
    //
    // @param {number} ret result of msg: <0 means failure, 0 means ongoing, 1 means success
    // @param {number} typ type of info: 1 means dict, 2 means audio
    // @param {string} word
    // @param {string} msg when ret equals 1, it represent local address of word's dict or audio
    // @memberof dictApp
    //
    public Info(ret: number, typ: number, word: string, msg: string) {
        if (ret < 0) {
            this.log('error', msg);
            if (typ == 1) {
                this.Record2File(this._miss_dict, `dict of ${word}: ${msg}\n`);
            }
            else if (typ == 2) {
                this.Record2File(this._miss_audio, `audio of ${word}: ${msg}\n\n`);
            }
        }
        else if (ret = 1) {
            if (typ == 2) {
                if (this._curWord == word) {
                    this._win.webContents.send("gui", "loadAndPlayAudio", msg);
                    msg = "OK to download audio of " + word;
                }
            }
        }

        this._win.webContents.send("gui", "modifyValue", "status", msg);
    }
    */

  protected async Record2File(filePath: string, something: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, something, { flag: "a" }, (err: any) => {
        if (err) {
          this.log("error", `Fail to record ${something} in ${filePath}!`);
          reject(false);
        } else {
          // console.log(`Success to record ${something} in ${file}!`);
          resolve(true);
        }
      });
    });
  }

  protected async Close() {
    if (this._bCfgModfied) {
      try {
        const ret = await this.SaveConfigure();
        this.log("info", ret);
      } catch (e) {
        this.log("error", (e as Error).message);
      }
    }
  }

  protected async minimize() {
    this._win?.minimize();
  }

  protected async quit() {
    // 做点其它操作：比如记录窗口大小、位置等，下次启动时自动使用这些设置；不过因为这里（主进程）无法访问localStorage，
    // 这些数据需要使用其它的方式来保存和加载，这里就不作演示了。
    // 这里推荐一个相关的工具类库，可以使用它在主进程中保存加载配置数据：https://github.com/sindresorhus/electron-store
    // ...
    // safeExit = true;

    await this.Close();

    this.log("info", "Quit!\n");
    log4js.shutdown((error: Error | undefined) => {
      if (error) {
        console.error(error.message);
      } else {
        console.info("Succes to shutdown log4js");
      }
      this._win?.close();
      app.quit(); // 退出程序
    });
  }

  private SaveConfigure(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Indent by 4 spaces
      fs.writeFile(this._cfgFile, JSON.stringify(this._cfg, null, 4), { flag: "w" }, (err: any) => {
        if (err) {
          reject("Fail to SaveConfigure!");
        } else {
          resolve("Success to SaveConfigure");
        }
      });
    });
  }

  /*
    public OnMenuClicked(menuId: string) {
        throw new Error('Method not implemented.');
        // let action: string = 'this._' + this._dictSysMenu[menuId];
        // this.log('info', `action = ${action}`);

        // // eval(action)(menuId);
        // // this._get_browser().ExecuteFunction('active_menu', menuId);
    }
    */
}
