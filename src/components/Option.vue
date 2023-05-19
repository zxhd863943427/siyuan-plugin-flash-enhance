<template>
    <div id="option">
        <div id="content">
            <span style="float: left">{{ name }}</span>
            <!-- <n-switch v-model:value="status" @update:value="$emit('update:open', status)" style="float: right;"></n-switch> -->
            <input class="b3-switch fn__flex-center" v-bind:id="name" type="checkbox" v-model="status" @change="$emit('update:open', status)">
        </div>
    </div> 
</template>

<script lang="ts" setup>
// import { NSwitch } from 'naive-ui'
import { ref } from 'vue'
const props = defineProps({
    open: Boolean,
    name: String
})
// console.log(props.open)
const status = ref(props.open)
</script>

<style scoped  lang="scss">
#option {
    display: grid;
    align-items: center;
    min-height: 30px;
}

#content {
    display: flex;
    justify-content: space-between;
}
</style>