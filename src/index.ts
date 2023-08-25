import {Plugin} from "siyuan";
import "./index.scss";
import { addMenu } from "./lib/menu";
import { addSheet } from "./lib/sheet";
import { dyMakeCard } from "./api/dyCard";
import { IRswitch } from "./api/IR";
import { occasionEdit, occasionLoad } from "./api/imageOccasion";
import { addCards } from "./utils/card";

import { watch } from 'vue'
import {settingList,getSetting} from "./utils/config"


export default class PluginSample extends Plugin {
    private customTab: () => any;
    sheet:HTMLElement;
    topBarElement:HTMLElement;
    onload() {
        this.data = {}
        this.init()
        this.eventBus.on("ws-main", this.wsEvent)
        this.eventBus.on("loaded-protyle", occasionLoad)
        this.eventBus.on("open-menu-image", occasionEdit)
        console.log(this.i18n.helloPlugin);
    }

    onunload() {
        this.sheet.remove()
        this.topBarElement.remove()
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
        this.topBarElement = this.addTopBar({
            icon: `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-device-ipad-bolt" width="32" height="32" viewBox="0 0 22 22" stroke-width="2.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M13.5 21h-7.5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v7" fill="none"></path>
            <path d="M9 18h4"></path>
            <path d="M19 16l-2 3h4l-2 3"></path>
         </svg>`,
            title: this.i18n.addTopBarIcon,
            position: "left",
            callback: () => {
                addCards(this.data["settingConfig"].labFeature[0]["status"].value)
            }
        });
        let that = this
        this.sheet = document.createElement('div')
        //添加右键菜单
        this.topBarElement.addEventListener("contextmenu",(ev:MouseEvent)=>{
            addMenu(ev,that)
        })
        addSheet(that)
        watch(settingList.setList,()=>{this.updateConfig()})
        IRswitch(this)
        this.addCommand({
            langKey: "makeCard",
            hotkey: "",
            callback: () => {
                addCards(this.data["settingConfig"].labFeature[0]["status"].value)
                }
        })
    }
}
