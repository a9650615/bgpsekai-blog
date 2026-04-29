---
title: "GPG驗證的使用方法"
slug: how-to-use-gpg-verification
pubDate: 2020-05-14T16:29:29.000+08:00
author: sheepdragon
tags:
  - gpg
updatedDate: 2020-05-14T16:35:17.000+08:00
featureImage: ../../assets/blog/content/images/2020/05/---1.png
excerpt: "GPG驗證的使用方法"
---

以John the Ripper來講，  
在官網下載了john-1.9.0-jumbo-1.tar.xz.sign和john-1.9.0-jumbo-1.tar.xz，  
放在同一個資料夾。

`user@master:~$ gpg '/tmp/mozilla_user0/john-1.9.0-jumbo-1.tar.xz.sign'`

就會出現這個。

```
gpg '/tmp/mozilla_user0/john-1.9.0-jumbo-1.tar.xz.sign' 
gpg: WARNING: no command supplied.  Trying to guess what you mean ...
gpg: assuming signed data in '/tmp/mozilla_user0/john-1.9.0-jumbo-1.tar.xz'
gpg: Signature made Tue 14 May 2019 10:21:53 AM PDT
gpg:                using RSA key 05C027FD4BDC136E
gpg: Can't check signature: No public key
```

將RSA Key拿去驗證。

`user@master:~$ gpg --receive-keys 05C027FD4BDC136E`

之後出現這些。

```
gpg: key 05C027FD4BDC136E: 5 signatures not checked due to missing keys
gpg: key 05C027FD4BDC136E: public key "Openwall offline signing key" imported
gpg: no ultimately trusted keys found
gpg: Total number processed: 1
```

在執行一次簽證。

`user@master:~$ gpg '/tmp/mozilla_user0/john-1.9.0-jumbo-1.tar.xz.sign'`

就會出現主鑰了。

```
gpg: WARNING: no command supplied.  Trying to guess what you mean ...
gpg: assuming signed data in '/tmp/mozilla_user0/john-1.9.0-jumbo-1.tar.xz'
gpg: Signature made Tue 14 May 2019 10:21:53 AM PDT
gpg:                using RSA key 05C027FD4BDC136E
gpg: Good signature from "Openwall offline signing key" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 297A D21C F86C 9480 8152  0C18 05C0 27FD 4BDC 136E
```

再去尋找官方公布的主鑰

```
Openwall offline signing key
pub   4096R/4BDC136E 2017-11-18
      Key fingerprint = 297A D21C F86C 9480 8152  0C18 05C0 27FD 4BDC 136E
sub   4096R/3939CC14 2017-11-18
```

一樣就完成了。
