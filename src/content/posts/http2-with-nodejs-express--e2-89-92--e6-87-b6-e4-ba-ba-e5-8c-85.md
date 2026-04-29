---
title: "HTTP/2 with NODEJS EXPRESS ≒ 懶人包"
slug: http2-with-nodejs-express--e2-89-92--e6-87-b6-e4-ba-ba-e5-8c-85
pubDate: 2016-08-02T18:07:31.000+08:00
author: a7612626
tags:
  - nodejs
  - tutorial
updatedDate: 2016-08-02T18:08:29.000+08:00
excerpt: "Windows需求Cmder [http://cmder.net/] 先來申請憑證 mkdir h2 cd h2 openssl genrsa -des3 -passout pass:x -out server.pass.key 2048 openssl rsa -passin pass:x -in server.pass.key -out server.key rm server.pass.key openssl req -new -key server.key -out server.csr 歇一下吧 打個CA的資料 然後繼續 (FQDN記得打上localhost或127.0.0.1) openssl x509 -req -sha256 -days 365 -in server.csr -signkey server.key -out server.crt npm init -y npm i express spdy -S 以下是index.js的內容 說白了http/2就是spdy的…延伸? 所以spdy是不可或缺的，然而需求https，所以要有憑證。 con"
---

Windows需求[Cmder](http://cmder.net/)

先來申請憑證

mkdir h2 cd h2 openssl genrsa -des3 -passout pass:x -out server.pass.key 2048 openssl rsa -passin pass:x -in server.pass.key -out server.key rm server.pass.key openssl req -new -key server.key -out server.csr

歇一下吧 打個CA的資料 然後繼續 (FQDN記得打上localhost或127.0.0.1)

openssl x509 -req -sha256 -days 365 -in server.csr -signkey server.key -out server.crt npm init -y npm i express spdy -S

以下是index.js的內容

說白了http/2就是spdy的…延伸?

所以spdy是不可或缺的，然而需求https，所以要有憑證。

const port = 3000; const spdy = require('spdy'); const express = require('express'); const path = require('path'); const fs = require('fs'); const app = express(); app.get('\*', (req, res) => { res .status(200) .json({message: 'ok'}) }); const options = { key: fs.readFileSync(\_\_dirname + '/server.key'), cert: fs.readFileSync(\_\_dirname + '/server.crt') } spdy .createServer(options, app) .listen(port, (error) => { if (error) { console.error(error) return process.exit(1) } else console.log('Listening on port: ' + port + '.') });

啟動

`<code class="EnlighterJSRAW" data-enlighter-language="null">node index.js`

載入一般的http的話是這個畫面

![1](https://bgpsekai.thisistap.com/wp-content/uploads/2016/08/1-500x168.jpg)

https

![2](https://bgpsekai.thisistap.com/wp-content/uploads/2016/08/2-500x237.png)

繼續前往囉

會出現警告是因為憑證並沒有被信任，取得憑證需要有DN，不過我們現在只是在local端測試，當然不會有結果…

晚點會說明如何讓本機信任self-signed憑證

現在先來解決這個假的http/2

![3](https://bgpsekai.thisistap.com/wp-content/uploads/2016/08/3-489x500.png)

稍微研究了一下原因：請移駕至下方文件【谷歌瀏覽器 HTTP/2 降級回 HTTP/1.1？】

就是NPN與ALPN的愛恨情仇…

最簡單的解決方法：使用node.js v6 (可以參考下方倒數的兩篇文章)

![5](https://bgpsekai.thisistap.com/wp-content/uploads/2016/08/5-489x500.png)

有沒有，成功了。

基本上做到這邊就可以了，如果不喜歡憑證紅紅的，繼續看下去唄。

至於信任憑證，這邊只說明Windows的方法…

`<code class="EnlighterJSRAW" data-enlighter-language="null">server.crt`

安裝憑證…

目前使用者與本機並無差別，就是字面上的意思。

選取”將所有憑證放入以下的存放區”，選取”受信任的根憑證授權單位”，重啟瀏覽器。

![1](https://bgpsekai.thisistap.com/wp-content/uploads/2016/08/1.png)

其實有點欺騙自己的感覺…

以上.

了解 HTTP/2 的特色與 HTTP/1.1 的差異:

[https://simular.co/knowledge/site-build/68-about-http2-and-http11.html](https://simular.co/knowledge/site-build/68-about-http2-and-http11.html)

HTTP/2: A QUICK LOOK

[http://blog.scottlogic.com/2014/11/07/http-2-a-quick-look.html](http://blog.scottlogic.com/2014/11/07/http-2-a-quick-look.html)

Easy HTTP/2 Server with Node.js and Express.js

[http://webapplog.com/http2-node/](http://webapplog.com/http2-node/)

谷歌瀏覽器 HTTP/2 降級回 HTTP/1.1？

[https://blog.wdt.im/supporting-http2-google-chrome-users/](https://blog.wdt.im/supporting-http2-google-chrome-users/)

How to Install the Latest Versions of NodeJS and NPM for Ubuntu 14.04 LTS

[http://askubuntu.com/questions/594656/how-to-install-the-latest-versions-of-nodejs-and-npm-for-ubuntu-14-04-lts](http://askubuntu.com/questions/594656/how-to-install-the-latest-versions-of-nodejs-and-npm-for-ubuntu-14-04-lts)

windows下管理多个版本nodejs

[http://shalles.github.io/blog/tools/2015/04/27/windows-nodejs-version-controller](http://shalles.github.io/blog/tools/2015/04/27/windows-nodejs-version-controller)
