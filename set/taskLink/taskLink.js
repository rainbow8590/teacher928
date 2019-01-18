
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;
Page({
  data: {
    src:''
  },
  onLoad: function(option){
    // console.log(option)
    var query = option.id.split(',')
    var that = this;
    this.setData({
      classCode: query[0],
      tipKejieIndex: query[1],
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
    })
    this.getUrl();
  },

  onShareAppMessage: function(){
    var that = this;
    var infos = this.data.classCode +','+this.data.tipKejieIndex+','+this.data.sRemainTime+','+this.data.futureTime+','+ this.data.teacherToken;
    this.setData({showBtn1: false})
    return {
      title: '完成作业来打卡喽',
      path: '/set/parentLogin/parentLogin?id='+infos+'&from=task',
      success: function(res){
        // wx.navigateTo({url:'/set/parentLogin/parentLogin?id='+infos})
      }
    }
  },
  getUrl:function(){
    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken;
    var classCode = this.data.classCode;
    var keJieId = this.data.tipKejieIndex;

    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nlessonno:keJieId,
      sclasscode:classCode,
    }
    var option = {
      api:'api/PunchLink',
      query: query,
      type: 'get',
    }

    wx.showLoading({
      title:'加载中......',
      success: function(){
        requests.request(option,function(res){
           wx.hideLoading()
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            var futureTime = resData.dtEndDate.replace('T',' ').replace(/\-/g,'/');
            that.setData({src: resData.picUrl,sRemainTime:resData.sRemainTime,futureTime:futureTime})  
            // console.log(that.data.src)
          }else if(res.data.ResultType == 7){
           publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          }
        })
      }
    })
  },
  

})

