const path = require("path");
const CameronJSHtmlWebpackPlugin = require("cameronjs-html-webpack-plugin");

module.exports = {
  devtool: "source-map",
  entry: "./code/javascripts/application.js",
  mode: process.env.NODE_ENV || "development",
  output: {
    filename: "javascripts/application.js",
    path: path.resolve(__dirname, "publish")
  },
  plugins: [
    new CameronJSHtmlWebpackPlugin({
      source: "./code/html",
      layouts: "layouts",
      partials: "partials"
    })
  ],
  watchOptions: {
    ignored: /node_modules/
  }
};
