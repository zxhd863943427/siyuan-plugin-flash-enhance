import {Plugin, showMessage, confirm, Dialog, Menu} from "siyuan";
import "./index.scss";

export default class PluginSample extends Plugin {
    onload() {
        this.eventBus.on("ws-main", ({detail}: any) => {
            console.log("on ws-main", detail);
        });

        const topBarElement = this.addTopBar({
            icon: "iconList",
            title: this.i18n.addTopBarIcon,
            position: "right",
            callback: (event: MouseEvent) => {
                this.addMenu(topBarElement.getBoundingClientRect());
            }
        })
    }

    onunload() {
        console.log(this.i18n.byePlugin);
        this.eventBus.off("ws-main", ({detail}: any) => {
            console.log(detail);
        });
    }

    private addMenu(rect: DOMRect) {
        const menu = new Menu("topBarSample", () => {
            console.log(this.i18n.byeMenu);
        })
        menu.addItem({
            label: "confirm",
            click(element: HTMLElement) {
                confirm("Confirm", "Is this a confirm?", () => {
                    console.log("confirm");
                }, () => {
                    console.log("cancel");
                })
            }
        })
        menu.addItem({
            label: "showMessage",
            click: (element: HTMLElement) => {
                showMessage(this.i18n.helloPlugin);
            }
        })
        menu.addItem({
            label: "Dialog",
            click: (element: HTMLElement) => {
                new Dialog({
                    title: "Info",
                    content: "This is a dialog",
                    width: "360px",
                });
            }
        })
        menu.addSeparator();
        menu.addItem({
            label: "readonly",
            type: "readonly",
        })
        menu.open({
            x: rect.right,
            y: rect.bottom,
            isLeft: true,
        })
    }
}
