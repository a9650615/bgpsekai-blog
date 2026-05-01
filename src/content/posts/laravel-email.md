---
title: LARAVEL EMAIL
slug: laravel-email
pubDate: 2016-07-28T17:09:17.000+08:00
author: a7612626
tags:
  - laravel
  - tutorial
updatedDate: 2016-11-28T09:12:41.000+08:00
excerpt: "今天打太多文章了，有點累 今天我們來實作Laravel的E-mail，測試功能為resetPassword [https://laravel.tw/docs/5.2/authentication#resetting-passwords] 來讓我們new一個project，順便把內建的Auth make起來 command line: laravel new test cd test artisan make:auth (說我命名沒有sence我也認了) .env(以Gmail為例) MAIL_DRIVER=smtp MAIL_HOST=smtp.gmail.com MAIL_PORT=465 MAIL_USERNAME={帳號} MAIL_PASSWORD={密碼} MAIL_ENCRYPTION=ssl 以下為Laravel 5.2(含) 以下的BUG，已於5.3修復， [vc_row][vc_column][vc_column_text] > config\\mail.php 58. ‘from’ => [‘address’ => {帳號}"
---

今天打太多***文章***了，有點累

今天我們來實作Laravel的E-mail，測試功能為[resetPassword](https://laravel.tw/docs/5.2/authentication#resetting-passwords)

來讓我們new一個project，順便把內建的Auth make起來

command line:

laravel new test cd test artisan make:auth

(說我命名沒有sence我也認了)

.env(以Gmail為例)

MAIL\_DRIVER=smtp MAIL\_HOST=smtp.gmail.com MAIL\_PORT=465 MAIL\_USERNAME={帳號} MAIL\_PASSWORD={密碼} MAIL\_ENCRYPTION=ssl

以下為Laravel 5.2(含) 以下的BUG，已於5.3修復，

\[vc\_row\]\[vc\_column\]\[vc\_column\_text\]

> **config\\mail.php**
> 
> **58.  ‘from’ => \[‘address’ => {帳號}, ‘name’ => {可以任意取名}\],**
> 
> **這個檔案大致上是以.env為主，同學也可以直接對這個檔案進行修改即可。**
> 
> **但第58行的部分預設就是null，所以要給初值，不然會報錯。**

以上。

接下來請同學自行新增帳號，然後至重設密碼的部分進行發送的動作。

這樣子就會收到信件了，信件內容如下：

<!-- removed: dead image https://bgpsekai.thisistap.com/wp-content/uploads/2016/07/1-2-500x121.png -->

如果想要修改內容，路徑如下：

storage\\framework\\views

裡面會有幾個.php 其中一個就是了。

我自己覺得這篇寫得很爛…原因我也不知道

或許是因為不知道怎麼講吧
