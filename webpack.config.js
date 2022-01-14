const { resolve } = require("path")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const HTMLWebpackPlugin = require("html-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = {
  mode: "development",
  devtool: "cheap-module-source-map",
  entry: {
    background: "./src/background/background.ts",
    content: "./src/content/content.ts",
    popup: "./src/popup/popup.tsx",
  },
  output: {
    filename: "[name].js",
    path: resolve(__dirname, "build"),
  },
  module: {
    rules: [{
      test: /\.ts(x?)$/,
      exclude: /node_modules/,
      use: "ts-loader",
    }],
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: "src/popup/popup.html",
      filename: "popup.html",
      chunks: ["popup"],
    }),
    new CopyWebpackPlugin({
      patterns: [{
        from: "public",
        to: ".",
      }],
    }),
    new CleanWebpackPlugin(),
  ]
}
