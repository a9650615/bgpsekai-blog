---
title: LARAVEL CORS
slug: laravel-cors
pubDate: 2016-07-28T17:29:33.000+08:00
author: a7612626
tags:
  - laravel
updatedDate: 2018-06-06T07:10:33.000+08:00
excerpt: "[vc_row][vc_column][vc_column_text] 如果我使用了Laravel當後端，然而在前端使用ajax呼叫時遇上這個錯誤該怎麼辦？ 這篇文章教你如何解決！ 這是因為一個cors的機制，Laravel預設會阻擋非同網域、甚至是port的請求。 假設我從localhost:3000想要透過ajax取得localhost:8000的資料，會被擋住，why？ 因為你們不同網域嘛，這也是為了安全性之類的顧慮。 首先，我們建立一個中介層 [https://laravel.tw/docs/5.2/middleware]，command line:<code class=\"EnlighterJSRAW\" data-enlighter-language=\"null\">artisan make:middleware Cors app\\Http\\Middleware\\cors header('Access-Control-Allow-Origin', '*') ->header('Access-Control-Allow-Methods', 'GET,"
---

\[vc\_row\]\[vc\_column\]\[vc\_column\_text\]![6](https://bgpsekai.thisistap.com/wp-content/uploads/2016/07/6-1-500x194.png)

如果我使用了Laravel當後端，然而在前端使用ajax呼叫時遇上這個錯誤該怎麼辦？

這篇文章教你如何解決！

這是因為一個cors的機制，Laravel預設會阻擋非同網域、甚至是port的請求。

假設我從localhost:3000想要透過ajax取得localhost:8000的資料，會被擋住，why？

因為你們不同網域嘛，這也是為了安全性之類的顧慮。

首先，我們建立一個[中介層](https://laravel.tw/docs/5.2/middleware)，command line: `<code class="EnlighterJSRAW" data-enlighter-language="null">artisan make:middleware Cors`

app\\Http\\Middleware\\cors

header('Access-Control-Allow-Origin', '\*') ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS'); } } app\\Http\\Kernal.php protected $routeMiddleware = \[ 'cors' => \\App\\Http\\Middleware\\Cors::class, \]; 順便關了\[csrf\](https://laravel.tw/docs/5.2/routing#csrf-protection) 找到這行並註解\```\App\Http\Middleware\VerifyCsrfToken::class,` 然後在你所需要的路由上使用中介層(我就用[上篇](https://bgpsekai.thisistap.com/tutorials/laravel/2016/07/laravel-jwt/)來做了) Route::group(['prefix' => 'api', 'middleware' => 'cors'], function() { Route::get('auth', 'AuthController@index'); Route::post('auth', 'AuthController@auth'); }); 路由表如下(會在中介層出現cors) ![1](https://bgpsekai.thisistap.com/wp-content/uploads/2016/07/1-1-500x270.png)   然後就成功了 ![2](https://bgpsekai.thisistap.com/wp-content/uploads/2016/07/2-1-489x500.png) 能從jquery官網直接抓到本機的api資料也是滿狂的啊     參考文章： http://en.vedovelli.com.br/2015/web-development/Laravel-5-1-enable-CORS/[/vc_column_text][/vc_column][/vc_row]``
