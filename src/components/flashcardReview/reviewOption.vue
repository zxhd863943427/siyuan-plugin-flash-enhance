<template>
    <div>reviewOption</div>
    <div v-if="optionStatus == 'reviewCard'">
        <button @click="prev">prev</button>
        <button @click="next">next</button>
        <button @click="()=>{updateStatus(1)}">bad</button>
        <button @click="()=>{updateStatus(2)}">normal</button>
        <button @click="()=>{updateStatus(3)}">good</button>
        <button @click="()=>{updateStatus(4)}">prefect</button>
    </div>
</template>

<script setup lang="ts">
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