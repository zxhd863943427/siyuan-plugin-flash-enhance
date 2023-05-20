import { fetchSyncPost } from "siyuan"
import { getFileID, getHpath, getCurrentPage } from "../utils/utils"
import { saveViaTransaction } from"../lib/utils"
import { settingList } from "../utils/config"
import { watch } from "vue"
import { getBlock } from "../lib/utils"

const luteEngine = globalThis.Lute.New()
const builtInDeck = '20230218211946-2kw8jgx'

export function IRswitch() {
    let enable = settingList.getSetting()["渐进式阅读"]
    if (enable) {
        HotKeyHandler.Register(2, "Q", 摘录)
        // HotKeyHandler.Register(2,"W",挖空)
        // HotKeyHandler.Register(2,"E",问答)
    }

    watch(settingList.setList,()=>{
        let enable = settingList.getSetting()["渐进式阅读"]
        if (enable) {
            HotKeyHandler.Register(2, "Q", 摘录)
            // HotKeyHandler.Register(2,"W",挖空)
            // HotKeyHandler.Register(2,"E",问答)
        }
    })
}

async function 摘录() {
    let open = settingList.getSetting()["渐进式阅读"]
    if (!open){
        return;
    }
    console.log("摘录")
    let selectionContent = getSelectionContent("Md")
    console.log(selectionContent)
    if (selectionContent[0].length <= 1){
        return
    }
    let subFileID = await createSubFile(selectionContent[1])
    updateSubFile(subFileID,selectionContent[0])
    addCard(subFileID)
}

function 挖空() {
    let open = settingList.getSetting()["渐进式阅读"]
    if (!open){
        return;
    }
    console.log("挖空")
}

function 问答() {
    let open = settingList.getSetting()["渐进式阅读"]
    if (!open){
        return;
    }
    console.log("问答")
}

function getSelectionContent(mode:string){
    const currentPage = getCurrentPage()
    //页面无.protyle-wysiwyg--select，说明未选中块，而是内容
    const slectMult = (currentPage.querySelector(".protyle-wysiwyg--select")!=null)
    let selectedContent;
    if (slectMult){
        selectedContent = getMultSelectionContent(currentPage, mode)
    }
    else{
        selectedContent = getMonSelectionContent(mode)
    }
    return selectedContent
}

function getMultSelectionContent(root:HTMLElement,mode:string){
    let md;
    let content;
    let source;
    const elemnet  = root.getElementsByTagName("div")
    const select = Array.from(elemnet)
    .filter(chapter => chapter.classList.contains("protyle-wysiwyg--select"))
    const AllSelection = document.createElement("div")
    for (let se of select) {
        updateBlockStyle(se)
        let item = se.cloneNode(true) as HTMLElement
        source = se.getAttribute("data-node-id")
        item.setAttribute("data-node-id",getNewID())
        AllSelection.appendChild(item)
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
    return [md,content];
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
    return [md,content];
}

async function createSubFile(title:string){
    let FileID = getFileID()
    let Hpath = await getHpath()
    console.log(FileID,Hpath)
    let queryData = await fetchSyncPost("/api/query/sql", {
        "stmt": `SELECT box FROM blocks WHERE id == \"${FileID}\"`
    })
    if (queryData.code != 0 ){
        console.log("query fail！")
        return
    }
    let NotebookId = queryData.data[0]["box"]
    console.log(NotebookId)
    let data = await fetchSyncPost("/api/filetree/createDocWithMd",{
        "notebook": NotebookId,
        "path": Hpath+"/"+title.slice(0,50),
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

function updateBlockStyle(el:HTMLElement){
    let ID = el.getAttribute("data-node-id")
    fetchSyncPost("/api/attr/setBlockAttrs",{
        "id": ID,
        "attrs": {
          "style": "background-color: var(--b3-font-background1);"
        }
      })
}

function updateContentStyle(range:Range){
    let selection = getSelection()
    let strongNode = document.createElement('span')
    strongNode.append(range.cloneContents())
    strongNode.setAttribute('style', 'background-color: var(--b3-font-background1);')
    range.deleteContents()
    range.insertNode(strongNode)
    range.setStartAfter(strongNode)
    range.collapse(true) //取消文本选择状态
    selection.removeAllRanges()
    selection.addRange(range)
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