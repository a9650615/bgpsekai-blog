---
title: "關於那tymon/jwt-auth升級的大小事（0.5.* => 1.0.0-rc.1）"
slug: -e9-97-9c-e6-96-bc-e9-82-a3tymonjwt-auth-e5-8d-87-e7-b4-9a-e7-9a-84-e5-a4-a7-e5-b0-8f-e4-ba-8b-ef-bc-880-5-1-0-0-rc-1-ef-bc-89
pubDate: 2017-09-14T06:19:46.000+08:00
author: a7612626
tags: []
updatedDate: 2017-09-14T07:12:21.000+08:00
excerpt: "> 警告：適用於更新，新安裝請參照舊文件對照著改 關於這個套件就不多加贅述了，我對它也是又愛又恨啊 這個版本大概是在上個月(8)底發的 1.0.0主要是在修復一些bug（至少我是沒什麼遇到） 基本上是跟Laravel/Lumen的auth做了很大的結合（guard可以正常使用了） 然後也不用use JWTAuth…之類的事情 記得更新的時候把config/app.php的<code class=\"EnlighterJSRAW\">Tymon\\JWTAuth\\Providers\\JWTAuthServiceProvider::class,拿掉 不拿掉的話應該是會不能更上去 然後就開始<code class=\"EnlighterJSRAW\" data-enlighter-language=\"null\">composer require tymon/jwt-auth:^1.0.0-rc.1 套件更新完之後一樣就是在config/app.php新增<code class=\"EnlighterJSRAW\">Tymon\\JWTAuth\\Providers\\Larave"
---

> 警告：適用於更新，新安裝請參照舊文件對照著改

關於這個套件就不多加贅述了，我對它也是又愛又恨啊

這個版本大概是在上個月(8)底發的

1.0.0主要是在修復一些bug（至少我是沒什麼遇到）

基本上是跟Laravel/Lumen的auth做了很大的結合（guard可以正常使用了）

然後也不用use JWTAuth…之類的事情

記得更新的時候把config/app.php的`<code class="EnlighterJSRAW">Tymon\JWTAuth\Providers\JWTAuthServiceProvider::class,`拿掉

不拿掉的話應該是會不能更上去

然後就開始`<code class="EnlighterJSRAW" data-enlighter-language="null">composer require tymon/jwt-auth:^1.0.0-rc.1`

套件更新完之後一樣就是在config/app.php新增`<code class="EnlighterJSRAW">Tymon\JWTAuth\Providers\LaravelServiceProvider::class,`

刪除或備份原設定app/jwt.php

然後發布`<code class="EnlighterJSRAW" data-enlighter-language="null">php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\JWTAuthServiceProvider"`

基本上中介沒有改（我實測是沒有，不過有人說有）

然後到config/auth.php裡面找到對應的guard修改driver成jwt(session => jwt)

之後就是Model的部分需要一些大變動

use Tymon\\JWTAuth\\Contracts\\JWTSubject; class User extends Authenticatable implements JWTSubject

/\*\* \* Get the identifier that will be stored in the subject claim of the JWT \* \* @return mixed */ public function getJWTIdentifier(){ return $this->getKey(); } /*\* \* Return a key value array, containing any custom claims to be added to the JWT \* \* @return array \*/ public function getJWTCustomClaims(){ return \[\]; }

大概就是這樣，上面其實都有詳述作用

最後就是把JWTAuth::attempt($…)改成原本預設的Auth::attempt($…) <-還是會吐token

當然guard()是可以被允許的

對了，記得`<code class="EnlighterJSRAW" data-enlighter-language="null">php artisan jwt:secret`一下，現在不允許沒有生成jwt key了

完.
