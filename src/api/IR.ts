import { fetchSyncPost, IProtyle, Plugin, Protyle } from "siyuan"
import { getFileID, getHpath, getCurrentPage } from "../utils/utils"
import { foreach, saveViaTransaction } from"../lib/utils"
import { settingList } from "../utils/config"
import { watch } from "vue"
import { getBlock } from "../lib/utils"
import {Shortcuts} from 'shortcuts';
import { ReviewInfo } from "../utils/type"
import { genTodayDate } from "./utils"

const shortcuts = new Shortcuts ();
const luteEngine = globalThis.Lute.New()
const builtInDeck = '20230218211946-2kw8jgx'
const MAKEDATE = 'custom-make-date'
const SOURCEROAD = 'custom-source-road'
const CARD_FRONT = 'custom-flash-front'
const CARD_BACK = 'custom-flash-back'

export function IRswitch(plugin:Plugin) {
    let enable = settingList.getSetting()["渐进式阅读"]
    if (enable) {
    plugin.addCommand({
        langKey: "extract",
        hotkey: "⌥Q",
        editorCallback: async(protyle: IProtyle) => {
            let newCard = await 摘录(protyle);
            plugin.eventBus.emit(("add-card" as any),{newCard:newCard as ReviewInfo})
        }
    })
    plugin.addCommand({
        langKey: "hollowedOut",
        hotkey: "⌥W",
        editorCallback: async(protyle: IProtyle) => {
            let newCard = await 挖空(protyle);
            plugin.eventBus.emit(("add-card" as any),{newCard:newCard as ReviewInfo})
        }
    })
    }


    watch(settingList.setList,()=>{
        let enable = settingList.getSetting()["渐进式阅读"]
        if (!enable) {

        }
        else{
            plugin.addCommand({
                langKey: "extract",
                hotkey: "⌥Q",
                editorCallback: async(protyle: IProtyle) => {
                    let newCard = await  摘录(protyle);
                    plugin.eventBus.emit(("add-card" as any),{newCard:newCard as ReviewInfo})
                }
            })
            plugin.addCommand({
                langKey: "hollowedOut",
                hotkey: "⌥W",
                editorCallback: async(protyle: IProtyle) => {
                    let newCard = await  挖空(protyle);
                    plugin.eventBus.emit(("add-card" as any),{newCard:newCard as ReviewInfo})
                }
            })
        }
    })
}

async function 摘录(protyle: IProtyle) {
    let open = settingList.getSetting()["渐进式阅读"]
    let cardData:ReviewInfo
    if (!open){
        return;
    }
    console.log("摘录")
    // updateContentStyle(protyle)
    let selectionContent = await getSelectionContent("Md",protyle)
    console.log(selectionContent)
    if (selectionContent[0].length <= 1){
        return
    }
    let subFileID = await createSubFile(selectionContent[1],selectionContent[2],selectionContent[0])
    //let data = await updateSubFile(subFileID,selectionContent[0])
    await addCard(subFileID)
    // console.log("摘录完成！",data)
    cardData = {
        deckID:builtInDeck,
        blockID:subFileID
    }
    addExtractInfo(subFileID,protyle)
    return cardData
}

async function 挖空(protyle: IProtyle) {
    let open = settingList.getSetting()["渐进式阅读"]
    let cardData:ReviewInfo
    if (!open){
        return;
    }
    console.log("挖空")
    
    let selectionContent = getHollowContent("Md",protyle,"sm")
    updateContentStyle(protyle)
    console.log(selectionContent)
    if (selectionContent[0].length <= 1){
        return
    }
    let title = "挖空 "+selectionContent[1].slice(0,20) + ' ...'
    let subFileID = await createSubFile(title,selectionContent[2])
    let data = await updateSubFile(subFileID,selectionContent[0])
    await addCard(subFileID)
    cardData = {
        deckID:builtInDeck,
        blockID:subFileID
    }
    addHollowInfo(subFileID,protyle)
    return cardData
}

