
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
   allUsers:[]
  },

  onLoad: function(option){

    var that = this;
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      player: JSON.parse(option.content)
    })
    console.log(this.data.player)
    // 获取手机宽高
    publicJs.getSystem(that,function(){
      that.setData({heigh: that.data.windowHeight - 55})
    });

    console.log(this.data.player)

    var allUsers = this.data.player.playbackUsers;
    var playbackUsers = this.data.player.playbackUsers;
    var onlineUsers = this.data.player.onlineUsers;
    for(var i = 0 ; i < playbackUsers.length; i++){
      for(var j = 0; j < onlineUsers.length; j++ ){
        if(playbackUsers[i].userCode == onlineUsers[j].userCode){
          allUsers[i]['onlineStatus'] = onlineUsers[j].onlineStatus
        }
      }
    }
    console.log(this.data.player.playbackUsers)
    console.log(allUsers)
    this.setData({
      allUsers:allUsers
    })
  },
  goRoom: function(){
    var roomId = this.data.player.roomId;
    var sclasscode = this.data.player.sCode;
    var nlessonno = this.data.player.nLessonNo;
    var status = this.data.player.status;
    wx.navigateTo({url:'/search/playerRoom/playerRoom?roomid='+roomId+'&sclasscode='+sclasscode+'&nlessonno='+nlessonno+'&status='+status})
  }
 
  // 获取信息
  // getDateInfos: function(callback){
  //   var that = this;
  //   // 时间戳
  //   var stamp = new Date().getTime();
  //   // 学年
  //   var year = this.data.schoolYear;
  //   // 学期
  //   var nSemester = this.data.nSemester;
  //   // 教师token
  //   var token = this.data.teacherToken;
  //   // 获取信息的类型
  //   var date = this.data.date;
  //   var query = {
  //     appid: appId,
  //     timestamp:stamp,
  //     token:token,
  //     date:date,
  //   }
  //   var option = {
  //     api:'api/Calendar/MonthCourse',
  //     query: query,
  //     type: 'get',
  //   }
  //   wx.showLoading({
  //     title:'努力加载中...',
  //     success: function(){
  //       requests.request(option, function(res){
  //         getRes(res);
  //       })
  //       function getRes(res){
  //         if(res.data.ResultType == 0){
  //           var result = res.data.AppendData;
  //           // console.log(result)
          
  //           that.setData({dateInfos:result})
  //           callback();

  //         }else if(res.data.ResultType == 7){
  //           publicJs.resultTip(res.data.Message)
  //           if(res.data.Message == '身份验证失败'){
  //             wx.clearStorageSync();
  //             wx.reLaunch({ url: '/pages/index/index'})
  //           }
            
  //         }
  //         setTimeout(()=>{
  //           wx.hideLoading()
  //         },500)
  //       }
  //     }
  //   })
    
  // },
 
  
  
})


