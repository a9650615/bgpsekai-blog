---
title: "自學 Git - 堪用級"
slug: learn-git-by-self
pubDate: 2016-07-28T21:04:14.000+08:00
author: a9650615
tags:
  - git
updatedDate: 2019-09-24T03:10:15.000+08:00
featureImage: ../../assets/blog/content/images/2019/09/5054a9e7-9c50-4942-81d4-3a804f4ca9cb.png
excerpt: "Git 是一個很好用的檔案管理系統，歷史什麼的…我只知道最當初是 linux 開發者做的。 好了廢話不多說，這篇文章將提供一些基本概念,依照常使用的程度排列。 搭配 GUI 介面操作將可以更快了解相關功能。推薦 sourcetree -------------------------------------------------------------------------------- git 初始專案相關指令 init 初始一個 Repository 使用 init 指令後，將在資料夾產生 .git 資料夾，用於紀錄檔案變動 clone 複製一個 Repository 從遠端 git 庫複製一項 repository 到某地 git 專案管理相關指令 commit 提交一次狀態 提交一次檔案紀錄，並且可加入一段提交說明 add 讓一檔案加入追蹤 加入要追蹤的檔案 status 看到當下的 commit 狀態 查看當下 commit 的訊息及檔案紀錄 log 看到 commit 的紀錄 可以查看到所有提交的 commit 紀錄 reset 回復版本/取消操"
---

Git 是一個很好用的檔案管理系統，歷史什麼的…我只知道最當初是 linux 開發者做的。

好了廢話不多說，這篇文章將提供一些基本概念,依照常使用的程度排列。

搭配 GUI 介面操作將可以更快了解相關功能。推薦 sourcetree

---

## git 初始專案相關指令

### init  初始一個 Repository

使用 init 指令後，將在資料夾產生 .git 資料夾，用於紀錄檔案變動

### clone 複製一個 Repository

從遠端 git 庫複製一項 repository 到某地

## git 專案管理相關指令

### commit 提交一次狀態

提交一次檔案紀錄，並且可加入一段提交說明

### add 讓一檔案加入追蹤

加入要追蹤的檔案

### status 看到當下的 commit 狀態

查看當下 commit 的訊息及檔案紀錄

### log 看到 commit 的紀錄

可以查看到所有提交的 commit 紀錄

### reset 回復版本/取消操作

回復一個版本，或者選擇一個檔案回復上一個狀態

另外 reset 有分為兩種 soft 和 hard

soft: 將記錄下回復這個狀態

hard: 將直接回復狀態而不留下任何紀錄

## git 分支管理指令

### branch 查詢/新增分支

如果你想要開發一個新功能等等並且不想影響到某分支， 開 branch(分支) 就會是一個好選擇，開一個新 brach 將從你想開的分支開出一個新分支，紀錄和內容將會和原本的分支分開，但是你接下來所做得更動將不會引響到你原本的分支。

### checkout 切換分支版本

如字面所說，另外，切換時你的檔案也將會變更成當下 branch 的狀態

### rebase 合併分支內容

將某一分支的內容合併至另一分支，在 merge 前先 rebase 可以防止檔案紀錄衝突的問題

### merge  合併分支

將某一分支和其他分支合併，並會留下分支線合併紀錄。

## git 相關

### .gitignore 設定 git 要忽略的檔案或路徑

以相對路徑分行設定即可