function 问答() {
    let open = settingList.getSetting()["渐进式阅读"]
    if (!open){
        return;
    }
    console.log("问答")
}

const getSourceTitle = (protyle:IProtyle):string=>{
    if (protyle.options.blockId === protyle.block.parentID){
        return protyle.title.editElement.innerText
    }
    let firstNode = protyle.element.querySelector(`div[data-node-id='${protyle.options.blockId}'] > div:nth-child(1)`) as HTMLElement
    if (firstNode){
        return firstNode.innerText.slice(0,30)
    }
    return '来源'
}

async function getSelectionContent(mode:string,protyle:IProtyle){
    const currentPage = protyle.element
    //页面无.protyle-wysiwyg--select，说明未选中块，而是内容
    const slectMult = (currentPage.querySelector(".protyle-wysiwyg--select")!=null)
    let selectedContent;
    if (slectMult){
        selectedContent = await getMultSelectionContent(currentPage, mode,protyle)
    }
    else{
        selectedContent = getMonSelectionContent(mode,protyle)
        updateContentStyle(protyle)
    }
    return selectedContent
}

async function getMultSelectionContent(root:HTMLElement,mode:string,protyle:IProtyle){
    let md;
    let sourceRoadMd;
    let content;
    let source;
    const elemnet  = root.getElementsByTagName("div")
    let sourceTitle = getSourceTitle(protyle)
    const select = Array.from(elemnet)
    .filter(chapter => chapter.classList.contains("protyle-wysiwyg--select"))
    const AllSelection = document.createElement("div")
    for (let se of select) {    
        let item = se.cloneNode(true) as HTMLElement
        source = se.getAttribute("data-node-id")
        item.setAttribute("data-node-id",getNewID())
        item.querySelectorAll("[data-node-id]").forEach((subNode)=>{subNode.setAttribute("data-node-id",getNewID())})
        AllSelection.appendChild(item)
        await updateBlockStyle(se)
    }
    let [_, sourceRoadElement] = extractSourceRoad(root)
    switch(mode){
        case "StdMd":
            md = luteEngine.BlockDOM2StdMd(AllSelection.innerHTML)
            sourceRoadMd = luteEngine.BlockDOM2StdMd(sourceRoadElement.innerHTML)
            break;
        case "Md":
            md = luteEngine.BlockDOM2Md(AllSelection.innerHTML)
            sourceRoadMd = luteEngine.BlockDOM2Md(sourceRoadElement.innerHTML)
            break;
    }
    content = luteEngine.BlockDOM2Content(AllSelection.innerHTML)
    // md = md + `\n((${source} "来源"))`
    md = md =  `${md}

{{{row
((${source} "${sourceTitle}"))

${sourceRoadMd}
    
${genTodayDate()}
{: ${MAKEDATE}="true"}
}}}
{: ${SOURCEROAD}="true"}`
    return [md,content,source];
}

function getMonSelectionContent(mode:string,protyle:IProtyle){
    let md;
    let sourceRoadMd;
    let content;

    let sourceTitle = getSourceTitle(protyle)
    
    let range = getSelection().getRangeAt(0)
    let selected = range.cloneContents()
    let source = getContentSource(range)
    updateContentStyle(protyle)
    let element = document.createElement("div")

    let [_,sourceRoadElement] = extractSourceRoad(protyle.element)

    element.appendChild(selected)
    switch(mode){
        case "StdMd":
            md = luteEngine.BlockDOM2StdMd(element.innerHTML)
            sourceRoadMd = luteEngine.BlockDOM2StdMd(sourceRoadElement.innerHTML)
            break;
        case "Md":
            md = luteEngine.BlockDOM2Md(element.innerHTML)
            sourceRoadMd = luteEngine.BlockDOM2Md(sourceRoadElement.innerHTML)
            break;
    }
    content = luteEngine.BlockDOM2Content(element.innerHTML)
    md = md =  `${md}

{{{row
((${source} "${sourceTitle}"))

${sourceRoadMd}
    
${genTodayDate()}
{: ${MAKEDATE}="true"}
    
}}}
{: ${SOURCEROAD}="true"}`

    return [md,content,source];
}

