<template>
    <div>reviewOption</div>
    <div v-if="optionStatus == 'hiddenCard'">
        <button @click="prev">prev</button>
        <button @click="next">next</button>
        <button @click="show">show</button>
    </div>
    <div v-if="optionStatus == 'readingDoc'">
        <button @click="prev">prev</button>
        <button @click="next">next</button>
        <button @click="nextRepetition">next repetition</button>
        <button @click="finishReading">read finish</button>
        <button @click="dontReading">don't read</button>
    </div>
    <div v-if="optionStatus == 'browerCard'">
        <button @click="prev">prev</button>
        <button @click="next">next</button>
        <button @click="continueReview">Learning</button>
        <button class="changeRepetition" @click="changeRepetition">change repetition</button>
    </div>
    <div v-if="optionStatus == 'reviewcard'">
        <button @click="prev">prev</button>
        <button @click="next">next</button>
        <button @click="()=>{updateStatus(-3)}">skip</button>
        <button @click="()=>{updateStatus(1)}">bad</button>
        <button @click="()=>{updateStatus(2)}">normal</button>
        <button @click="()=>{updateStatus(3)}">good</button>
        <button @click="()=>{updateStatus(4)}">prefect</button>
        <button @click="mark">mark</button>
    </div>
    <div v-if="optionStatus == 'changeRate'">
        <button @click="prev">prev</button>
        <button @click="next">next</button>
        <button @click="()=>{changeRate(-3)}">skip</button>
        <button @click="()=>{changeRate(1)}">bad</button>
        <button @click="()=>{changeRate(2)}">normal</button>
        <button @click="()=>{changeRate(3)}">good</button>
        <button @click="()=>{changeRate(4)}">prefect</button>
        <button @click="mark">mark</button>
    </div>
    <div v-if="optionStatus == 'processMark'">
        <button @click="prev">prev</button>
        <button @click="next">next</button>
        <button @click="stop">stop</button>
        <button @click="deleteCard">delete</button>
        <button @click="finish">finish</button>
    </div>
</template>

<script setup lang="ts">
import {ReviewOption, ReviewInfo} from "../../utils/type"
import { fetchSyncPost } from "siyuan";
import {genTodayDate} from "../../api/utils"

    const props = defineProps({
        optionStatus: {
      type: Object as Object as () => ReviewOption,
      required: true
    },
    currentCard: {
      type: Object as Object as () => ReviewInfo,
      required: true
    }
    })
const emit = defineEmits([
    "next",
    "prev",
    "updateStatus",
    "switchOption",
    "continueReview",
    "markCurrentCard",
    "startNewReview",
    "changeRepetition",
    "changeRate"])
function next() {
        emit("next")
    }
    function prev(){
        emit("prev")
    }
    function show(){
        emit("switchOption","reviewcard")
    }
    function continueReview(){
        emit("continueReview")
    }
    function updateStatus(status:number){
        emit("updateStatus",status)
    }
    function mark(){
        emit("markCurrentCard")
    }
    function finish(){
        emit("startNewReview")
    }
    function changeRepetition(){
        emit("changeRepetition")
    }
function changeRate(rate:number){
    emit("changeRate",rate)
}
function stop() {
    fetchSyncPost("/api/attr/setBlockAttrs", {
        "id": props.currentCard.blockID,
        "attrs": {
            "custom-plugin-card-stop": "true"
        }
    })
}
function deleteCard() {
    let body = {
        deckID: props.currentCard.deckID,
        blockIDs: [props.currentCard.blockID]
    }
    console.log(body)
    fetchSyncPost("/api/riff/removeRiffCards", body)
}

const getRefNum = async(id:string):Promise<number> =>{
    let data = await fetchSyncPost(`/api/ref/getBacklink2`, {
        "sort": "3",
        "mSort": "3",
        "id": `${id}`,
        "k": "",
        "mk": ""
    })
    return data.data.linkRefsCount
}
const getBlockNum = async (id:string):Promise<number> =>{
    let data = await fetchSyncPost("/api/filetree/getDoc",{
        id:id,
        size:102400})
    let regexp = /NodeParagraph/g;
    let matches = data.data.content.match(regexp);
    if (matches === null){
        return 1
    }
    return matches.length
}
const calculateNext = (a:number, b:number, factor:number=0) =>{
  const numerator = 1;
  const denominator = 1 + Math.exp(-b / (0.4 * a) + 1.3+0.3*factor);
  const y = 1 - (numerator / denominator);

  return y;
}
const getReadNum =async (id:string):Promise<number>=>{
    let readNumData = await fetchSyncPost("/api/attr/getBlockAttrs", {
        "id": id
    })
    let readNum:number
    if (readNumData.data["custom-plugin-reading-number"] ){
        readNum = parseInt(readNumData.data["custom-plugin-reading-number"])
    }
    else{
        readNum = 0
    }
    return readNum
}
function setReadNum(id:string,readNum:number){
    fetchSyncPost("/api/attr/setBlockAttrs", {
        "id": id,
        "attrs": {
            "custom-plugin-reading-number": readNum
        }
    })
}
function setReadFinish(id:string){
    fetchSyncPost("/api/attr/setBlockAttrs", {
        "id": id,
        "attrs": {
            "custom-plugin-reading-finish": "true"
        }
    })
}
function setReadLastTime(id:string){
    fetchSyncPost("/api/attr/setBlockAttrs", {
        "id": id,
        "attrs": {
            "custom-plugin-reading-last-time": genTodayDate()
        }
    })
}
//TODO
async function setCurrentReadingIndex(id:string){
    let blockData = await fetchSyncPost("/api/attr/getBlockAttrs", {
        "id": id
    })
    let readingSource = blockData.data["custom-plugin-reading-source"]
    if (!readingSource){
        console.error(`block ${id} is not a read item`)
        return
    }
    
}

async function nextRepetition(){
    let blockID = props.currentCard.blockID
    let blockNum = await getBlockNum(blockID)
    let RefNum = await getRefNum(blockID)
    let readNum = await getReadNum(blockID)
    setReadNum(blockID,readNum+1)
    let calculateNextFactor = calculateNext(blockNum, RefNum, readNum)
    let rate = Math.ceil(calculateNextFactor * 4)
    setReadLastTime(blockID)
    updateStatus(rate)
}
async function finishReading() {
    let blockID = props.currentCard.blockID
    let blockNum = await getBlockNum(blockID)
    let RefNum = await getRefNum(blockID)
    let readNum = await getReadNum(blockID)
    setReadNum(blockID,readNum+3)
    let calculateNextFactor = calculateNext(blockNum, RefNum, readNum+3)
    let rate = Math.ceil(calculateNextFactor * 4)
    setReadFinish(blockID)
    setReadLastTime(blockID)
    updateStatus(rate)
}

async function dontReading(){
    let blockID = props.currentCard.blockID
    let readNum = await getReadNum(blockID)
    setReadNum(blockID,readNum+1)
    setReadLastTime(blockID)
    stop()
    updateStatus(-3)
}

</script>

<style scoped lang="scss">
button{
    min-width: 6em;
    height: 2em;
    margin: 0.2em;
}
.changeRepetition{
    width: 12em;
}
</style>