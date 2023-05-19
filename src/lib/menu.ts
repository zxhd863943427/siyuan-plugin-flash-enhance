import { showMessage, confirm, Menu, isMobile } from "siyuan";
import { createApp } from "vue";
import * as App from "../App.vue";
import {getSetting} from "../utils/config"

const testConfig={"闪卡样式增强":true,
"复习挖空增强":true,
"类remnote复习界面":true,
"层级闪卡":true,
"内置卡包制卡":true,
"数学块遮挡制卡":true,
"沉浸式制卡":false}


export async function addMenu(ev: MouseEvent,plugin:any) {
    const menuHtml = document.createElement('div')
    let setting = await getSetting(null)
    let tempApp = App
    const app = createApp(App.default,setting)
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
    if (isMobile()) {
        menu.fullscreen();
    } else {
        menu.open({
            x: rect.right,
            y: rect.bottom,
            isLeft: true,
        });
    }
}