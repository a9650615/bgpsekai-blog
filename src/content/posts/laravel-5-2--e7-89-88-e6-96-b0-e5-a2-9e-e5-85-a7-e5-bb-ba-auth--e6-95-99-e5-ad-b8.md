---
title: "Laravel - 5.2 版新增內建 auth 教學"
slug: laravel-5-2--e7-89-88-e6-96-b0-e5-a2-9e-e5-85-a7-e5-bb-ba-auth--e6-95-99-e5-ad-b8
pubDate: 2016-04-14T08:14:37.000+08:00
author: a9650615
tags: []
updatedDate: 2016-04-14T09:50:21.000+08:00
excerpt: "[vc_row][vc_column][vc_column_text]剛開始接觸 Laravel 時，看到別人的教學文先以內建的 auth (使用者認證) 開始，但怎麼找就是找不到阿，原來在 Laravel 5.0 版以後都需要自己創建。這篇文章就是要介紹如何實作內建的 auth 。 [/vc_column_text][/vc_column][/vc_row][vc_row][vc_column][vc_separator][/vc_column][/vc_row][vc_row][vc_column][vc_column_text]查詢了一些文章後，發現到 Laravel 把這功能藏到 artisan 指令列去了，只要呼叫以下指令即可呼叫出相關組件。 > <code class=\"EnlighterJSRAW\" data-enlighter-language=\"null\">artisan make:auth 接下來就會看到它自動生成的項目。 [https://birdyo.ddns.net/blog/tutorials/2016/04/laravel-5-2-%e7%8"
---

\[vc\_row\]\[vc\_column\]\[vc\_column\_text\]剛開始接觸 Laravel 時，看到別人的教學文先以內建的 auth (使用者認證) 開始，但怎麼找就是找不到阿，原來在 Laravel 5.0 版以後都需要自己創建。這篇文章就是要介紹如何實作內建的 auth 。

\[/vc\_column\_text\]\[/vc\_column\]\[/vc\_row\]\[vc\_row\]\[vc\_column\]\[vc\_separator\]\[/vc\_column\]\[/vc\_row\]\[vc\_row\]\[vc\_column\]\[vc\_column\_text\]查詢了一些文章後，發現到 Laravel 把這功能藏到 artisan 指令列去了，只要呼叫以下指令即可呼叫出相關組件。

> `<code class="EnlighterJSRAW" data-enlighter-language="null">artisan make:auth`

接下來就會看到它自動生成的項目。

<!-- removed: dead image https://birdyo.ddns.net/blog/wp-content/uploads/2016/04/image-2016-04-14-1-500x170.png -->

接下來到 \*\*route.php \*\*，就會發現到底下自動添加了兩行。<!-- removed: dead image https://birdyo.ddns.net/blog/wp-content/uploads/2016/04/image-2016-04-14-001.png -->

再遷移 (migrate) 資料庫

接下來只要到 [http://你的網址/home](http://xn--6qqv5qbo2ac9f/home) 就會看到你想要的

<!-- removed: dead image https://birdyo.ddns.net/blog/wp-content/uploads/2016/04/image-2016-04-14-002-500x128.png -->

這樣基本上就完成了auth的實作

\[/vc\_column\_text\]\[/vc\_column\]\[/vc\_row\]\[vc\_row\]\[vc\_column\]\[vc\_text\_separator title=”進階”\]\[/vc\_column\]\[/vc\_row\]\[vc\_row\]\[vc\_column\]\[vc\_column\_text\]但總有某些東西感覺不太直覺，現在的模式是先經由 route 啟用 auth 並且再呼叫 /home 後，再經由 home Controller 的建構式去呼叫中介層 (middleware) 來進行呼叫 auth 進行驗證(如下圖)。

<!-- removed: dead image https://birdyo.ddns.net/blog/wp-content/uploads/2016/04/image-2016-04-14-003-347x500.png -->但我想試著在 route 就先切換至中介層進行處理，這就是接下來的目標。\[/vc\_column\_text\]\[/vc\_column\]\[/vc\_row\]\[vc\_row\]\[vc\_column\]\[vc\_column\_text\]所以我們的手先目標就是先為 route 指派 middleware (詳見:[5.1 中文連結](https://laravel.tw/docs/5.1/routing#route-group-middleware))

Route::auth(); Route::group(\['middleware' => 'auth'\], function () { Route::get('/home', 'HomeController@index'); });

\[/vc\_column\_text\]\[vc\_message message\_box\_color=”pink” icon\_fontawesome=”fa fa-exclamation-triangle”\]警告 Route::auth(); 務必要放在前面才會載入相關功能。

否則只會出現一個 \*\*NotFoundHttpException \*\*錯誤\[/vc\_message\]\[/vc\_column\]\[/vc\_row\]
