---
title: "[開箱] BananaPi M3 開箱及測試及小評"
slug: bananapi-m3-open-box-and-test
pubDate: 2017-05-02T07:33:29.000+08:00
author: a9650615
tags:
  - nodejs
  - sbc
updatedDate: 2019-09-24T02:54:29.000+08:00
featureImage: ../../assets/blog/content/images/2019/09/dcd0f942-d559-4c00-8db0-7e0c0d2c9b39.jpg
excerpt: "由於前些時間有接觸到一些 gpio control 的東西，害我對 SBC ( Single Board Computer ) 有點興趣，想買一台來當作常待 server 外，也可以玩看看相關的東西，然後又看上 Banapi M3 ，不過由於又是一個基於衝動購買的產物，果然缺點什麼的還挺不少的，最主要的缺點有以下幾點： * 無法使用 usb 進行供電，害我還要特地去找 DC 接頭 * Sata Port 是由 Usb 2.0 分出來的，速度就…恩 * wifi 收訊聽說不佳，接上天線也好不到哪去（不過我直接接網路線 無感 * 官方提供的 Ubuntu Mate 沒有辦法取得內核時脈及溫度等等 （ 不知道是不是 Allwinner 核心架構沒公開的關係？ * 官方提供的內核版本頗舊 ( 3.4 )，而且好像更新成謎（我也沒有能力自己編內核，難過ＱＱ * Gpio 好像無法使用 linux 原生的 gpio 調整，需要使用 gpio library ( 還需要安裝 BPI-WiringPi 否則會認不出板子，而且官方 ubuntu mate 安裝 BPI-WiringP"
---

由於前些時間有接觸到一些 gpio control 的東西，害我對 SBC ( Single Board Computer ) 有點興趣，想買一台來當作常待 server 外，也可以玩看看相關的東西，然後又看上 Banapi M3 ，不過由於又是一個基於衝動購買的產物，果然缺點什麼的還挺不少的，最主要的缺點有以下幾點：

-   無法使用 usb 進行供電，害我還要特地去找 DC 接頭
-   Sata Port 是由 Usb 2.0 分出來的，速度就…恩
-   wifi 收訊聽說不佳，接上天線也好不到哪去（不過我直接接網路線 無感
-   官方提供的 Ubuntu Mate 沒有辦法取得內核時脈及溫度等等 （ 不知道是不是 Allwinner 核心架構沒公開的關係？
-   官方提供的內核版本頗舊 ( 3.4 )，而且好像更新成謎（我也沒有能力自己編內核，難過ＱＱ
-   Gpio 好像無法使用 linux 原生的 gpio 調整，需要使用 gpio library ( 還需要安裝 BPI-WiringPi 否則會認不出板子，而且官方 ubuntu mate 安裝 BPI-WiringPi 有雷 [連結](http://wdpsestea.blogspot.tw/2016/05/bpi-m3-gpio.html)

雖然缺點還不少，但是基本的服務架設還是沒什麼問題的，像是跑跑 nodejs 服務等等

不過由於沒辦法原生控制 gpio ，要用 nodejs 來開發也不方便，還是決定拿來架 Server 好了，拿來架 Server 基本上效能頗夠用，可惜內核版本過舊，要不然還想拿來架 Docker Server 的。

## 小評

雖然以 arm 單板來說效能強大，但是由於官方所提供的支援、資源並不是很多，真的要作為實驗開發，還是樹莓派或者 Arduino 來的方便許多，至於如果是想要拿來純架 Server 的話，多花點錢買 x86 的 SBC 感覺會比較實際點，不過如果只想花些許的錢架些小服務的話，那其實就還蠻適合的。
