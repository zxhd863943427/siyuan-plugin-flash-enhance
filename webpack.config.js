const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {EsbuildPlugin} = require("esbuild-loader");
const webpack = require("webpack");
const fs = require("fs");

module.exports = (env, argv) => {
    return {
        mode: argv.mode || "development",
        watch: argv.mode !== "production",
        devtool: argv.mode !== "production" ? "eval" : false,
        output: {
            filename: "[name].js",
            libraryTarget: "commonjs",
            path: path.resolve(__dirname, "./dist/"),
        },
        externals: {
            siyuan: "siyuan",
        },
        entry: {
            "index": "./src/index.ts",
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
        plugins: [
            new MiniCssExtractPlugin({
                filename: "index.css",
            }),
            new webpack.BannerPlugin({
                banner: () => {
                    return fs.readFileSync("LICENSE").toString();
                },
            })
        ],
    };
};
