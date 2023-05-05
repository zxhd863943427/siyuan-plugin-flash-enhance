# plugin-sample
SiYuan plugin sample

## Release

- `pnpm run build` to general dist and zip.
- Create new GitHub release using your new version number as the "Tag version". See here for an example: https://github.com/siyuan-note/plugin-sample/releases
- Upload the files `*.zip` as binary attachments.
- Publish the release.

## How to use

- `pnpm i` to install dependencies
- `pnpm run dev` to start compilation in watch mode.

## Manually installing the plugin

- `pnpm run build` to general dist.
- Copy all files under `dist` to `Workspace/data/plugins/your-plugin-name/`.
