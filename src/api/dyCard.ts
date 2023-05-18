import { isDoMark, isDelete, isUndo, isCarded } from "../lib/status"
import { foreach } from "../lib/utils"
export function dyMakeCard(detail: any, plugin: any) {
    console.log("编辑操作")
    console.log(detail)
    foreach(detail.data, (data: any) => {
        // console.log("是否为撤回操作:",isUndo(data))
        foreach(data.doOperations,(item:any)=>{
            let type = item.action
            let marked = isDoMark(item)
            let carded = isCarded(item)
            let needMakeCard = ((type ==="insert" || type === "update") && marked && !carded)
            let needDelCard = ((type === "update" && !marked && carded) || (type === "delete"))
            console.log(item.id,"操作类型:",item.action,
                "\n是否已经制卡:\t",carded,
                "\n是否需要制卡:\t",needMakeCard,
                "\n是否需要取消制卡:\t",needDelCard,
                )
        })
    })
}