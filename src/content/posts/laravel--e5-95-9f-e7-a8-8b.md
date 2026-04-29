---
title: "Laravel 5.2 - 啟程"
slug: laravel--e5-95-9f-e7-a8-8b
pubDate: 2016-04-12T00:47:57.000+08:00
author: a7612626
tags: []
updatedDate: 2016-12-28T00:51:24.000+08:00
excerpt: "[vc_row][vc_column][vc_column_text]重話講在前頭，沒有PHP背景請勿輕易嘗試。 本文開始 Laravel [https://laravel.tw/]是什麼呢？ Laravel是一款採用PHP的後端MVC框架，然而，我會建議初學者使用Laravel wagon [http://www.laravel-dojo.com/opensource/wagon]所提供的免安裝環境。 Laravel wagon需要 * Visual C++ 可轉散發套件 2012 [http://www.microsoft.com/zh-tw/download/details.aspx?id=30679] * Visual C++ 可轉散發套件 2015 [https://www.microsoft.com/zh-TW/download/details.aspx?id=48145] * 下載 wagon [https://github.com/laravel-dojo/wagon/releases/download/1.3.0/wagon-rele"
---

\[vc\_row\]\[vc\_column\]\[vc\_column\_text\]重話講在前頭，沒有PHP背景請勿輕易嘗試。

本文開始

