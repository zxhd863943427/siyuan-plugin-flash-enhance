import * as sheet from "../components/sheet.vue";
import { createApp } from "vue";
export function addSheet(plugin:any){
    const AppSheet = createApp(sheet.default,plugin.data["settingConfig"])
    AppSheet.mount(plugin.sheet)
    let base = document.querySelector("head")
    base?.appendChild(plugin.sheet)
}