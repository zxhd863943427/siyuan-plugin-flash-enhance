# plugin-sample
SiYuan plugin sample

## First time developing plugins?

Quick starting guide for new plugin devs:

- Make a copy of this repo as a template with the "Use this template" button (login to GitHub if you don't see it).
- Clone your repo to a local development folder. For convenience, you can place this folder in your `workspace/data/plugins` folder.
- Install [NodeJS](https://nodejs.org/en/download) and [pnpm](https://pnpm.io/installation), then run `pnpm i` in the command line under your repo folder.
- Run `pnpm run dev` to compile your plugin from `index.ts`.
- Open Market and enable plugin.

## Development

- update plugin.json, README.md, icon.png(96 * 96) and preview.png(1024 * 768)
- [API](https://github.com/siyuan-note/petal)

## Release

- `pnpm run build` to general dist and zip.
- Create new GitHub release using your new version number as the "Tag version". See here for an example: https://github.com/siyuan-note/plugin-sample/releases
- Upload the files `*.zip` as binary attachments.
- Publish the release.

## Manually installing the plugin

- `pnpm run build` to general dist.
- Copy all files under `dist` to `workspace/data/plugins/your-plugin-name`.
