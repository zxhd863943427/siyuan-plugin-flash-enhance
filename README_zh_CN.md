# 思源笔记插件示例

## 开始

* Make a copy of this repo as a template with the "Use this template" button (login to GitHub if you don't see it)
* Clone your repo to a local development folder. For convenience, you can place this folder in
  your `{workspace}/data/plugins` folder
* Install [NodeJS](https://nodejs.org/en/download) and [pnpm](https://pnpm.io/installation), then run `pnpm i` in the
  command line under your repo folder
* Run `pnpm run dev` to compile your plugin from `index.ts`
* Open SiYuan marketplace and enable plugin

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

* `pnpm run build` to generate package.zip
* Create a new GitHub release using your new version number as the "Tag version". See here for an
  example: https://github.com/siyuan-note/plugin-sample/releases
* Upload the file package.zip as binary attachments
* Publish the release

If it is the first release, please create a pull request to
the [Community Bazaar](https://github.com/siyuan-note/bazaar) repository and modify the plugins.json file in it. This
file is the index of all community theme repositories, the format is:

```json
{
  "repos": [
    "username/reponame"
  ]
}
```
