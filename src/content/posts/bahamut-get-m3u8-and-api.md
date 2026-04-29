---
title: "巴哈動漫瘋 跳過網站直抓 m3u8 以及巴哈通知 api"
slug: bahamut-get-m3u8-and-api
pubDate: 2016-06-15T14:06:19.000+08:00
author: a9650615
tags:
  - dong-man-feng
  - ba-ha
updatedDate: 2019-09-24T03:01:07.000+08:00
featureImage: ../../assets/blog/content/images/2019/09/9f7b1387-ce0c-4765-8c02-10d12a4c41f0.jpg
excerpt: "首先需要取得一組 device ID http://ani.gamer.com.tw/ajax/getdeviceid.php?id= 然後將 device ID 和想要的影片 ID 放入以下網址 http://ani.gamer.com.tw/ajax/token.php?adID=0&sn=[影片_ID]&device=[device_ID]&hash=[騙鬼用的13碼英數組合] [http://ani.gamer.com.tw/ajax/token.php?adID=0&sn=%5B%E5%BD%B1%E7%89%87_ID%5D&device=%5Bdevice_ID%5D&hash=%5B%E9%A8%99%E9%AC%BC%E7%94%A8%E7%9A%8413%E7%A2%BC%E8%8B%B1%E6%95%B8%E7%B5%84%E5%90%88%5D] hash 取得 code ( 不知功用為何 function e() { var t = (new Date).getTime(); window.performance && \"function\" == t"
---

首先需要取得一組 device ID

[http://ani.gamer.com.tw/ajax/getdeviceid.php?id=](http://ani.gamer.com.tw/ajax/getdeviceid.php?id=)

然後將 device ID 和想要的影片 ID 放入以下網址

[http://ani.gamer.com.tw/ajax/token.php?adID=0&sn=\[影片\_ID\]&device=\[device\_ID\]&hash=\[騙鬼用的13碼英數組合\]](http://ani.gamer.com.tw/ajax/token.php?adID=0&sn=%5B%E5%BD%B1%E7%89%87_ID%5D&device=%5Bdevice_ID%5D&hash=%5B%E9%A8%99%E9%AC%BC%E7%94%A8%E7%9A%8413%E7%A2%BC%E8%8B%B1%E6%95%B8%E7%B5%84%E5%90%88%5D)

hash 取得 code ( 不知功用為何

function e() { var t = (new Date).getTime(); window.performance && "function" == typeof window.performance.now && (t += performance.now()); var e = "xxxxxxxxxxxx".replace(/\[x\]/g, function(e) { var n = (t + 16 \* Math.random()) % 16 | 0; return t = Math.floor(t / 16), ("x" == e ? n : 3 & n | 8).toString(16) }); return e }

然後將結果的 SRC 資料取出可取得一 m3u8 檔

裡面放了四種解析度的 ts 分割 m3u8 檔 （ 360, 540, 720, 1080 ）

選擇所需網址

[http://gamer-cds.cdn.hinet.net/vod/gamer/\[m3u檔名到-video前\]/hls-ae-2s/\[m3u8網址\]](http://gamer-cds.cdn.hinet.net/vod/gamer/%5Bm3u%E6%AA%94%E5%90%8D%E5%88%B0-video%E5%89%8D%5D/hls-ae-2s/%5Bm3u8%E7%B6%B2%E5%9D%80%5D)

以上

---

未確認 url （需要未知參數

[http://ani.gamer.com.tw/ajax/want2play.php?s=\[動漫\_ID\]](http://ani.gamer.com.tw/ajax/want2play.php?s=%5B%E5%8B%95%E6%BC%AB_ID%5D)

還不小心寫了個插件 Bug 有點多：~[連結](http://acgn-moemoe.tw/2016/06/17/%E8%BB%9F%E9%AB%94-chrome-%E6%8F%92%E4%BB%B6-%E5%B7%B4%E5%93%88%E7%98%8B-%E5%B7%B4%E5%93%88%E5%8B%95%E6%BC%AB%E7%98%8B%E5%B0%8F%E8%9F%B2/)~ 

[https://drive.google.com/drive/folders/0B1NOJo1tOF\_KdTJfY2xXd2g5eWM?usp=sharing](https://drive.google.com/drive/folders/0B1NOJo1tOF_KdTJfY2xXd2g5eWM?usp=sharing) ( 更新 內含原始碼 歡迎自行取閱改動

使用方法 到網站下按下右鍵選單 可以找到按鈕 **在看完廣告之後點擊 (無法略過了)** 再打開選單就可以選擇連結  ( 更新 但不是最新 因該是還能用吧 大概 又不能用請叫我更新

至於通知 api

[http://ani.gamer.com.tw/ajax/topBar\_AJAX.php?type=\[type\]](http://ani.gamer.com.tw/ajax/topBar_AJAX.php?type=%5Btype%5D)

type 共有三種 light\_0 (所有通知)、light\_1(訂閱通知)、light\_2 (推薦)

又有得做小工具了

補充

提醒的API

[http://ani.gamer.com.tw/ajax/notify.php?a=\[type\]](http://ani.gamer.com.tw/ajax/notify.php?a=%5Btype%5D)

\[type\] 有 1 : 三種訊息數量,逗點隔開,2 : 公開消息xml,3：未知
