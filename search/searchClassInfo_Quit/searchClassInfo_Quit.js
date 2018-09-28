 //index.js
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;
Page({
  data: {
    yearArr:[
      {id: 2016, value: 2016},
      {id: 2017, value: 2017},
    ],
    semesterArr: [
      {id: 1, value: '秋季'},
      {id: 2, value: '寒假'},
      {id: 3, value: '春季'},
      {id: 4, value: '暑假'}
    ],
    teacherName:'',
    // schoolYear: new Date().getFullYear(),
    showModalStatus: false,
    isopen:'open',
    classInfo: [], //班级信息数组
    classes:[],
    tipClassIndex:0,
    show: false,//控制弹窗显示
    yearInn:2017,//显示的班级字符串
    semesterInn:'秋季', //显示的年级字符串
    inpStr:'',   //公共显示的字符串
    infos:[],
    changeW: 130,
    theadH: 108,//表头的高度
    classStr:'',
    currentItem: 0,
    sNameW:100,
    flagBubble: true,
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
    
    showDetail: false, //控制详情弹窗
    showPhone: false ,//控制号码浮层
    quitArr: [],
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
    this.setData({classStr:choiceClass.sClassCode+choiceClass.sClassName})

    //组装班级id和名称
    var classInfo = that.data.classInfo
    for(var i = 0 ; i < classInfo.length; i++){
      that.data.classes.push({id:i,value:classInfo[i].times})
    }
    that.setData({
      classes: that.data.classes,
      classInn:that.data.classes[that.data.tipClassIndex].value,
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
    
    this.getQuitData();
  },
 
 /* // 改变班级相关值
  getClass: function (e) {
    publicJs.getClass(e,this)
  },*/
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
    if(inpStr == 'class'){  //班级
      if(this.data.classInn==this.data.arr[e.detail.detail.dataset.id].value) return;
      this.setData({
        classInn:this.data.arr[e.detail.detail.dataset.id].value, 
        tipClassIndex:e.detail.detail.dataset.id, 
        flagAjax: false
      })
      // 缓存选择的班级信息的编号
      wx.setStorageSync('tipClassIndex',this.data.tipClassIndex);
      // 设置班级
      var choiceClass = this.data.classInfo[this.data.tipClassIndex]
      this.setData({classStr:choiceClass.sClassCode+choiceClass.sClassName})
      this.getQuitData();
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
  // 显示详情弹窗
  showDetail: function(e){
    console.log(e)
    var ind = e.currentTarget.dataset.idx;
    this.setData({showDetail: true,sOutMemo:this.data.quitArr[ind].sOutMemo})
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
   // 退出登录
  unlogin: function(){
    publicJs.unlogin()
  },


  // 显示号码
  showPhone: function(e){
    // console.log(e)
    var that = this;
    var flagBubble = this.data.flagBubble;
    var id = e.currentTarget.dataset.idx;
    if(flagBubble){
      that.setData({ flagBubble:false})
      that.setData({currentItem: id})
      setTimeout(()=>{
        that.setData({
          currentItem: id+1000,
          flagBubble:true
        })
      },2000)
    }
  },
  hidePhone:function(e){
    // console.log(e)
    // 前几其它地方隐藏气泡
    if(e.target.dataset.bubble != 'bubble'){
        this.setData({
          currentItem: 1000,
          flagBubble:true
        })
      }
  },

  // 获取退班信息
  getQuitData:function(){
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
      api:'api/Class/GetTBStudent',
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
            that.data.quitArr = [];
            that.setData({number: resData.length})
            for(var i = 0 ; i < resData.length; i++){
              var cur = resData[i]
              that.data.quitArr.push({
                sStudentName:cur.sStudentName,
                sOutMemo:cur.sOutMemo,
                sOutMemoData:cur.sOutMemo.length>20?cur.sOutMemo.substr(0,20)+'...':cur.sOutMemo,
                sOutTime:cur.dtOutDate.substr(0,cur.dtOutDate.indexOf('T')),
                sInTime:cur.dtInDate.substr(0,cur.dtInDate.indexOf('T')),
                sPhone: cur.sPhone,
                type:cur.nInType 
              })
            }
            for(var i = 0 ; i <  that.data.quitArr.length; i++){
              var now = that.data.quitArr[i]
              if(now.type == 1){
                now.type ='报班';
              }else if(now.type == 2){
                now.type ='转班';
              }else if(now.type == 4){
                now.type ='延转';
              }
            }
            that.setData({quitArr:that.data.quitArr,isAjaxOver:true})
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




  // 滑动
  touchstart: function(e){
    publicJs.touchstart(e,this,100,137,487,0)
  },
  touchmove: function(e){
    publicJs.touchmove(e,this,100)
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
            console.log(res)
            that.setData({show3: false})
          }
        })
      }
    })
  }

  
})
