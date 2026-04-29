---
title: "一段程式碼了解 React 基礎用法 ( 新手向"
slug: -e4-b8-80-e6-ae-b5-e7-a8-8b-e5-bc-8f-e7-a2-bc-e4-ba-86-e8-a7-a3-react--e5-9f-ba-e7-a4-8e-e7-94-a8-e6-b3-95
pubDate: 2017-01-23T21:31:01.000+08:00
author: a9650615
tags:
  - qing-song-xue-xi
updatedDate: 2017-02-02T06:30:50.000+08:00
excerpt: "[vc_row][vc_column][vc_message]本環境使用 es6 語法及 jsx , 如須本機測試請自行配置編譯環境 ( babel 等等 )[/vc_message][/vc_column][/vc_row][vc_row][vc_column][vc_column_text]先上程式碼範例連結 [https://codepen.io/a9650615/pen/RKVEOq] 本範例功能包含 顯示/隱藏 及添加新元件 先從最底下 React.render 講起，這行的功能在於渲染虛擬元素到 #app 的 div上 Example 元件 Example 這個元件, 裡面包含了 > * react 的 render 函式 * es6 的 class constructor( 建構子 ) * 兩個自定義的 function (_add, toggleShow) 先從 react 的 render 開始，由於 react 的元素是用虛擬元素 ( 官方介紹 [https://facebook.github.io/react/docs/introducing-j"
---

\[vc\_row\]\[vc\_column\]\[vc\_message\]本環境使用 es6 語法及 jsx , 如須本機測試請自行配置編譯環境 ( babel 等等 )\[/vc\_message\]\[/vc\_column\]\[/vc\_row\]\[vc\_row\]\[vc\_column\]\[vc\_column\_text\]先上程式碼 [範例連結](https://codepen.io/a9650615/pen/RKVEOq)

本範例功能包含 顯示/隱藏 及添加新元件

先從最底下 React.render 講起，這行的功能在於渲染虛擬元素到 #app 的 div上

#### Example 元件

Example 這個元件, 裡面包含了

> -   react 的 render 函式
> -   es6 的 class constructor( 建構子 )
> -   兩個自定義的 function (\_add, toggleShow)

先從 react 的 render 開始，由於 react 的元素是用虛擬元素 ( [官方介紹](https://facebook.github.io/react/docs/introducing-jsx.html) ) ，所以元件必須經由 render() 來渲染以及更新，藉由 return 元素來做渲染畫面的功能 ( flux 架構內的 view )。 在 render 的 return 內可藉由 {} 執行返回變數或程式判斷等等操作也可再嵌入虛擬元素。

至於 constructor 則是繼承至 react component 所以要繼承相關參數，因此要**super(props)**  
來繼承，而需要修改到 constructor 的原因則是因為要設定 state 的初始值，state 是拿來儲存元件的狀態用 ( flux 架構內的 store )，因此在此我們需要初始值用來放置 list (列表) 以及 show (是否顯示) 的狀態。

然後剩下的兩個 function \_add, toggleShow 則是用來添加 state list 列表及切換 show 狀態 ( flux 架構內的 action )，並經由 react 提供的 setState 更新 state 並重新 render 。

#### Child 元件

Child 這個元件則是嵌在 Example 元件底下，根據 list state 的來更改數量，並藉由 props 接收由 Example 所傳送給 Child 的 number 參數。

整體大概就這樣，總之如果大概了解了 flux 架構，而且對 js 有一定的概念，react 因該能蠻容易上手的。\[/vc\_column\_text\]\[/vc\_column\]\[/vc\_row\]
