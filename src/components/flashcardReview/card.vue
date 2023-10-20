<template>
    <div>{{currentCard? currentCard.deckID:""}}</div>
    <div>{{currentCard? currentCard.cardID:""}}</div>
    <div>{{currentCard? currentCard.blockID:""}}</div>
    <div ref="mainCard" class="protyle"></div>
</template>

<script setup lang="ts">
import {watch, onMounted, ref, Ref} from "vue"
import { Protyle } from "siyuan";
import {plugin} from "../../api/utils"
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
const props = defineProps({
  currentCard: {
      type: Object as Object as () => ReviewInfo,
      required: true
    }
})
let mainCard:Ref<null|HTMLElement> = ref(null)

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
                    scroll: true,
                    breadcrumb: true,
                    breadcrumbDocName: true,
                }
            })
        }
    )
})
</script>

<style lang="scss" scoped>
.protyle{
    height: 80%;
}
</style>