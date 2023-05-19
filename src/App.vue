<template>
  <div style="min-width: 250px" class="menu">

    <div style="color:var(--b3-theme-on-background);font-size:1.35em;margin: 20px 0px;">
      管理界面
    </div>
    <div class="option">
      危险功能
    </div>
    <template v-for="item in dangerousFeature">
      <MyButton :name="item.content" :click-func="item.func"></MyButton>
    </template>


    <div class="option">
      美化功能
    </div>
    <template v-for="item in beautifulFeature">
      <Option :name="item.content" v-model:open="item.status.value"></Option>
    </template>


    <div class="option">
      实验功能
    </div>
    <template v-for="item in labFeature">
      <Option :name="item.content" v-model:open="item.status.value"></Option>
    </template>

  </div>
</template>

<script lang="ts" setup>
// import { NCard } from 'naive-ui'
import Option from "./components/Option.vue"
import MyButton from "./components/MyButton.vue"
import { ref, watch } from 'vue'

const props = defineProps({
  beautifulFeature: Array<{
    content: string;
    status: Ref<T>;
  }>,
  labFeature: Array<{
    content: string;
    status: Ref<T>;
  }>,
  dangerousFeature: Array<{ content: string, func: () => void }>
})

// const beautifulFeature = [
//   { content: "闪卡样式增强", status: ref(false) },
//   { content: "复习挖空增强", status: ref(false) },
//   { content: "类remnote复习界面", status: ref(false) },
//   { content: "层级闪卡", status: ref(false) },

// ]

// const labFeature = [
//   { content: "自定义卡包制卡", status: ref(false) },
//   { content: "数学块遮挡制卡", status: ref(false) },
//   { content: "沉浸式制卡", status: ref(false) },

// ]
// const dangerousFeature = [
//   { content: "清除当页闪卡", func: testClick },
// ]
// function testClick() {
//   console.log("It click!")
// }



</script>

<style scoped lang="scss">
.option {
  font-size: 1.1em;
  font-weight: 600;
  margin: 5px 0px 0px;
}

.menu {
  color: var(--b3-theme-on-background);
  background-color: var(--b3-menu-background);
  margin: 1px;
  padding: 10px 20px;
  /* 添加边框 */
  border: 1px solid var(--b3-theme-surface-lighter);;
  border-radius: 3px;
}
</style>