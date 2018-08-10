
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
// var upload = require('../../utils/upload.js');
var phone = require('../../utils/phone.js');

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
    teacherName:'',
    showModalStatus: false, //控制导航显示
    isopen:'open',  //控制菜单显示
    teacherToken:'', //教师token
    show1: false,//控制评价
    show2: false,//控制取消代课
    show3: false,//控制打电话/复制按钮
    isShowTeacher: false, //控制是否显示教师
  },
  onReady: function(){
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(options){
    console.log(options)
    var that = this;
    var query = options.id.split(',')
    console.log(query)
    this.setData({
      id: query[0],
      status: query[1],
      teacherKind: query[2],
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      kind: wx.getStorageSync('kind'),
      noAuditing: wx.getStorageSync('noAuditing'),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')
      
    })
   // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({heigh: that.data.windowHeight - 55})
    });
    // // 获取设备高度
    // wx.getSystemInfo({
    //   success: function(res) {
    //     that.setData({
    //       windowHeight: res.windowHeight,
    //       windowWidth: res.windowWidth,
    //       heigh: res.windowHeight - 55
    //     })
    //   }
    // });
    this.getInfo();
  },
  onShareAppMessage: function(){
    var that = this;
    var data = this.data.id +','+ this.data.status+','+ this.data.teacherKind
    console.log("replaceDetail="+data)
    return {
      title: '有新的代课请求',
      path: '/search/replaceRecordDetail/replaceRecordDetail?id='+data,
      // imageUrl:that.data.src,
      success: function(res){
        // that.setData({show1: false,showBtn: true,showBtn1: false})
        // wx.redirectTo({ url: '/pages/parentLogin/parentLogin?id='+infos });
      }
    }
  },

   // 关闭弹窗
  closeFloat: function(e){
    publicJs.closeFloat(e,this)
  },
  // 点击改变tabBar颜色
  // changeColor: function(e){
  //   publicJs.changeColor(e,this)
  // },
  showTip: function(){
    this.setData({show2:true})
  },
  // 取消代课
  deleteLesson: function(){
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var data = {};
    var id = this.data.id;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token
    }
    var option = {
      api:'api/LessonLeave/DeleteTeacherLessonLeave/'+id,
      query: query,
      type: 'post',
      data: data
    }
    wx.showLoading({
      title:'取消中...',
      success: function(){
        requests.request(option, function(res){
          saveRes(res);
        })
        function saveRes(res){
          // var resData = JSON.parse(res.data);
          var resData = res.data;
          var result = resData.AppendData
          if(resData.ResultType == 0){
            publicJs.resultTip('取消成功',function(){
              wx.redirectTo({url:'/set/replace/replace'})
            })

          }else if(resData.ResultType == 7){
            //publicJs.resultTip('取消失败')
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
  // 显示评价框
  evaluateTeacher: function(){
    this.setData({show1: true})
  },
  // 评价内容
  evaluate: function(e){
    console.log(e)
    this.content = e.detail.value
  },
  // 提交评价
  submit: function(){
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var data = {}
    var ids = this.data.lessonInfo.id;
    var query = {
      appid: appId,
      scomment: this.content,
      timestamp: stamp,
      token: token
    }
    var option = {
      api:'api/LessonLeave/SaveTeacherLessonLeaveComment/'+ids,
      query: query,
      type: 'post',
      data: data
    }
    wx.showLoading({
      title:'提交中...',
      success: function(){
        requests.request(option, function(res){
          saveRes(res);
        })
        function saveRes(res){
          // var resData = JSON.parse(res.data);
          var resData = res.data;
          var result = resData.AppendData
          if(resData.ResultType == 0){
            publicJs.resultTip('提交成功',function(){
              that.setData({show1: false})
            })

          }else if(resData.ResultType == 7){
            // publicJs.resultTip('提交失败')
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
  // 取消评价
  offEvaluate: function(){
    this.setData({show1: false})
  },
  // 取消代课
  offLesson:function(){
    this.setData({show2: false})
    wx.redirectTo({url:'/set/replace/replace'})
  },
  // 获取电话号码
  getPhone: function(e){
    phone.getPhone(this, e)
  },
  // 打电话:
  callPhone: function(e){
    phone.callPhone(this, e)
  },
  // 复制
  copy: function(e){
    phone.copy(this, e)
  },
  //上传病假条
  upload: function(e){
    // 上传病假条, 推消息给教管
    var page = '/task/daikeAuditingDetail/daikeAuditingDetail';
    requests.chooseAndSave(this,e,appId,page);
  },
  // 获取信息
  getInfo: function(){
    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken;
    var status = this.data.status;
    var id = this.data.id
    var query = {
      appid:appId,
      timestamp:stamp,
      token:token,
    }
    var option = {
      api: 'api/LessonLeave/GetTeacherLessonLeaveBy/'+id,
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
            var newInfos = {};
            var resData = res.data.AppendData;
            console.log(res.data)
                newInfos.id = resData.Id;
                newInfos.sClassCode = resData.sClassCode;
                newInfos.sClassName = resData.sClassName;
                newInfos.sTeacherName = resData.sTeacherName;
                newInfos.sTeacherPhone = resData.sTeacherPhone;
                newInfos.sTeacherName = resData.sTeacherName;
                newInfos.sTeacherName1 = resData.sChangeTeacherName;
                newInfos.sTeacherPhone1 = resData.sChangeTeacherPhone;
                newInfos.nLessonNo = resData.nLessonNo;
                newInfos.SectBegin = resData.SectBegin;
                newInfos.sTime = resData.sTime;
                newInfos.sTopic = resData.sTopic;
                newInfos.dtDate = resData.dtDate.substr(5,5).replace('-','月')+'日 '+resData.sTime;
                newInfos.sStatus =resData.sStatus;
                newInfos.nStatus =resData.nStatus;
                newInfos.sAreaName =resData.sAreaName;
                newInfos.time = publicJs.daojishi(resData.SectBegin.replace(/\-/g,'/').replace('T',' '));
                newInfos.nLeaveType =resData.nLeaveType;
                newInfos.sLeavePicUrl =resData.sLeavePicUrl;
                newInfos.nPicAduit =resData.nPicAduit;
                newInfos.showImg =false;
            that.setData({notesArr: newInfos,teacherKind:resData.nKind})
            // 判断代课的状态, 显示不同的弹窗
            if(newInfos.nStatus >= 1){ //已经被接受
              that.setData({isShowTeacher: true})
              // if(that.data.teacherCode != newInfos.sTeacherCode1){
              //   that.setData({tipInner:'手快有手慢无，下次再努力吧~',show1: true })
              // }
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


