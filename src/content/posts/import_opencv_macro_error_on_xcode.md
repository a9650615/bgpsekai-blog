---
title: "openCV 導入 iOS 專案筆記"
slug: import_opencv_macro_error_on_xcode
pubDate: 2020-04-28T15:15:41.000+08:00
author: a9650615
tags: []
updatedDate: 2020-04-28T15:15:41.000+08:00
featureImage: ../../assets/external/images.unsplash.com/b1251a848366.jpg
excerpt: "遇到 Expanded from macro 'NO' 時該怎麼辦呢"
metaDescription: "Xcode 導入 opencv framwork 時出現了 Expanded from macro 'NO' 這個錯誤，但是並沒有引入錯誤，該怎麼辦呢"
---

匯入的部分非常簡單只要確認 Framework 檔案有導入，專案設定確認有導入就可以直接用了  
![導入列表](../../assets/external/i.imgur.com/f3e4af8e2414.png)  
(最下面的 opencv2.framework 那項)

接下來就橋接到你的 object c 檔案吧 (要接到 Swift 還要再接一層 Bridge 有空再講)  
但是邊譯時就遇到這錯誤了  
![Expanded from macro 'NO'](../../assets/external/i.imgur.com/2ce87185f41f.png)

`Expanded from macro 'NO'`

後來才發現是內建的 macro check 所導致的，最簡單的解法就是放在引入其他東西之前，像是下面這樣  
![](../../assets/external/i.imgur.com/480a4560e441.png)

這樣就可以順利編過囉
