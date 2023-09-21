/***
 * This files contains the js for the front side of anki cards.
 */
import { settingList } from "../utils/config"
import { IMenuItemOption, Dialog } from "siyuan";
import * as OcclusionEditor from "../components/OcclusionEditor.vue"
import { getBlock, getWysiwygContainer } from "../lib/utils";
import { createApp } from "vue";
import { fabric } from "fabric";

type Occasion = {
    "left":number,
    "top":number,
    "width":number,
    "height":number,
    "angle":number,
    "cId":number}

type OcclusionList = Map<string,Occasion[]>

export function occasionEdit({detail}: any){
    let open = settingList.getSetting()["图像遮挡"]
    if (!open){
        return;
    }
    // console.log("编辑遮挡")
    console.log(detail);
    let myMenu:IMenuItemOption = {
        label:"编辑图像遮挡",
        icon:"iconAdd",
        click:()=>{openOcclusionEditor(detail.element)}
    };
    detail.menu.addItem(myMenu)
}

function openOcclusionEditor(img:HTMLElement){
    console.log("开始编辑遮挡")
    let destroyCallFn : Function[] =[]
    destroyCallFn.push(()=>{console.log("dialog destory")})
    const occlusionEditorDialog = new Dialog({
        title:"图像遮挡编辑",
        content:"<div id='image-editor'></div>",
        destroyCallback:()=>{
            for(let fn of destroyCallFn){
                fn()
            }
        }
    })
    const AppOcclusionEditor = createApp(OcclusionEditor.default,{
        closeFunc:()=>{occlusionEditorDialog.destroy()},
        img:img,
        destroyCallFn:destroyCallFn
        })
    AppOcclusionEditor.mount(occlusionEditorDialog.element.querySelector("#image-editor"))

}

export function occasionLoad({detail}: any){
    let open = settingList.getSetting()["图像遮挡"]
    if (!open){
        return;
    }
    if (!detail.element.classList.contains("card__block")){
        return
    }
    console.log("启动遮挡")
    let imgToCanvasHashMap = {};
    let container = getOcclusionContainer(detail.element);

    let imagesContainer = Array.from(detail.element.querySelectorAll("[custom-plugin-image-occlusion]"))
    let ImagesOccasionData:[string,Occasion[]][] = imagesContainer
    .map((elem:HTMLElement)=>{
        let rawData:OcclusionList = JSON.parse(elem.getAttribute("custom-plugin-image-occlusion"))
        return Object.entries(rawData)
    })
    .flat(1)
    //抽取keys，后展平
    let OccasionedImages = ImagesOccasionData
    .map((data:[string,Occasion[]])=>{
        return data[0]
    })
    // console.log(imagesContainer,ImagesOccasionData,OccasionedImages)
    setHiddenImg(OccasionedImages, container)

    imagesContainer
    .map((elem:HTMLElement)=>{
        let rawData:OcclusionList = JSON.parse(elem.getAttribute("custom-plugin-image-occlusion"))
        // setTimeout(()=>{showOcclusion(Object.entries(rawData), elem, container)},10)
        let position = container.getBoundingClientRect()
        let waitTime = 30
        setTimeout(()=>{
            waitToLoadedPosition(
                container,
                position,
                ()=>{
                    showOcclusion(Object.entries(rawData), elem, container)
                },
                waitTime)
        },waitTime)
        return 
    })
}
//等待位置不再变动再进行操作
function waitToLoadedPosition(elem:HTMLElement,position:DOMRect,fn:Function,waitTime:number = 10){
    let newPosition = elem.getBoundingClientRect()
    let topChange = Math.abs(newPosition.top - position.top)
    let leftChange = Math.abs(newPosition.left - position.left)
    console.log("wait change",topChange,leftChange)
    if ((topChange + leftChange) < 0.1){
        fn()
    }
    else{
        setTimeout(()=>{
            waitToLoadedPosition(elem,newPosition,fn,waitTime)
        },waitTime)
    }
}

