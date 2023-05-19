import { request, showMessage, getCurrentPage, getHpath, iterArr } from "./utils.js"
// 传入列表下的段落，返回被标记段落的父节点：列表项的id
function fliterListCard(node) {
    let re = /(>>|(》》)|(\|\|)|(\?)|(？))\s?\u200b?$/;
    if (re.test(node.innerText)) {
        return {
            status: "ok",
            data: node.parentElement.getAttribute("data-node-id")
        }
    }
    return { status: "no", data: null };
}

function fliterMarkCard(node) {
    return {
        status: "ok",
        data: getBlock(node).getAttribute("data-node-id")
    }
}

function fliterSuperBlockCard(node) {
    return {
        status: "ok",
        data: node.getAttribute("data-node-id")
    }
}


function getBlock(node){
    if(node!=null && node.getAttribute("data-node-id") === null){
        return getBlock(node.parentElement)
    }
    return node
}


export async function getCurrentDeck(){
    let res = await request("/api/riff/getRiffDecks", {});

    //获取当前打开文档的路径
    let focusItemPath = await getHpath()
    if (focusItemPath === null) {
        showMessage(`未能当前文档读取路径`);
        return [];
    }
    let customDeckIdArr = [];
    //获取deck.id, 其deck.name 包含在 focusItemPath 中
    Array.from(res.data).forEach((item) => {
        let name = item.name;
        if (focusItemPath.search(name) != -1) {
            customDeckIdArr.push(item.id);
        }
    })
    return customDeckIdArr
}


// 添加多个卡片
export async function addCards(useBulitIn = true) {


    let customDeckIdArr = [];
    // 导入默认卡包
    if (useBulitIn === true) {
        customDeckIdArr.push('20230218211946-2kw8jgx');
    }
    else {
        customDeckIdArr = await getCurrentDeck()
    }

    if (customDeckIdArr === []){
        return;
    }


    if (customDeckIdArr.length === 0) {
        showMessage(`未能获取到：${focusItemPath} 的卡包`);
        return;
    }

    // 获取需要被制成卡片的块的ID
    const currentPage = getCurrentPage()
    //标记块
    const markList = currentPage.querySelectorAll("span[data-type*='mark']")
    //超级块
    const superBlockList = currentPage.querySelectorAll("div[class='sb']")
    //列表块
    const listList = currentPage.querySelectorAll("div[class='li']:has(div[class='li'])  > div[class = 'p']")

    let arr = [];
    let markCardList = iterArr(markList, fliterMarkCard)
    let superBlockCardList = iterArr(superBlockList, fliterSuperBlockCard)
    let listCardList = iterArr(listList, fliterListCard)
    arr = arr.concat(markCardList, superBlockCardList, listCardList)


    if (arr.length === 0) {
        showMessage(`未能获取到：${focusItemPath} 页面的卡片`);
        return;
    }

    // 去重
    arr = [... new Set(arr)];

    for (let deckIndex in customDeckIdArr) {
        let body = {
            deckID: customDeckIdArr[deckIndex],
            blockIDs: arr,
        };
        let res = await request("/api/riff/addRiffCards", body);
        if (res.code === 0) {
            showMessage(`${res.data.name}卡包的总卡片数：${res.data.size}`);
        }
    }

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////

function fliterBlockCard(node) {
    return {
        status: "ok",
        data: node.getAttribute("data-node-id")
    }
}

export async function removeCards() {


    // 获取需要被制成卡片的块的ID
    const currentPage = getCurrentPage()
    //已制卡块
    const cardedBlockList = currentPage.querySelectorAll(".protyle-wysiwyg [data-node-id][custom-riff-decks]")


    let arr = [];
    let cardedBlockIdList = iterArr(cardedBlockList, fliterBlockCard)

    arr = arr.concat(cardedBlockIdList)


    if (arr.length === 0) {
        showMessage(`未能获取到页面的卡片`);
        return;
    }

    // 去重
    arr = [... new Set(arr)];


    let body = {
        deckID: '',
        blockIDs: arr,
    };
    let res = await request("/api/riff/removeRiffCards", body);
    if (res.code === 0) {
        showMessage(`All卡包的移除卡片数：${arr.length}`);
    }

}
