# 思源笔记插件示例

## 开始

* 通过 <kbd>Use this template</kbd> 按钮将该库文件复制到你自己的库中，请注意库名必须和插件名称一致
* 将你的库克隆到本地开发文件夹中，为了方便可以直接将开发文件夹放置在 `{工作空间}/data/plugins/` 下
* 安装 [NodeJS](https://nodejs.org/en/download) 和 [pnpm](https://pnpm.io/installation)，然后在开发文件夹下执行 `pnpm i`
* 执行 `pnpm run dev` 进行实时编译
* 在思源中打开集市并在下载选项卡中启用插件

## 开发

* plugin.json
* icon.png (160*160)
* preview.png (1024*768)
* src/*
* README*.md
* [API](https://github.com/siyuan-note/petal)

## 国际化

国际化方面我们主要考虑的是支持多语言，具体需要完成以下工作：

* 插件自身的元信息，比如插件描述和自述文件
    * plugin.json 中的 `description` 和 `readme` 字段，以及对应的 README*.md 文件
* 插件中使用的文本，比如按钮文字和提示信息
    * src/i18n/*.json 语言配置文件
    * 代码中使用 `this.i18.key` 获取文本
* 最后在 plugin.json 中的 `i18n` 字段中声明该插件支持的语言

## 打包

无论使用何种方式编译打包，我们最终需要生成一个 package.zip，它至少包含如下文件：

* icon.png
* index.js
* plugin.json
* preview.png
* README.md
* index.css (optional)
* i18n/* (optional)

## 上架集市

* 执行 `pnpm run build` 生成 package.zip
* 在 GitHub 上创建一个新的发布，使用插件版本号作为 “Tag
  version”，示例 https://github.com/siyuan-note/plugin-sample/releases
* 上传 package.zip 作为二进制附件
* 提交发布

如果是第一次发布版本，还需要创建一个 PR 到 [Community Bazaar](https://github.com/siyuan-note/bazaar) 社区集市仓库，修改该库的
plugins.json。该文件是所有社区插件库的索引，格式为：

```json
{
  "repos": [
    "username/reponame"
  ]
}
```

PR 被合并以后集市会通过 GitHub Actions 自动更新索引并部署。后续发布新版本插件时只需要按照上述步骤创建新的发布即可，不需要再 PR 社区集市仓库。

正常情况下，社区集市仓库每隔 1 小时会自动更新索引并部署，可在 https://github.com/siyuan-note/bazaar/actions 查看部署状态。
