const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {EsbuildPlugin} = require("esbuild-loader");
const webpack = require("webpack");
const fs = require("fs");
const CopyPlugin = require("copy-webpack-plugin");
const ZipPlugin = require('zip-webpack-plugin');
const pluginJSON = require("./plugin.json");

module.exports = (env, argv) => {
    const plugins = [
        new MiniCssExtractPlugin({
            filename: "dist/index.css",
        })
    ]
    if (argv.mode === "production") {
        plugins.push(new webpack.BannerPlugin({
            banner: () => {
                return fs.readFileSync("LICENSE").toString();
            },
        }))
        plugins.push(new CopyPlugin({
            patterns: [
                {from: "preview.png", to: "./dist/preview.png"},
                {from: "icon.png", to: "./dist/icon.png"},
                {from: "README.md", to: "./dist/README.md"},
                {from: "plugin.json", to: "./dist/plugin.json"},
            ],
        }))
        plugins.push(new ZipPlugin({
            filename: `${pluginJSON.name}-${pluginJSON.version}.zip`,
            algorithm: "gzip",
            include: [/dist/],
            pathPrefix: `${pluginJSON.name}`,
            pathMapper: (assetPath) => {
                return assetPath.replace("dist/", "")
            },
        }))
    }
    return {
        mode: argv.mode || "development",
        watch: argv.mode !== "production",
        devtool: argv.mode !== "production" ? "eval" : false,
        output: {
            filename: "[name].js",
            libraryTarget: "commonjs",
            path: path.resolve(__dirname),
        },
        externals: {
            siyuan: "siyuan",
        },
        entry: {
            "dist/index": "./src/index.ts",
        },
        optimization: {
            minimize: true,
            minimizer: [
                new EsbuildPlugin({target: "es6"}),
            ],
        },
        resolve: {
            extensions: [".ts", ".scss"],
        },
        module: {
            rules: [
                {
                    test: /\.ts(x?)$/,
                    include: [path.resolve(__dirname, "src")],
                    use: [
                        {
                            loader: "esbuild-loader",
                            options: {
                                target: "es6",
                            }
                        },
                    ],
                },
                {
                    test: /\.scss$/,
                    include: [path.resolve(__dirname, "src")],
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader", // translates CSS into CommonJS
                        },
                        {
                            loader: "sass-loader", // compiles Sass to CSS
                        },
                    ],
                }
            ],
        },
        plugins,
    };
};
