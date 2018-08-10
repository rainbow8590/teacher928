
var publicJs = require('../../utils/public.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
//获取应用实例
const app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;
Page({
  data: {
    tabBarArr:[
      {id:0,txt:'录入',classname:'icon-write',changeTextColor:'#888',isChange: true},
      {id:1,txt:'查询',classname:'icon-search',changeTextColor:'#888',isChange: false},
      {id:2,txt:'任务',classname:'icon-taskingactive',changeTextColor:'#1FBB1C',isChange: false},
      {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888',isChange: false},
    ],
    zoomShow: false,
    showModalStatus: false,//控制导航显示
    isopen: 'open',//控制菜单按钮显示
    isAjaxOver1: false
  },
  onReady: function(){
    this.selectPopup = this.selectComponent("#selectPopup");
  },
  onLoad:function(){
    var that = this;
    this.setData({
      teacherToken:wx.getStorageSync('teacherToken'),
      teacherName: wx.getStorageSync('teacherName'),
      identity: wx.getStorageSync('identity')
    })
    // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({heigh: that.data.windowHeight - 55})
    });
    this.getTrainBase()
  },
  onShow:function(){
    // 实习期作业状态
    var completeTask = wx.getStorageSync('completeTask')
    var completeLesson = wx.getStorageSync('completeLesson')

    if(this.data.baseInfo){
      //实习期作业首次进入未完成, 返回的时候已完成
      console.log('=='+this.data.baseInfo.bTaskFinish,completeTask)
      if(!this.data.baseInfo.bTaskFinish&&completeTask){
        this.getTrainBase()
      }
      // 听课任务首次进入未完成, 返回的时候已完成
      console.log('=='+this.data.baseInfo.bListenFinish,completeLesson)
      if(this.data.baseInfo.bListenFinish!=completeLesson){
        this.getTrainBase()
      }
    }
  },
  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
  },
  // 退出登录
  unlogin: function(){
    publicJs.unlogin()
  },
  // 菜单按钮
  powerDrawer: function (e) {
    publicJs.powerDrawer(e,this)
  },
  // 关闭导航
  closeNav: function(e){
    publicJs.closeNav(e,this)
  },
  // 点击改变tabBar颜色
  changeColor: function(e){
    publicJs.changeColor(e,this);
  },
  // 实习期作业
  goPractiveJob: function(e){
    wx.navigateTo({url: '/task/practiceJob/practiceJob?baseInfo='+JSON.stringify(this.data.baseInfo)})
  },
  //听课任务
  goLessonTask: function(e){
    wx.navigateTo({url: '/task/lessonTask/lessonTask?bListenFinish='+this.data.baseInfo.bListenFinish})
  },
  // 获取培训基本信息
  getTrainBase: function(){
    var that = this;
    var token = this.data.teacherToken;
    var stamp = new Date().getTime();
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
    }
    var option = {
      api:'api/TeacherTrain/GetTrainBaseInfo',
      query: query,
      type: 'get',
    }
    wx.showLoading({
      title:'努力加载中...',
      success: function(){
        requests.request(option, function(res){
          getRes(res)
        })
        function getRes(res){
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            resData.ListenTime = resData.ListenTime.substr(0,resData.ListenTime.indexOf('T'))
            resData.TaskEndTime = resData.TaskEndTime.substr(0,resData.TaskEndTime.indexOf('T'))
            that.setData({baseInfo: resData})
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
  }
 
})
