---
title: Laravel - RESTful Resource Controllers
slug: laravel-restful-resource-controllers
pubDate: 2016-04-13T00:24:00.000+08:00
author: a7612626
tags: []
updatedDate: 2016-07-28T21:35:25.000+08:00
excerpt: "[vc_row][vc_column][vc_column_text] > 重要！！本篇屬於理論性質，由於前篇的錯誤示範，本篇無法完成 (看看就好) 原文 [https://laravel.tw/docs/5.2/controllers#restful-resource-controllers] 今天學長跟我提到了路由的部分可以使用resource來做， 我是知道的，但是對於瀏覽器來說，它本身看不懂， 所以要在Form表單中加入_method(參考資料 [http://stackoverflow.com/questions/8054165/using-put-method-in-html-form])。 以PUT(update所使用的method)以及我們昨天的表單為範例： 姓名： 電話： {{ csrf_field() }} app\\Http\\routes.php： 把昨天的路由全部以這行來取代： <code class=\"EnlighterJSRAW\" data-enlighter-language=\"php\">Route::resource('/', 'Te"
---

\[vc\_row\]\[vc\_column\]\[vc\_column\_text\]

> **重要！！本篇屬於理論性質，由於前篇的錯誤示範，本篇無法完成**
> 
> **(看看就好)**

[原文](https://laravel.tw/docs/5.2/controllers#restful-resource-controllers)

今天學長跟我提到了路由的部分可以使用resource來做，

我是知道的，但是對於瀏覽器來說，它本身看不懂，

所以要在Form表單中加入\_method([參考資料](http://stackoverflow.com/questions/8054165/using-put-method-in-html-form))。

以PUT(update所使用的method)以及我們昨天的表單為範例：

姓名： 電話：  {{ csrf\_field() }} 

app\\Http\\routes.php：

把昨天的路由全部以這行來取代：

`<code class="EnlighterJSRAW" data-enlighter-language="php">Route::resource('/', 'TestController');`

然後在Cmder底下鍵入：

`<code class="EnlighterJSRAW" data-enlighter-language="null">artisan route:list`

會得到這樣的結果：

<!-- removed: dead image https://bgpsekai.thisistap.com/wp-content/uploads/2016/04/1-500x269.png -->

你會發現，id傳不進Controller，Why？

我只能跟你說…看看官方文件吧！

如果要實作，需要一個prefix(我覺得應該算prefix啦！)，例如：

`<code class="EnlighterJSRAW" data-enlighter-language="php">Route::resource('/test', 'TestController');`

<!-- removed: dead image https://bgpsekai.thisistap.com/wp-content/uploads/2016/04/2-500x269.jpg -->

這樣，昨天的範例會有兩個問題：

1.  表單的action要全部添加prefix
2.  表單的action有部分要修改路徑(update、destroy…等)
3.  ~TestController內的$id要修改成$test~

其實還有另一套軟體可以測試，就是[Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop)，

可以讓你省去修改表單的麻煩，直接使用Postman來測試。

[教學](http://blog.roachking.net/blog/2012/11/07/postman-restful-client/)

~*對不起，我是懶人，我很慚愧，做了錯誤示範還這樣草草帶過*~

7.28 感動 5.2的文件大致上中文化了\[/vc\_column\_text\]\[/vc\_column\]\[/vc\_row\]
