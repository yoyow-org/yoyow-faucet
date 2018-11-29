/**
 * Created by BenJ on 2017/7/17.
 */
"use strict";

var path = require('path');
var webpack = require('webpack');
var fs = require('fs');

var nodeModules = {};

fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = function(env) {
  return {
    devtool: 'cheap-eval-source-map',
    entry: './index.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist')
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: "babel-loader",
          exclude: [/node_modules/],
        }
      ]
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        mangle: {
          except: ['$super', '$', 'exports', 'require']
        },
        compress: {
          warnings: false,
          drop_console: true,
          unused: true,
          sequences: false
        },
        comments: false

      })
    ],
    // 排除不需要打包的nodemodule
    target: 'node',
    // externals: nodeModules
  }
};