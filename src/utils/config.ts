export { SettingList, settingList, getSetting }

import { addCards, removeCards, openDynamiMarkCard } from './card'
import { ref } from 'vue'

//////////////////////    设置选项      ///////////////////////

const beautifulFeatureList = [
    "闪卡样式增强",
    "复习挖空增强",
    "类remnote复习界面",
    "层级闪卡"]

const labFeatureList = [
    "内置卡包制卡",
    "数学块遮挡制卡",
    "沉浸式制卡"
]

////////////////////    工具类      ////////////////////////
class SettingList {
    setList!: any[]
    SetDict!: any
    constructor() {
        //setList是为了方便watch
        this.setList = []
        //SetDict是为了方便读取保存的配置
        this.SetDict = {}
    }
    setting(init: any, name: string) {
        this.setList.push(init)
        this.SetDict[name] = init
        return init
    }
    //返回读取结果后的dict字典，方便保存
    getSetting() {
        let settingKey = Object.keys(this.SetDict)
        let returnDict: any = {}
        for (let item of settingKey) {
            returnDict[item] = this.SetDict[item].value;
        }
        return returnDict
    }
}

let settingList = new SettingList()


////////////////////    工具函数       ////////////////////

//辅助添加菜单，并将选项状态保存到 settingList
function addSetting(settingKey: string, setDict: any) {
    return {
        content: settingKey, status: settingList.setting(
            ref(setDict[settingKey])
            , settingKey)
    }
}


function loadSetting(settingDict: any) {
    let beautifulFeature: any = []
    for (let item of beautifulFeatureList) {
        beautifulFeature.push(addSetting(item, settingDict))
    }

    let labFeature: any = []

    for (let item of labFeatureList) {
        labFeature.push(addSetting(item, settingDict))
    }

    const dangerousFeature = [
        { content: "清除当页闪卡", func: removeCards },
    ]

    let settingConfig = {
        beautifulFeature: beautifulFeature,
        labFeature: labFeature,
        dangerousFeature: dangerousFeature,
    }
    return settingConfig
}

function initSetting() {
    let setDict: any = {}
    for (let item of beautifulFeatureList) {
        setDict[item] = false
    }
    for (let item of labFeatureList) {
        setDict[item] = false
    }
    setDict["内置卡包制卡"] = true
    let settingConfig = loadSetting(setDict)
    return settingConfig
}

async function getSetting(localConfig: null | any) {
    //没有本地配置，那就初始化状态
    if (!localConfig) {
        return initSetting()
    }
    // let setDictText = localConfig
    // let setDict = JSON.parse(setDictText)
    
    return loadSetting(localConfig)
    // return initSetting()
}