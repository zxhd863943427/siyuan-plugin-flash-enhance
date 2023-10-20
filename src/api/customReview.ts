import * as FlashReview from "../components/FlashcardReview.vue"
import { settingList } from "../utils/config"
import { watch, createApp } from "vue"
import { fetchSyncPost, IProtyle, openTab } from "siyuan"

const TAB_TYPE = "review-enhance"

export function customReviewSwitch(plugin:any) {
    let enable = settingList.getSetting()["增强闪卡界面"]
    console.log("review")
    const customTab = plugin.addTab({
        type: TAB_TYPE,
        init() {
            this.element.innerHTML = ``;
            console.log("init flash card")

        },
        beforeDestroy() {
            console.log("before destroy tab:", TAB_TYPE);
        },
        destroy() {
            console.log("destroy tab:", TAB_TYPE);
        }
    });
    if (enable) {
    plugin.addCommand({
        langKey: "enhanceReview",
        hotkey: "⌥U",
        callback: () => {
            openEnhanceReview(plugin);
        }
    })
    }


    watch(settingList.setList,()=>{
        let enable = settingList.getSetting()["渐进式阅读"]
        if (!enable) {

        }
        else{
            plugin.addCommand({
                langKey: "enhanceReview",
                hotkey: "⌥U",
                callback: () => {
                    openEnhanceReview(plugin);
                }
            })
        }
    })
}

async function openEnhanceReview(plugin:any){

    const tab = await openTab({
        app: plugin.app,
        custom: {
            icon: "iconFace",
            title: "Custom Tab",
            id: plugin.name + TAB_TYPE
        },
    });
    const flashReview= createApp(FlashReview.default)
    flashReview.mount(tab.panelElement)
    console.log("mount")
    console.log(tab.panelElement)
    console.log(tab)
}