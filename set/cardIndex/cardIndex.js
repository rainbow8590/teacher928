var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
// var check = require('../../utils/check.js');
//获取应用实例
var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;

Page({
  data: {
    tabBarArr:[
      {id:0,txt:'录入',classname:'icon-write',changeTextColor:'#888',isChange: false},
      {id:1,txt:'查询',classname:'icon-search',changeTextColor:'#888',isChange: true},
      {id:2,txt:'任务',classname:'icon-tasking',changeTextColor:'#888',isChange: false},
      {id:3,txt:'工具',classname:'icon-settingactive',changeTextColor:'#1FBB1C',isChange: false},
    ],
    yearArr:app.globalData.yearArr,
    semesterArr: app.globalData.semesterArr,
    teacherName:'',
    resultH:400,
    schoolYear: new Date().getFullYear(),
    semester:'秋季',
    showModalStatus: false,//控制导航显示
    isopen:'open',//控制菜单按钮显示
    show: false,//控制公共弹窗显示
    show1: false,//控制按钮弹窗显示
    tipClassIndex: 0, //点击的班级序号
    tipKejieIndex: 0, //点击的课节序号
    nSemester: 1,  //学年
    inpStr: '',//公共字符串
    arr:[],// 公共数组
    zoomShow: false,
    isAjaxOver: false,

    // 圆半径
    radius: 260,
    showCanvas: false,
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(){
    var that = this;
    that.startY = this.moveY = 0;
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      noAuditing: wx.getStorageSync('noAuditing'),
      nSemester: publicJs.flagSemester(),
      semester: publicJs.flagSemester() == 4? this.data.semesterArr[0].value:this.data.semesterArr[publicJs.flagSemester()].value,
      schoolYear: publicJs.flagYear(),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')
    })
    // 校验是否在其他设备 上登陆
    requests.check(this)

    // 获取手机宽高
    publicJs.getSystem(that,function(){
      that.setData({resultH: that.data.windowHeight -108})
    });

    wx.setStorageSync('tipKejieIndex',1);
    this.getClassList();
    // this.draw(0,100);
  },

  // 显示弹窗 学年
  getYear: function (e) {

    this.setData({arr: this.data.yearArr,inpStr: e.detail.detail,show:true})
    // this.selectPopup.showPopup()
  },
  // 显示弹窗 学期
  getSemester: function (e) {
    this.setData({arr: this.data.semesterArr,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
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
  // 改变班级相关值
  goTaskProgress: function(e){
    this.setData({
      tipClassIndex:e.currentTarget.dataset.num
    })
    wx.setStorageSync('tipClassIndex',this.data.tipClassIndex)
    if(this.data.classes[0].value != "您此学期没有课程"){
      wx.navigateTo({url:'/set/taskProgress/taskProgress?page=cardIndex'})
    }else{
      return;
    }
  },

  // 获取点击的弹窗的id和value值
  getIndex:function(e){
    var inpStr = this.data.inpStr;
    this.setData({show: false})
    if(inpStr == 'year'){ //年份
      if(this.data.schoolYear == e.detail.detail.dataset.id) return;
      this.setData({
        schoolYear:e.detail.detail.dataset.id, 
        classInn: this.data.classes[0].value
      })
      // 缓存选择的年份
      wx.setStorageSync('year',e.detail.detail.dataset.id);
      this.getClassList();
    }else if(inpStr == 'semester'){ //学期
      if(this.data.semester == this.data.arr[e.detail.detail.dataset.id-1].value) return;
      this.setData({
        semester:this.data.arr[e.detail.detail.dataset.id-1].value, 
        nSemester:this.data.arr[e.detail.detail.dataset.id-1].semester, 
        classInn: this.data.classes[0].value
      })
      // 缓存选择的学期的编号
      wx.setStorageSync('semesterIndex',e.detail.detail.dataset.id);
      this.getClassList();
    }
  },
  
  // 班级列表
  getClassList: function(){
    var that = this;
    // 时间戳
    var stamp = new Date().getTime();
    var year = this.data.schoolYear;
    var nSemester = this.data.nSemester;
    var token = this.data.teacherToken;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      pagesize:50,
      pageindex:1,
      nsemester:nSemester,
      nclassyear:year,
    }
    var option = {
      api:'api/Class',
      query: query,
      type: 'get',
    }
    wx.showLoading({
      title:'努力加载中...',
      success: function(){
        requests.request(option,function(res){
          getRes(res)
        })
        
        function getRes(res){
          if(res.data.ResultType == 0){
            that.setData({isAjaxOver: true})
            var resData = res.data.AppendData;
            // if(resData.length == 0){
            //   that.setData({classes:['您此学期没有课程']});
            // }else{
              classList.classList(that.data.classes,resData,that);
            // }
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