function getOcclusionContainer(root:HTMLElement) {
    
    let container = (root.querySelector(".plugin-occasion-container") as HTMLDivElement|null);
    if (container != null) {
        container.innerHTML = ''
        return container
    }
    container = document.createElement("div")
    container.classList.add("plugin-occasion-container");
    container.style.position = "relative";
    container.style.height = "0px";
    let protyleContent = root.querySelector(".protyle-content")
    protyleContent.insertBefore(container, protyleContent.firstChild)
    return container;
}

function setHiddenImg(OccasionedImages:String[],container:HTMLElement){
    let cssText = `
    .plugin-occasion-container {
        visibility: hidden;
    }
    .card__block--hidemark .plugin-occasion-container {
        visibility: initial;
    }`
    for (let item of OccasionedImages){
        cssText += `.card__block--hidemark [data-src="${item}"]{
            visibility: hidden;
        }
        `
    }
    let div = document.createElement("style")
    div.innerHTML = cssText
    container.append(div)
}

function showOcclusion(ImagesOccasionData:[string,Occasion[]][],root:HTMLElement,container:HTMLElement){
    let currentClozeId = 1
    let containerTop = container.getBoundingClientRect().top
    let containerLeft = container.getBoundingClientRect().left
    for(let anImagesOccasionData of ImagesOccasionData){
        let canvasEl = document.createElement("canvas");
        //处理一张闪卡出现相同图片的问题：选择不加载
        let imageList = root.querySelectorAll(`img[data-src="${anImagesOccasionData[0]}"]`)
        if (imageList.length != 1) return
        let image = imageList[0] as HTMLImageElement
        if (image.complete){
            addCanvasOcclusion(image,canvasEl,anImagesOccasionData,currentClozeId,containerTop,containerLeft,container)
        }
        else{
            image.onload = ()=>{
                addCanvasOcclusion(image,canvasEl,anImagesOccasionData,currentClozeId,containerTop,containerLeft,container)
            }
        }
        
        
    }
}

function addCanvasOcclusion(
    image:HTMLImageElement,
    canvasEl:HTMLCanvasElement,
    anImagesOccasionData:[string, Occasion[]],
    currentClozeId:number,
    containerTop:number,
    containerLeft:number,
    container:HTMLElement,
    opacity:number = 1
    ) {
    console.log("loaded img ",image.src)
    let style = image.getBoundingClientRect()
    //兼容超级块制卡和列表制卡
    if (style.width <= 0){
        return
    }
    canvasEl.width = image.width;
    canvasEl.height = image.height;
    let canvas = new fabric.Canvas(canvasEl, {
    imageSmoothingEnabled: false,
});
    let imgFabric = new fabric.Image(image);
    let scaleX = canvas.width / imgFabric.width,
        scaleY = canvas.height / imgFabric.height;
    canvas.setViewportTransform([scaleX, 0, 0, scaleY, 0, 0]);
    canvas.setBackgroundImage(
        imgFabric,
        canvas.renderAll.bind(canvas),
        {
            scaleX: 1,
            scaleY: 1,
        },
    );
    let occlusionArr = anImagesOccasionData[1];
    occlusionArr.forEach((obj) => {
        //先改为全部通过
        if (obj.cId == currentClozeId || true) {
            let occlusion = createOcclusionRectEl(
                obj.left,
                obj.top,
                obj.width,
                obj.height,
                obj.angle,
                obj.cId,
            );
            occlusion._objects[0].set("opacity", opacity);
            canvas.add(occlusion);
            canvas.renderAll();
        }
    });
    canvasEl.style.top = `${image.getBoundingClientRect().top-containerTop}px`
    canvasEl.style.left = `${image.getBoundingClientRect().left-containerLeft}px`
    canvasEl.style.position = "absolute"
    container.append(canvasEl)
};

