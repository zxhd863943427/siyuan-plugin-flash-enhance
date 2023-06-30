import { exist } from "./utils"
import { getCurrentPage } from "../utils/utils"

export function isDoMark(item: any) {
    if (item.data === null) {
        return false
    }
    let element = document.createElement("div")
    element.innerHTML = item.data
    let query = element.querySelectorAll("span[data-type*='mark']")
    // console.log(item.data)
    // console.log(query)
    return query.length != 0
}

export function isDoListCard(item:any):boolean{

    let DoListCard = false
    let element = document.createElement("div")
    element.innerHTML = item.data

    let sourceElement = getParentElement(item)
    if (sourceElement === null) //无法找到父节点，证明不是列表，返回false
        return false
    let parentIsList = isParentIsList(item)
    if (!parentIsList)
        return false
    let query = element.querySelectorAll(`[data-type~="strong"]`)
    for (let node of query){
        let innerText = (node as HTMLElement).innerText
        if (innerText === "?" || innerText === "？")
            DoListCard = true
    }
    return DoListCard
}

export function isHasListCardMark(item:any):boolean{
    if (item.data === null) {
        return false
    }
    let re = /(>>|(》》)|(\|\|)|(\?)|(？))\s?\u200b?$/;
    let deleteListCarded = false
    let element = document.createElement("div")
    element.innerHTML = item.data
    if (re.test(element.innerText))
        deleteListCarded = true
    return deleteListCarded
}

export function isParentIsList(item:any):boolean{

    let sourceElement = getParentElement(item)
    let dataType = sourceElement ? sourceElement.getAttribute("data-type") : "none"
    if (sourceElement === null || dataType != "NodeListItem") //无法找到nodelist的父节点，证明不是列表，返回false
        return false
    else{
        return true
    }
}

export function isDosuperBlockCard(item:any):boolean{

    let DoListCard = false
    let element = document.createElement("div")
    element.innerHTML = item.data

    let sourceElement = getParentElement(item)
    if (sourceElement === null) //无法找到父节点，证明不是列表，返回false
        return false
    let parentIsList = isParentIsSuperBlock(item)
    if (!parentIsList)
        return false
    let isFirstSubBlock = sourceElement.querySelector(`:scope>[data-node-id='${item.id}']:nth-child(1)`) != null
    if (!isFirstSubBlock)
        return false
    let query = element.querySelectorAll(`[data-type~="strong"]`)
    for (let node of query){
        let innerText = (node as HTMLElement).innerText
        if (innerText === "?" || innerText === "？")
            DoListCard = true
    }
    return DoListCard
}

export function isParentIsSuperBlock(item:any):boolean{

    let sourceElement = getParentElement(item)
    let dataType = sourceElement ? sourceElement.getAttribute("data-type") : "none"
    if (sourceElement === null || dataType != "NodeSuperBlock") //无法找到nodelist的父节点，证明不是列表，返回false
        return false
    else{
        return true
    }
}

export function isParentCarded(item:any):boolean{

    let sourceElement = getParentElement(item)
    if (sourceElement === null) //无法找到nodelist的父节点，证明不是列表，返回false
        return false
    let query = sourceElement.getAttribute("custom-riff-decks")
    return query != null
}

export function getParentElement(item:any):Element|null{
    if (item.data === null || (typeof(item.data)) != "string") {
        return null
    }
    let element = document.createElement("div")
    element.innerHTML = item.data
    let dataId = (element.childNodes[0] as HTMLElement).getAttribute("data-node-id")
    let currentPage = getCurrentPage()
    let sourceElement = currentPage.querySelector(`[data-type]:has(>[data-node-id="${dataId}"])`)
    return sourceElement
}

export function isCarded(item: any) {
    if (item.data === null) {
        return false
    }
    let element = document.createElement("div")
    element.innerHTML = item.data
    let query = element.querySelectorAll("[custom-riff-decks]")
    return query.length != 0
}

export function isDelete(item: any) {
    return (item.action === "delete")
}

export function isUndo(data: any) {
    return (data.undoOperations === null)
}