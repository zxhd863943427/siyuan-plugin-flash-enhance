import {Plugin, showMessage, confirm, Dialog, Menu, isMobile, openTab, adaptHotkey} from "siyuan";
import "./index.scss";
import { addMenu } from "./lib/menu";

const STORAGE_NAME = "menu-config";
const TAB_TYPE = "custom_tab";
const DOCK_TYPE = "dock_tab";

export default class PluginSample extends Plugin {

    private customTab: () => any;
    data:any;
    onload() {
        this.data = {}
        this.data[STORAGE_NAME] = {readonlyText: "Readonly"};

        const topBarElement = this.addTopBar({
            icon: "iconEmoji",
            title: this.i18n.addTopBarIcon,
            position: "left",
            callback: () => {
                console.log("一键制卡")
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

    openSetting() {
        const dialog = new Dialog({
            title: this.name,
            content: `<div class="b3-dialog__content"><textarea class="b3-text-field fn__block" placeholder="readonly text in the menu"></textarea></div>
<div class="b3-dialog__action">
    <button class="b3-button b3-button--cancel">${this.i18n.cancel}</button><div class="fn__space"></div>
    <button class="b3-button b3-button--text">${this.i18n.save}</button>
</div>`,
            width: isMobile() ? "92vw" : "520px",
        });
        const inputElement = dialog.element.querySelector("textarea");
        inputElement.value = this.data[STORAGE_NAME].readonlyText;
        const btnsElement = dialog.element.querySelectorAll(".b3-button");
        dialog.bindInput(inputElement, () => {
            (btnsElement[1] as HTMLButtonElement).click();
        });
        inputElement.focus();
        btnsElement[0].addEventListener("click", () => {
            dialog.destroy();
        });
        btnsElement[1].addEventListener("click", () => {
            this.saveData(STORAGE_NAME, {readonlyText: inputElement.value});
            dialog.destroy();
        });
    }

    private wsEvent({detail}: any) {
        if (detail.cmd === "transactions" ){
            console.log("编辑操作")
            console.log(detail)
        }
        
    }
}
