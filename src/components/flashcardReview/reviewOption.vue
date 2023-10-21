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
        <button @click="()=>{}">Learning</button>
        <button @click="()=>{}">change repetition</button>
    </div>
    <div v-if="optionStatus == 'reviewcard'">
        <button @click="prev">prev</button>
        <button @click="next">next</button>
        <button @click="()=>{updateStatus(1)}">bad</button>
        <button @click="()=>{updateStatus(2)}">normal</button>
        <button @click="()=>{updateStatus(3)}">good</button>
        <button @click="()=>{updateStatus(4)}">prefect</button>
        <button @click="()=>{}">stop</button>
        <button @click="()=>{}">delete</button>
        <button @click="()=>{}">mark</button>
    </div>
</template>

<script setup lang="ts">
type reviewOption = "reviewcard"|"hiddenCard"|"readingDoc"|"browerCard"
    const props = defineProps({
        optionStatus: {
      type: String,
      required: true
    }
    })
    const emit = defineEmits(["next","prev","updateStatus","show"])
    function next(){
        emit("next")
    }
    function prev(){
        emit("prev")
    }
    function show(){
        emit("show")
    }
    function updateStatus(status:number){
        emit("updateStatus",status)
    }

    
</script>

<style scoped lang="scss">
button{
    width: 6em;
    height: 2em;
    margin: 0.2em;
}
</style>