 //index.js
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
  
    teacherName:'',
    schoolYear: 2017,
    showModalStatus: false,
    isopen:'open',
    classInfo: [], //班级信息数组
    classes:[],
    tipClassIndex:0,
    show: false,//控制弹窗显示
    showQuit: false,//控制缺勤人员弹窗显示
    inpStr:'',   //公共显示的字符串
    infos:[],
    theadH: 108,//表头的高度
    classStr:'',
    currentItem: 0,
    sNameW:60,
    zoomShow: false,

    // 滑动所需值
    windowWidth: 0,  //手机宽度
    windowHeight: 0,//手机高度
    pixelRatio:2,//手机像素比
    startX: 0, //触摸开始的X坐标
    startY: 0, //触摸开始的Y坐标
    saveOldLeft: 0, //触摸结束的X坐标
    saveOldTop: 0, //触摸结束的Y坐标
    contentH: 100, //表格内容的总高度
    contentW: 3000, //表格内容的总宽度
    heigh: 100, //内容区的高度
    scrollL: 0, //滑动的X值
    scrollT: 0,  //滑动的Y值
    detailArr:[], //数据详情
    showDetail: false, //控制详情弹窗
    isAjaxOver: false
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
  },
  onLoad: function(){

    var that = this;
    that.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      tipClassIndex: wx.getStorageSync('tipClassIndex'),
      schoolYear: wx.getStorageSync('schoolYear'),
      semesterIndex: wx.getStorageSync('semesterIndex'),
      classInfo: wx.getStorageSync('classInfo'),
      localShow: wx.getStorageSync('localShow'),
      flagGrade: wx.getStorageSync('flagGrade'),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')
    })

     // 设置班级
    var choiceClass = this.data.classInfo[this.data.tipClassIndex]
    // this.setData({classStr:choiceClass.classCode + choiceClass.sClassTypeName})
    this.setData({classStr:choiceClass.sClassCode+choiceClass.sClassName })

    //组装班级id和名称
    var classInfo = that.data.classInfo
    for(var i = 0 ; i < classInfo.length; i++){
      that.data.classes.push({id:i,value:classInfo[i].times})
    }
    that.setData({
      classes: that.data.classes,
      classInn:that.data.classes[that.data.tipClassIndex].value,
      // gradeInn:that.data.gradeArr[0].value,
      // grade:this.data.classInfo[this.data.tipClassIndex].nGrade
    })

    // 显示提示
    if(this.data.localShow.length == 0){
      this.setData({localShow: true})
    }
    var allHeight = 45 + 42 + 41 +10
    // 获取手机宽高
    publicJs.getSystem(that,function(){
      that.setData({
          heigh: that.data.windowHeight - allHeight,
          theadH: that.data.theadH
      })
    });
    
    this.getDetailData();
  },
 
 
  // 显示弹窗 班级
  getClass: function (e) {
    this.setData({arr: this.data.classes,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
  },
 
  // 获取点击的弹窗的id和value值
  getIndex:function(e){
    var inpStr = this.data.inpStr;
    this.setData({show: false})
    if(inpStr == 'class'){
      if(this.data.classInn==this.data.arr[e.detail.detail.dataset.id].value) return;
      this.setData({
        tipClassIndex:e.detail.detail.dataset.id, 
        classInn:this.data.arr[e.detail.detail.dataset.id].value, 
      })
       // 缓存选择的班级信息的编号
      wx.setStorageSync('tipClassIndex',this.data.tipClassIndex);
       // 设置班级
      var choiceClass = this.data.classInfo[this.data.tipClassIndex]
      this.setData({classStr:choiceClass.sClassCode+choiceClass.sClassName })

      this.getDetailData();
    }
  },
  // 菜单按钮
  powerDrawer: function (e) {
    publicJs.powerDrawer(e,this)
  },
  // 点击改变tabBar颜色
  changeColor: function(e){
    publicJs.changeColor(e,this)
  },
  // 关闭导航
  closeNav: function(e){
    publicJs.closeNav(e,this)
  },
  // 关闭弹窗
  closeFloat: function(e){
    publicJs.closeFloat(e,this)
  },
  // 显示缺勤人员弹窗
  showQuit: function(){
    this.setData({showQuit: true})
  },
  // 关闭缺勤人员弹窗
  closeQuit: function(e){
    var tId = e.target.dataset.id
    if(tId == 'float'){
      this.setData({
        showQuit: false
      })
    }
  },
   // 退出登录
  unlogin: function(){
    publicJs.unlogin()
  },

  // 获取详情信息
  getDetailData: function(){
    var that = this;
    // 时间戳
    var stamp = new Date().getTime();
    // 学年
    var year = this.data.schoolYear;
    // 学期
    var nSemester = this.data.nSemester;
    // 教师token
    var token = this.data.teacherToken;
    var sClassCode = this.data.classInfo[this.data.tipClassIndex].sClassCode;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      sclasscode:sClassCode
    }
    var option = {
      api:'api/Class/GetClassLessonInfo',
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
            var reg = /[(\u4e00-\u9fa5)(0-9)]{2,6}\s[0-9]{11}/g;
            var reg1 = /[|]/g;
            that.data.detailArr = [];
            for(var i = 0 ; i < resData.length; i++){
              var cur = resData[i]
              that.data.detailArr.push({
                sTeacherName: cur.sTeacherName,
                sTeacherPhone: cur.sTeacherPhone,
                nLessonNo: cur.nLessonNo,
                sAssistTeacherName: cur.sAssistTeacherName.length ? cur.sAssistTeacherName.replace(reg1,' '):"无",
                sAssistTeachers: cur.sAssistTeacherName.length ?  cur.sAssistTeacherName.match(reg):['待定'],
                sRoomName: cur.sRoomName,
                sTopic: cur.sTopic==null? "暂无":cur.sTopic,
                sContent: cur.sContent,
                sContentData: cur.sContent == null? "暂无":(cur.sContent.substr(0,20) == ""? "暂无":cur.sContent.substr(0,20)),
                // sContentData: cur.sContent == null? "暂无":cur.sContent.substr(0,20),
                regNum: cur.sAssistTeacherName!= ""?(cur.sAssistTeacherName.replace(reg1,'  ')).match(reg).length: 0,
              })
            }
            that.setData({detailArr:that.data.detailArr,isAjaxOver:true})
            console.log(that.data.detailArr)
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


 // 显示详情弹窗
  showDetail: function(e){
    var ind = e.target.dataset.idx;
    this.setData({showDetail: true,sContent:this.data.detailArr[ind].sContent})
  },
  // 关闭详情弹窗
  closeDetail: function(e){
    var tId = e.target.dataset.id
    if(tId == 'float'){
      this.setData({
        showDetail: false
      })
    }
  },
  // 滑动
  touchstart: function(e){
    publicJs.touchstart(e,this,60,137,827,0)
  },
  touchmove: function(e){
    publicJs.touchmove(e,this,60)
  },
  touchend: function(e){
    publicJs.touchend(e,this)
  },
   // 获取电话号码
  getPhone: function(e){
    // console.log(e)
    this.phone = e.currentTarget.dataset.phone;
    this.setData({show3: true})
  },
  // 打电话:
  callPhone: function(e){
    wx.makePhoneCall({
      phoneNumber: this.phone
    })
    this.setData({show3: false})
  }, 
  // 复制
  copy: function(e){
    var that = this;
    wx.setClipboardData({
      data: this.phone,
      success: function(res) {
        wx.getClipboardData({
          success: function(res) {
            that.setData({show3: false})
            console.log('1233333')
          }
        })
      }
    })
  }
 
  
  
})
