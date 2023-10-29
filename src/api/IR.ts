import { fetchSyncPost, IProtyle, Plugin } from "siyuan"
import { getFileID, getHpath, getCurrentPage } from "../utils/utils"
import { foreach, saveViaTransaction } from"../lib/utils"
import { settingList } from "../utils/config"
import { watch } from "vue"
import { getBlock } from "../lib/utils"
import {Shortcuts} from 'shortcuts';
import { ReviewInfo } from "../utils/type"

const shortcuts = new Shortcuts ();
const luteEngine = globalThis.Lute.New()
const builtInDeck = '20230218211946-2kw8jgx'

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
    let selectionContent = await getSelectionContent("Md")
    console.log(selectionContent)
    if (selectionContent[0].length <= 1){
        return
    }
    let subFileID = await createSubFile(selectionContent[1],selectionContent[2])
    let data = await updateSubFile(subFileID,selectionContent[0])
    await addCard(subFileID)
    console.log("摘录完成！",data)
    cardData = {
        deckID:builtInDeck,
        blockID:data[0].doOperations[0].id
    }
    return cardData
}

async function 挖空(protyle: IProtyle) {
    let open = settingList.getSetting()["渐进式阅读"]
    let cardData:ReviewInfo
    if (!open){
        return;
    }
    console.log("挖空")
    let selectionContent = 获取挖空内容("Md")
    console.log(selectionContent)
    if (selectionContent[0].length <= 1){
        return
    }
    let subFileID = await createSubFile("挖空",selectionContent[2])
    let data = await updateSubFile(subFileID,selectionContent[0])
    await addCard(selectionContent[3])
    cardData = {
        deckID:builtInDeck,
        blockID:data[0].doOperations[0].id
    }
    return cardData
}

function 问答() {
    let open = settingList.getSetting()["渐进式阅读"]
    if (!open){
        return;
    }
    console.log("问答")
}

async function getSelectionContent(mode:string){
    const currentPage = getCurrentPage()
    //页面无.protyle-wysiwyg--select，说明未选中块，而是内容
    const slectMult = (currentPage.querySelector(".protyle-wysiwyg--select")!=null)
    let selectedContent;
    if (slectMult){
        selectedContent = await getMultSelectionContent(currentPage, mode)
    }
    else{
        selectedContent = getMonSelectionContent(mode)
    }
    return selectedContent
}

async function getMultSelectionContent(root:HTMLElement,mode:string){
    let md;
    let content;
    let source;
    const elemnet  = root.getElementsByTagName("div")
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
    switch(mode){
        case "StdMd":
            md = luteEngine.BlockDOM2StdMd(AllSelection.innerHTML)
            break;
        case "Md":
            md = luteEngine.BlockDOM2Md(AllSelection.innerHTML)
            break;
    }
    content = luteEngine.BlockDOM2Content(AllSelection.innerHTML)
    md = md + `\n((${source} "来源"))`
    return [md,content,source];
}

function getMonSelectionContent(mode:string){
    let md;
    let content;

    
    let range = getSelection().getRangeAt(0)
    let selected = range.cloneContents()
    let source = getContentSource(range)
    updateContentStyle(range)
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
    md = md + `\n((${source} "来源"))`
    return [md,content,source];
}

