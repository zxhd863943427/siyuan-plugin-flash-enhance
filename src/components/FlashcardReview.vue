<template>
    <topbar :currentCard="currentCard"/>
    <status/>
    <div>status :{{ reviewOptionStatus }}</div>
    <div> now index:{{ getNewCardIndex(0,currentCard as ReviewInfo,allReviewCard)+1 }}</div>
    <div> total index:{{allReviewCard.length}}</div>
    <card 
        :currentCard="currentCard"
        :optionStatus="reviewOptionStatus"/>
    <reviewOption 
        :currentCard="currentCard"
        :optionStatus="reviewOptionStatus" 
        @next="switchNextCard" 
        @prev="switchPrevCard" 
        @switchOption="switchOption"
        @updateStatus="reviewCard"
        @continue-review="continueReview"
        @markCurrentCard="markCurrentCard"
        @start-new-review="startNewReview"
        @change-repetition="changeRepetition"
        @change-rate="changeRate"/>
    <div>{{ currentCard }}</div>
    <div>{{ markCardList }}</div>
</template>

<script lang="ts" setup>
import {onMounted, ref, Ref} from "vue"
import  topbar  from "./flashcardReview/topbar.vue";
import  status  from "./flashcardReview/status.vue";
import  card  from "./flashcardReview/card.vue";
import  reviewOption  from "./flashcardReview/reviewOption.vue";
import { Protyle, fetchSyncPost } from "siyuan"
import {ReviewOption, ReviewInfo} from "../utils/type"


const allReviewCard:Ref<ReviewInfo[]> = ref([])
const currentCard:Ref<null|ReviewInfo> = ref(null)
//浏览卡片时用于恢复的状态
const storeCard:Ref<null|ReviewInfo> = ref(null)
//卡片的显示状态
const reviewOptionStatus:Ref<ReviewOption> = ref("hiddenCard")
const reviewCardEnd = ref(false)
let originAllreviewCard:ReviewInfo[] = []
let markCardList:ReviewInfo[] = []
let reviewedCardList:Set<ReviewInfo> = new Set

async function getDueCard(type:string) {
    if (type === "all"){
        return await fetchSyncPost("/api/riff/getRiffDueCards",{deckID: ""})
    }
}
function switchCard(delta:number) {
    if (allReviewCard.value == null) return;
    let newIndex = getNewCardIndex(delta, (currentCard.value as ReviewInfo), allReviewCard.value);
    let cardNumber = allReviewCard.value.length - 1;
    if (newIndex >= cardNumber) {
        newIndex = cardNumber;
        reviewCardEnd.value = true;
    }
    else {
        reviewCardEnd.value = false;
    }
    currentCard.value = allReviewCard.value[newIndex]
}
function getNewCardIndex(delta: number,card:ReviewInfo,cardList:ReviewInfo[]) {
    let nowCard = card;
    let index = cardList.indexOf(nowCard);
    let cardNumber = cardList.length - 1;
    let newIndex = index + delta;
    if (newIndex < 0) {
        newIndex = 0;
    }
    if (newIndex >= cardNumber) {
        newIndex = cardNumber;
    }
    return newIndex;
}

function switchNextCard(){
    if(storeCard.value === null)
        storeCard.value = currentCard.value
    if (reviewOptionStatus.value != "processMark")
        reviewOptionStatus.value = "browerCard"
    switchCard(1)
}
function switchPrevCard(){
    if(storeCard.value === null)
        storeCard.value = currentCard.value
    if (reviewOptionStatus.value != "processMark")
        reviewOptionStatus.value = "browerCard"
    switchCard(-1)
}

async function continueReview(){
    reviewOptionStatus.value = await getCardOption(storeCard.value as ReviewInfo)
    currentCard.value = storeCard.value
    storeCard.value = null
}
function markCurrentCard(){
    let currentCardData = (currentCard.value as ReviewInfo)
    if (markCardList.indexOf(currentCardData)){
        markCardList.push( currentCardData)
    }
}
function switchProcessMark(){
    reviewOptionStatus.value = "processMark"
    allReviewCard.value = markCardList
    currentCard.value = allReviewCard.value[0]
}
const getCardOption = async (card:ReviewInfo):Promise<ReviewOption>=>{
    return "hiddenCard"
}

function switchOption(newOption:ReviewOption){
    reviewOptionStatus.value = newOption
}

function startNewReview(){
    initReview()
}
function changeRepetition(){
    if (reviewedCardList.has(currentCard.value as ReviewInfo)){
        reviewOptionStatus.value = "changeRate"
    }
}
function changeRate(rate:number){
    setCardReviewRate(rate);
    reviewOptionStatus.value = "browerCard"
}
async function reviewCard(rate:number){
    setCardReviewRate(rate);
    reviewedCardList.add(currentCard.value as ReviewInfo)
    let newIndex = getNewCardIndex(1, currentCard.value as ReviewInfo, allReviewCard.value)
    let oldIndex = getNewCardIndex(0, currentCard.value as ReviewInfo, allReviewCard.value)
    let newStatus:ReviewOption;
    console.log("restart")
    if (newIndex > oldIndex){
        newStatus = await getCardOption(allReviewCard.value[newIndex])
        reviewOptionStatus.value=newStatus
        switchCard(1)
        return
    }
    if (markCardList.length > 0 ){
        switchProcessMark()
    } 
    else{
        console.log("restart")
        initReview()
    } 
}
function setCardReviewRate(rate: number) {
if (rate != -3) {
fetchSyncPost("/api/riff/reviewRiffCard", {
cardID: currentCard.value?.cardID,
deckID: currentCard.value?.deckID,
rating: rate,
reviewedCards: originAllreviewCard
});
}
else {
fetchSyncPost("/api/riff/skipReviewRiffCard", {
cardID: currentCard.value?.cardID,
deckID: currentCard.value?.deckID,
rating: rate,
reviewedCards: originAllreviewCard
});
}
}

async function initReview(){
    reviewCardEnd.value = false
    originAllreviewCard = []
    markCardList = []
    reviewedCardList.clear()
    let cardData = await getDueCard("all")
    if (cardData== undefined) return

    allReviewCard.value = cardData.data.cards as ReviewInfo[]

    if (allReviewCard.value?.length === 0) return

    reviewOptionStatus.value = await getCardOption(allReviewCard.value[0])
    originAllreviewCard = allReviewCard.value
    currentCard.value = allReviewCard.value[0]
}
onMounted(async ()=>{
    initReview()
})

</script>
<style lang="scss" scoped>
card{
    height: 600px;
}
</style>