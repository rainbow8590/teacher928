var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');

var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;

Page({
  data: {
    isAjaxOver: false
  },
  onReady: function(){
    // this.menu = this.selectComponent("#menu");
    // this.selectPopup = this.selectComponent("#selectPopup");
    // this.tab = this.selectComponent("#tab");
  },
  onLoad: function(option){
    console.log(option)
    wx.setNavigationBarTitle({
      title: option.father
    })
    var that = this;
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      father: option.father
    })

    this.query = {
      appid: appId,
      timestamp:new Date().getTime(),
      token:this.data.teacherToken,
      nsemester:option.nsemester,
      nclassyear:option.nclassyear,
      nyear:option.nyear,
      nmonth:option.nmonth
    }
    this.getInfo();
  },
  lookDetail: function(e){
    console.log(this.data.info)
    console.log(e)
    this.setData({
      selectInfo: this.data.info[e.currentTarget.dataset.index],
      showDetail: true,
      hideDetail: false,
    })
    console.log(this.data.selectInfo)
  },
  closeDetail: function(){
    this.setData({
      selectInfo:{},
      showDetail: false,
      hideDetail: true
    })
  },
  goRulePage:function(){
    wx.navigateTo({url:'/search/payInfo/payInfo?from=periodpaylist'})
  },
  getInfo:function(){
    if(this.data.father == '请假'){
      this.LeaveFun();
    }else if(this.data.father == '旷课'){
      this.NoSignInFun()
    }else if(this.data.father == '代课'){
      this.ReplaceFun()
    }else if(this.data.father == '未点名'){
      this.NoSignInStudentFun()
    }else if(this.data.father == '课前迟到'){
      this.BeforeLateFun()
    }else if(this.data.father == '课后迟到'){
      this.AfterLateFun()
    }
  },
  // 请假
  LeaveFun:function (){
    var that = this;
    var option = {
      api:'api/TeacherSalary/GetMonthLeave',
      query: this.query,
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
            var newInfos = [];
            var resData = res.data.AppendData;
            console.log(resData)
            let totalHour = 0;
            let totalDeduction = 0;
            for(let i = 0 ; i < resData.length; i++){
              totalHour+= resData[i].nHour;
              resData[i].dDeduction = Math.abs(resData[i].dDeduction);
              totalDeduction += Math.abs(resData[i].dDeduction);
            }
             that.setData({info: resData,totalHour: totalHour, totalDeduction:totalDeduction})
          }else if(res.data.ResultType == 7){
            
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          }
          setTimeout(()=>{
            wx.hideLoading();
            that.setData({isAjaxOver:true})
          },500)
        }
      }
     }) 
  },
  // 代课
  ReplaceFun:function (){
    var that = this;
    var option = {
      api:'api/TeacherSalary/GetMonthReplace',
      query: this.query,
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
            var newInfos = [];
            var resData = res.data.AppendData;
            console.log(resData)
            let totalHour = 0;
            for(let i = 0 ; i < resData.length; i++){
              totalHour+= resData[i].nHour;
            }
            that.setData({info: resData,totalHour: totalHour})
          }else if(res.data.ResultType == 7){
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
          }
          setTimeout(()=>{
            wx.hideLoading()
            that.setData({isAjaxOver:true})
          },500)
        }
      }
     }) 
  },
  // 旷课
  NoSignInFun:function (){
    var that = this;
    var option = {
      api:'api/TeacherSalary/GetMonthNoSignIn',
      query: this.query,
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
            var newInfos = [];
            var resData = res.data.AppendData;
            console.log(resData)
            let totalHour = 0;
            let totalDeduction = 0;
            for(let i = 0 ; i < resData.length; i++){
              totalHour+= resData[i].nHour;
              resData[i].dDeduction = Math.abs(resData[i].dDeduction);
              totalDeduction += Math.abs(resData[i].dDeduction);
            }
            that.setData({info: resData,totalHour: totalHour, totalDeduction:totalDeduction})
          }else if(res.data.ResultType == 7){
            
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          }
          setTimeout(()=>{
            wx.hideLoading()
            that.setData({isAjaxOver:true})
          },500)
        }
      }
     }) 
  },
  // 未点名
  NoSignInStudentFun:function (){
    var that = this;
    var option = {
      api:'api/TeacherSalary/GetMonthNoSignInStudent',
      query: this.query,
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
            var newInfos = [];
            var resData = res.data.AppendData;
            console.log(resData)
            let totalHour = 0;
            let totalDeduction = 0;
            for(let i = 0 ; i < resData.length; i++){
              totalHour+= resData[i].nHour;
              resData[i].dDeduction = Math.abs(resData[i].dDeduction);
              totalDeduction += Math.abs(resData[i].dDeduction);
            }
            that.setData({info: resData,totalHour: totalHour, totalDeduction:totalDeduction})
          }else if(res.data.ResultType == 7){
            
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          }
          setTimeout(()=>{
            wx.hideLoading()
            that.setData({isAjaxOver:true})
          },500)
        }
      }
     }) 
  },
  // 课前迟到
  BeforeLateFun:function (){
    var that = this;
    var option = {
      api:'api/TeacherSalary/GetMonthBeforeLate',
      query: this.query,
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
            var newInfos = [];
            var resData = res.data.AppendData;
            console.log(resData)
            let totalHour = 0;
            let totalDeduction = 0;
            for(let i = 0 ; i < resData.length; i++){
              totalHour+= resData[i].nHour;
              resData[i].dDeduction = Math.abs(resData[i].dDeduction);
              totalDeduction += Math.abs(resData[i].dDeduction);
            }
            that.setData({info: resData,totalHour: totalHour, totalDeduction:totalDeduction})
          }else if(res.data.ResultType == 7){
            
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          }
          setTimeout(()=>{
            wx.hideLoading()
            that.setData({isAjaxOver:true})
          },500)
        }
      }
     }) 
  },
  // 课后迟到
  AfterLateFun:function (){
    var that = this;
    var option = {
      api:'api/TeacherSalary/GetMonthAfterLate',
      query: this.query,
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
            var newInfos = [];
            var resData = res.data.AppendData;
            console.log(resData)
            let totalHour = 0;
            let totalDeduction = 0;
            for(let i = 0 ; i < resData.length; i++){
              totalHour+= resData[i].nHour;
              resData[i].dDeduction = Math.abs(resData[i].dDeduction);
              totalDeduction += Math.abs(resData[i].dDeduction);
            }
             that.setData({info: resData,totalHour: totalHour, totalDeduction:totalDeduction})
          }else if(res.data.ResultType == 7){
            
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          }
          setTimeout(()=>{
            wx.hideLoading()
            that.setData({isAjaxOver:true})
          },500)
        }
      }
     }) 
  },


})