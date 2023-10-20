<template>
    <topbar/>
    <status/>
    <card :currentCard="currentCard"/>
    <reviewOption/>
    <div>{{ currentCard }}</div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from "vue"
import  topbar  from "./flashcardReview/topbar.vue";
import  status  from "./flashcardReview/status.vue";
import  card  from "./flashcardReview/card.vue";
import  reviewOption  from "./flashcardReview/reviewOption.vue";
import { Protyle, fetchSyncPost } from "siyuan"
const allReviewCard = ref(null)
const currentCard = ref(null)

async function getDueCard(type:string) {
    if (type === "all"){
        return await fetchSyncPost("/api/riff/getRiffDueCards",{deckID: ""})
    }
}

let ok = ref(null);
onMounted(async ()=>{
    
    ok.value = "fff"
    console.log("init vue!")
    let cardData = await getDueCard("all")
    allReviewCard.value = cardData.data.cards
    currentCard.value = allReviewCard.value[0]

})

</script>