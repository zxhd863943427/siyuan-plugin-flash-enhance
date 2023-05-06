# 思源笔记插件示例

## 第一次开发插件？

* Make a copy of this repo as a template with the "Use this template" button (login to GitHub if you don't see it)
* Clone your repo to a local development folder. For convenience, you can place this folder in your `{workspace}/data/plugins` folder
* Install [NodeJS](https://nodejs.org/en/download) and [pnpm](https://pnpm.io/installation), then run `pnpm i` in the command line under your repo folder
* Run `pnpm run dev` to compile your plugin from `index.ts`
* Open SiYuan marketplace and enable plugin

## 开发

* Update plugin.json, README.md, icon.png (160*160) and preview.png (1024*768)
* [API](https://github.com/siyuan-note/petal)

## 打包

无论使用何种方式编译打包，我们最终需要生成一个 package.zip，它至少包含如下文件：

* icon.png
* index.css (optional)
* index.js
* plugin.json
* preview.png
* README.md

## 上架集市

* `pnpm run build` to generate package.zip
* Create a new GitHub release using your new version number as the "Tag version". See here for an example: https://github.com/siyuan-note/plugin-sample/releases
* Upload the file package.zip as binary attachments
* Publish the release

If it is the first release, please create a pull request to the [Community Bazaar](https://github.com/siyuan-note/bazaar) repository and modify the plugins.json file in it. This file is the index of all community theme repositories, the format is:

```json
{
   "repos": [
     "username/reponame"
   ]
}
```