[Laravel](https://laravel.tw/)是什麼呢？

Laravel是一款採用PHP的後端MVC框架，然而，我會建議初學者使用[Laravel wagon](http://www.laravel-dojo.com/opensource/wagon)所提供的免安裝環境。

Laravel wagon需要

-   [Visual C++ 可轉散發套件 2012](http://www.microsoft.com/zh-tw/download/details.aspx?id=30679)
-   [Visual C++ 可轉散發套件 2015](https://www.microsoft.com/zh-TW/download/details.aspx?id=48145)
-   下載 [wagon](https://github.com/laravel-dojo/wagon/releases/download/1.3.0/wagon-release-1.3.0.zip) (1.3.0)

下載完成之後把wagon解壓縮至欲放置的位置，然後，讓我們開始吧！

請先開啟你的UwAmp (一套標準的Windows Apache MySQL PHP Server)

路徑為：wagon\\uwamp\\UwAmp.exe

確認你的Apache與MySql處於Running狀態(如果沒有的話，請嘗試安裝Visual C++ 2012 2015 x86版本)，

在瀏覽器上連結至[http://localhost:8000/](http://localhost:8000/)或[http://127.0.0.1:8000/](http://127.0.0.1:8000/)，會看到wagon works!的字樣。

現在，我們來建立一個新的Laravel專案：

開啟wagon\\cmder\\Cmder.exe (一款可以使用Windows 以及 Linux的命令提示字元)，

如果跳出警告視窗，選擇第一個選項。

接下來會看到我們所在路徑是wagon\\uwamp\\www，

~我們在此鍵入laravel new {專案名稱}，例如： `<code class="EnlighterJSRAW" data-enlighter-language="null">laravel new test`~

改版到5.3了，所以新指令在這裡：

`<code class="EnlighterJSRAW" data-enlighter-language="null">composer create-project laravel/laravel test "5.2.*"`

\->請自行尋求打發時間的方法，這會持續一段時間<-

完成後會看到Application ready! Build something amazing.的字樣

讓我們進到UwAmp的Apache Config，

然後把預設路徑的{DOCUMENTPATH}/default改成{DOCUMENTPATH}/test/public (請依自己的專案名稱修改test部分)

再重新整理，即可看到Laravel 5 (我們所使用的版本是Laravel 5.2)

在Laravel官方有提供相關的[教學文件](https://laravel.tw/docs/5.2)，有部分是英文的，可以切換至5.1版本瀏覽中文(內容通常大同小異)。

我們接下來處理資料庫部分(MySQL)，連結到[http://localhost:8000/mysql/](http://localhost:8000/mysql/)，預設帳號：root，密碼為空，

現在出現了一個問題，登入失敗，而且回報給我們一串亂碼，解決方式如下：

下載WampServer，開啟並等待右下角圖示轉換為綠色

(抱歉…我找不到更好的方法了)

進入之後我們建立一個新的資料庫，比如說test\_db，之後到Laravel設定檔進行設定。

我建議使用[Sublime Text](https://www.sublimetext.com/)或者是[Atom](https://atom.io/)，這兩個編輯器可以把整個專案資料夾集中管理，方便我們使用。

我們直接把wagon\\uwamp\\www\\test拖曳到Sublime Text或Atom。

先從資料庫開始，

找到.env，編輯以下部分：

DB\_DATABASE=test\_db

DB\_USERNAME=root

DB\_PASSWORD=

接下來編輯時區(可以不編輯沒有關係)：

config\\app.php

‘timezone’ => ‘Asia/Taipei’,

我們現在先來學習建立controller以及model(就不贅述MVC架構了)

`<code class="EnlighterJSRAW" data-enlighter-language="null">artisan make:controller TestController --resource`

有沒有–resource的差別在於會不會幫你建立以下function：

-   index()
-   create()
-   store(Request $request)
-   show($id)
-   edit($id)
-   update(Request $request, $id)
-   destroy($id)

這樣子，一個controller就建立完成了，controller的路徑位於app\\Http\\Controllers。

`<code class="EnlighterJSRAW" data-enlighter-language="null">artisan make:model Test -m`

有沒有-m的差別在於migration，也就是所謂的資料庫遷移，其路徑在database\\migrations，

然而我們新增的檔案會是{今天的日期}*create*{model名稱}s\_table。

在up function裡面會看到：

$table->increments('id'); $table->timestamps();

其中，increaments是主鍵(一個遞增的int)，其名稱為id，timestamps是時間暫存(建立時間以及更新時間)，

若要新增新的欄位，可以這樣打：

`<code class="EnlighterJSRAW" data-enlighter-language="php">$table->string('name');`

這樣會建立一個欄位名稱name，是一個varchar的格式。

我們可以利用migration來在資料庫中建立資料表：

`<code class="EnlighterJSRAW" data-enlighter-language="null">artisan migrate`

也可以使用make:migration直接建立新的資料表：

`<code class="EnlighterJSRAW" data-enlighter-language="null">artisan make:migration tests`

然而，我們又可以把model做歸類，參考這篇文章：[胖胖Model減重的五個方法by howtomakeaturn – Slides](http://slides.com/howtomakeaturn/model)

不過，我的分類有點不一樣，是分成Repository、Entity、Service

我們現在有了Controller以及Model，接下來就來說一下所謂的路由(route)，

其路徑在app\\Http\\routes.php。

何謂路由？ 你想要在[http://localhost:8000/test/](http://localhost:8000/test/)上顯示東西，此時你就需要建立新的路由。

Route::get('/', function () { return view('welcome'); });

這是預設的情況下，當使用者連結至[http://localhost:8000/](http://localhost:8000/)，路由就會幫你導入welcom這個view，其路徑為resources\\views。

現在，我們撰寫一個view如下：

resources\\views\\hello.blade.php

Hello, Laravel! Here is /test.  
Hello, Laravel!

然後在路由底下新增：

Route::get('/test', function() { return view('hello'); });

然後試著連接[http://localhost:8000/test/](http://localhost:8000/test/)看看，有東西了唄！

那麼Controller是拿來幹嘛的？

當你需要使用Controller，你可以這樣做(記得把上面那段mark掉，或者直接砍掉)：

`<code class="EnlighterJSRAW" data-enlighter-language="php">Route::get('/test', 'TestController@index');`

然後到app\\Http\\Controllers\\TestController.php，

在make Controller時沒有使用–resource的同學請新增，有使用–resource的同學只要在index內修改即可。

public function index() { return view('hello'); }

這樣就可以達到跟上面相同的效果，但為什麼要這樣做呢？

應該沒有人會把全部的function寫在路由上吧…(那MVC的意義何在呢？)

這邊，我們就來實際的Demo一下整個Laravel如何操作：

其實，不把Model拆分成那麼細也沒有關係，我也只是因為實驗室那邊的要求才這樣做的，但是這有助於整個團隊的撰寫以及DeBug。

至於，[Blade](https://laravel.tw/docs/5.2/blade)部分，我們擇日再談。

我們先把路由以及Controller的部分清除(避免混淆視聽)，

然後，我們要新增欄位，在database\\migration的資料表遷移部分新增：

$table->string('name'); $table->integer('phone');

然後把原本的test\_db資料表刪除後再進行一次：

`<code class="EnlighterJSRAW" data-enlighter-language="null">artisan migrate`

我們在app\\Http\\Controllers\\TestController的index()部分新增：

`<code class="EnlighterJSRAW" data-enlighter-language="php">return view('index');`

新增一個檔案resources\\views\\index.blade.php：

[新增資料](https://blog.bgpsekai.club/create)

這是一個簡易的超連結而已。

在app\\Http\\Controllers\\TestController的create()部分新增：

`<code class="EnlighterJSRAW" data-enlighter-language="php">return view('create');`

新增一個檔案resources\\views\\create.blade.php：

姓名： 電話： {{ csrf\_field() }} 

表單部分就不多加贅述了，至於{{ csrf\_token() }}是為了防止csrf攻擊，如果沒有的話，Laravel會警告。

做了這麼多，我們來修改路由app\\Http\\routes.php：

Route::get('/index', 'TestController@index'); Route::get('/create', 'TestController@create');

好了，我們到[http://localhost:8000/index](http://localhost:8000/index)試試看！

接下來，來處理最重要的部分：

在app\\Http\\Controllers\\TestController的store()部分新增：

$data = \\App\\Test::create($request->all()); return redirect('/'.$data->id);

將所有資料存進資料表，然後重新導向至/index/{id}

當然，我們的Model並沒有做到這件事，所以我們必須修改app\\Test.php，在class內新增：

`<code class="EnlighterJSRAW" data-enlighter-language="php">public $fillable = ['name', 'phone'];`

有哪些資料，就填哪些資料！

接下來，在app\\Http\\Controllers\\TestController的show()部分新增：

$data = \\App\\Test::find($id); return view('show', compact('data'));

在資料庫中找到$id這個變數的東西(等等會從路由傳進來)，且送給show這個View來處理。

修改路由app\\Http\\routes.php：

Route::post('/store', 'TestController@store'); Route::get('/{id}', 'TestController@show');

現在，我們還需要一個show的View，resources\\views\\show.blade.php：

名字：{{ $data->name }} 電話：{{ $data->phone }}

這樣子，就可以實際操作新增了！

接下來，我們把index修改成這樣：

[新增資料](https://blog.bgpsekai.club/create)  
@foreach($datas as $data) 姓名：{{ $data->name }} 電話：{{ $data->phone }} [修改](https://blog.bgpsekai.club/%7B%7B%20$data-%3Eid%20%7D%7D/edit) [刪除](https://blog.bgpsekai.club/destroy/%7B%7B%20$data-%3Eid%20%7D%7D)  
@endforeach

@是blade的一種表示法，讓你不用在那邊<?php…

至於資料哪裡來呢？參照剛剛的TestController@show，把app\\Http\\Controllers\\TestController的index()改成這樣：

$datas = \\App\\Test::get(); return view('index', compact('datas'));

這頁，就可以在[http://localhost:8000/index/](http://localhost:8000/index/)看到所有的資料了！

接下來，我們就來做修改以及刪除的動作，

刪除比較簡單：

在app\\Http\\Controllers\\TestController的destroy()部分新增：

\\App\\Test::destroy($id); return redirect('/index');

修改路由app\\Http\\routes.php：

`<code class="EnlighterJSRAW" data-enlighter-language="php">Route::get('/destroy/{id}', 'TestController@destroy');`

這樣，就可以進行刪除的動作了。

相對的，修改並沒有難到哪裡去，

首先，我們要新增一個檔案resources\\views\\edit.blade.php：

姓名： 電話： {{ csrf\_field() }} 

其實跟create大同小異，

然後在路由app\\Http\\routes.php新增：

`<code class="EnlighterJSRAW" data-enlighter-language="null">Route::get('/{id}/edit', 'TestController@edit');`

還有，千萬不要忘了在app\\Http\\Controllers\\TestController的edit()部分新增：

$data = \\App\\Test::find($id); return view('edit', compact('data'));

這段就跟show的部分有所雷同了，

然後就可以來試試看修改頁面是否成功，

但是這時候是沒有功能的。

所以，我們要在路由app\\Http\\routes.php新增：

`<code class="EnlighterJSRAW" data-enlighter-language="php">Route::post('/{id}/update', 'TestController@update');`

在app\\Http\\Controllers\\TestController的update()部分新增：

$data = \\App\\Test::find($request->id)->update($request->all()); return redirect('/'+$id);

好了，簡易的增刪查改(CRUD)就這樣完成了！

\=>以下新手可以略過<=

我們來把Model分開來處理：

1.建立app\\Entities、app\\Repositories、app\\Services(其實這個可以不用，因為我們用不到)

2.將Test.php這個Model移入app\\Entities，並把namespace App;修改為namespace App\\Entities;

3.在app\\Repositories建立對應之檔案，如：TestRepository.php，其內容為：

all()); } function show($id) { return Test::find($id); } function edit($id) { return Test::find($id); } function update($request, $id) { return Test::find($request->id)->update($request->all()); } function destroy($id) { return Test::destroy($id); } }   4.將app\\Http\\Controllers\\TestController.php之內容新增： \` ``use App\Repositories\TestRepository;` 在其class內新增： private $repo; public function __construct(TestRepository $repo) { $this->repo = $repo; } 並且將其內容改為： public function index() { $datas = $this->repo->index(); return view('index', compact('datas')); } public function create() { return view('create'); } public function store(Request $request) { $data = $this->repo->store($request); return redirect('/'.$data->id); } public function show($id) { $data = $this->repo->show($id); return view('show', compact('data')); } public function edit($id) { $data = $this->repo->edit($id); return view('edit', compact('data')); } public function update(Request $request, $id) { $data = $this->repo->update($request, $id); return redirect('/'+$id); } public function destroy($id) { $this->repo->destroy($id); return redirect('/index'); } 這樣是不是乾淨多了？   還有一個小提醒， 原本可以加上use App\Test;來讓你只打Test::find($id);之類的，而不用打App\Test::find($id); 為什麼現在才說呢？ 因為我忘記了…   4/12： phone不要用integer格式，不然會被吃掉！ 所以上面integer請改string…   感謝BJ不熱情協助   ~*小抱怨：果然還是比較習慣Sublime*~[/vc_column_text][/vc_column][/vc_row]``
