const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, "./src/index.tsx"),
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "esbuild-loader",
        options: {
          loader: "tsx",
          target: "es2015",
          tsconfigRaw: require(path.join(__dirname, "./tsconfig.json"))
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      "events": require.resolve("events/"),
      "buffer": require.resolve("buffer/"),
      "stream": require.resolve("stream/"),
      "assert": require.resolve("assert/"),
      "process": require.resolve("process/"),
    },
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "./public"),
    },
    historyApiFallback: {
      index: '/'
    },
    compress: false,
    port: 3000,
  },
  output: {
    publicPath: '/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "./public", "index.html"),
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.join(__dirname, "./tsconfig.json"),
      },
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
};
