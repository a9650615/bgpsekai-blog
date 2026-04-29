---
title: "NVM 設定教學"
slug: nvm-installation
pubDate: 2019-11-05T19:31:17.000+08:00
author: a9650615
tags:
  - nodejs
updatedDate: 2019-11-05T19:33:56.000+08:00
featureImage: ../../assets/blog/content/images/2019/11/-----2019-11-05---7.32.40.png
excerpt: "先簡單介紹一下，NVM （ Node Version Manager ）是個 NodeJS 的版本管理器，可以任意的安裝及切換各種版本的 Node 環境。 那接下來就來說明如何使用吧。 -------------------------------------------------------------------------------- 如果你是Mac使用者 homebrew 那安裝步驟很簡單。 只需直接安裝就可以了 brew install nvm 安裝完之後即可使用 nvm 列出所有可以安裝的版本，例如列出 v10 的所有版本 nvm ls-remote | grep v10 安裝想要安裝的 NodeJS 版本，以 10.13.0 為例，另外你可以安裝多種版本在進行選擇 nvm install 10.13.0 安裝完之後利用 use 選擇想要的版本 nvm use 10.13.0 最後，如果你想要設定成預設的 NodeJS 環境，使用以下指令 ( 以 10.13.0 為例 ) nvm alias default 10.13.0 最後 如"
---

先簡單介紹一下，NVM （ Node Version Manager ）是個 NodeJS 的版本管理器，可以任意的安裝及切換各種版本的 Node 環境。  
那接下來就來說明如何使用吧。

---

如果你是Mac使用者 homebrew 那安裝步驟很簡單。

只需直接安裝就可以了

```shell
brew install nvm
```

安裝完之後即可使用 nvm 列出所有可以安裝的版本，例如列出 v10 的所有版本

```shell
nvm ls-remote | grep v10
```

安裝想要安裝的 NodeJS 版本，以 10.13.0 為例，另外你可以安裝多種版本在進行選擇

```shell
nvm install 10.13.0
```

安裝完之後利用 `use` 選擇想要的版本

```shell
nvm use 10.13.0
```

最後，如果你想要設定成預設的 NodeJS 環境，使用以下指令 ( 以 10.13.0 為例 )

```shell
nvm alias default 10.13.0
```

最後 如果你不是 Mac 用戶可以參考  
[Windows](https://github.com/coreybutler/nvm-windows/releases)  
[Linux](https://github.com/nvm-sh/nvm#installation-and-update)
