import { showMessage, confirm, Menu } from "siyuan";
import { createApp } from "vue";
import * as App from "../App.vue";
import { isMobile } from "../api/utils";
import {getSetting} from "../utils/config"


export async function addMenu(ev: MouseEvent,plugin:any) {
    const menuHtml = document.createElement('div')
    const app = createApp(App.default,plugin.data["settingConfig"])
    app.mount(menuHtml)
    console.log(menuHtml)
    console.log(app)

    const menu = new Menu("topBarSample", );
    let target:any = ev.target
    let rect: any = target.getBoundingClientRect()

    let menuObj = new Menu('FlashePlugin',() => {
        console.log(plugin.i18n.byeMenu);
    })
    let html = menuObj.addItem({ id:"pickrMenu" })
    let container = html.parentElement
    container.innerHTML = ""
    container.append(menuHtml)
    if (isMobile) {
        menu.fullscreen();
    } else {
        menu.open({
            x: rect.right,
            y: rect.bottom,
            isLeft: true,
        });
    }
}