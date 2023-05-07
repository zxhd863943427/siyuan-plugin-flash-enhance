import {Plugin, showMessage, confirm, Dialog} from "siyuan";
import "./index.scss";

export default class MyPlugin extends Plugin {
    onload() {
        this.eventBus.on("ws-main", ({detail}: any) => {
            console.log(detail);
        });
        confirm("Confirm", "Is this a confirm?", () => {
            console.log("confirm");
        }, () => {
            console.log("cancel");
        })

        showMessage(this.i18n.helloPlugin);
        const dialog = new Dialog({
            title: "info",
            content: "This is a dialog",
        });
    }

    onunload() {
        console.log(this.i18n.byePlugin);
        this.eventBus.off("ws-main", ({detail}: any) => {
            console.log(detail);
        });
    }
}
