
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
    windowHeight:0,
    windowWidth: 0,
    imageW: 0,
    imageH: 0,
    showImg:false,
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
    this.startY = this.moveY = 0;
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
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({resultH: that.data.windowHeight - 108})
    });
    this.getClassList();

  },
  loadImg: function(e){
    this.setData({imageW: e.detail.width,imageH: e.detail.height})
  },
  // 显示弹窗 学年
  getYear: function (e) {
    if(this.data.isAjaxOver){
      this.setData({arr: this.data.yearArr,inpStr: e.detail.detail})
      this.selectPopup.showPopup()
    }
  },
  // 显示弹窗 学期
  getSemester: function (e) {
    if(this.data.isAjaxOver){
      this.setData({arr: this.data.semesterArr,inpStr: e.detail.detail})
      this.selectPopup.showPopup()
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
  goPic: function(e){
    if(this.data.classes[0].value == '您此学期没有课程'){
      this.setData({
        show1: false,
        // inpStr:e.currentTarget.dataset.id,
        // tipClassIndex:e.currentTarget.dataset.index,
      })
    }else{
       this.setData({
        show1: true,
        inpStr:e.currentTarget.dataset.id,
        tipClassIndex:e.currentTarget.dataset.index,
      })
    }
  },
  // 获取点击的弹窗的id和value值
  getIndex:function(e){
    var inpStr = this.data.inpStr;
    this.setData({show: false})
    if(inpStr == 'classes'){  //班级
      this.setData({
        tipKejieIndex:e.detail.value, 
        show1: false,
      })
      // 缓存选择的班级信息的编号
      wx.setStorageSync('tipKejieIndex',e.detail.value);
      this.getUrl();
      this.setData({showImg:true})
    }else if(inpStr == 'year'){ //年份
      if(this.data.schoolYear==e.detail.detail.dataset.id) return;
      this.setData({
        schoolYear:e.detail.detail.dataset.id, 
        classInn: this.data.classes[0].value
      })
      this.getClassList();
      // 缓存选择的年份
      wx.setStorageSync('schoolYear',e.detail.detail.dataset.id);
    }else if(inpStr == 'semester'){ //学期
      if(this.data.semester==this.data.arr[e.detail.detail.dataset.id-1].value) return;
      this.setData({
        semester:this.data.arr[e.detail.detail.dataset.id-1].value, 
        nSemester:this.data.arr[e.detail.detail.dataset.id-1].semester, 
        classInn: this.data.classes[0].value
      })
      this.getClassList();
      // 缓存选择的学期的编号
      wx.setStorageSync('semesterIndex',e.detail.detail.dataset.id);
    }
  },
  // 班级列表
  getClassList: function(){
    var that = this;
    // 时间戳
    var stamp = new Date().getTime();
    // 学年
    var year = this.data.schoolYear;
    // 学期
    var nSemester = this.data.nSemester;
    // 教师token
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
          getRes(res);
        })
        function getRes(res){
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            // if(resData.length == 0){
            //   that.setData({classes:['您此学期没有课程']});
            // }else{
              classList.classList(that.data.classes,resData,that);
              that.setData({isAjaxOver: true})
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
  //获取图片地址
  getUrl: function(){
    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken;
    var classCode = this.data.classInfo[this.data.tipClassIndex].classCode;
    var keJieId = this.data.tipKejieIndex;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nlesson:keJieId,
      sclasscode:classCode,
    }
    var option = {
      api:'api/CreatePic',
      query: query,
      type: 'get',
    }
    requests.request(option, function(res){
      if(res.data.ResultType == 0){
        var resData = res.data.AppendData;
        that.setData({src: resData})
        var arr = [];
        arr.push(resData)
          wx.previewImage({
            current: resData, // 当前显示图片的http链接
            urls: arr,
          })

        
      }
    })
    
  },
  
})
