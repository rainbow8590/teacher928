
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
      {id:0,txt:'录入',classname:'icon-writeactive',changeTextColor:'#1FBB1C',isChange: true},
      {id:1,txt:'查询',classname:'icon-search',changeTextColor:'#888',isChange: false},
      {id:2,txt:'任务',classname:'icon-tasking',changeTextColor:'#888',isChange: false},
      {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888',isChange: false},
    ],
    yearArr:app.globalData.yearArr,
    semesterArr: app.globalData.semesterArr,
    schoolYear: new Date().getFullYear(),
    semester:'秋季',
    showModalStatus: false, //控制导航显示
    isopen:'open',  //控制菜单显示
    teacherName: '', //教师名称
    teacherToken:'', //教师token
    classInfo:[], //课程信息
    classes: [], //班级
    nSemester: 1,  //学年
    tipClassIndex: 0, //点击的第几个班级
    show:false, //控制弹窗显示
    arr:[], //公共数组
    inpStr:'',   //公共显示的字符串
    classInn: '',  //显示的班级字符串
    getkind: 1, // 查询类型 基本/期中期末
    zoomShow: false,
    isAjaxOver: true, //判断数据请求是否完成
    date: new Date().getFullYear()+'/'+(new Date().getMonth()+1)+'/'+new Date().getDate()
  },
  onReady: function(){
    this.selectPopup = this.selectComponent("#selectPopup");
  },
  onLoad: function(){
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
    wx.setStorageSync('schoolYear',this.data.schoolYear);
    wx.setStorageSync('semesterIndex',this.data.nSemester);
    wx.setStorageSync('kind',this.data.kind);
    this.getClassList();
  },
  onShow:function(){
    // 区分条件是 用户是第一次进入还是从下级返回的,通过tipClassIndex来区分
    var oldIndex = this.data.tipClassIndex;
    var newIndex = wx.getStorageSync('tipClassIndex');
   if(wx.getStorageSync('classes')){
      this.setData({classes:wx.getStorageSync('classes')});
    }
    if(newIndex){
      // 如果两个值一样 说明是第一次进入或进入后没有选择班级就进入下一级页面
      if(oldIndex == newIndex){
        wx.setStorageSync('tipClassIndex',this.data.tipClassIndex); 
      }
      // 两个值不一样，说明是从下级页面返回的
      else{
        this.setData({
          classInn: this.data.classes[wx.getStorageSync('tipClassIndex')].value
        })
      }
    }
  },
  // 显示弹窗 学年
  getYear: function (e) {
    if(this.data.isAjaxOver){
      this.setData({arr: this.data.yearArr,inpStr: e.detail.detail.dataset.id})
      this.selectPopup.showPopup()
    }
  },
  // 显示弹窗 学期
  getSemester: function (e) {
    if(this.data.isAjaxOver){
      this.setData({arr: this.data.semesterArr,inpStr: e.detail.detail.dataset.id})
      this.selectPopup.showPopup()
    }
  },
  // 显示弹窗 班级
  getClass: function (e) {
    if(this.data.isAjaxOver){
      this.setData({arr: this.data.classes,inpStr: e.detail.detail.dataset.id})
      this.selectPopup.showPopup()
    }
  },
  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
  },
  
  
  
  // 菜单按钮
  powerDrawer: function (e) {
    console.log(e)
    publicJs.powerDrawer(e,this)
  },
  // 关闭导航
  closeNav: function(e){
    publicJs.closeNav(e,this)
  },

  // 获取类型（基础信息/期中期末）
  getKind: function(e){
    this.setData({getkind: Number(e.detail.value)})
    wx.setStorageSync('getkind',this.data.kind);
  },
  // 获取点击的弹窗的id和value值
  getIndex:function(e){
    var inpStr = this.data.inpStr;
    this.setData({show: false})
    if(inpStr == 'year'){
      if(this.data.schoolYear == e.detail.detail.dataset.id) return;
      this.setData({
        schoolYear:e.detail.detail.dataset.id, 
        classInn: this.data.classes[0].value
      })
      this.getClassList();
      wx.setStorageSync('schoolYear',e.detail.detail.dataset.id);
    }else if(inpStr == 'semester'){
      if(this.data.semester==this.data.arr[e.detail.detail.dataset.id-1].value) return;
      this.setData({
        semester:this.data.arr[e.detail.detail.dataset.id-1].value, 
        nSemester:this.data.arr[e.detail.detail.dataset.id-1].semester, 
        classInn: this.data.classes[0].value
      })
      this.getClassList();
      wx.setStorageSync('semesterIndex',e.detail.detail.dataset.id);
    }else if(inpStr == 'class'){
      this.setData({
        classInn:this.data.arr[e.detail.detail.dataset.id].value, 
        tipClassIndex:e.detail.detail.dataset.id, 
      })
      // 缓存选择的班级信息的编号
      wx.setStorageSync('tipClassIndex',this.data.tipClassIndex);
    }
  },
  
 
  // 点击确定
  goDetail: function(){
    if(this.data.classes.length == 1 && this.data.classes[0].value == '您此学期没有课程') return;
    if(this.data.getkind == 1){
      wx.navigateTo({url:'/write/schoolBase/schoolBase'})
    }else if(this.data.getkind == 2){
      this.getGrade()
    }
  },
  // 获取年级
  getGrade:function(){
    var that = this;
    // 时间戳
    var stamp = new Date().getTime();
    // 年级
    var grade = this.data.classInfo[this.data.tipClassIndex].nGrade;
    // 教师token
    var token = this.data.teacherToken;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      grade:grade
    }
    var option = {
      api:'api/IsSchool',
      query: query,
      type: 'get',
    }
    requests.request(option, function(res){
      getRes(res);
    })
    function getRes(res){
      if(res.data.ResultType == 0){
        if(res.data.Message == '小学'){
          publicJs.resultTip('小学暂未开放此功能')
         
        }else{
          wx.navigateTo({url:'/write/schoolScore/schoolScore'})
        }
      }else if(res.data.ResultType == 7){
        publicJs.resultTip(res.data.Message)
        if(res.data.Message == '身份验证失败'){
          wx.clearStorageSync();
          wx.reLaunch({ url: '/pages/index/index'})
        }
            
      }
    }
    
  },
  // 获取班级列表
  getClassList: function(e){
    if(this.data.isAjaxOver==false) return;
    this.data.isAjaxOver = false;
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
        requests.request(option, function(res){
          getRes(res);
        })
        function getRes(res){
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            classList.classList(that.data.classes,resData,that);
            that.setData({classInn: that.data.classes[0].value})
            wx.setStorageSync('tipClassIndex',0); 
          }else if(res.data.ResultType == 7){
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          }
          setTimeout(()=>{
            wx.hideLoading();
            that.setData({isAjaxOver: true})
          },500)
        }
      }
    })
    
  },
  
})