async function createSubFile(title:string,id:string){
    // let FileID = getFileID()
    // let Hpath = await getHpath()
    // console.log(FileID,Hpath)
    // let queryData = await fetchSyncPost("/api/query/sql", {
    //     "stmt": `SELECT box FROM blocks WHERE id == \"${FileID}\"`
    // })
    // if (queryData.code != 0 ){
    //     console.log("query fail！")
    //     return
    // }
    // let NotebookId = queryData.data[0]["box"]
    let [FileID, NotebookId, Hpath] =  await getBlockInfo(id)
    // 还要去除零宽度空格
    let subTitle = title.slice(0,15).replace(/\r\n|\r|\n|\u2028|\u2029|\t|\//g,"").replace(/[\u200B-\u200D\uFEFF]/g, '')
    subTitle = subTitle === "" ? getNewID().slice(0,14) : subTitle
    console.log(NotebookId)
    let data = await fetchSyncPost("/api/filetree/createDocWithMd",{
        "notebook": NotebookId,
        "path": Hpath+"/"+subTitle, 
        "markdown": ""
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

function updateContentStyle(range:Range){
    let selection = getSelection()
    // let strongNode = document.createElement('span')
    // strongNode.append(range.cloneContents())
    // strongNode.setAttribute('style', 'background-color: var(--b3-font-background1);')
    // range.deleteContents()
    // range.insertNode(strongNode)
    // range.setStartAfter(strongNode)
    // range.collapse(true) //取消文本选择状态
    // selection.removeAllRanges()
    // selection.addRange(range)
    
    let cloneContents = range.cloneContents().childNodes
    range.deleteContents()
    //遍历节点，增加样式
    foreach(cloneContents,(item:any)=>{
        let addStyleNode
        if (item instanceof Text){
            if(item.textContent == ""){
                return;
            }
            addStyleNode = document.createElement('span')
            addStyleNode.setAttribute('style', 'background-color: var(--b3-font-background1);')
            addStyleNode.append(item)
            console.log(addStyleNode)
        }
        else{
            addStyleNode = item.cloneNode(true)
            addStyleNode.setAttribute('style', 'background-color: var(--b3-font-background1);')
            addStyleNode.setAttribute('data-type',addStyleNode.getAttribute("data-type").replaceAll("mark","").trim())
            console.log(addStyleNode)
        }
        range.insertNode(addStyleNode)
        range.setStartAfter(addStyleNode)
    })
    range.collapse(true) //取消文本选择状态
    selection.removeAllRanges()
    selection.addRange(range)
    console.log(cloneContents)
    //关闭toolbar
    document.querySelector("#layouts  div.fn__flex-1.protyle > div.protyle-toolbar").classList.add('fn__none') 
    saveViaTransaction()
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

function 获取挖空内容(mode:string){
    let md;
    let content;
    let range = getSelection().getRangeAt(0)
    let block = getBlock(range.startContainer as HTMLElement)
    设置挖空状态(range.cloneRange())
    //重新获取range
    range = getSelection().getRangeAt(0)
    //设置块id
    let cardID = getNewID()
    let selected = block.cloneNode(true) as HTMLElement
    selected.setAttribute("data-node-id",cardID)
    console.log("start",selected)
    let source = getContentSource(range)

    // 恢复挖空前状态(range.cloneRange(),oldContent)
    updateContentStyle(range)
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

// function 恢复挖空前状态(range:Range, content:any){
//     range.deleteContents()
//     let cloneContents = content.childNodes
//     foreach(cloneContents,(item:any)=>{
//         let addStyleNode = item.cloneNode(true)
//         range.insertNode(addStyleNode)
//         range.setStartAfter(addStyleNode)
//     })
// }

function 设置挖空状态(range:Range){
    // let selection = getSelection()
    // let strongNode = document.createElement('span')
    // strongNode.append(range.cloneContents())
    // strongNode.setAttribute('data-type', 'mark')
    // range.deleteContents()
    // range.insertNode(strongNode)
    let cloneContents = range.cloneContents().childNodes
    range.deleteContents()
    let firstNode:null|HTMLElement = null
    let lastNode:null|HTMLElement = null
    //遍历节点，增加样式
    foreach(cloneContents,(item:any)=>{
        let addStyleNode
        if (item instanceof Text){
            if(item.textContent == ""){
                return;
            }
            addStyleNode = document.createElement('span')
            addStyleNode.setAttribute('data-type', 'mark')
            addStyleNode.append(item)
            console.log(addStyleNode)
        }
        else{
            addStyleNode = item.cloneNode(true)
            addStyleNode.setAttribute('data-type', 'mark '+addStyleNode.getAttribute("data-type"))
            console.log(addStyleNode)
        }
        range.insertNode(addStyleNode)
        if (firstNode === null)
            firstNode = addStyleNode
        lastNode = addStyleNode
        range.setStartAfter(addStyleNode)
    })
    document.getSelection().removeAllRanges()
    document.getSelection().addRange(((item)=>{item.setStartBefore(firstNode);item.setEndAfter(lastNode);return item})(new Range()))
    document.getSelection().getRangeAt(0)
}

async function addCard(id: string){
    let body = {
        deckID: builtInDeck,
        blockIDs: [id],
    };
    fetchSyncPost("/api/riff/addRiffCards", body);
}
var HotKeyHandler = {
    currentMainKey: null as any,
    currentValueKey: null as any,
    Init: function () {
        HotKeyHandler.Register(0, "K", function () { alert("注册成功"); });
    },
    Register: function (tag: number, value: string, func: Function) {
        let MainKey = 0;
        switch (tag) {
            case 0:
                MainKey = 17; //Ctrl
                break;
            case 1:
                MainKey = 16; //Shift
                break;
            case 2:
                MainKey = 18; //Alt
                break;
        }
        document.onkeyup = function (e) {
            HotKeyHandler.currentMainKey = null;
        }

        document.onkeydown = function (event) {
            //获取键值  
            var keyCode = event.keyCode;
            var keyValue = String.fromCharCode(event.keyCode);

            if (HotKeyHandler.currentMainKey != null) {
                if (keyValue == value) {
                    HotKeyHandler.currentMainKey = null;
                    if (func != null) func();
                }
            }
            if (keyCode == MainKey)
                HotKeyHandler.currentMainKey = keyCode;
        }
    }
}