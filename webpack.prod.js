/* eslint-disable @typescript-eslint/naming-convention */
//@ts-check

"use strict";

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

/** @type WebpackConfig */
const extensionConfig = merge(common[0], {
  mode: "production",
	devtool: 'hidden-source-map',
});

/** @type WebpackConfig */
const reactConfig = merge(common[1], {
  mode: "production",
	devtool: 'hidden-source-map',
});

/** @type WebpackConfig */
const webExtensionConfig = merge(common[2], {
  mode: "production",
	devtool: 'hidden-source-map',
});

module.exports = [extensionConfig, reactConfig, webExtensionConfig];
