import {Plugin, showMessage, confirm, Dialog, Menu, isMobile, openTab, adaptHotkey} from "siyuan";
import "./index.scss";
import { addMenu } from "./lib/menu";
import { dyMakeCard } from "./api/dyCard";
import { addCards } from "./utils/card";

import { createApp,ref,watch } from 'vue'
import {settingList,getSetting} from "./utils/config"


export default class PluginSample extends Plugin {
    private customTab: () => any;
    onload() {
        this.data = {}
        this.init()
        const topBarElement = this.addTopBar({
            icon: "iconEmoji",
            title: this.i18n.addTopBarIcon,
            position: "left",
            callback: () => {
                console.log("一键制卡")
                addCards(true)
            }
        });
        let that = this
        topBarElement.addEventListener("contextmenu",(ev:MouseEvent)=>{
            addMenu(ev,that)
        })
        this.eventBus.on("ws-main", this.wsEvent)
        console.log(this.i18n.helloPlugin);
    }

    onunload() {
        console.log(this.i18n.byePlugin);
    }



    private wsEvent({detail}: any) {
        if (detail.cmd === "transactions" ){
            dyMakeCard(detail,this)
        }
    }
    async updateConfig(){
        this.saveData("enhanceConfig.json",JSON.stringify(settingList.getSetting()))
    }
    private async init(){
        let localConfig = await this.loadData("enhanceConfig.json")
        this.data["settingConfig"] = await getSetting(localConfig)
        console.log(this.data)
        this.updateConfig()
    }
}
