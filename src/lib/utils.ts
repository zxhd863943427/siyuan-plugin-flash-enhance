export function foreach(obj: any, func: Function) {
    Array.from(obj).forEach(function (item) {
        func(item)
    });
}

export function exist(obj: any) {
    return (obj != null && obj != undefined && obj != "")
}

export function saveViaTransaction() {
    let protyle = document.querySelector('.fn__flex-1.protyle:not(.fn__none) .protyle-wysiwyg.protyle-wysiwyg--attr') //需要获取到当前正在编辑的 protyle
    let e = document.createEvent('HTMLEvents')
    e.initEvent('input', true, false)
    protyle.dispatchEvent(e)
  }
  