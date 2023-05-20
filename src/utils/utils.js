import { isMobile } from 'siyuan';

// 请求函数
export function request(url, data = null, method = "POST") {
    return new Promise((resolve, reject) => {
        if (method.toUpperCase() == "POST") {
            fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
                .then(
                    (data) => resolve(data.json()),
                    (error) => {
                        reject(error);
                    }
                )
                .catch((err) => {
                    console.error("请求失败:", err);
                });
        }
    });
}

// 弹出提示信息
export async function showMessage(msg) {
    await request("/api/notification/pushMsg", { msg, timeout: 3000 });
}

// 获取当前文档id
export function getFileID() {
    if (isMobile())
        return document.querySelector('#editor .protyle-content .protyle-background')?.getAttribute("data-node-id");
    //获取当前页面
    const currentPage = getCurrentPage();
    //获取当前页面id
    const currentPageID = currentPage.querySelector(
        "span.protyle-breadcrumb__item--active"
    ).getAttribute("data-node-id");

    return currentPageID;
}

export function getCurrentPage() {

    try {
        //获取当前屏幕
        let currentScreen = document.querySelector(".layout__wnd--active");
        //获取当前页面
        let currentPage = currentScreen.querySelector(
            ".fn__flex-1.protyle:not(.fn__none)"
        );
        return currentPage;
    }
    catch (e) {
        showMessage(`未能获取到页面焦点！`)
    }
    throw new Error("未能获取到页面焦点！");
}

// 获取当前文档路径
export async function getHpath() {
    let currentPageID = getFileID()
    let body = { "id": currentPageID }
    let res = await request("/api/filetree/getHPathByID", body);

    //检测返回值
    if (res.code === 0) {
        let currentPagePath = res.data;
        return currentPagePath;
    }
    return null;
}

//传入 node节点列表 arr和数据抽取函数 fliter。
// fliter 传入一个节点，返回一个字典
// 字典格式：
// {status,data}
// status 为 ok，则代表为抽取成功，将data压入返回列表anwer，并最后返回。
export function iterArr(arr, fliter) {

    if (!arr && arr.length <= 0) {
        return [];
    }

    let length = arr.length;
    let anwer = [];
    for (let node of arr) {
        let data = fliter(node);
        if (data["status"] === "ok" && data["data"]) {
            anwer.push(data["data"]);
        }
    }
    return anwer;
}

