import { 
    isDoMark, 
    isCarded, 
    isDoListCard, 
    isHasListCardMark, 
    isParentCarded, 
    getParentElement, 
    isParentIsList,
    isDosuperBlockCard,
    isDoImageOcclusion,
    isParagraph,
} from "../lib/status"
import { foreach } from "../lib/utils"
import { settingList } from "../utils/config"
import { fetchPost, showMessage } from "siyuan"

const builtInDeck = '20230218211946-2kw8jgx'

export function dyMakeCard(detail: any, plugin: any) {
    // console.log("编辑操作")
    // console.log(detail)
    //判断是否打开功能
    let open = settingList.getSetting()["沉浸式制卡"]
    if (!open){
        return;
    }
    foreach(detail.data, (data: any) => {
        // console.log("是否为撤回操作:",isUndo(data))
        foreach(data.doOperations, (item: any) => {
            // console.log("\n是否打开动态制卡:\t", open)
            makeBlockCard(item)
            makeListCard(item)
            makeSuperBlockCard(item)
            autoDeleteCard(item)
        })
    })
}

function makeBlockCard(item: any) {
    let type = item.action
    let marked = isDoMark(item)
    let carded = isCarded(item)
    let occlusioned = isDoImageOcclusion(item)
    let needMakeCard = ((type === "insert" || type === "update") && marked && !carded) || (type === "updateAttrs" && occlusioned && !carded)
    let needDelCard = (type === "update" && !marked && !occlusioned && carded)
    // console.log(item.id, "操作类型:", item.action,
    //     "\n是否已经制卡:\t", carded,
    //     "\n是否需要制卡:\t", needMakeCard,
    //     "\n是否需要取消制卡:\t", needDelCard
    // )
    if (needMakeCard) {
        addCard(item.id)
    }
    if (needDelCard) {
        removeCard(item.id)
    }
}

function makeListCard(item: any) {
    let type = item.action
    let ListCarded = isDoListCard(item)
    let ListCardMarked = isHasListCardMark(item)
    let parentIsList = isParentIsList(item)
    let carded = isParentCarded(item)
    let paragraphed = isParagraph(item)
    let needMakeCard = ((type === "insert" || type === "update") && ListCarded && !carded)
    let needDelCard = (type === "update" && parentIsList && carded && !ListCarded && !ListCardMarked && paragraphed)
    // console.log(item.id, "操作类型:", item.action,
    //     "\n是否父元素为列表:\t", parentIsList,
    //     "\n是否当前元素为段落:\t", paragraphed,
    //     "\n是否使用列表标记:\t", ListCarded,
    //     "\n是否存在原始列表标记:\t", ListCardMarked,
    //     "\n是否已经制卡:\t", carded,
    //     "\n是否需要制卡:\t", needMakeCard,
    //     "\n是否需要取消制卡:\t", needDelCard
    // )
    if (needMakeCard) {
        let listElement = getParentElement(item)
        if (listElement === null) return
        let id = listElement.getAttribute("data-node-id")
        addCard(id)
    }
    if (needDelCard) {
        let listElement = getParentElement(item)
        if (listElement === null) return
        let id = listElement.getAttribute("data-node-id")
        removeCard(id)
    }
}

function makeSuperBlockCard(item: any) {
    let type = item.action
    let superBlockCarded = isDosuperBlockCard(item)
    let carded = isParentCarded(item)
    let needMakeCard = ((type === "insert" || type === "update") && superBlockCarded && !carded)
    // console.log(item.id, "操作类型:", item.action,
    //     "\n是否使用超级块标记:\t", superBlockCarded,
    //     "\n是否已经制卡:\t", carded,
    //     "\n是否需要制卡:\t", needMakeCard
    // )
    if (needMakeCard) {
        let listElement = getParentElement(item)
        if (listElement === null) return
        let id = listElement.getAttribute("data-node-id")
        addCard(id)
    }
}

function autoDeleteCard(item:any){
    let type = item.action
    let needDelCard = ((type === "delete"))
    if (needDelCard) {
        removeCard(item.id)
    }
}

async function addCard(id: string){
    let body = {
        deckID: builtInDeck,
        blockIDs: [id],
    };
    fetchPost("/api/riff/addRiffCards", body, (res)=>{
        // showMessage(`${res.data.name}卡包的总卡片数：${res.data.size}`);
    });
}

async function removeCard(id: string){
    let body = {
        deckID: builtInDeck,
        blockIDs: [id],
    };
    fetchPost("/api/riff/removeRiffCards", body, (res)=>{
        // showMessage(`${res.data.name}卡包的剩余卡片数：${res.data.size}`);
    });
}