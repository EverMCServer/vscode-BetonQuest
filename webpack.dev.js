/* eslint-disable @typescript-eslint/naming-convention */
//@ts-check

"use strict";

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

/** @type WebpackConfig */
const extensionConfig = merge(common[0], {
  mode: "development",
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
});

/** @type WebpackConfig */
const reactConfig = merge(common[1], {
  mode: "development",
  devtool: "inline-source-map",
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  }
});
module.exports = [extensionConfig, reactConfig];