export function createOcclusionRectEl(
    left = 0,
    top = 0,
    width = 80,
    height = 40,
    angle = 0,
    cId = 1,
) {
    const rect = new fabric.Rect({
        fill: "#FFEBA2",
        stroke: "#000",
        strokeWidth: 1,
        strokeUniform: true,
        noScaleCache: false,
        opacity: 0.8,
        width: width,
        height: height,
        originX: "center",
        originY: "center",
    });
    const text = new fabric.Text(`${cId}`, {
        originX: "center",
        originY: "center",
    });
    text.scaleToHeight(height);
    const group = new fabric.Group([rect, text], {
        left: left,
        top: top,
        width: width,
        height: height,
        originX: "center",
        originY: "center",
        angle: angle,
    });
    return group;
}

const getFloatOccasionContainer = (imageElement:HTMLImageElement)=>{
    let wysiwygContainer = getWysiwygContainer(imageElement)
    if (wysiwygContainer === null) return;
    let container;
    container = wysiwygContainer.querySelector(".float-occasion-container")
    if (container != null) return container;
    container = document.createElement("div")
    container.classList.add("float-occasion-container")
    wysiwygContainer.insertBefore(container, wysiwygContainer.firstChild)
    container.id = "plugin-float-image-occasion"
    container.style.position = "relative"
    container.style.height = "0px"
    // container.style.transform = "translate(-4px, -4px)"
    container.style.borderRadius = "5px"
    return container
}

const showFloatOcclusion = (imageElement:HTMLImageElement)=>{
    let block = getBlock(imageElement)
    let container = getFloatOccasionContainer(imageElement)
    let rawData:OcclusionList = new Map(Object.entries(JSON.parse(block.getAttribute("custom-plugin-image-occlusion"))))
    let imgSrc = imageElement.getAttribute("src")
    let occlusinData:[string, Occasion[]] = [imgSrc,rawData.get(imgSrc)]
    let canvasEl = document.createElement("canvas")
    // let position = imageElement.getBoundingClientRect()
    let containerPostion = container.getBoundingClientRect()
    addCanvasOcclusion(imageElement,canvasEl,occlusinData,1,containerPostion.top,containerPostion.left,container,0.5)
    const removeElement = () => {
        canvasEl.removeEventListener("mouseout",removeElement)
        canvasEl.removeEventListener("contextmenu",rightClick)
        setTimeout(()=>{canvasEl.remove()},300)
        console.log('关闭函数');
    }
    const rightClick = (event:MouseEvent) =>{
        const rightClickEvent = new MouseEvent('contextmenu', {
            bubbles: true,
            clientX:event.screenX,
            clientY:event.screenY
          }); 
        imageElement.dispatchEvent(rightClickEvent);
    }
    const autoRemove = setTimeout(()=>removeElement(),5000)
    const autoCleanRemove = ()=>{
        // console.log("捕获到鼠标事件，停止自动清除")
        clearTimeout(autoRemove)
    }
    canvasEl.onmouseover = autoCleanRemove
    // 鼠标移出,清除浮窗
    canvasEl.addEventListener('mouseout',removeElement,{once:true});
    canvasEl.addEventListener("contextmenu",rightClick)
}

const ShowFloatOccasionEvent = (event:MouseEvent) => {
    // 事件目标
    const target = event.target;

    // 检查目标是否符合要求
    if (!(target instanceof HTMLElement)){
        return
    }
    if (target.matches('[custom-plugin-image-occlusion] img')) {

        // 启动定时器,3秒后触发
        const timer = setTimeout(() => {
            showFloatOcclusion(target as HTMLImageElement)
            console.log('触发函数');
        }, 400);

        // 鼠标移出,清除定时器
        target.addEventListener('mouseout', () => {
            clearTimeout(timer);
            console.log('关闭函数');
        },{once:true});
    }
}

export function initShowFloatOccasion(){
    document.body.addEventListener('mouseover', (event)=>{
        ShowFloatOccasionEvent(event)
    })
}
