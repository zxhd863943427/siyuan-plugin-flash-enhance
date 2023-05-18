import { exist } from "./utils"

export function isDoMark(item: any) {
    if (item.data === null) {
        return false
    }
    let element = document.createElement("div")
    element.innerHTML = item.data
    let query = element.querySelectorAll("span[data-type='mark']")
    // console.log(item.data)
    // console.log(query)
    return query.length != 0
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