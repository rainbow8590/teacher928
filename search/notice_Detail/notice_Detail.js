
var WxParse = require('../../wxParse/wxParse.js');
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
    teacherName:'',
    showModalStatus: false, //控制导航显示
    isopen:'open',  //控制菜单显示
    teacherName: '', //教师名称
    teacherToken:'', //教师token
    showArrow:true, //显示当前tab的箭头
    noticeType: 3, // 默认获取任务, -1是智库
    title:'',
    content:'<div>1111</div>',
    noticeId:'',// 文章id
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(option){
    var that = this;
    console.log(option)
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      noticeId: option.id,
      noAuditing: wx.getStorageSync('noAuditing'),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')
    })
    // 获取手机宽高
    publicJs.getSystem(that,function(){
      that.setData({heigh: that.data.windowHeight - 55 - 55})
    });

    this.getNoticeDetail()
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
    publicJs.closeNav(e,this)
  },

  // 获取信息
  getNoticeDetail: function(){
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
    var noticeID = this.data.noticeId;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      noticeid:noticeID
    }
    var option = {
      api:'api/Notice/NoticeInfo',
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
            var content = res.data.AppendData.sContent;
            that.setData({
              title:res.data.AppendData.sTitle,
            })
            // 处理富文本
            WxParse.wxParse('article', 'html', content, that, 20);
          }if(res.data.ResultType == 7){
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
            // wx.showModal({
            //   title: '提示',
            //   content: '请重新登陆',
            //   showCancel: false,
            //   success:function(){
            //     wx.clearStorageSync();
            //     wx.reLaunch({ url: '/pages/index/index'})
            //   }
            // })
          }
          setTimeout(()=>{
            wx.hideLoading()
          },500)
        }
        
      }
    })
    
  },
 
  
})
