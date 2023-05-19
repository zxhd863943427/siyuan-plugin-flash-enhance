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
        data: node.parentElement.parentElement.getAttribute("data-node-id")
    }
}

function fliterSuperBlockCard(node) {
    return {
        status: "ok",
        data: node.getAttribute("data-node-id")
    }
}



// 添加多个卡片
export async function addCards(useBulitIn = true) {
    //获取全部deck
    let res = await request("/api/riff/getRiffDecks", {});

    //获取当前打开文档的路径
    let focusItemPath = await getHpath()
    if (focusItemPath === null) {
        showMessage(`未能当前文档读取路径`);
        return;
    }


    let customDeckIdArr = [];
    // 导入默认卡包
    if (useBulitIn === true) {
        customDeckIdArr.push('20230218211946-2kw8jgx');
    }
    else {

        //获取deck.id, 其deck.name 包含在 focusItemPath 中
        Array.from(res.data).forEach((item) => {
            let name = item.name;
            if (focusItemPath.search(name) != -1) {
                customDeckIdArr.push(item.id);
            }
        })
    }



    if (customDeckIdArr.length === 0) {
        showMessage(`未能获取到：${focusItemPath} 的卡包`);
        return;
    }

    // 获取需要被制成卡片的块的ID
    const currentPage = getCurrentPage()
    //标记块
    const markList = currentPage.querySelectorAll("span[data-type='mark']")
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

//////////////////////////////////////////////////////////////////////////////////////////////////

function fliterDyMarkCard(node) {

    let nodeParent = node.parentElement.parentElement
    //判断是否已经制卡
    if (nodeParent.getAttribute("custom-riff-decks")) {
        return {
            status: "No a todo card",
            data: nodeParent.getAttribute("data-node-id")
        }
    }
    return {
        status: "ok",
        data: nodeParent.getAttribute("data-node-id")
    }
}

async function dynamiMarkCard(useBulitIn) {

    //获取全部deck
    let res = await request("/api/riff/getRiffDecks", {});

    //获取当前打开文档的路径
    let focusItemPath = await getHpath()
    if (focusItemPath === null) {
        showMessage(`未能当前文档读取路径`);
        return;
    }

    let customDeckIdArr = [];
    // 导入默认卡包
    if (useBulitIn === true) {
        customDeckIdArr.push('20230218211946-2kw8jgx');
    }
    else {

        //获取deck.id, 其deck.name 包含在 focusItemPath 中
        Array.from(res.data).forEach((item) => {
            let name = item.name;
            if (focusItemPath.search(name) != -1) {
                customDeckIdArr.push(item.id);
            }
        })
    }

    if (customDeckIdArr.length === 0) {
        showMessage(`未能获取到：${focusItemPath} 的卡包`);
        return;
    }
    //获取选中位置的情况
    let selectParent = document.getSelection().anchorNode.parentElement

    //如果为selectParent.tagName === "SPAN"，说明为标记，进入制卡流程
    if (selectParent.tagName === "SPAN") {
        setTimeout(async ()=>{await dyAddCard();}, 500)
    }
    else{
        //否则说明为取消标记，需要判断是否取消了所有标记
        setTimeout(async ()=>{await removeCard();}, 500)
    }
    async function dyAddCard() {
        let MarkCardList = iterArr([selectParent], fliterDyMarkCard);

        for (let deckIndex in customDeckIdArr) {
            let body = {
                deckID: customDeckIdArr[deckIndex],
                blockIDs: MarkCardList,
            };

            let res = await request("/api/riff/addRiffCards", body);
        }
        return;
    }

    async function removeCard() {
        // console.log("取消标记")
        let markNode = selectParent.querySelectorAll("span[data-type='mark']");
        // console.log("markNode ",markNode)
        if (markNode.length <= 0) {
            let MarkCardList = [selectParent.parentElement.getAttribute("data-node-id")];
            // console.log("MarkCardList ",MarkCardList)
            let body = {
                deckID: '',
                blockIDs: MarkCardList,
            };
            // console.log("body ",body)
            let res = await request("/api/riff/removeRiffCards", body);
            // console.log("res ",res.code)
        }
    }
}

export async function openDynamiMarkCard(openDynamiMark, useBulitIn){
    if (!openDynamiMark){
        return;
    }
    setTimeout(()=>{dynamiMarkCard(useBulitIn)}, 100)
    // dynamiMarkCard(useBulitIn)
}