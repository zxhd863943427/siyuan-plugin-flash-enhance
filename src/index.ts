import {Plugin, showMessage, confirm, Dialog, Menu, isMobile, openTab, adaptHotkey} from "siyuan";
import "./index.scss";
import { addMenu } from "./lib/menu";
import { addSheet } from "./lib/sheet";
import { dyMakeCard } from "./api/dyCard";
import { addCards } from "./utils/card";

import { createApp,ref,watch } from 'vue'
import {settingList,getSetting} from "./utils/config"


export default class PluginSample extends Plugin {
    private customTab: () => any;
    sheet:HTMLElement;
    onload() {
        this.data = {}
        this.init()
        this.eventBus.on("ws-main", this.wsEvent)
        console.log(this.i18n.helloPlugin);
        watch(settingList.setList,()=>{this.updateConfig()})
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
        //添加一键制卡
        const topBarElement = this.addTopBar({
            icon: "iconEmoji",
            title: this.i18n.addTopBarIcon,
            position: "left",
            callback: () => {
                addCards(this.data["settingConfig"].labFeature[0]["status"].value)
            }
        });
        let that = this
        this.sheet = document.createElement('div')
        //添加右键菜单
        topBarElement.addEventListener("contextmenu",(ev:MouseEvent)=>{
            addMenu(ev,that)
        })
        addSheet(that)
    }
}
