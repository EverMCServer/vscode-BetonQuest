/* eslint-disable @typescript-eslint/naming-convention */
//@ts-check

"use strict";

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

/** @type WebpackConfig */
const extensionConfig = merge(common[0], {
  // ...
});

/** @type WebpackConfig */
const reactConfig = merge(common[1], {
  // ...
});
module.exports = [extensionConfig, reactConfig];
