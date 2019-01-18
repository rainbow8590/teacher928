
var publicJs = require('../../utils/public.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var deleteUpload = require('../../utils/deleteUpload.js');
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
    isAjaxOver1: false,
    pics:[]
  },
  onReady: function(){
    this.selectPopup = this.selectComponent("#selectPopup");
  },
  onLoad:function(option){
    var that = this;
    this.nowTipIndex=null;
    this.setData({
      teacherToken:wx.getStorageSync('teacherToken'),
      teacherName: wx.getStorageSync('teacherName'),
      identity: wx.getStorageSync('identity'),
      bListenFinish: option.bListenFinish
    })
    // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({contentH: that.data.windowHeight - 50})
    });
    // this.getReserveClass()
  },
  onShow:function(){
    var lessonTaskAudit = wx.getStorageSync('lessonTaskAudit');
    var PerpareLesson = wx.getStorageSync('PerpareLesson');
    /*if(this.data.baseInfo && this.nowTipIndex!=null){
      if(this.data.baseInfo.ClassList[this.nowTipIndex].TaskAudit !=  lessonTaskAudit){
        this.getReserveClass()
      }
    }
    console.log(PerpareLesson)
    if(PerpareLesson){
      this.getReserveClass()
    }*/
    this.getReserveClass()
  },
  onUnload: function(){
    var flag;
    var classList = this.data.baseInfo.ClassList;
    for(var i = 0 ; i < classList.length; i++){
      if(classList[i].TaskAudit == null){
        flag = false;
        break;
      }else{
        flag = true
      }
    }

    // 退出页面
    wx.setStorageSync('completeLesson',flag)
    console.log(flag)
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

  //听课任务
  preLessons: function(e){
    
    wx.navigateTo({url: '/task/prepareLesson/prepareLesson'})
  },
  uploadNotes:function(e){
    var idx = e.currentTarget.dataset.id
    this.nowTipIndex = idx;
    console.log(this.data.baseInfo)
    var classInfo = this.data.baseInfo.ClassList[idx];
    classInfo.TrainCode = this.data.baseInfo.TrainCode;
    wx.navigateTo({url: '/task/lessonNotes/lessonNotes?classinfo='+ JSON.stringify(classInfo)})
  },
  // 获取已经预约的班级列表
  getReserveClass: function(){
    var that = this;
    var token = this.data.teacherToken;
    var stamp = new Date().getTime();
    
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
    }
    var option = {
      api:'api/TeacherTrain/GetTrainListenInfo',
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
            if(resData.ClassList!=null && resData.ClassList.length){
              
                for(var i = 0; i < resData.ClassList.length; i++){
                  (function(i){
                    var item = resData.ClassList[i];
                    item.SemesterName = item.Semester == 1?'秋季班':(item.Semester == 2?'寒假班':(item.Semester == 3?'春季班':'暑假班'))
                    item.dtDate = item.dtDate.substr(0,item.dtDate.indexOf('T'))
                    // item.totalNum = 10;
                    // item.nowNum = 4;
                    // if(item.totalNum!= item.nowNum){
                    //   var query = {
                    //     appid: appId,
                    //     TrainCode: resData.TrainCode,
                    //     LessonNo: item.LessonNo,
                    //     ClassCode: item.ClassCode,
                    //     timestamp: new Date().getTime(),
                    //     token: that.data.teacherToken,
                    //     TaskType: 2 // 2听课 1 作业
                    //   }
                    //   deleteUpload.deleteUpload(query)
                    // }
                    
                  })(i)
                }

            }
            resData.ListenTimeShort = resData.ListenTime.substr(0,resData.ListenTime.indexOf('T'))
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
