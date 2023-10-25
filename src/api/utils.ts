import { getFrontend } from "siyuan"
const frontEnd = getFrontend();
export const isMobile = (frontEnd === "mobile" || frontEnd === "browser-mobile")
export let plugin:any;
export function setPlugin(_plugin:any){
    plugin = _plugin;
}

export const getDockByType = (type: string) => {
    if (!window.siyuan.layout.leftDock) {
        return undefined;
    }
    if (window.siyuan.layout.leftDock.data[type]) {
        return window.siyuan.layout.leftDock;
    }
    if (window.siyuan.layout.rightDock.data[type]) {
        return window.siyuan.layout.rightDock;
    }
    if (window.siyuan.layout.bottomDock.data[type]) {
        return window.siyuan.layout.bottomDock;
    }
};

export const genTodayDate = ()=>{
    const date = new Date();

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const formatted = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    return formatted
}
