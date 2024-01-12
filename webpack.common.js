/* eslint-disable @typescript-eslint/naming-convention */
//@ts-check

"use strict";

const path = require("path");
const webpack = require("webpack");

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: "node", // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  entry: "./src/extension.ts", // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, "dist"),
    filename: "extension.js",
    libraryTarget: "commonjs2",
  },
  externals: {
    vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vscodeignore file
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
};

/** @type WebpackConfig */
const reactConfig = {
  target: "web",

  // entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  entry: {
    // exampleEditor: "./src/view/exampleEditor/index.tsx",
    conversationEditor: "./src/view/conversationEditor/index.tsx",
    eventsEditor: "./src/view/eventsEditor/index.tsx",
    conditionsEditor: "./src/view/conditionsEditor/index.tsx",
    objectivesEditor: "./src/view/objectivesEditor/index.tsx",
    packageEditor: "./src/view/packageEditor/index.tsx",
  }, // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  optimization: {
    splitChunks: {
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "all",
        },
        betonquest: {
          test: /[\\/]src[\\/]betonquest[\\/]/,
          name: "betonquest",
          chunks: "all",
        },
        bukkit: {
          test: /[\\/]src[\\/]bukkit[\\/]/,
          name: "bukkit",
          chunks: "all",
        },
        i18n: {
          test: /[\\/]src[\\/]i18n[\\/]/,
          name: "i18n",
          chunks: "all",
        },
        utils: {
          test: /[\\/]src[\\/]utils[\\/]/,
          name: "utils",
          chunks: "all",
        },
        viewComponents: {
          test: /[\\/]src[\\/]view[\\/]components[\\/]/,
          name: "view/components",
          chunks: "all",
        },
        viewLegacyListEditor: {
          test: /[\\/]src[\\/]view[\\/]legacyListEditor[\\/]/,
          name: "view/legacyListEditor",
          chunks: "all",
        },
        viewStyle: {
          test: /[\\/]src[\\/]view[\\/]style[\\/]/,
          name: "view/style",
          chunks: "all",
        },
      },
    },
  },
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    // path: path.resolve(__dirname, 'dist'),
    // filename: 'extension.js',
    // libraryTarget: 'commonjs2'
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    // library: {
    //   type: "var",
    //   name: "[name]"
    // }
  },
  externals: {
    vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vscodeignore file
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: [".ts", ".js", ".tsx", ".jsx", ".css"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
        ],
      },
      {
        test: /\.module\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-modules-typescript-loader",
          },
          {
            loader: "css-loader",
            options: { modules: true },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      process: {
        env: {
          LOG_TOKENS: undefined
        }
      }
    })
  ]
};

/** @type WebpackConfig */
const webExtensionConfig = {
  target: 'webworker', // extensions run in a webworker context
  entry: {
    'extension': './src/extension.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist/web'),
    libraryTarget: 'commonjs',
    devtoolModuleFilenameTemplate: '../../[resource-path]'
  },
  resolve: {
    mainFields: ['browser', 'module', 'main'], // look for `browser` entry point in imported node modules
    extensions: ['.ts', '.js'], // support ts-files and js-files
    alias: {
      // provides alternate implementation for node module and source files
    },
    fallback: {
      // Webpack 5 no longer polyfills Node.js core modules automatically.
      // see https://webpack.js.org/configuration/resolve/#resolvefallback
      // for the list of Node.js core module polyfills.
      'assert': require.resolve('assert'),
      'path': require.resolve('path-browserify'),
      // 'process': require.resolve('process/browser'),
      'process/browser': require.resolve('process/browser'),
    }
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      use: [{
        loader: 'ts-loader'
      }]
    }]
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1 // disable chunks by default since web extensions must be a single bundle
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser', // provide a shim for the global `process` variable
    }),
  ],
  externals: {
    'vscode': 'commonjs vscode', // ignored because it doesn't exist
  },
  performance: {
    hints: false
  },
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
};

module.exports = [extensionConfig, reactConfig, webExtensionConfig];