async function createSubFile(title:string,id:string, content=''){

    let [FileID, NotebookId, Hpath] =  await getBlockInfo(id)
    // 还要去除零宽度空格
    let subTitle = title.slice(0,15).replace(/\r\n|\r|\n|\u2028|\u2029|\t|\//g,"").replace(/[\u200B-\u200D\uFEFF]/g, '')
    subTitle = subTitle === "" ? getNewID().slice(0,14) : subTitle
    console.log(NotebookId)
    let data = await fetchSyncPost("/api/filetree/createDocWithMd",{
        "notebook": NotebookId,
        "path": Hpath+"/"+subTitle, 
        "markdown": content
    })
    if (data.code!=0){
        console.log(data.msg)
        return ""
    }
    return data.data
}

async function updateSubFile(id:string, content:string){
    let data = await fetchSyncPost("/api/block/prependBlock",{
        "dataType": "markdown",
        "data": content,
        "nextID": "",
        "previousID": "",
        "parentID": id
    })
    if (data.code!=0){
        console.log(data.msg)
        return ""
    }
    return data.data
}

async function updateBlockStyle(el:HTMLElement){
    let ID = el.getAttribute("data-node-id")
    await fetchSyncPost("/api/attr/setBlockAttrs",{
        "id": ID,
        "attrs": {
          "style": "background-color: var(--b3-font-background1);"
        }
      })
      el.classList.remove("protyle-wysiwyg--select")
}

function updateContentStyle(protyle:IProtyle){
    protyle.toolbar.setInlineMark(protyle, "text", "range", {
        type: "backgroundColor",
        color:"var(--b3-font-background1)"
    });
}



function getNewID(){
    return globalThis.Lute.NewNodeID()
}

function getContentSource(range:Range){
    return getBlock(range.startContainer as HTMLElement).getAttribute("data-node-id")
}

async function getBlockInfo(id:string){
    let queryData = await fetchSyncPost("/api/query/sql", {
        "stmt": `SELECT root_id, box, hpath FROM blocks WHERE id == \"${id}\"`
    })
    if (queryData.code != 0 ){
        console.log("query fail！")
        return
    }
    let DocId = queryData.data[0]["root_id"]
    let notebookId = queryData.data[0]["box"]
    let hpath = queryData.data[0]["hpath"]
    return [DocId,notebookId,hpath]
}

function getHollowContent(mode:string, protyle:IProtyle, type:"std"|"sm"="std"){
    if (type==="std"){
        return getStdHollowContent(mode,protyle)
    }
    else{
        return getSmHollowContent(mode,protyle)
    }
}

function getStdHollowContent(mode:string, protyle:IProtyle){
    let md;
    let content;
    let cardID = getNewID()
    let range = getSelection().getRangeAt(0)
    let block = getBlock(range.startContainer as HTMLElement)
    protyle.toolbar.setInlineMark(protyle, "mark", "range")
    let selected = block.cloneNode(true) as HTMLElement
    protyle.toolbar.setInlineMark(protyle, "mark", "range")
    selected.setAttribute("data-node-id",cardID)
    let source = getContentSource(range)
    let element = document.createElement("div")

    element.appendChild(selected)
    switch(mode){
        case "StdMd":
            md = luteEngine.BlockDOM2StdMd(element.innerHTML)
            break;
        case "Md":
            md = luteEngine.BlockDOM2Md(element.innerHTML)
            break;
    }
    content = luteEngine.BlockDOM2Content(element.innerHTML)
    md =  `((${source} "*"))` + md
    return [md,content,source,cardID];
}

const createHollow = ():HTMLElement=>{
    let hollow = document.createElement("span")
    hollow.setAttribute("data-type",'hollow')
    hollow.innerText = '[...]'
    return hollow
}



function getSmHollowContent(mode:string, protyle:IProtyle){
    let md;
    let hollowMd;
    let sourceRoadMd;
    let content;
    let cardID = getNewID()
    let doc = protyle.element.querySelector('.protyle-wysiwyg') as HTMLElement
    let sourceTitle = getSourceTitle(protyle)
    protyle.toolbar.setInlineMark(protyle, "wait", "range")
    let selected = doc.cloneNode(true) as HTMLElement
    protyle.toolbar.setInlineMark(protyle, "wait", "range")
    // selected.setAttribute("data-node-id",cardID)
    let source = protyle.options.blockId

    for (let se of selected.childNodes) {    
        let item = se as HTMLElement
        item.setAttribute("data-node-id",getNewID())
        item.querySelectorAll("[data-node-id]").forEach((subNode)=>{subNode.setAttribute("data-node-id",getNewID())})
    }
    let hollowElement = selected.querySelector("[data-type='wait']")
    hollowElement.replaceWith(createHollow())
    let tempHollowParent = document.createElement("div")
    tempHollowParent.append(hollowElement)

    let sourceRoadElement;
    [selected,sourceRoadElement] = extractSourceRoad(selected)
    
    selected
    .querySelectorAll('[data-type="text"][style*="background-color: var(--b3-font-background1)"]')
    .forEach((node)=>{
        node.setAttribute('data-type',"search-mark")
    })
    
    switch(mode){
        case "StdMd":
            md = luteEngine.BlockDOM2StdMd(selected.innerHTML)
            hollowMd = luteEngine.BlockDOM2StdMd(tempHollowParent.innerHTML)
            sourceRoadMd  = luteEngine.BlockDOM2StdMd(sourceRoadElement.innerHTML)
            break;
        case "Md":
            md = luteEngine.BlockDOM2Md(selected.innerHTML)
            hollowMd = luteEngine.BlockDOM2Md(tempHollowParent.innerHTML)
            sourceRoadMd  = luteEngine.BlockDOM2Md(sourceRoadElement.innerHTML)
            break;
    }
    content = luteEngine.BlockDOM2Content(selected.innerHTML)
    md =  `{{{row
{{{row
${md}

}}}
{: ${CARD_FRONT}='true'}


> ${hollowMd}
{: ${CARD_BACK}="true"}

}}}

{{{row
((${source} "${sourceTitle}"))

${sourceRoadMd}
    
${genTodayDate()}
{: ${MAKEDATE}="true"}
    
}}}
{: ${SOURCEROAD}="true"}`
    return [md,content,source,cardID];
}

function extractSourceRoad(node:HTMLElement):[HTMLElement,HTMLElement]{
    let cloneNode = node.cloneNode(true) as HTMLElement
    let sourceRoadElement = cloneNode.querySelector("[custom-source-road]")
    if(!sourceRoadElement){
        sourceRoadElement = document.createElement("div")
    }
    sourceRoadElement.remove()
    sourceRoadElement.querySelector('[custom-make-date]')?.remove()
    return [cloneNode as HTMLElement,sourceRoadElement as HTMLElement]
}

async function addCard(id: string){
    let body = {
        deckID: builtInDeck,
        blockIDs: [id],
    };
    fetchSyncPost("/api/riff/addRiffCards", body);
}

async function addExtractInfo(newDocID:string,protyle: IProtyle) {
    await fetchSyncPost("/api/attr/setBlockAttrs",{
        "id": newDocID,
        "attrs": {
            "custom-plugin-incremental-reading": "true",
            "custom-extract-source":protyle.options.blockId
        }
      })
}

async function addHollowInfo(newDocID:string,protyle: IProtyle) {
    await fetchSyncPost("/api/attr/setBlockAttrs",{
        "id": newDocID,
        "attrs": {
            "custom-extract-source":protyle.options.blockId
        }
      })
}