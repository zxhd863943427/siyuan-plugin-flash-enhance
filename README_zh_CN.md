一个增强思源闪卡体验的插件

### 主要功能

左键一键制卡，右键打开扩展功能

* 一键制卡
* 清除当前页面闪卡
* 闪卡样式加强
* 挖空增强
* 类remnote界面
* 层级闪卡
* 自定义卡包制卡
* 数学块制卡
* 沉浸式制卡
* 渐进式阅读

#### 一键制卡
![Alt text](img/%E4%B8%80%E9%94%AE%E5%88%B6%E5%8D%A1.gif)

一键制卡类型：

**标记块**

**列表块**

末尾添加标记即可制卡

支持标记：？、?、》》、>>、||

**超级块**

垂直超级块、水平超级块


### 右键菜单内容

#### 清除当前页面闪卡
![Alt text](img/%E4%B8%80%E9%94%AE%E6%B8%85%E9%99%A4.gif)

#### 闪卡样式加强
![Alt text](img/%E9%97%AA%E5%8D%A1%E6%A0%B7%E5%BC%8F%E5%A2%9E%E5%BC%BA.gif)

#### 挖空增强
![Alt text](img/%E6%8C%96%E7%A9%BA%E5%A2%9E%E5%BC%BA.gif)

#### 类remnote界面
![Alt text](img/%E7%B1%BBremnote%E7%95%8C%E9%9D%A2.gif)

#### 层级闪卡
![Alt text](img/%E5%B1%82%E7%BA%A7%E9%97%AA%E5%8D%A1.gif)

#### 自定义卡包制卡
![Alt text](img/%E8%87%AA%E5%AE%9A%E4%B9%89%E5%8D%A1%E5%8C%85%E5%88%B6%E5%8D%A1.gif)

#### 数学块制卡
![Alt text](img/%E6%95%B0%E5%AD%A6%E5%9D%97%E5%88%B6%E5%8D%A1.gif)

#### 沉浸式制卡（不稳定）
![Alt text](img/%E6%B2%89%E6%B5%B8%E5%BC%8F%E5%88%B6%E5%8D%A1.gif)

#### 支持渐进式阅读摘录

开启后，即可使用快捷键 alt+Q 摘录生成闪卡，alt+W 生成挖空闪卡

![Alt text](img/%E6%B8%90%E8%BF%9B%E5%BC%8F%E9%98%85%E8%AF%BB.gif)

#### 图片制卡

开启后，能够实现以下操作：

![遮挡](img/%E9%81%AE%E6%8C%A1.gif)

![悬浮显示](img/%E6%82%AC%E6%B5%AE%E6%98%BE%E7%A4%BA.gif)

![复习](img/%E5%A4%8D%E4%B9%A0.gif)

### 缺陷
* [x] 配置不能保存
* [x] 沉浸式制卡不够稳定, 移除卡片有概率无法移除样式（但是卡片确实已经从卡包移除）（已改进了部分）
* [x] 无法一键制卡多种样式的标记
* [ ] 图片遮挡在界面缩放后会发生移位

### 感谢名单
[zuoez02](https://github.com/zuoez02) 大佬创建的 [社区插件系统](https://github.com/zuoez02/siyuan-plugin-system)

[svchord](https://github.com/svchord) 大佬 [日历插件项目](https://github.com/svchord/siyuan-arco-calendar) 的参考

社区 [BryceAndJuly](https://ld246.com/member/BryceAndJuly) 大佬实现的原型 [【分享】使用当前文档的二级标题快速制作闪卡](https://ld246.com/article/1674135504898)

社区 [RenaEmiya - 链滴](https://ld246.com/member/RenaEmiya) 大佬提供了[复习时隐藏最后一个块标](https://ld246.com/article/1680862515960/comment/1680866557430#comments)

### 更新日志
v0.0.8
增加一键制卡快捷键和命令面板支持
增加列表块和超级块沉浸式制卡支持，使用**？** 和 **?** 即可动态制卡。其中列表块可以动态取消，超级块不行。
改进渐进式阅读摘录和挖空

v0.0.14
增加图片遮挡功能。如果需要在遮挡后把当前块制卡，需要打开沉浸式制卡功能，目前两者的结合仍有可能存在问题。
目前存在已知问题：图片遮挡在复习时，假如界面缩放后会发生移位。