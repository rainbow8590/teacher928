
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');

//获取应用实例
var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;
Page({
  data: {

    teacherToken:'', //教师token
   
  },

  onLoad: function(option){
    console.log(option)
    var that = this;
    this.roomId = option.roomid
    this.sClassCode = option.sclasscode
    this.nLessonNo = option.nlessonno
    this.status = option.status
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      
    })
    // 获取手机宽高
    publicJs.getSystem(that,function(){
      that.setData({heigh: that.data.windowHeight - 55})
    });

    // console.log(this.status)
    // 1 学员观看 上课中  
    // 2 观看回放  已下课
    /*if(this.status == 1){
      console.log(this.status)
      wx.setNavigationBarTitle({
        title:'学员观看'
      })
    }else{
      console.log(this.status)
      wx.setNavigationBarTitle({
        title:'观看回放'
      })
    }*/
   this.getUrl();
  },
 
  //获取直播地址
  getUrl: function(){
    var that = this;

    var stamp = new Date().getTime();
    // 教师token
    var token = this.data.teacherToken;

    var date = this.data.date;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      sclasscode:this.sClassCode,
      nlessonno:this.nLessonNo,
      roomid:this.roomId,
    }
    var option = {
      api:'api/Calendar/GetOnlineClassUrl',
      query: query,
      type: 'get',
    }
    wx.showLoading({
      title:'努力加载中...',
      success: function(){
        requests.request(option, function(res){
          getRes(res);
        })
        function getRes(res){
          if(res.data.ResultType == 0){
            var result = res.data.AppendData;
            // console.log(result)
            var reg = /http/;
            var result1= result.replace(reg,'https')
            // console.log(result1)

          
            that.setData({url:result1})


          }else if(res.data.ResultType == 7){
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          }
          setTimeout(()=>{
            wx.hideLoading()
          },500)
        }
      }
    })
    
  },
 
  
  
})


