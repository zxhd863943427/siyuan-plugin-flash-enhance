import * as FlashReview from "../components/FlashcardReview.vue"
import { settingList } from "../utils/config"
import { watch, createApp, App } from "vue"
import { fetchSyncPost, IProtyle, openTab,ITab } from "siyuan"
import { QueryOption } from "../utils/type"

const TAB_TYPE = "review-enhance"
let flashReviewRef:App<Element> = null;
let openedTab:ITab;

const getDocID = (protyle:IProtyle)=>{
    return protyle.block.rootID
}

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
            flashReviewRef?.unmount()
            flashReviewRef = null
            openedTab = null
        }
    });
    if (enable) {
    plugin.addCommand({
        langKey: "enhanceReview",
        hotkey: "⌥U",
        callback: () => {
            openEnhanceReview(plugin,{type:"all"});
        },
    })
    plugin.addCommand({
        langKey:"fileTreeEnhanceReview",
        hotkey:"⌥I",
        editorCallback:async(protyle:IProtyle)=>{

            openEnhanceReview(plugin,{
                type:"fileTree",
                fileTree:getDocID(protyle)
            })
        }
    })
    }


    watch(settingList.setList,()=>{
        let enable = settingList.getSetting()["增强闪卡界面"]
        if (!enable) {

        }
        else{
            plugin.addCommand({
                langKey: "enhanceReview",
                hotkey: "⌥U",
                callback: () => {
                    openEnhanceReview(plugin,{type:"all"});
                }
            })
            plugin.addCommand({
                langKey:"fileTreeEnhanceReview",
                hotkey:"⌥I",
                editorCallback:async(protyle:IProtyle)=>{
                    let treeReviewCardData = await fetchSyncPost('/api/riff/getTreeRiffDueCards',{
                        rootID:getDocID(protyle)
                    })
                    console.log(treeReviewCardData)
                    const {cards} = treeReviewCardData.data
                    console.log(cards)
                    openEnhanceReview(plugin,cards)
                }
            })
        }
    })
}

async function openEnhanceReview(plugin:any, queryOption:QueryOption){

    if (openedTab!=null){
        openedTab.close()
    }
    openedTab = await openTab({
        app: plugin.app,
        custom: {
            icon: "iconFace",
            title: "Custom Tab",
            id: plugin.name + TAB_TYPE
        },
    });
    const flashReview = createApp(FlashReview.default,{
        initReviewCard:queryOption
    })
    flashReview.mount(openedTab.panelElement)
    console.log("mount")
    console.log(openedTab.panelElement)
    console.log(openedTab)
    flashReviewRef = flashReview
}

async function addBlockReading(id:string,deck:string = '20230218211946-2kw8jgx'){
    await fetchSyncPost("/api/attr/setBlockAttrs", {
        "id": id,
        "attrs": {
            "custom-plugin-incremental-reading": "true"
        }
    })
    let body = {
        deckID: deck,
        blockIDs: [id],
    };
    await fetchSyncPost("/api/riff/addRiffCards", body);
}

export function addReadingItem({detail}:any){
    detail.menu.addItem({
        label: "添加为阅读材料",
        icon: "",
        click: () => {
            let id = detail.blockElements?detail.blockElements[0].getAttribute("data-node-id"):detail.data.id
            addBlockReading(id)
        }
    })
}

const genAddOrderReadingItemMemu=(data:any):any[]=>{
    let submenu:any[] = []
    for (let i = 1; i <= 6; i++) {
        submenu.push
            ({
                label: `按${i}级标题拆分`,
                icon: "",
                click: async() => {
                    addOrderReading(data,i)
                }
            })
    }
    console.log(submenu)
    return submenu
}

async function addOrderReading(data:any,headingLevel:number){
    let sourceDocID = data.id
    let headBlockList:any[]
    let headBlockListWithIndex:{index:number,blockData:any}[]=[]
    headBlockList= (await fetchSyncPost("/api/query/sql",{
        stmt: `select * from blocks where subtype = "h${headingLevel}" and root_id = "${sourceDocID}"`
    })).data
    for (let headingBlock of headBlockList){
        let blockIndex = (await fetchSyncPost("/api/block/getBlockIndex",{
            id: headingBlock.id
        })).data
        headBlockListWithIndex.push({index:blockIndex,blockData:headingBlock})
    }
    headBlockListWithIndex = headBlockListWithIndex.sort((a,b)=>{
        return a.index - b.index
    })
    
    let blockListLength = headBlockListWithIndex.length
    for (let index = 0;index<blockListLength;index++){
        let currentID = headBlockListWithIndex[index].blockData.id
        let prevID = index === 0 ? "START": headBlockListWithIndex[index-1].blockData.id
        let nextID = index === blockListLength -1 ? "END" : headBlockListWithIndex[index+1].blockData.id
        let enableReading = index === 0 ? "true": "false"
        await fetchSyncPost("/api/attr/setBlockAttrs", {
            "id": headBlockListWithIndex[index].blockData.id,
            "attrs": {
                "custom-plugin-incremental-reading-prev-id": prevID,
                "custom-plugin-incremental-reading-next-id": nextID,
                "custom-plugin-incremental-reading-source": sourceDocID,
                "custom-plugin-incremental-reading-enable": enableReading
            }
        })
        await addBlockReading(headBlockListWithIndex[index].blockData.id)
    }
}

export function addOrderReadingItem({detail}:any){
    detail.menu.addItem({
        'label':"添加有序阅读材料",
        'submenu':genAddOrderReadingItemMemu(detail.data)
    })
}