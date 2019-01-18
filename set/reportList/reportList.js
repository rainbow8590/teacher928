
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;
Page({
  data: {
    url:''
  },
  onLoad: function(option){
    console.log(option)
    var that = this;
    this.setData({
      studentToken: option.studentToken,
    })
    this.setData({url:'https://weixin.gaosiedu.com/app/report/#/?token='+this.data.studentToken})
    console.log(this.data.url)
  },

})

