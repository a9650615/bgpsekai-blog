---
title: "React es6 webpack 環境懶人包紀錄"
slug: react-es6-webpack--e7-92-b0-e5-a2-83-e6-87-b6-e4-ba-ba-e5-8c-85-e7-b4-80-e9-8c-84
pubDate: 2016-04-16T10:24:32.000+08:00
author: a9650615
tags:
  - es6
  - nodejs
  - webpack
  - lan-ren-bao
updatedDate: 2016-04-16T10:29:00.000+08:00
excerpt: "請確認已安裝webpack npm npm install react react-dom babel-loader babel-preset-es2015 babel-preset-react --save-dev webpack.config.js var path = require('path'); var config = { entry: path.resolve(__dirname, 'resources/assets/js/xxx.js'), output: { path: path.resolve(__dirname, 'public/js'), filename: 'bundle.js' }, resolve: { extensions: ['', '.js', '.jsx'] }, module: { loaders: [ { test: /.jsx?$/, exclude: /node_modules/, loader: 'babel', query: { presets: ['es2015', 'react'] } } ] } }; module.ex"
---

請確認已安裝webpack

npm

npm install react react-dom babel-loader babel-preset-es2015 babel-preset-react --save-dev

webpack.config.js

var path = require('path'); var config = { entry: path.resolve(\_\_dirname, 'resources/assets/js/xxx.js'), output: { path: path.resolve(\_\_dirname, 'public/js'), filename: 'bundle.js' }, resolve: { extensions: \['', '.js', '.jsx'\] }, module: { loaders: \[ { test: /.jsx?$/, exclude: /node\_modules/, loader: 'babel', query: { presets: \['es2015', 'react'\] } } \] } }; module.exports = config;

`<code class="EnlighterJSRAW" data-enlighter-language="null">webpack -w` 即可
