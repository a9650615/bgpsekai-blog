---
title: "scss 從零開始學習中"
slug: scss--e5-be-9e-e9-9b-b6-e9-96-8b-e5-a7-8b-e5-ad-b8-e7-bf-92-e4-b8-ad
pubDate: 2016-05-26T10:51:16.000+08:00
author: a9650615
tags:
  - css
  - scss
updatedDate: 2016-05-26T11:05:50.000+08:00
excerpt: "[vc_row][vc_column][vc_column_text]scss 是後期的 sass 具有css的語法結構(和sass差很多)和程式的概念 可以用更簡單的作法做出一樣的效果，但花的時間就ㄏㄏ 這眼鏡長的真突兀（X 目前學習到的功能有這些 因該也是最常用的 [/vc_column_text][/vc_column][/vc_row][vc_row][vc_column][vc_text_separator title=”變數(Variables)”][vc_column_text]scss的變數命名好像和php一樣 不過不是用等號而是用css的： 用法 $white: #ffffff; body{ color: $white; } 編譯完後將會自動套用 [/vc_column_text][/vc_column][/vc_row][vc_row][vc_column][vc_text_separator title=”嵌套(Nesting)”][vc_column_text]個人感覺很好用的一個功能 這就像是用sql做子查詢一樣狂 可以透過巢狀結"
---

\[vc\_row\]\[vc\_column\]\[vc\_column\_text\]scss 是後期的 sass

具有css的語法結構(和sass差很多)和程式的概念

可以用更簡單的作法做出一樣的效果，但花的時間就ㄏㄏ

<!-- removed: dead image https://birdyo.ddns.net/blog/wp-content/uploads/2016/05/yooo-500x235.png -->

這眼鏡長的真突兀（X

目前學習到的功能有這些

因該也是最常用的

\[/vc\_column\_text\]\[/vc\_column\]\[/vc\_row\]\[vc\_row\]\[vc\_column\]\[vc\_text\_separator title=”變數(Variables)”\]\[vc\_column\_text\]scss的變數命名好像和php一樣

不過不是用等號而是用css的：

用法

$white: #ffffff; body{ color: $white; }

編譯完後將會自動套用

\[/vc\_column\_text\]\[/vc\_column\]\[/vc\_row\]\[vc\_row\]\[vc\_column\]\[vc\_text\_separator title=”嵌套(Nesting)”\]\[vc\_column\_text\]個人感覺很好用的一個功能

這就像是用sql做子查詢一樣狂

可以透過巢狀結構進行篩選

並編譯出最簡易的css

h1{ padding: 5px; h2{ color: #ccc; } }

\[/vc\_column\_text\]\[/vc\_column\]\[/vc\_row\]\[vc\_row\]\[vc\_column\]\[vc\_text\_separator title=”函式(Mixins)”\]\[vc\_column\_text\]就像是程式語言中的function

使用方法為

> @mixin 名稱($參數)

然後就可以透過\*\*@include\*\*去呼叫\[/vc\_column\_text\]\[/vc\_column\]\[/vc\_row\]\[vc\_row\]\[vc\_column\]\[vc\_text\_separator title=”繼承(Extend)”\]\[/vc\_column\]\[/vc\_row\]\[vc\_row\]\[vc\_column\]\[vc\_column\_text\]可以直接在其他群組直接呼叫其他群組

即可共用其他群組功能

> @extend 其他群組即可

不知道繼承嵌套再加群組再加函式的子群組會怎樣(X\[/vc\_column\_text\]\[/vc\_column\]\[/vc\_row\]
