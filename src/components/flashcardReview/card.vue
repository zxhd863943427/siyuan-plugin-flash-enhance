<template>
    <div>
        <span> deckID: {{currentCard? currentCard.deckID:""}} </span>
        <span> cardID: {{currentCard? currentCard.cardID:""}} </span>
        <span> blockID: {{currentCard? currentCard.blockID:""}}</span>
    </div>

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
                action:["cb-get-all"],
                blockId:props.currentCard.blockID,
                render: {
                    title: true,
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
    ::v-deep div.card__block > div.protyle-content > div.protyle-wysiwyg { 
        padding: 16px 10px 0px !important;
        max-width: calc(max(50%, 800px));
        margin-left: auto;
        margin-right: auto;
    }
    ::v-deep [custom-source-road]>div{
        display: block !important;
    }
    ::v-deep [custom-hollow="true"] {
        background: var(--plugin-hollow-background);
        color: var(--plugin-hollow-color);
        font-size: 1.2em;
        margin: 0.3em;
        padding: 0.1em;
    }
    ::v-deep div.sb[data-node-id][custom-source-road] {
        margin-top: 3em;
        background: var(--b3-theme-surface-light);
    }
    ::v-deep div.bq[data-node-id][custom-flash-back] {
        background-color: transparent!important;
        border: none;
        border-radius: 0em !important;
        margin-top: 1.5em !important;
        padding-top: 0em !important;
        padding-bottom: 0em !important;
        padding-left: 0.1em;
        margin-left: 0.5em;
        border-left: 0.2em solid #c31e1e59 !important;
    }
    :deep(.card__block--hidesb .protyle-wysiwyg>.sb>div:nth-of-type(n+2):not(.protyle-attr)) {
        display: none;
    }
} 
</style>
<style lang="scss">
:root{
    --plugin-hollow-color: red;
    --plugin-hollow-background: yellow;
}
</style>