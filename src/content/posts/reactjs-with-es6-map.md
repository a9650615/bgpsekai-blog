---
title: ReactJS with ES6 - Map
slug: reactjs-with-es6-map
pubDate: 2016-04-09T07:25:38.000+08:00
author: a7612626
tags: []
updatedDate: 2016-07-28T21:37:48.000+08:00
excerpt: "import React, { Component } from 'react'; class MapTest extends Component { render() { var newsNodes = this.props.data.map(function(news) { return ( {news.title} {news.time} ); }); return ( 主題 時間 {newsNodes} ); } } export class Test extends Component { constructor(props) { super(props); this.state = {data: []}; this.loadNewsFromServer(); } loadNewsFromServer() { $.ajax({ url: ' http://211.23.17.100/itravel/index.php?view=getTravelNewsList', dataType: 'json', type: 'POST', data: {page: 1}, suc"
---

<!-- removed: dead image https://bgpsekai.thisistap.com/wp-content/uploads/2016/04/pasted-image-0-500x171.png -->

import React, { Component } from 'react'; class MapTest extends Component { render() { var newsNodes = this.props.data.map(function(news) { return ( {news.title} {news.time} ); }); return ( {newsNodes}

| 主題 | 時間 |
| --- | --- |

); } } export class Test extends Component { constructor(props) { super(props); this.state = {data: \[\]}; this.loadNewsFromServer(); } loadNewsFromServer() { $.ajax({ url: '[http://211.23.17.100/itravel/index.php?view=getTravelNewsList](http://211.23.17.100/itravel/index.php?view=getTravelNewsList)', dataType: 'json', type: 'POST', data: {page: 1}, success: function(data) { this.setState({data: data.result}); }.bind(this) }); } render() { return (

); } }
