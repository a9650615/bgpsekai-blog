---
title: "巴哈動畫瘋 跳過網站直抓 m3u8 (更新版"
slug: bahamut-anime-get-m3u8-updated
pubDate: 2017-02-14T22:24:47.000+08:00
author: sheepdragon
tags:
  - tutorial
  - dong-man-feng
  - ba-ha
  - lan-ren-bao
updatedDate: 2019-09-24T03:08:20.000+08:00
featureImage: ../../assets/blog/content/images/2019/09/9f7b1387-ce0c-4765-8c02-10d12a4c41f0-1.jpg
excerpt: "要抓m3u8必需要下幾種東西 設備ID(device)、影片ID(sn)、廣告ID(s) 最下方有懶人包 設備ID(device)請直接用這個取得 animefun.getdeviceid(); 影片ID(sn)請直接用這個取得 animefun.videoSn; 廣告ID(s)請直接用這個取得 getAd()[0]; -------------------------------------------------------------------------------- 不怎麼重要的狀態說明(看下去就知道了) 而在token.php回應了一些資訊 {\"src\":\"\",\"r18\":0,\"vip\":0,\"time\":0,\"login\":0} src 就不用說了，沒用 r18 只是分級用，回饋會有 0、1、2、4、5(好像沒有3，不確定) vip 估計是0和1，1因該是vip time 決定是否已經過了廣告了沒，0是還沒，1是有 login 是否登入，0是還沒，1是有 --------------------------------"
---

要抓m3u8必需要下幾種東西

設備ID(device)、影片ID(sn)、廣告ID(s)

最下方有懶人包

設備ID(device)請直接用這個取得

animefun.getdeviceid();

影片ID(sn)請直接用這個取得

animefun.videoSn;

廣告ID(s)請直接用這個取得

getAd()\[0\];

---

不怎麼重要的狀態說明(看下去就知道了)

而在token.php回應了一些資訊

{"src":"","r18":0,"vip":0,"time":0,"login":0}

src 就不用說了，沒用

r18 只是分級用，回饋會有 0、1、2、4、5(好像沒有3，不確定)

vip 估計是0和1，1因該是vip

time 決定是否已經過了廣告了沒，0是還沒，1是有

login 是否登入，0是還沒，1是有

---

反正沒取得就知道了

[http://ani.gamer.com.tw/ajax/videoCastcishu.php](http://ani.gamer.com.tw/ajax/videoCastcishu.php)

參數有三個

sn 是影片ID

s 是廣告ID

ad=end而這個很重要

因為這個ad=end決定是否重新播放

當沒傳送ad=end，將會token的time=0而導致廣告出現

而有傳送ad=end，則有機會可以使time=1(估計是15秒)

[http://ani.gamer.com.tw/ajax/m3u8.php?sn=\[影片ID\]&device=\[取得device\]](http://ani.gamer.com.tw/ajax/m3u8.php?sn=%5B%E5%BD%B1%E7%89%87ID%5D&device=%5B%E5%8F%96%E5%BE%97device%5D)

而最後就是取得m3u8

一般而言前面沒過的話會回應這樣

{src: "", error: 15}

而error: 15不知是啥意思(廣告沒過src就是空的)

而要成功

先videoCastcishu => 15秒 => videoCastcishu END => m3u8

{"src":"[//gamer-cds.cdn.hinet.net/vod/gamer/gamer2\_fast-07572248b0bc6da693cb3f53b6814c3ee5c2a961/hls-ae-2s/index.m3u8?token=1xuirtkTWPaVMnuoHLNBJA&expires=1487068703&bahaData=03187970a11ee75deee9e807446810a6d0a8c84c7c890cee587f6eeb7162:5795:0:PC:cabc3](//gamer-cds.cdn.hinet.net/vod/gamer/gamer2_fast-07572248b0bc6da693cb3f53b6814c3ee5c2a961/hls-ae-2s/index.m3u8?token=1xuirtkTWPaVMnuoHLNBJA&expires=1487068703&bahaData=03187970a11ee75deee9e807446810a6d0a8c84c7c890cee587f6eeb7162:5795:0:PC:cabc3)"}

而src就是m3u8檔目錄檔了

裡面放了四種解析度的 ts 分割 m3u8 檔 （ 360, 540, 720, 1080 ）

而要成為單檔m3u8

請看上一篇文中 : [連結](https://bgpsekai.thisistap.com/%E9%9A%A8%E6%89%8B%E4%BA%82%E5%81%9A/2016/06/%E5%B7%B4%E5%93%88%E5%8B%95%E6%BC%AB%E7%98%8B-%E8%B7%B3%E9%81%8E%E7%B6%B2%E7%AB%99%E7%9B%B4%E6%8A%93-m3u8/)

以上

---

懶人包

所以又還不小心寫了個tampermonkey插件

有可能有Bug

[https://greasyfork.org/zh-TW/scripts/26825](https://greasyfork.org/zh-TW/scripts/26825)
