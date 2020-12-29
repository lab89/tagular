const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const config = {
  entry: ['@babel/polyfill', './src/index.ts'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'tagular.js',
    libraryTarget : 'umd',
    library : "tagular",
    libraryExport : "default",
  },
  module: {
    rules: [
      { test: /\.ts$/, use: 'awesome-typescript-loader' },
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
      { enforce: 'pre', test: /\.ts$/, loader: 'tslint-loader' },
      
    ]
  },
  resolve: {
    extensions: [".ts", ".js", ".json"]
  },
  plugins: [],
  devtool: 'source-map',
  // https://webpack.js.org/concepts/mode/#mode-development
  mode: 'development'
};

module.exports = config;