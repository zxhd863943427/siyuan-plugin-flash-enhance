<template>
    <topbar/>
    <status/>
    <card/>
    <reviewOption/>
</template>

<script lang="ts" setup>
import {onMounted, ref} from "vue"
import  topbar  from "./flashcardReview/topbar.vue";
import  status  from "./flashcardReview/status.vue";
import  card  from "./flashcardReview/card.vue";
import  reviewOption  from "./flashcardReview/reviewOption.vue";
import { Protyle } from "siyuan"



let ok = ref(null);
onMounted(()=>{
    
    ok.value = "fff"
    console.log("init vue!")
})

</script>