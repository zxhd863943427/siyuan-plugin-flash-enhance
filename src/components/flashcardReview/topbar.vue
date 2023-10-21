<template>
    <div>topbar<button @click="selectDoc">select doc</button></div>
    
</template>

<script lang="ts" setup>
import {fetchSyncPost} from "siyuan"
import {getDockByType} from "../../api/utils"
import {ReviewOption, ReviewInfo} from "../../utils/type"
const props = defineProps({
    currentCard: {
        type: Object as Object as () => ReviewInfo,
        required: true
    },
})
async function selectDoc(){
    let blockInfo = await fetchSyncPost("/api/block/getBlockInfo",{id:props.currentCard.blockID})
    const dockFile = getDockByType("file");
    if (!dockFile) {
        return false;
    }
    const files = dockFile.data.file
    let notebookId = blockInfo.data.box
    let path = blockInfo.data.path
    files.selectItem(notebookId, path)
}
</script>