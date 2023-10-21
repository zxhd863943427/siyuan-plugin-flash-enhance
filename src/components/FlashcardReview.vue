<template>
    <topbar/>
    <status/>
    <card :currentCard="currentCard"/>
    <reviewOption 
        :optionStatus="reviewOptionStatus" 
        @next="switchNextCard" 
        @prev="switchPrevCard" 
        @switchOption="switchOption"
        @updateStatus="reviewCard"
        @continue-review="continueReview"/>
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
type reviewOption = 
"reviewcard"    //显示隐藏并打分
|"hiddenCard"   //隐藏闪卡背面
|"readingDoc"   //渐进阅读文档
|"browerCard"   //使用前后移动浏览卡片

const allReviewCard:Ref<null|any> = ref(null)
const currentCard:Ref<null|ReviewInfo> = ref(null)
//浏览卡片时用于恢复的状态
const storeCard:Ref<null|ReviewInfo> = ref(null)
//卡片的显示状态
const reviewOptionStatus:Ref<reviewOption> = ref("hiddenCard")
const reviewCardEnd = ref(false)

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
    reviewOptionStatus.value = "browerCard"
    switchCard(1)
}
function switchPrevCard(){
    if(storeCard.value === null)
        storeCard.value = currentCard.value
    reviewOptionStatus.value = "browerCard"
    switchCard(-1)
}

async function continueReview(){
    reviewOptionStatus.value = await getCardOption(storeCard.value as ReviewInfo)
    currentCard.value = storeCard.value
    storeCard.value = null
}

const getCardOption = async (card:ReviewInfo):Promise<reviewOption>=>{
    return "hiddenCard"
}

function switchOption(newOption:reviewOption){
    reviewOptionStatus.value = newOption
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
    let newIndex = getNewCardIndex(1, currentCard.value as ReviewInfo, allReviewCard.value)
    getCardOption(allReviewCard.value[newIndex])
    .then((newStatus)=>{
        reviewOptionStatus.value=newStatus
        switchCard(1)
    })

}

let ok = ref(null);
onMounted(async ()=>{
    
    console.log("init vue!")
    let cardData = await getDueCard("all")
    if (cardData== undefined) return
    if (cardData.data.cards.length === 0) return
    allReviewCard.value = cardData.data.cards
    currentCard.value = allReviewCard.value[0]

})

</script>
<style lang="scss" scoped>
card{
    height: 600px;
}
</style>