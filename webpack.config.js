const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerNotifierWebpackPlugin = require("fork-ts-checker-notifier-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = (env, argv) => {

  const config = {
    devtool: "source-map",
    entry: path.join(__dirname, "src/index.js"),
    output: {
      path: path.join(__dirname, "dist"),
      filename: "[name].[hash].js",
      //publicPath: "files://asset/",
      globalObject: "this",
      library: 'WebpackTest',
      libraryTarget: 'umd',
    },
    externals: {
      L: 'L'
    },
    resolve: {
      extensions: [".js", ".json"],
    },
    module: {
      rules: [
        {
          test: /\.(css|less)$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                // you can specify a publicPath here
                // by default it use publicPath in webpackOptions.output
                publicPath: "../",
              },
            },
            "css-loader",
            "less-loader",
          ],
        },
        // {
        //   test: /\.tsx?$/,
        //   use: [
        //     // babelLoader,
        //     {
        //       loader: "ts-loader",
        //       options: {
        //         transpileOnly: true,
        //         projectReferences: true,
        //       },
        //     },
        //   ],
        //   exclude: /node_modules/,
        // },
        {
          test: /\.(png|jpg|gif|otf|svg)$/,
          use: [
            {
              loader: "url-loader",
              options: {
                limit: 8192,
                fallback: "file-loader",
                outputPath: "asset",
                name: "[name].[ext]?hash=[hash]",
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin({}),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: "styles/[name].[hash].css",
        chunkFilename: "styles/[id].[hash].css",
      }),
      new HtmlWebPackPlugin({
        // inject: false,
        // chunks: ['renderer', 'vendors'],
        // excludeChunks: ['rendererScreenshot'],
        template: "./index.html",
        filename: "./index.html",
        inlineSource: '.(js|css)$' // embed all javascript and css inline
      }),
      new HtmlWebpackInlineSourcePlugin(HtmlWebPackPlugin)
    ],
    devServer: {
      lazy: false,
      contentBase: path.join(__dirname, "dist"),
      compress: false,
      port: 9000,
      hot: true,
      watchOptions: {
        ignored: [/node_modules/, /appconfig.*\.json/],
      },
      host:"0.0.0.0",
    },
  };

  let defineds = {
    version: process.env.npm_package_version,
  };

  config.mode = argv.mode;

  if (argv.mode === "development") {
    console.log("development mode");
    if (argv.remoteDevPort || argv.remoteDevHost) {
      defineds["remote_dev"] = {
        port: argv.remoteDevPort,
        host: argv.remoteDevHost,
      };
    }
    defineds["development"] = {};
  }

  console.log("argv.appConfig=", argv.appConfig);

  config.plugins.push(
    new webpack.DefinePlugin({
      __GLOBAL_DEFINES: JSON.stringify(defineds),
      __AppConfig: argv.appConfig,
    })
  );

  return config;
};