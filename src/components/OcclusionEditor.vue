<template>
    <div class="ui__modal occlusion__editor settings-modal cp__settings-main" style="z-index: 9999;">
    <div class="ui__modal-overlay ease-out duration-300 opacity-100 enter-done">
       <div class="absolute inset-0 opacity-75"></div>
    </div>
    <div class="">
       <div class="panel-content">
          <div class="ui__confirm-modal is-">
             <div class="cloze-editor">
               <OcclusionEditorComponent :imgSrc="currentImg" :occlusionData="loadData[currentImg]" />
             </div>
             <div class="fn__flex b3-label">
               <span class="">
               <button type="button" class="b3-button b3-button--outline fn__flex-center fn__size96" @:click="occlusion_save_action">Save</button>
            </span>
            <span class="fn__size96"></span>
            <span class="">
                  <button type="button" class="b3-button b3-button--outline fn__flex-center fn__size96" @:click="occlusion_cancel_action">Cancel</button>
               </span></div>
          </div>
       </div>
    </div>
 </div>
</template>

<script lang="ts" setup>
import { getBlock } from "../lib/utils"
import { fetchSyncPost } from "siyuan";
import OcclusionEditorComponent from "./OcclusionEditorComponent.vue"
import { Ref } from "vue";
const props = defineProps({
   closeFunc:Function,
   img:HTMLElement
})
type Occasion = {
    "left":number,
    "top":number,
    "width":number,
    "height":number,
    "angle":number,
    "cId":number}

type OcclusionList = Map<string,Occasion[]>

// console.log(props.closeFunc,props.img, getBlock(props.img))
let currentBlock = getBlock(props.img as HTMLElement)
let currentBlockID = currentBlock.getAttribute("data-node-id")
let rawData = currentBlock?.getAttribute("custom-plugin-image-occlusion")
rawData = rawData ? rawData : "{}"
let loadData:OcclusionList = JSON.parse(rawData ? rawData : "")
let currentImgSrc = ((props.img as HTMLElement).querySelector("img") as HTMLImageElement).getAttribute("src")
let currentImg = currentImgSrc!=null ? currentImgSrc : "" 
console.log(currentBlock,currentBlockID,loadData,props.img,currentImg,loadData[currentImg])

function updateData(resolveData:Occasion[]) {
   loadData[currentImg] = resolveData
}

function saveData() {
   let savingData = JSON.stringify(loadData)
   fetchSyncPost("/api/attr/setBlockAttrs",{
        "id": currentBlockID,
        "attrs": {
          "custom-plugin-image-occlusion": savingData,
        }
      })
}

function occlusion_save_action() {
   saveData()
   if (props.closeFunc != undefined)
      props.closeFunc()
}

function occlusion_cancel_action() {
   if (props.closeFunc != undefined)
      props.closeFunc()
}
</script>