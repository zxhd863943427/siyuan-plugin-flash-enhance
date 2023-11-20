<template>
    <topbar :currentCard="currentCard"/>
    <status/>
    <div>status :{{ reviewOptionStatus }}</div>
    <div><span> now index:{{ getNewCardIndex(0,currentCard as ReviewInfo,allReviewCard)+1 }}</span> <span> total index:{{allReviewCard.length}}</span></div>
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
import {onMounted,onUnmounted, ref, Ref} from "vue"
import  topbar  from "./flashcardReview/topbar.vue";
import  status  from "./flashcardReview/status.vue";
import  card  from "./flashcardReview/card.vue";
import  reviewOption  from "./flashcardReview/reviewOption.vue";
import { Protyle, fetchSyncPost } from "siyuan"
import {ReviewOption, ReviewInfo} from "../utils/type"
import { plugin, sortByTopo, genTodayDate } from "../api/utils";


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
    console.log("getCardOption")
    let blockInfo = await fetchSyncPost("/api/attr/getBlockAttrs",{
        id:card.blockID})
    if (blockInfo.data["custom-plugin-incremental-reading"]){
        return "readingDoc"
    }
    return "hiddenCard"
}

function switchOption(newOption:ReviewOption){
    switch(newOption){
        case "processMark":
            switchProcessMark();
            break;
        default:
            reviewOptionStatus.value = newOption;
            break;
    }
    
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

const filterSupendCard =  async(cardList:ReviewInfo[]):Promise<ReviewInfo[]>=>{
    let supendCardData = await fetchSyncPost("/api/query/sql", {
        "stmt": "select block_id from attributes where name like '%custom-plugin-card-stop%'"
    })
    let supendCard = new Set(supendCardData.data.map(x=>x['block_id']))
    let filteredCardList:ReviewInfo[]
    filteredCardList = cardList.filter((x)=>{return !supendCard.has(x.blockID)})
    return filteredCardList
}

const getBlockSQL = (cardList:ReviewInfo[])=>{
    let blockIDs = cardList.map(reviewInfo=>{return reviewInfo.blockID})
    let blockSQL = ` block_id in ('${blockIDs.join("','")}')`
    return blockSQL
}

//TODO
// 今日已经读过的文档不在阅读
const filterTodayReadedDoc = async(cardList:ReviewInfo[]):Promise<ReviewInfo[]>=>{
    let today = genTodayDate()
    let blockSQL = getBlockSQL(cardList)
    let disableCardData = await fetchSyncPost("/api/query/sql", {
        "stmt": `select block_id from attributes
         where name like '%custom-plugin-reading-last-time%'
         and value = '${today}'
         and ${blockSQL}`
    })
    let supendCard = new Set(disableCardData.data.map(x=>x['block_id']))
    let filteredCardList:ReviewInfo[]
    filteredCardList = cardList.filter((x)=>{return !supendCard.has(x.blockID)})

    return filteredCardList
}

// 未确认finish之后的文档不会被阅读
const filterAfterFinishDoc = async(cardList:ReviewInfo[]):Promise<ReviewInfo[]>=>{
    // console.log("filterAfterFinishDoc")
    let blockSQL = getBlockSQL(cardList)
    let disableCardData = await fetchSyncPost("/api/query/sql", {
        "stmt": `select block_id from attributes
         where name like '%custom-plugin-incremental-reading-enable%'
         and value = 'false'
         and ${blockSQL}`
    })
    // console.log("filterAfterFinishDoc",blockSQL)
    let supendCard = new Set(disableCardData.data.map(x=>x['block_id']))
    let filteredCardList:ReviewInfo[]
    filteredCardList = cardList.filter((x)=>{return !supendCard.has(x.blockID)})
    return filteredCardList
}

const filterCard = async(cardList:ReviewInfo[]):Promise<ReviewInfo[]>=>{

    let filteredCardList = await filterSupendCard(cardList)
    filteredCardList = await filterTodayReadedDoc(filteredCardList)
    filteredCardList = await filterAfterFinishDoc(filteredCardList)
    return filteredCardList
}

const sortExcartSource =async (cardList:ReviewInfo[]) => {
    let sortCardList = [...cardList]
    let blockIDs = cardList.map(reviewInfo=>{return reviewInfo.blockID})
    let blockSQL = ` block_id in ('${blockIDs.join("','")}')`
    let extractCardData = await fetchSyncPost("/api/query/sql", {
        "stmt": `select block_id, value from attributes
         where name like '%custom-extract-source%'
         and ${blockSQL}
         LIMIT 10240`
    })
    let sourceMap = new Map(extractCardData.data.map(x=>{
        return [x['block_id'], x['value']]
    }))
    sortCardList = sortByTopo(sortCardList,sourceMap)

    console.log(sourceMap)
    // console.log("excart 排序",sortCardList)
    return sortCardList
}

// TODO
// 优先级高的在前
// 源文档排在其生成的子文档后
const sortCard = async(cardList:ReviewInfo[]):Promise<ReviewInfo[]>=>{
    let sortedCardList = await sortExcartSource(cardList)
    console.log("完成排序")
    console.log(cardList)
    console.log(sortedCardList)
    return sortedCardList
}

async function initReview(){
    reviewCardEnd.value = false
    originAllreviewCard = []
    markCardList = []
    reviewedCardList.clear()
    let cardData = await getDueCard("all")
    if (cardData== undefined) return

    let fiteredCard = await filterCard(cardData.data.cards as ReviewInfo[])
    let sortedCard = await sortCard(fiteredCard)

    allReviewCard.value = sortedCard

    if (allReviewCard.value?.length === 0) return

    reviewOptionStatus.value = await getCardOption(allReviewCard.value[0])
    originAllreviewCard = [...allReviewCard.value]
    currentCard.value = allReviewCard.value[0]
}

const afterAddCard=({detail})=>{
        console.log(detail.newCard)
        let oldIndex = getNewCardIndex(0, currentCard.value as ReviewInfo, allReviewCard.value)
        allReviewCard.value.splice(oldIndex,0,detail.newCard)
        console.log(allReviewCard)
    }
function listenAddNewCard(){
    console.log("listener add card!")
    plugin.eventBus.on(("add-card" as any),afterAddCard)
}
onMounted(async ()=>{
    initReview()
    listenAddNewCard()
})
onUnmounted(async ()=>{
    console.log("un mount")
    plugin.eventBus.off(("add-card" as any),afterAddCard)
})

</script>
<style lang="scss" scoped>
card{
    height: 600px;
}
</style>