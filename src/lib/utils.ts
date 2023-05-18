export function foreach(obj: any, func: Function) {
    Array.from(obj).forEach(function (item) {
        func(item)
    });
}

export function exist(obj: any) {
    return (obj != null && obj != undefined && obj != "")
}