---
title: "網易雲也出 linux 版了"
slug: netease-music-on-mac
pubDate: 2016-06-01T22:58:17.000+08:00
author: a9650615
tags:
  - linux
  - wang-yi-yun
updatedDate: 2019-09-24T03:03:25.000+08:00
featureImage: ../../assets/blog/content/images/2019/09/b14d6711-7b1a-40d2-96a0-51ffc56d9df5.png
excerpt: "今天剛好 wine 上的網意雲出了問題 想去官網重抓一下 沒想到官網竟然和 deepin 合作出 linux 版了 共出了 ubuntu 和 deepin 兩個發行版 安裝後遇到了一個大問題 資料能載入但歌全部都不能載和聽阿 查了 google 後 發現是因為網意雲有擋海外 改一下 /etc/hosts 就有解了 > 198.47.104.134 m1.music.126.net 198.47.104.134 m2.music.126.net 198.47.104.134 m3.music.126.net 198.47.104.134 m4.music.126.net 198.47.104.134 m5.music.126.net 198.47.104.134 m6.music.126.net 198.47.104.134 m7.music.126.net 198.47.104.134 m8.music.126.net 198.47.104.134 m9.music.126.net 198.47.104.134 m10.music.126.net 原文：https://www"
---

今天剛好 wine 上的網意雲出了問題  
想去官網重抓一下  
沒想到官網竟然和 deepin 合作出 linux 版了  
共出了 ubuntu 和 deepin 兩個發行版  
安裝後遇到了一個大問題  
資料能載入但歌全部都不能載和聽阿  
查了 google 後 發現是因為網意雲有擋海外  
改一下 /etc/hosts 就有解了

> 198.47.104.134 m1.music.126.net  
> 198.47.104.134 m2.music.126.net  
> 198.47.104.134 m3.music.126.net  
> 198.47.104.134 m4.music.126.net  
> 198.47.104.134 m5.music.126.net  
> 198.47.104.134 m6.music.126.net  
> 198.47.104.134 m7.music.126.net  
> 198.47.104.134 m8.music.126.net  
> 198.47.104.134 m9.music.126.net  
> 198.47.104.134 m10.music.126.net

原文：[https://www.zhihu.com/question/46732449/answer/102685954](https://www.zhihu.com/question/46732449/answer/102685954)

不過 bug 還是有遇到一些 像是修改歌曲下載路徑會直接掛和桌面狀態列並不會出現小圖示 等等

不過目前用起來體驗仍然很不錯 (用網頁就是狂)

最後付個截圖

現在可以自選顏色了 不錯

---

好像發現了新問題

這版本好像會記憶體洩漏

我小小的 8g ram 就這樣被它撐爆了

解法也找到了 [https://bbs.deepin.org/forum.php?mod=viewthread&tid=39708](https://bbs.deepin.org/forum.php?mod=viewthread&tid=39708)

看來可能是權限問題呢

7月更新 host 連至別人反向代理已無效

[http://spacekid.me/unblock-netease-music/](http://spacekid.me/unblock-netease-music/)

舊版解法
