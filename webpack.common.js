/* eslint-disable @typescript-eslint/naming-convention */

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

"use strict";

const path = require("path");
const webpack = require("webpack");
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');

/** @type WebpackConfig */
const extensionConfig = {
  context: path.join(__dirname, "extension"),
  target: "node", // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  entry: "./src/extension.node.ts", // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    uniqueName: "betonquest_extension",
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, "extension", "dist"),
    filename: "extension.js",
    libraryTarget: "commonjs2",
  },
  externals: {
    vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vscodeignore file
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: [".ts", ".js", ".json"],
    plugins: [new TsconfigPathsPlugin({
      configFile: path.join(__dirname, "extension", "tsconfig.json"),
    })]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              projectReferences: true
            }
          },
        ],
      },
    ],
  },
};

/** @type WebpackConfig */
const webExtensionConfig = {
  context: path.join(__dirname, "extension"),
  target: 'webworker', // extensions run in a webworker context
  entry: './src/extension.web.ts',
  output: {
    uniqueName: "betonquest_extension",
    filename: 'extension.js',
    path: path.resolve(__dirname, "extension", "dist", "web"),
    libraryTarget: 'commonjs',
    devtoolModuleFilenameTemplate: '../../[resource-path]'
  },
  resolve: {
    mainFields: ['browser', 'module', 'main'], // look for `browser` entry point in imported node modules
    extensions: ['.ts', '.js', ".json"], // support ts-files and js-files
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
    },
    plugins: [new TsconfigPathsPlugin({
      configFile: path.join(__dirname, "extension", "tsconfig.json"),
    })]
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      use: [{
        loader: 'ts-loader',
        options: {
          projectReferences: true
        }
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

/** @type WebpackConfig */
const webviewConfig = {
  context: path.join(__dirname, "webview"),
  target: "web",

  entry: {
    // exampleEditor: "./src/exampleEditor/index.tsx",
    conversationEditor: "./src/conversationEditor/index.tsx",
    eventsEditor: "./src/eventsEditor/index.tsx",
    conditionsEditor: "./src/conditionsEditor/index.tsx",
    objectivesEditor: "./src/objectivesEditor/index.tsx",
    packageEditor: "./src/packageEditor/index.tsx",
  }, // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  optimization: {
    splitChunks: {
      minSize: 0,
      cacheGroups: {
        // test: {
        //   test: async (module) => {
        //     if (module.resource.includes("betonquest")) {
        //       // for (let i = 0; i < 1000; i++) {
        //         console.log("module:", module.resource);
        //       // }
        //       console.log("wait...");
        //       await new Promise(r => setTimeout(r, 2000));
        //     }
        //     // console.log("module:", module.resource);
        //     return false;
        //   },
        // },
        // All other BQ YAML models
        utilsBetonquest: {
          test: /[\\/]utils[\\/]src[\\/]betonquest[\\/](?!v\d)/,
          name: "utils/betonquest",
          chunks: "all",
        },
        // Element Lists for BQ v1
        utilsBetonquest_v1: {
          test: /[\\/]utils[\\/]src[\\/]betonquest[\\/]v1[\\/]/,
          name: "utils/betonquest_v1",
          chunks: "all",
        },
        // Element Lists for BQ v2
        utilsBetonquest_v2: {
          test: /[\\/]utils[\\/]src[\\/]betonquest[\\/]v2[\\/]/,
          name: "utils/betonquest_v2",
          chunks: "all",
        },
        // Bukkit API, Entity list etc
        utilsBukkit: {
          test: /[\\/]utils[\\/]src[\\/]bukkit[\\/]/,
          name: "utils/bukkit",
          chunks: "all",
        },
        // Translations
        utilsI18n: {
          test: /[\\/]utils[\\/]src[\\/]i18n[\\/]/,
          name: "utils/i18n",
          chunks: "all",
        },
        // UI components for Element List editing
        utilsUiInput: {
          test: /[\\/]utils[\\/]src[\\/]ui[\\/]Input[\\/]/,
          name: "utils/ui_input",
          chunks: "all",
        },
        // Style overrides for Ant Design components
        utilsUiStyle: {
          test: /[\\/]utils[\\/]src[\\/]ui[\\/]style[\\/]/,
          name: "utils/ui_style",
          chunks: "all",
        },
        // YAML utilities
        utilsYaml: {
          test: /[\\/]utils[\\/]src[\\/]yaml[\\/]/,
          name: "utils/yaml",
          chunks: "all",
        },
        // Layout components for conversation eiting, includes Drawer, Sider etc
        viewComponents: {
          test: /[\\/]webview[\\/]src[\\/]components[\\/]/,
          name: "view/components",
          chunks: "all",
        },
        // Legacy Element List editor
        viewLegacyListEditor: {
          test: /[\\/]webview[\\/]src[\\/](?:legacyList|conditions|events|objectives)Editor[\\/]/,
          name: "view/legacyListEditor",
          chunks: "all",
        },
        // Conversation editor
        viewConversationEditor: {
          test: /[\\/]webview[\\/]src[\\/]conversationEditor[\\/]/,
          name: "view/conversationEditor",
          chunks: "all",
        },
        // Package editor
        viewPackageEditor: {
          test: /[\\/]webview[\\/]src[\\/]packageEditor[\\/]/,
          name: "view/packageEditor",
          chunks: "all",
        },
        // all other node_modules
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "lib/vendor",
          chunks: "all",
        },
      },
    },
  },
  output: {
    uniqueName: "betonquest_webview",
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    // path: path.resolve(__dirname, 'dist', 'extension'),
    // filename: 'extension.js',
    // libraryTarget: 'commonjs2'
    path: path.resolve(__dirname, "webview", "dist"),
    filename: "[name].js",
    // library: {
    //   type: "var",
    //   name: "[name]"
    // }
  },
  externals: {
    vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vscodeignore file
    "react": "React",
    "react-dom": "ReactDOM",
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: [".ts", ".js", ".tsx", ".jsx", ".json", ".css"],
    plugins: [new TsconfigPathsPlugin({
      configFile: path.join(__dirname, "webview", "tsconfig.json"),
    })]
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              projectReferences: true
            }
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
const lspServerNodeConfig = {
  context: path.join(__dirname, 'server'),
  mode: 'none',
  target: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  entry: './src/server.node.ts',
  output: {
    filename: 'server.node.js',
    path: path.join(__dirname, "server", "dist"),
    library: {
      name: 'betonquest_server',
      type: "var"
      // type: "commonjs2"
    },
  },
  resolve: {
    mainFields: ['module', 'main'],
    extensions: ['.ts', '.js', ".tsx", ".jsx", ".json"], // support ts-files and js-files
    alias: {},
    fallback: {
      //path: require.resolve("path-browserify")
    },
    plugins: [new TsconfigPathsPlugin({
      configFile: path.join(__dirname, "server", "tsconfig.json"),
    })]
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              projectReferences: true
            }
          },
        ],
      },
    ],
  },
  externals: {
    vscode: 'commonjs vscode', // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vscodeignore file
  },
};

/** @type WebpackConfig */
const lspServerWebConfig = {
  context: path.join(__dirname, 'server'),
  mode: 'none',
  target: 'webworker', // web extensions run in a webworker context
  entry: './src/server.web.ts',
  output: {
    filename: 'server.web.js',
    path: path.join(__dirname, "server", "dist"),
    library: {
      name: 'betonquest_server',
      type: 'var'
    },
  },
  resolve: {
    mainFields: ['module', 'main'],
    extensions: ['.ts', '.js', ".tsx", ".jsx", ".json"], // support ts-files and js-files
    alias: {},
    fallback: {
      //path: require.resolve("path-browserify")
    },
    plugins: [new TsconfigPathsPlugin({
      configFile: path.join(__dirname, "server", "tsconfig.json"),
    })]
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              projectReferences: true
            }
          },
        ],
      },
    ],
  },
  externals: {
    vscode: 'commonjs vscode', // ignored because it doesn't exist
  },
  performance: {
    hints: false,
  },
};

module.exports = [extensionConfig, webExtensionConfig, webviewConfig, lspServerNodeConfig, lspServerWebConfig];
