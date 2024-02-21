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
const webExtensionConfig = merge(common[1], {
  mode: "production",
  devtool: 'hidden-source-map',
});

/** @type WebpackConfig */
const webviewConfig = merge(common[2], {
  mode: "production",
  devtool: 'hidden-source-map',
  optimization: {
    usedExports: true,
    minimize: true,
  },
});

/** @type WebpackConfig */
const lspServerNodeConfig = merge(common[3], {
  mode: "production",
  devtool: 'hidden-source-map',
});

/** @type WebpackConfig */
const lspServerWebConfig = merge(common[4], {
  mode: "production",
  devtool: 'hidden-source-map',
});

module.exports = [extensionConfig, webExtensionConfig, webviewConfig, lspServerNodeConfig, lspServerWebConfig];
