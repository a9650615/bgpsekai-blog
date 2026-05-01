---
title: "laravel安裝小bug及nginx配置檔保存"
slug: laravel-e5-ae-89-e8-a3-9d-e5-b0-8fbug-e5-8f-8anginx-e9-85-8d-e7-bd-ae-e6-aa-94-e4-bf-9d-e5-ad-98
pubDate: 2016-04-12T07:55:15.000+08:00
author: a9650615
tags:
  - laravel
  - nginx
updatedDate: 2016-04-14T07:04:07.000+08:00
# featureImage removed: dead image https://bgpsekai.thisistap.com/wp-content/uploads/2016/04/2014-4-11-installlaravelerror.png
excerpt: "[vc_row][vc_column][vc_column_text]今天使用 laravel v1.3.2的 installer 安裝 laravel 之後 new 了一個 project，結果出現了詭異的問題。 > TTY mode is not supported on windows platform. 難道是 windows 的錯!? 結果看來不是，因該是 laravel 1.3.2 installer 的 bug 。 [https://birdyo.ddns.net/blog/wp-content/uploads/2016/04/2014-4-11-installlaravelfind.png] 解法 composer create-project --prefer-dist laravel/laravel blog [/vc_column_text][/vc_column][/vc_row][vc_row][vc_column][vc_text_separator title=”nginx 配置檔”][vc_column_text] server"
---

\[vc\_row\]\[vc\_column\]\[vc\_column\_text\]今天使用 laravel v1.3.2的 installer 安裝 laravel 之後 new 了一個 project，結果出現了詭異的問題。

> TTY  mode is not supported on windows platform.

難道是 windows 的錯!?

結果看來不是，因該是 laravel 1.3.2 installer 的 bug 。

<!-- removed: dead image https://birdyo.ddns.net/blog/wp-content/uploads/2016/04/2014-4-11-installlaravelfind-500x171.png -->

解法

composer create-project --prefer-dist laravel/laravel blog

\[/vc\_column\_text\]\[/vc\_column\]\[/vc\_row\]\[vc\_row\]\[vc\_column\]\[vc\_text\_separator title=”nginx 配置檔”\]\[vc\_column\_text\]

server { #监听端口 listen 8000; #域名 server\_name servername; #默认访问的文件 index index.html index.htm index.php; #代码根目录 root path\_to\_your\_dir\_name; charset utf-8; #匹配站点内的所有链接 # 将http://meitubar.com/users 这样的请求全部转发到index.php/users 上面去，其实就是rewrite了 location / { try\_files $uri $uri/ /index.php?$query\_string; } # try\_files 及$uri 的具体含义参考: [HttpCoreModule](http://nginx.org/en/docs/http/ngx_http_core_module.html) location = /favicon.ico { access\_log off; log\_not\_found off; } # 匹配favicon.ico时，关闭日志 location = /robots.txt { access\_log off; log\_not\_found off; } # 同上 # 不知道为什么我的Laravel如果木有设置下面的缓存时间的话，会直接404返回回来 location ~ .\*.(js|css|png|jpg)?$ { expires 12h; # 设置缓存时间 } access\_log off; # 关闭访问日志 error\_log D:/works/php/meitubar-error.log error; #设置错误日志的位置 error\_page 404 /index.php; # 定义出错页面，出错时，直接跳转到首页 sendfile off; # 关闭sendfile选项 # 配置解析php文件的方式 location ~ .php$ { #root path\_to\_your\_dir; fastcgi\_pass 127.0.0.1:9123; #fastcgi\_param HTTPS on; fastcgi\_index index.php; fastcgi\_param SCRIPT\_FILENAME $document\_root$fastcgi\_script\_name; include fastcgi\_params; } location ~ /.ht { deny all; } }

\[/vc\_column\_text\]\[/vc\_column\]\[/vc\_row\]
