<template>
    <div>{{currentCard? currentCard.deckID:""}}</div>
    <div>{{currentCard? currentCard.cardID:""}}</div>
    <div>{{currentCard? currentCard.blockID:""}}</div>
    <div class="fn__flex-1">
        <div class="card__main">
            <div ref="mainCard" :class="cardMainClass">
            </div>
        </div>
    </div>
    
    
</template>

<script setup lang="ts">
import {watch, onMounted, ref, Ref} from "vue"
import { Protyle } from "siyuan";
import {plugin} from "../../api/utils"
import {ReviewOption, ReviewInfo} from "../../utils/type"
const props = defineProps({
    currentCard: {
        type: Object as Object as () => ReviewInfo,
        required: true
    },
    optionStatus: {
        type: Object as Object as () => ReviewOption,
        required: true
    },
})
let mainCard:Ref<null|HTMLElement> = ref(null)
let cardMainClass = ref("card__block fn__flex-1 protyle card__block--hidemark card__block--hidesb card__block--hideli")

onMounted(async()=>{
    watch(
        () => props.currentCard,
        (newProps, oldProps) => {
            new Protyle(plugin.app,(mainCard.value as HTMLElement),{
                action:["cb-get-append","cb-get-before","cb-get-all"],
                blockId:props.currentCard.blockID,
                render: {
                    title: false,
                    gutter: true,
                    scroll: false,
                    breadcrumb: true,
                    breadcrumbDocName: true,
                }
            })
        }
    )
    watch(
        () => props.optionStatus,
        (newProps, oldProps) => {
            if(props.optionStatus!='hiddenCard'){
                cardMainClass.value = "card__block fn__flex-1 protyle"
            }
            else{
                cardMainClass.value = "card__block fn__flex-1 protyle card__block--hidemark card__block--hidesb card__block--hideli"
            }
        }
    )
})
</script>

<style lang="scss" scoped>
.card__main{
    height: 60vh;

}
.card__main{
::v-deep .protyle-wysiwyg { 
    padding: 16px 10px 144px !important;
    max-width: calc(max(50%, 800px));
    margin-left: auto;
    margin-right: auto;
 }
} 
</style>
<style lang="scss">
</style>