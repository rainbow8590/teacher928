var requests = require('../../utils/requests.js');
var saveFormId = require('../../utils/saveFormId.js');

var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;
var timeStart = app.globalData.timeStart;
var timeEnd = app.globalData.timeEnd;
var isOver = app.globalData.isOver;
var isOver1 = app.globalData.isOver1;


Page({
  data: {
    moblie:'',
    password:'',
    kind: 2, 
    email: false,
    // eyeSrc:'/pages/images/Close.png',
    showPass: true,
    isFocus: false,
    isShoweye:true
  },
  onLoad: function(option){
    console.log('onLoad')
    console.log(option)
  
    if(option.isClose == 'false'){
      console.log(123)
      wx.navigateBack({
        delta:1
      })
    }
    this.eyeNum = 0;
    var that = this;
    var teacherName = wx.getStorageSync('teacherName')
    var identity = wx.getStorageSync('identity')
    if(teacherName){
        if(timeEnd - timeStart > 30*60*1000){
          this.setData({
            isOver: true,
            isOver1: false
          })
        }else{
            this.setData({
              isOver: true,
              isOver1: false
            })
        }
        setTimeout(()=>{
          if(identity == 101 ){
            wx.reLaunch({ url: '/pages/main/main?activeIndex=2&tip=0'})
          }else{
            wx.reLaunch({ url: '/pages/main/main?activeIndex=0&tip=0'})
          }
        },1000)
    }else{
      this.setData({
        isOver: true,
        isOver1: false
      })
      setTimeout(()=>{
        that.setData({
          isOver: false,
          isOver1: true
        })
      },1000)
    }
  },
  onHide: function(){
    isOver1= false
  },
  // 获取教师类型
  getKind:function(e){
    var kind = Number(e.detail.value);
    this.setData({ kind: kind })
    if(kind == 100){
      this.setData({email: true})
    }else{
      this.setData({email: false})
    }
  },
  // 获取输入账号  
  moblieChange: function (e) {
    this.setData({
      moblie: e.detail.value
    })
  },  
  // 获取输入密码  
  passwordChange: function (e) {
    this.setData({
      password: e.detail.value
    })
  },
  login: function(e){
    this.setData({formId: e.detail.formId});
    var that = this;
      wx.login({
        success: function(res){
          console.log(res)
          that.code = res.code
          that.loginFunction();
        }
      })
    
  },
  // 教师 助教 登陆
  loginFunction: function () {

    var that = this;
    // 校验表单
    if (this.data.password.length == 0 || this.data.moblie.length == 0) {
      wx.showModal({
        title: '提示',
        content: '账号密码不能为空',
        showCancel: false
      })
      return;
    }else {
      var data = {
        "loginName": that.data.moblie,
        "password": that.data.password,
        "kind": that.data.kind,
        "appId": appId,
        "code": that.code
      }

      requests.requestPost('api/Login/Post',data,function(res){
        var resData = JSON.parse(res.data);
        var data = resData.AppendData;
        console.log(resData.Powers);
        if(resData.ResultType == 0 ){
            that.setData({teacherToken:resData.Message})
            wx.setStorageSync('teacherToken',resData.Message);
            if(data.TeacherInfo && !data.Powers.length){
              wx.setStorageSync('teacherName',data.TeacherInfo.sName)
              wx.setStorageSync('kind',data.TeacherInfo.nKind)
              wx.setStorageSync('teacherCode',data.TeacherInfo.sCode);
              wx.setStorageSync('identity',data.TeacherInfo.nKind) //教师
              wx.reLaunch({ url: '/pages/main/main?activeIndex=0&tip=0'});
            }else if(data.Powers.length && !data.TeacherInfo){
              wx.setStorageSync('teacherName',data.EmployeeInfo.sName);
              wx.setStorageSync('EmployeeCode',data.EmployeeInfo.sCode);
              wx.setStorageSync('kind',100);
              
              //细分教管
              // LessonLeave 教管A  PrepareLesson教管B
              console.log(that.isInArray(data.Powers,'LessonLeave'))
              if(that.isInArray(data.Powers,'LessonLeave') && that.isInArray(data.Powers,'PrepareLesson')){
                wx.setStorageSync('identity',100) //教管A 教管B
                wx.reLaunch({ url: '/pages/main/main?activeIndex=0&tip=0'});
              }else if(that.isInArray(data.Powers,'LessonLeave') && !that.isInArray(data.Powers,'PrepareLesson')){
                wx.setStorageSync('identity',101) //教管A
                wx.reLaunch({ url: '/pages/main/main?activeIndex=2&tip=0'});
              }else if(!that.isInArray(data.Powers,'LessonLeave') && that.isInArray(data.Powers,'PrepareLesson')){
                wx.setStorageSync('identity',102) //教管B
                wx.reLaunch({ url: '/pages/main/main?activeIndex=0&tip=0'});
              }
              console.log(wx.getStorageSync('identity'))
            }else if(data.EmployeeInfo && data.TeacherInfo){
              wx.setStorageSync('teacherName',data.TeacherInfo.sName);
              wx.setStorageSync('teacherCode',data.TeacherInfo.sCode);
              wx.setStorageSync('kind',data.TeacherInfo.nKind)

              if(that.isInArray(data.Powers,'LessonLeave') && that.isInArray(data.Powers,'PrepareLesson')){
                wx.setStorageSync('identity',103) //教师 教管A 教管B
              }else if(that.isInArray(data.Powers,'LessonLeave') && !that.isInArray(data.Powers,'PrepareLesson')){
                wx.setStorageSync('identity',104) //教师  教管A
              }else if(!that.isInArray(data.Powers,'LessonLeave') && that.isInArray(data.Powers,'PrepareLesson')){
                wx.setStorageSync('identity',105) //教师  教管B
              }
              wx.reLaunch({ url: '/pages/main/main?activeIndex=0&tip=0'});
            }
             console.log(wx.getStorageSync('identity'))
            that.setData({openId: data.OpenId})
            wx.setStorageSync('openId',data.OpenId)
            saveFormId.saveFormId(that,appId,appKey);
        }else{
          var msg = resData.Message
          wx.showModal({
            title: '提示',
            content: msg,
            showCancel: false
          })
        }
      })
    }
  },
  isInArray:function(arr,value){
    for(var i = 0; i < arr.length; i++){
        if(value === arr[i]){
            return true;
        }
    }
    return false;
  },
  // 是否显示密码
  ifShowPassword: function(){
    this.eyeNum ++;
    if(this.eyeNum %2 != 0){
      this.setData({isShoweye:false,showPass:false,isFocus: true})
    }else{
      this.setData({isShoweye:true,showPass:true,isFocus: true})
    }

  }
})
