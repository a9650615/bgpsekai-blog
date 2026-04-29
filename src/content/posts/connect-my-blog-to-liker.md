---
title: "Liker - 讚賞公民 的發現及 Ghost 串接之旅"
slug: connect-my-blog-to-liker
pubDate: 2020-04-13T13:43:04.000+08:00
author: a9650615
tags:
  - blog
  - tutorial
updatedDate: 2020-05-28T16:57:44.000+08:00
featureImage: ../../assets/blog/content/images/2020/04/---2020-04-13---1.42.45.png
excerpt: "前言 讚賞公民其實到現在也已經出現好幾年了，也時常在很多 blog 上看到，不過由於自己的 blog 一直沒有在認真維護的關係，因此一直沒有去研究這部分，直到最近想要啟動自己的寫作計畫才開始在思考究竟能不能靠寫作產生收入，但又不想依靠會引響觀看體驗的廣告收入，因此因緣際會找上了 Liker 讚賞公民這個平台，順便試試自己的 blog 到底值幾分錢。 特色及使用原因 會選上這個的原因主要是因為他是透過讀者主動點擊讚的按鈕來獲取觀看者所產生的獎賞金（可惜不是直接給我我新台幣），也可以透過月費成為讚賞公民，可以分配更多獎賞給作者，創造雙贏局面，而取得的獎賞為數位貨幣也是蠻有趣的，可惜只有在 bitAsset 上架，要出金有點麻煩。 串接及遇到的問題 由於我目前所使用的平台為 Ghost [https://ghost.org/]，而它預設有提供的插件只有 Wordpress 和 Medium ，因此需要繞點路來把按讚的按鈕接到上面，開始研究官方文件（寫得還蠻完整的），然而上面也沒有直接提供方法，最後決定參考這個方式 [https://docs.like.co/v/zh/user-guide"
metaDescription: "讚賞公民其實到現在也已經出現好幾年了，也時常在很多 blog 上看到，不過由於自己的 blog 一直沒有在認真維護的關係，因此一直沒有去研究這部分，直到最近想要啟動自己的寫作計畫才開始在思考究竟能不能靠寫作產生收入"
---

## 前言

讚賞公民其實到現在也已經出現好幾年了，也時常在很多 blog 上看到，不過由於自己的 blog 一直沒有在認真維護的關係，因此一直沒有去研究這部分，直到最近想要啟動自己的寫作計畫才開始在思考究竟能不能靠寫作產生收入，但又不想依靠會引響觀看體驗的廣告收入，因此因緣際會找上了 Liker 讚賞公民這個平台，順便試試自己的 blog 到底值幾分錢。

## 特色及使用原因

會選上這個的原因主要是因為他是透過讀者主動點擊讚的按鈕來獲取觀看者所產生的獎賞金（可惜不是直接給我我新台幣），也可以透過月費成為讚賞公民，可以分配更多獎賞給作者，創造雙贏局面，而取得的獎賞為數位貨幣也是蠻有趣的，可惜只有在 bitAsset 上架，要出金有點麻煩。

## 串接及遇到的問題

由於我目前所使用的平台為 [Ghost](https://ghost.org/)，而它預設有提供的插件只有 Wordpress 和 Medium ，因此需要繞點路來把按讚的按鈕接到上面，開始研究官方文件（寫得還蠻完整的），然而上面也沒有直接提供方法，最後決定參考這個[方式](https://docs.like.co/v/zh/user-guide/likecoin-button/blink)，用框架的方式把按讚按鈕嵌入，分享我修改後的版本

```html
<div style="display: flex;" class="likecoin-embed likecoin-button">
    <iframe
         style="flex: 1; min-height: 220px;"
         scrolling="no" frameborder="0" 
         src="https://button.like.co/in/embed/a9650615/button?referrer={{url absolute="true"}}">
    </iframe>
</div>
```

以上 code 必須更改 src 位置，規則為

> [https://button.like.co/in/embed/{你的ID}/button?referrer={{你的blog網址}](https://button.like.co/in/embed/%7B%E4%BD%A0%E7%9A%84ID%7D/button?referrer=%7B%7B%E4%BD%A0%E7%9A%84blog%E7%B6%B2%E5%9D%80%7D)}

最後，如果這篇文章有幫助到你，希望您也可以點以下[連結](https://liker.land/civic?from=a9650615)來成為我的公民XD

現在文章末也可以幫我按讚了哦～～
