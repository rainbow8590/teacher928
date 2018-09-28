
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
    teacherToken:'', //教师token
    showModalStatus: false, //控制导航显示
    isopen:'open',  //控制菜单显示
    nSemester:0,
    yearArr:app.globalData.yearArr,
    semesterArr: app.globalData.semesterArr,
    show: false, //年份和学期的弹窗
  },
  onReady: function(){
    this.tab = this.selectComponent("#tab");  
    this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
  },
  onLoad: function(){
    var that = this;
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      kind: wx.getStorageSync('kind'),
      noAuditing: wx.getStorageSync('noAuditing'),
      semester:publicJs.flagSemester(),
      nSemester: publicJs.flagSemester() == 4? this.data.semesterArr[0].value:this.data.semesterArr[publicJs.flagSemester()].value,
      schoolYear: publicJs.flagYear(),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')
    })
    // console.log(this.data.kind)
    // 获取手机宽高
    publicJs.getSystem(that,function(){
      that.setData({heigh: that.data.windowHeight - 55})
    }); 
    this.getLessonRecord();
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
  getYear: function(e){
    this.setData({arr: this.data.yearArr,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  getSemester: function(e){
    this.setData({arr: this.data.semesterArr,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
  },
  getIndex:function(e){
    var inpStr = this.data.inpStr;
    this.setData({show: false})
    if(inpStr == 'year'){ //年份
      if(this.data.schoolYear == e.detail.detail.dataset.id) return;
      this.setData({
        schoolYear:e.detail.detail.dataset.id, 
      })
      this.getLessonRecord();
      // 缓存选择的年份
      wx.setStorageSync('schoolYear',e.detail.detail.dataset.id);
    }else if(inpStr == 'semester'){ //学期
      if(this.data.semester == this.data.arr[e.detail.detail.dataset.id-1].value) return;
      this.setData({
        semester:this.data.arr[e.detail.detail.dataset.id-1].semester, 
        nSemester:this.data.arr[e.detail.detail.dataset.id-1].value, 
      })
      this.getLessonRecord();
      // 缓存选择的学期的编号
      wx.setStorageSync('semesterIndex',e.detail.detail.dataset.id);
    }
  },

  // 跳转详情页面
  goDetail: function(e){
    var ids = e.currentTarget.dataset.id;
    var lessonId = this.data.notesArr[ids].id;
    var status = this.data.notesArr[ids].nStatus;
    var teacherKind = this.data.notesArr[ids].teacherKind;
    var data = lessonId+','+status+','+teacherKind;
    wx.navigateTo({url:'/search/replaceRecordDetail/replaceRecordDetail?id='+data})
  },
  //获取代课记录信息
  getLessonRecord: function(){
    var that = this;
    var stamp = new Date().getTime();
    var nYear = this.data.schoolYear;
    var nSemester = this.data.semester;
    var token = this.data.teacherToken;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nsemester:nSemester,
      nclassyear:nYear,
    }
    var option = {
      api:'api/LessonLeave/GetTeacherLessonLeaveAccept',
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
          that.setData({isAjaxOver: true})
          if(res.data.ResultType == 0){
            var newInfos = [];
            var resData = res.data.AppendData;
            if(!resData.length){
              that.setData({notesArr: []});
              setTimeout(()=>{
                wx.hideLoading()
              },500)
              return;
            }
            // console.log(resData)
            for(var i = 0 ; i < resData.length; i++){
              var cur = resData[i];
              newInfos.push({
                id: cur.Id,
                sClassCode: cur.sClassCode,
                sClassName: cur.sClassName,
                sTeacherName: cur.sTeacherName,
                sTeacherPhone: cur.sTeacherPhone,
                sTeacherName1: cur.sChangeTeacherName,
                sTeacherPhone1: cur.sChangeTeacherPhone,
                nLessonNo: cur.nLessonNo,
                SectBegin: cur.SectBegin,
                sTime: cur.sTime,
                sTopic: cur.sTopic,
                dtDate: cur.dtDate.substr(5,5).replace('-','月')+'日 '+cur.sTime,
                sStatus:cur.sStatus,
                nStatus:cur.nStatus,
                sAreaName:cur.sAreaName,
                time:publicJs.daojishi(cur.SectBegin.replace(/\-/g,'/').replace('T',' ')),
                sComment:cur.sComment,
                teacherKind: cur.nKind
              })
            }
            that.setData({notesArr: newInfos})
            setTimeout(()=>{
              wx.hideLoading()
            },500)
          }else if(res.data.ResultType == 7){
            setTimeout(()=>{
              wx.hideLoading()
            },500)
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
   
          }
        }
      }
     })
    
  },
})


