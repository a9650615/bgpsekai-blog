---
title: "Laravel 5.4 Events 事件系統"
slug: laravel-5-4-events--e4-ba-8b-e4-bb-b6-e7-b3-bb-e7-b5-b1
pubDate: 2017-07-25T19:43:11.000+08:00
author: a7612626
tags: []
updatedDate: 2017-07-25T19:50:33.000+08:00
excerpt: "請先準備該有的東西（Web server、MySQL、PHP…） 今天要講的版本是5.4，所以請先備妥 5.4跟5.3的事件觸發是一樣的，不過會跟5.2的有所差異（從fire到不用fire、預設事件的使用） 拿官方範例好了，這是觸發的程式碼 5.2 <code class=\"EnlighterJSRAW\" data-enlighter-language=\"php\">Event::fire(new PodcastWasPurchased($podcast)); 5.3 or later <code class=\"EnlighterJSRAW\" data-enlighter-language=\"php\">event(new PodcastWasPurchased($podcast)); 還有我踩到的那個預設事件的雷我就不說了… 然後從5.3以後都是把broadcasting從events拆出來，所以我們要講的只是最最基本的events 我們先從預設事件開始（如使用者登入） 要拿使用者登入做什麼呢？ 就來記錄登入ip吧！ 一定會有人想說要做這件事要events"
---

請先準備該有的東西（Web server、MySQL、PHP…）

今天要講的版本是5.4，所以請先備妥

5.4跟5.3的事件觸發是一樣的，不過會跟5.2的有所差異（從fire到不用fire、預設事件的使用）

拿官方範例好了，這是觸發的程式碼

5.2

`<code class="EnlighterJSRAW" data-enlighter-language="php">Event::fire(new PodcastWasPurchased($podcast));`

5.3 or later

`<code class="EnlighterJSRAW" data-enlighter-language="php">event(new PodcastWasPurchased($podcast));`

還有我踩到的那個預設事件的雷我就不說了…

然後從5.3以後都是把broadcasting從events拆出來，所以我們要講的只是最最基本的events

我們先從預設事件開始（如使用者登入）

要拿使用者登入做什麼呢？ 就來記錄登入ip吧！

一定會有人想說要做這件事要events幹嘛？ 不是直接在Controller處理就好了嗎？

對！是沒有錯，可是這樣不是有點奇怪嗎？

以這整件事的邏輯，把使用者登入視為一個事件來另外處理不是好多了？

我可不想讓Controller亂糟糟的… 如果你真心想用Controller來做，那我建議你可以不用看下去了

本篇開始

先到App\\Providers\\EventServiceProvider.php進行註冊

protected $listen = \[ 'Illuminate\\Auth\\Events\\Login' => \[ 'App\\Listeners\\UserLogin', \], \];

之後執行`<code class="EnlighterJSRAW" data-enlighter-language="null">php artisan event:generate`來生成事件的Listener

接下來到App\\Listener\\UserLogin處理事件觸發後的後續

基本上這是預設事件，所以不用去手動觸發

你可以在handle function做很多很多事

例如這個：

request = $request; } /\*\* \* Handle the event. \* \* @param Login $event \* @return void \*/ public function handle(Login $event) { $user = Auth::user(); $user->last\_ip = $this->request->ip(); $user->save(); } }   > 記得去把User Table生出一個last\_ip欄位出來 > > 還要記得php artisan make:auth   這樣就能自動在使用者登入時記錄ip了（其實真的跟Controller做沒什麼兩樣）   再來再來，來一個非預設事件（我很懶，隨便抓一個使用者註冊好了） 一樣照上面的步驟在App\\Providers\\EventServiceProvider.php新增一個 'App\\Events\\UserRegister' => \[ 'App\\Listeners\\UserRegisterListener', \], 然後\````` php artisan event:generate` 這時候你會發現多了一個App\Events\UserRegister.php 這邊照官方的解釋就是很簡單地在裡面注入，這是一個註冊的事件，所以理所當然是注入user user = $user; } /** * Get the channels the event should broadcast on. * * @return Channel|array */ public function broadcastOn() { return new PrivateChannel('channel-name'); } } 就這樣而已，滿簡單的   再來就是一樣在Listener裡面的handle function 這邊簡單的做一個dd就好了 ```dd($event->user);`   接下來很重要的一件事就是，因為這邊我們使用自建事件，所以需要自己去觸發 請找到App\Http\Controllers\Auth\RegisterController.php 也就是註冊的部分，把create function改成這樣   $user = User::create([ 'name' => $data['name'], 'email' => $data['email'], 'password' => bcrypt($data['password']), ]); event(new UserRegister($user)); return $user; > 記得use App\Events\UserRegister; 然後去註冊一個使用者就可以看到我們dd的東西了   資質愚昧的我需要這篇文章來幫忙記住我到底學了什麼，也是幫助別人不要踩雷…`` ````
