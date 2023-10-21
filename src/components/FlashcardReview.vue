<template>
    <topbar/>
    <status/>
    <card :currentCard="currentCard"/>
    <reviewOption 
        :optionStatus="reviewOptionStatus" 
        @next="switchNextCard" 
        @prev="switchPrevCard" 
        @show="showCard"
        @updateStatus="reviewCard"/>
    <div>{{ currentCard }}</div>
</template>

<script lang="ts" setup>
import {onMounted, ref, Ref} from "vue"
import  topbar  from "./flashcardReview/topbar.vue";
import  status  from "./flashcardReview/status.vue";
import  card  from "./flashcardReview/card.vue";
import  reviewOption  from "./flashcardReview/reviewOption.vue";
import { Protyle, fetchSyncPost } from "siyuan"

interface ReviewInfo {
 deckID: string;
 cardID: string;
 blockID: string;
 nextDues: {
   1: string;
   2: string;
   3: string; 
   4: string;
 }
}
type reviewOption = "reviewcard"|"hiddenCard"|"readingDoc"|"browerCard"

const allReviewCard:Ref<null|any> = ref(null)
const currentCard:Ref<null|ReviewInfo> = ref(null)
//浏览卡片时用于恢复的状态
const storeCard:Ref<null|ReviewInfo> = ref(null)
//卡片为隐藏还是显示状态
const reviewOptionStatus:Ref<reviewOption> = ref("hiddenCard")
const reviewCardEnd = ref(false)

async function getDueCard(type:string) {
    if (type === "all"){
        return await fetchSyncPost("/api/riff/getRiffDueCards",{deckID: ""})
    }
}
function switchCard(delta:number) {
    if (allReviewCard.value == null) return;
    let nowCard = currentCard.value
    let index = allReviewCard.value.indexOf(nowCard)
    let cardNumber = allReviewCard.value.length - 1
    let newIndex = index + delta
    if (newIndex<0){
        newIndex = 0
    }
    if (newIndex >= cardNumber){
        newIndex = cardNumber
        reviewCardEnd.value = true;
    }
    else{
        reviewCardEnd.value = false;
    }
    currentCard.value = allReviewCard.value[newIndex]
}
function switchNextCard(){
    switchCard(1)
}
function switchPrevCard(){
    switchCard(-1)
}

function showCard(){
    console.log("show")
    reviewOptionStatus.value = "reviewcard"
}

function reviewCard(rate:number){
    if (rate != -3){
        fetchSyncPost("/api/riff/reviewRiffCard",{
            cardID: currentCard.value?.cardID,
            deckID: currentCard.value?.deckID,
            rating: rate,
            reviewedCards:allReviewCard.value
        })
    }
    else{
        fetchSyncPost("/api/riff/skipReviewRiffCard",{
            cardID: currentCard.value?.cardID,
            deckID: currentCard.value?.deckID,
            rating: rate,
            reviewedCards:allReviewCard.value
        })
    }
    reviewOptionStatus.value="hiddenCard"
    switchNextCard()
}

let ok = ref(null);
onMounted(async ()=>{
    
    console.log("init vue!")
    let cardData = await getDueCard("all")
    if (cardData== undefined) return
    allReviewCard.value = cardData.data.cards
    currentCard.value = allReviewCard.value[0]

})

</script>
<style lang="scss" scoped>
card{
    height: 600px;
}
</style>