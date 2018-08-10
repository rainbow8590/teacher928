
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;
Page({
  data: {
    tabBarArr:[
      {id:0,txt:'录入',classname:'icon-write',changeTextColor:'#888',isChange: false},
      {id:1,txt:'查询',classname:'icon-searchactive',changeTextColor:'#1FBB1C',isChange: true},
      {id:2,txt:'任务',classname:'icon-tasking',changeTextColor:'#888',isChange: false},
      {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888',isChange: false},
    ],
    showModalStatus: false, //控制导航显示
    isopen:'open',  //控制菜单显示
    teacherName: '', //教师名称
    teacherToken:'', //教师token
    noticeType: 3, // 默认获取任务, -1是智库
    taskArr:[], //任务数组
    thinkArr:[], //智库数组
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(){
    var that = this;
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      noAuditing: wx.getStorageSync('noAuditing'),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')
    })
    // 获取手机宽高
    publicJs.getSystem(that,function(){
      that.setData({heigh: that.data.windowHeight - 55})
    });

    this.getNotices(3);
    this.getNotices(-1);
  },
  // 退出登录
  unlogin: function(){
    publicJs.unlogin()
  },
   // 关闭弹窗
  closeFloat: function(e){
    publicJs.closeFloat(e,this)
  },
  // 菜单按钮
  powerDrawer: function (e) {
    publicJs.powerDrawer(e,this)
  },
  // 关闭导航
  closeNav: function(e){
    console.log(e)
    publicJs.closeNav(e,this)
  },
  // 点击改变tabBar颜色
  // changeColor: function(e){
  //   publicJs.changeColor(e,this)
  // },
  // 跳转详情页面
  goDetail: function(e){
    console.log(e)
    var noticeId = e.currentTarget.dataset.noticeid;
    wx.navigateTo({url:'/search/notice_Detail/notice_Detail?id='+noticeId})
  },
  // 获取信息
  getNotices: function(noticeType){
    var that = this;
    // 时间戳
    var stamp = new Date().getTime();
    // 学年
    var year = this.data.schoolYear;
    // 学期
    var nSemester = this.data.nSemester;
    // 教师token
    var token = this.data.teacherToken;
    // 获取信息的类型
    var noticeType = noticeType;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      pagesize:50,
      pageindex:1,
      noticetype:noticeType,
    }
    var option = {
      api:'api/Notice/NoticeList',
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
            var result = res.data.AppendData;
            if(noticeType == 3){
              for(var i = 0 ; i < result.length; i++){
                that.data.taskArr.push({
                  sTitle: result[i].sTitle,
                  sNoticeId: result[i].NoticeId,
                  sIsLook: result[i].IsLook,
                  sDate: result[i].dtStartdate.substr(0,result[i].dtStartdate.indexOf('T')),
                })
              }
              that.setData({taskArr:that.data.taskArr})
            }else if(noticeType == -1){
              for(var i = 0 ; i < result.length; i++){
                that.data.thinkArr.push({
                  sTitle: result[i].sTitle,
                  sNoticeId: result[i].NoticeId,
                  sIsLook: result[i].IsLook,
                  sDate: result[i].dtStartdate.substr(0,result[i].dtStartdate.indexOf('T')),
                })
              }
              that.setData({thinkArr:that.data.thinkArr})
            }
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


