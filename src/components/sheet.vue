<template>
    <div v-if="beautifulFeature">
        <!-- 闪卡样式增强 -->
        <div v-if="beautifulFeature[0].status.value">
            <component is="style">
                /* 闪卡样式增强 v0.04 */
                .protyle-wysiwyg .li[data-node-id][custom-riff-decks] {
                position: relative;
                display: block;
                border-left: 0.15em solid #ff6a6a;
                padding: 0px 0.2em 0.1em 0px !important;
                box-shadow: 0.1em 0.1em 0.2em #aaaaaa;
                background-image: none;
                margin: 0.2em 0em 0em 0em;
                }
                .protyle-wysiwyg .p[data-node-id][custom-riff-decks] {
                position: relative;
                display: block;
                border-left: 0.15em solid #00c853;
                box-shadow: 0.1em 0.1em 0.2em #aaaaaa;
                background-image: none;
                margin: 0.1em 0em 1em 0em;
                }

                .protyle-wysiwyg .sb[data-node-id][custom-riff-decks] {
                position: relative;
                border-left: 0.15em solid #7c4dff;
                box-shadow: 0.1em 0.1em 0.2em #aaaaaa;
                background-image: none;
                margin: 0.1em 0em 1em 0em;
                }

            </component>
        </div>
        <!-- 复习挖空增强 -->
        <div v-if="beautifulFeature[1].status.value">
            <component is="style">
                /*增强闪卡的遮挡效果 v0.02 */
                .card__block--hidemark span[data-type~=mark]::before {
                content: " [...] ";
                color: var(--b3-theme-on-background);
                font-size: 16px;
                }

                .card__block--hidemark span[data-type~=mark] {
                font-size: 0px;
                }
            </component>
        </div>
        <!-- 类remnote复习界面 -->
        <div v-if="beautifulFeature[2].status.value">
            <component is="style">
                /*类remnote界面 v0.05 */
                /*全宽显示*/
                .card__block .protyle-breadcrumb__bar span {
                max-width: 100%;
                }
                /*全宽显示*/
                .card__block .protyle-breadcrumb__bar.protyle-breadcrumb__bar--nowrap {
                width: 100%;
                }
                /*竖向显示*/
                .card__block .protyle-breadcrumb__bar {
                display: block;
                }
                /*隐藏 > 符号*/
                .card__block .protyle-breadcrumb__bar > svg {
                display: none;
                }
                /*隐藏退出聚焦和文档菜单*/
                .card__block .protyle-breadcrumb button {
                display: none;
                }
                /**/
                .card__block span.protyle-breadcrumb__item.protyle-breadcrumb__item--active+svg+span {
                display: none;
                }
                /* 隐藏最后一个面包屑 */
                .card__block .protyle-breadcrumb__bar>span:last-child {
                opacity: 0;
                }
                /* 隐藏面包屑悬浮显示 */
                .card__block .protyle-breadcrumb__bar>span:last-child:hover {
                opacity: 1;
                }
            </component>
        </div>
        <!-- 层级闪卡 -->
        <div v-if="beautifulFeature[3].status.value">
            <component is="style">
                /* 层级闪卡 v0.01 */
                /* 隐藏二级以下的列表 */
                .card__block div.li>div.list>div.li>div.list>div.li {
                display: none;
                }
            </component>
        </div>
    </div>
    <div v-if="labFeature">
        <!-- 数学块遮挡制卡 -->
        <div v-if="labFeature[1].status.value">
            <component is="style">
                /*数学制卡 v0.06 */
                /*隐藏面包屑中的latex文本*/
                .card__block:has(span[style='color:#6495ed;'])
                span.protyle-breadcrumb__item.protyle-breadcrumb__item--active {
                display: none;
                }

                /*提供公式制卡的遮挡效果*/
                .card__block--hidemark span:has(>span[style='color:#6495ed;'])::before {
                content: " [...] ";
                color: var(--b3-theme-on-background);
                font-size: 16px;
                }

                .card__block--hidemark span:has(>span[style='color:#6495ed;']) > span {
                display: none;
                }

                .card__block--hidemark span:has(>span[style='color:#6495ed;']) {
                font-size: 0px;
                }
                /*兼容选项，针对部分设备不支持has选择器。*/
                .card__block--hidemark span[style='color:#6495ed;'] {
                background: #6495ed;
                }

            </component>
            <component is="script">
                (() => {
                var tempMacro = JSON.parse(window.siyuan.config.editor.katexMacros || "{}");
                tempMacro["\\tempMark"] = "\\color{#6495ed}";
                tempMacro["\\mark"] = "{\\tempMark#1}";
                window.siyuan.config.editor.katexMacros = JSON.stringify(tempMacro);
                })();

            </component>
        </div>
        <!-- 沉浸式制卡 -->
        <!-- <div v-if="labFeature[2].status.value">
            <component is="style">

            </component>
        </div> -->

    </div>
</template>

<script lang="ts" setup>

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
</script>