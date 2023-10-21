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
        <button @click="()=>{}">next repetition</button>
        <button @click="()=>{}">read finish</button>
        <button @click="()=>{}">don't read</button>
    </div>
    <div v-if="optionStatus == 'browerCard'">
        <button @click="prev">prev</button>
        <button @click="next">next</button>
        <button @click="continueReview">Learning</button>
        <button class="changeRepetition" @click="()=>{}">change repetition</button>
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
    const emit = defineEmits(["next","prev","updateStatus","switchOption","continueReview","markCurrentCard","startNewReview"])
    function next(){
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
</script>

<style scoped lang="scss">
button{
    width: 6em;
    height: 2em;
    margin: 0.2em;
}
.changeRepetition{
    width: 12em;
}
</style>