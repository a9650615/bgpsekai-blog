---
title: LARAVEL + JWT
slug: laravel-jwt
pubDate: 2016-07-28T17:06:45.000+08:00
author: a7612626
tags:
  - laravel
  - tutorial
updatedDate: 2016-10-18T11:33:24.000+08:00
excerpt: "[vc_row][vc_column][vc_column_text]什麼是JWT [https://jwt.io/]？ 簡單來說就是JSON Web Tokens 今天，我登入了，就會收到一組token，然而我再拿著這組token繼續去要資料，當然也包括身分的識別，而且這組token是有時間限制的，當token過期，就必須重新登入。 JWT本身是極為輕巧的規範，有乖乖點進第一行的超連結的同學就會知道它有多輕巧。 今天我們就來使用Laravel [https://laravel.tw/]來實作，若還不認識Laravel的同學請轉向 [https://bgpsekai.thisistap.com/tutorials/2016/04/laravel-%E5%95%9F%E7%A8%8B/]。 必備環境：Laravel、composer、Apache或其他Web Server、MySQL、PHP、Postman 當然，Wagon [http://www.laravel-dojo.com/opensource/wagon] 都幫我們準備好了，使用其他環境也是可以的，當然也能在現"
---

\[vc\_row\]\[vc\_column\]\[vc\_column\_text\]什麼是[JWT](https://jwt.io/)？

簡單來說就是JSON Web Tokens

今天，我登入了，就會收到一組token，然而我再拿著這組token繼續去要資料，當然也包括身分的識別，而且這組token是有時間限制的，當token過期，就必須重新登入。

JWT本身是極為輕巧的規範，有乖乖點進第一行的超連結的同學就會知道它有多輕巧。

今天我們就來使用[Laravel](https://laravel.tw/)來實作，若還不認識Laravel的同學請[轉向](https://bgpsekai.thisistap.com/tutorials/2016/04/laravel-%E5%95%9F%E7%A8%8B/)。

必備環境：Laravel、composer、Apache或其他Web Server、MySQL、PHP、Postman

當然，[Wagon](http://www.laravel-dojo.com/opensource/wagon)都幫我們準備好了，使用其他環境也是可以的，當然也能在現成的環境上增加。

[Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop)是一款可以用來測試GET、POST、UPDATE、DELETE等Restful API的工具。

進入正題：

1.利用commanad line來new一個專案並安裝JWT

composer create-project laravel/laravel JWTExam "5.2.\*" cd JWTExam composer require tymon/jwt-auth

筆者使用版本：Laravel 5.2 tymon/jwt-auth 0.5.9

2.  建立資料庫以及修改.env的DB部分
    
3.  common line: `<code class="EnlighterJSRAW" data-enlighter-language="null">artisan migrate`
    
4.  config\\app.php
    

'providers' => \[ ..., Tymon\\JWTAuth\\Providers\\JWTAuthServiceProvider::class \]

'aliases' => \[ ..., 'JWTAuth' => Tymon\\JWTAuth\\Facades\\JWTAuth::class, 'JWTFactory' => Tymon\\JWTAuth\\Facades\\JWTFactory::class \]

5.  command line: `<code class="EnlighterJSRAW" data-enlighter-language="null">artisan vendor:publish --provider="Tymon\JWTAuth\Providers\JWTAuthServiceProvider"`
    
6.  生成JWT KEY
    

command line: `<code class="EnlighterJSRAW" data-enlighter-language="null">artisan jwt:generate`

7.  我們使用內建的user model與users資料表來試做

建立seed來模擬資料

database\\seeds\\DatabaseSeeder.php

'test', 'email' => 'test@test.com', 'password' => Hash::make('secret') \] ); } } command line: \```````` artisan db:seed` (建立完記得檢查是否成功) 8. app\Http\Kernel.php protected $routeMiddleware = [ ..., 'jwt.auth' => \Tymon\JWTAuth\Middleware\GetUserFromToken::class, 'jwt.refresh' => \Tymon\JWTAuth\Middleware\RefreshToken::class ]; 9. 建立路由 app\Http\routes.php Route::group(['prefix' => 'api'], function() { Route::get('auth', 'AuthController@index'); Route::post('auth', 'AuthController@auth'); }); 10. 建立controller `````` artisan make:controller AuthController` app\Http\Controllers\AuthController.php (路徑不要錯了) only('email', 'password'); try { if (! $token = JWTAuth::attempt($credentials)) { return response()->json(['error' => 'invalid_credentials'], 401); } } catch (JWTException $e) { return response()->json(['error' => 'could_not_create_token'], 500); } return response()->json(compact('token')); } public function __construct() { $this->middleware('jwt.auth', ['except' => ['auth']]); } public function index() { return response()->json(Auth::user()->all()); } } 11. 開啟Postman進行測試 (建議先在command line: ```` artisan route:list `看看有沒有錯誤訊息) <!-- removed: dead image https://bgpsekai.thisistap.com/wp-content/uploads/2016/07/1-500x270.png --> 這個是沒有經過驗證的結果 我們現在來取得token <!-- removed: dead image https://bgpsekai.thisistap.com/wp-content/uploads/2016/07/2-500x270.png --> 這個代表沒有經過Laravel的[csrf](https://laravel.tw/docs/5.2/routing#csrf-protection)認證(這邊就不贅述了) 讓我們把csrf關閉 在app\Http\Kernel.php找到這行，並且註解 ` ``\App\Http\Middleware\VerifyCsrfToken::class,` <!-- removed: dead image https://bgpsekai.thisistap.com/wp-content/uploads/2016/07/3-500x270.png --> 出現此錯誤代表email或password錯誤 <!-- removed: dead image https://bgpsekai.thisistap.com/wp-content/uploads/2016/07/4-500x270.png --> 這樣子就可以得到token了 接下來將這token這樣使用(如網址列) <!-- removed: dead image https://bgpsekai.thisistap.com/wp-content/uploads/2016/07/5-500x270.png --> 如此，我們就能取得想要的資料了   ※圖中有切換GET與POST   另外，如果有同學想利用ajax來獲得資料的話會遇上cors的錯誤(如圖) <!-- removed: dead image https://bgpsekai.thisistap.com/wp-content/uploads/2016/07/6-500x194.png --> 我們將在[這篇文章](https://bgpsekai.thisistap.com/tutorials/laravel/2016/07/laravel-cors/)講解如何解決   心理OS: TMD又要來測試這篇文章的完整性，重run一次…(趴   參考文章： http://blog.qiji.tech/archives/4091[/vc_column_text][/vc_column][/vc_row]`` ``` ````` ```````
