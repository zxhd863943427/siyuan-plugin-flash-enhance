import {Plugin, Message, Confirm} from "siyuan";
import "./index.scss";

export default class MyPlugin extends Plugin {
    onload() {
        this.eventBus.on("ws-main", ({detail}: any) => {
            console.log(detail);
        });
        Confirm("Confirm", "Is this a confirm?", () => {
            console.log("confirm");
        }, () => {
            console.log("cancel");
        })

        Message(this.i18n.helloPlugin);
    }

    onunload() {
        console.log(this.i18n.byePlugin);
        this.eventBus.off("ws-main", ({detail}: any) => {
            console.log(detail);
        });
    }
}
