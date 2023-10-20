import { getFrontend } from "siyuan"
const frontEnd = getFrontend();
export const isMobile = (frontEnd === "mobile" || frontEnd === "browser-mobile")
export let plugin:any;
export function setPlugin(_plugin:any){
    plugin = _plugin;
}