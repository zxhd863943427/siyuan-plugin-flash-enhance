<template>
    <div  @keydown="hotKey" tabindex="0">
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
    function processMark(){
        emit("switchOption","processMark")
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
async function stop() {
    await fetchSyncPost("/api/attr/setBlockAttrs", {
        "id": props.currentCard.blockID,
        "attrs": {
            "custom-plugin-card-stop": "true"
        }
    })
}
async function deleteCard() {
    let body = {
        deckID: props.currentCard.deckID,
        blockIDs: [props.currentCard.blockID]
    }
    console.log(body)
    await fetchSyncPost("/api/riff/removeRiffCards", body)
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
const setReadNum = (body:object,readNum:number)=>{
    let newbody = {...body,
        "custom-plugin-reading-number": `${readNum}`
    }
    return newbody
}
const setReadFinish = (body:object)=>{
    let newbody = {...body,
        "custom-plugin-reading-finish": "true"
    }
    return newbody
}

const setReadLastTime = (body:object)=>{
    let newbody = {...body,
        "custom-plugin-reading-last-time": genTodayDate()
    }
    return newbody
}

//TODO
async function enableNextDoc(id:string){
    let blockData = await fetchSyncPost("/api/attr/getBlockAttrs", {
        "id": id
    })
    let nextID = blockData.data["custom-plugin-incremental-reading-next-id"]
    if (!nextID) {
        console.error(`block ${id} has not next ID!`)
        return
    }
    if (nextID === "END") {
        console.error(`block ${id} is end`)
        return
    }
    await fetchSyncPost("/api/attr/setBlockAttrs", {
        "id": nextID,
        "attrs": {
            "custom-plugin-incremental-reading-enable": "true"
        }
    })
}

async function setBlockAttr(id:string,body:object) {
    await fetchSyncPost("/api/attr/setBlockAttrs", {
        "id": id,
        "attrs": body
    })
}

async function nextRepetition(){
    let blockID = props.currentCard.blockID
    let blockNum = await getBlockNum(blockID)
    let RefNum = await getRefNum(blockID)
    let readNum = await getReadNum(blockID)

    let body = {}
    body = setReadNum(body,readNum+1)
    body = setReadLastTime(body)

    let calculateNextFactor = calculateNext(blockNum, RefNum, readNum)
    let rate = Math.ceil(calculateNextFactor * 4)

    await setBlockAttr(blockID,body)
    updateStatus(rate)
}
async function finishReading() {
    
    let blockID = props.currentCard.blockID
    let blockNum = await getBlockNum(blockID)
    let RefNum = await getRefNum(blockID)
    let readNum = await getReadNum(blockID)

    let body = {}
    body = setReadNum(body,readNum+3)
    body = setReadFinish(body)
    body = setReadLastTime(body)

    let calculateNextFactor = calculateNext(blockNum, RefNum, readNum+3)
    let rate = Math.ceil(calculateNextFactor * 4)
    await setBlockAttr(blockID,body)
    await enableNextDoc(blockID)
    updateStatus(rate)
}

async function dontReading(){
    let blockID = props.currentCard.blockID
    let readNum = await getReadNum(blockID)

    let body = {}
    body = setReadNum(body,readNum+1)
    body = setReadLastTime(body)

    await setBlockAttr(blockID,body)
    await enableNextDoc(blockID)
    await stop()
    updateStatus(-3)
    
}

const hotKeyForRate = (el) => {
    let keyMapRate = new Map([
        ["h", -3],
        ["j", 1],
        ["k", 2],
        ["l", 3],
        [";", 4],
        ["0", -3],
        ["1", 1],
        ["2", 2],
        ["3", 3],
        ["4", 4],
        [" ", 3],
        ["Enter", 3],
        ["m", 5]
    ])
    if (keyMapRate.get(el.key)) {
        console.log(keyMapRate.get(el.key))
        let choseItem = keyMapRate.get(el.key)
        switch (choseItem) {
            case -3:
            case 1:
            case 2:
            case 3:
            case 4:
                if (props.optionStatus === "reviewcard") {
                    updateStatus(choseItem)
                }
                if (props.optionStatus === "changeRate") {
                    changeRate(choseItem)
                }
                break;
            case 5:
                mark();
                break;
            default:
                console.error("error input:", choseItem, el)
        }

    }
}

function hotKey(el){
    console.log(el)
    if(props.optionStatus === "reviewcard" || 
    props.optionStatus === "changeRate"){
        hotKeyForRate(el)
    }
    if(props.optionStatus  === "hiddenCard"){
        let keyMapRate = new Map([
            [" ",3],
            ["Enter",3]
        ])
        if (keyMapRate.get(el.key)){
            show()
        }
    }
    if(props.optionStatus  === "browerCard"){
        let keyMapRate = new Map([
            [" ",3],
            ["Enter",3],
            ["l",4],
            ["e",5],
        ])
        if (keyMapRate.get(el.key)){
            if(keyMapRate.get(el.key) === 3){
                changeRepetition()
            }
            if(keyMapRate.get(el.key) === 4){
                continueReview()
            }
            if(keyMapRate.get(el.key) === 5){
                processMark()
            }
        }
    }
    let keyMapRate = new Map([
            [",",1],
            [".",2]
        ])
    if(keyMapRate.get(el.key)){
        if (keyMapRate.get(el.key) === 1){
            prev()
        }
        if (keyMapRate.get(el.key) === 2){
            next()
        }
    }
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
[tabindex] {
    outline: none !important;
}
</style>