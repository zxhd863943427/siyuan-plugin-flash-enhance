import { getFrontend,Plugin } from "siyuan"
import { ReviewInfo } from "../utils/type";
const frontEnd = getFrontend();
export const isMobile = (frontEnd === "mobile" || frontEnd === "browser-mobile")
export let plugin:Plugin;
export function setPlugin(_plugin:Plugin){
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
const Status = {
    TO_VISIT: 'to_visit',
    VISITING: 'visiting', 
    VISITED: 'visited'
  };
  

export function sortByTopo(cardList: ReviewInfo[], sourceMap: Map<string, string>) {
    let sortedCardList: ReviewInfo[] = []
    //保存复习组中出现的全部blockid
    let currentCardIdList = new Set(cardList.map((item) => item.blockID))
    //保存访问记录
    let currentCardVisitedMap = new Map(cardList.map((item) => [item.blockID, Status.TO_VISIT]))
    //深度优先算法
    const dfs = (cardItem: ReviewInfo): boolean => {
        currentCardVisitedMap.set(cardItem.blockID, Status.VISITING)
        let sourceID = sourceMap.get(cardItem.blockID)

        //如果来源id存在，且其确实在本次复习组之中，则需要进行优先插入。
        if (sourceID && currentCardIdList.has(sourceID)) {

            //判断是否成环
            if (currentCardVisitedMap.get(sourceID) === Status.VISITING) {
                return false;
            }

            let sourceCard = cardList.find((item) => item.blockID === sourceID)

            if (currentCardVisitedMap.get(sourceID) === Status.TO_VISIT && sourceCard && !dfs(sourceCard)) {
                return false;
            }
        }
        currentCardVisitedMap.set(cardItem.blockID, Status.VISITED)
        sortedCardList.push(cardItem)
        return true;
    }
    for (let i = 0; i < cardList.length; i++) {
        let cardItem = cardList[i];
        // console.log(cardList.length)
        if (currentCardVisitedMap.get(cardItem.blockID) === Status.TO_VISIT
            && !dfs(cardItem)) {
            return []
        }

    }
    //检验是否排序错误
    let origin = new Set(cardList.map((item) => item.blockID))
    let sorted = new Set(sortedCardList.map((item) => item.blockID))
    let isSame = origin.size === sorted.size
    sortedCardList = sortedCardList.reverse()
    if (sorted.size === sortedCardList.length && isSame && testTopo(sortedCardList, sourceMap)) {
        return sortedCardList
    }
    else {
        console.error("排序出现未知错误！对应的复习参数为：\n", JSON.stringify(cardList, null, "\t"))
        console.log(
            "size:", sorted.size === sortedCardList.length,
            "item : ", isSame,
            "topo :", testTopo(sortedCardList, sourceMap))
        return cardList
    }
}

const testTopo = (sortList: ReviewInfo[], sourceMap: Map<string, string>) => {
    // 判断是否符合拓扑排序要求
    // 遍历全部已排序的序列，查找对应的上层id
    // 如果上层id排在前面，则返回false
    let n = sortList.length;
    for (let i = 0; i < n; i++) {
        let sourceID = sourceMap.get(sortList[i].blockID)
        if (!sourceID) {
            continue;
        }
        let sourceCard = sortList.find((item) => item.blockID === sourceID)
        if (!sourceCard) {
            continue;
        }
        if (sortList.indexOf(sourceCard) < sortList.indexOf(sortList[i])) {
            console.log(sortList.indexOf(sourceCard),
                sourceCard,
                sortList.indexOf(sortList[i]),
                sortList[i])
            return false;
        }
    }
    return true;
}
