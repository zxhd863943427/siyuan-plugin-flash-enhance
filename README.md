# SiYuan plugin sample

## Get started

* Make a copy of this repo as a template with the "Use this template" button (login to GitHub if you don't see it)
* Clone your repo to a local development folder. For convenience, you can place this folder in
  your `{workspace}/data/plugins` folder
* Install [NodeJS](https://nodejs.org/en/download) and [pnpm](https://pnpm.io/installation), then run `pnpm i` in the
  command line under your repo folder
* Run `pnpm run dev` to compile your plugin from `index.ts`
* Open SiYuan marketplace and enable plugin in downloaded tab

## Development

* plugin.json
* icon.png (160*160)
* preview.png (1024*768)
* src/*
* README*.md
* [API](https://github.com/siyuan-note/petal)

## I18n

In terms of internationalization, our main consideration is to support multiple languages. Specifically, we need to
complete the following tasks:

* Meta information about the plugin itself, such as plugin description and readme
    * `description` and `readme` fields in plugin.json, and the corresponding README*.md file
* Text used in the plugin, such as button text and tooltips
    * src/i18n/*.json language configuration files
    * Use `this.i18.key` to get the text in the code
* Finally, declare the language supported by the plugin in the `i18n` field in plugin.json

## Package

No matter which method is used to compile and package, we finally need to generate a package.zip, which contains at
least the following files:

* icon.png
* index.js
* plugin.json
* preview.png
* README.md
* index.css (optional)
* i18n/* (optional)

## List on the marketplace

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
