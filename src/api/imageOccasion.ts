/***
 * This files contains the js for the front side of anki cards.
 */
import { settingList } from "../utils/config"
import { IMenuItemOption, Dialog } from "siyuan";
import * as OcclusionEditor from "../components/OcclusionEditor.vue"
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
    const occlusionEditorDialog = new Dialog({
        title:"图像遮挡编辑",
        content:"<div id='image-editor'></div>"
    })
    const AppOcclusionEditor = createApp(OcclusionEditor.default,{
        closeFunc:()=>{occlusionEditorDialog.destroy()},
        img:img
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
    let container = document.createElement("div")
    container.classList.add("plugin-occasion-container")
    container.style.position = "relative"
    container.style.height = "0px"
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
    console.log(imagesContainer,ImagesOccasionData,OccasionedImages)
    let protyleContent = detail.element.querySelector(".protyle-content")
    protyleContent.insertBefore(container, protyleContent.firstChild)
    setHiddenImg(OccasionedImages, container)

    setTimeout(()=>{showOcclusion(ImagesOccasionData,detail.element,container)},300)
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
        
        let image:HTMLImageElement = root.querySelector(`img[data-src="${anImagesOccasionData[0]}"]`)

        canvasEl.width = image.width;
        canvasEl.height = image.height;
        let canvas = new fabric.Canvas(canvasEl, {
        imageSmoothingEnabled: false,
    });
        let imgEl = new Image();
        imgEl.src = image.src;
        imgEl.onload = function () {
            let imgFabric = new fabric.Image(imgEl);
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
        };

        let occlusionArr = anImagesOccasionData[1];
        occlusionArr.forEach((obj) => {
            if (obj.cId == currentClozeId) {
                let occlusion = createOcclusionRectEl(
                    obj.left,
                    obj.top,
                    obj.width,
                    obj.height,
                    obj.angle,
                    obj.cId,
                );
                occlusion._objects[0].set("opacity", 1);
                canvas.add(occlusion);
                canvas.renderAll();
            }
        });
        canvasEl.style.top = `${image.getBoundingClientRect().top-containerTop}px`
        canvasEl.style.left = `${image.getBoundingClientRect().left-containerLeft}px`
        canvasEl.style.position = "relative"
        container.append(canvasEl)
    }
}

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



