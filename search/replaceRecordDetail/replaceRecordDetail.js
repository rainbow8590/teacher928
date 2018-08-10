
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
var publicJs = require('../../utils/public.js');
var phone = require('../../utils/phone.js');

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
    showModalStatus: false, //控制导航显示
    isopen:'open',  //控制菜单显示
    teacherToken:'', //教师token
    /*semesterArr: [
      {id: 1, value: '秋季'},
      {id: 2, value: '寒假'},
      {id: 3, value: '春季'},
      {id: 4, value: '暑假'}
    ],*/
    showEvaluate: false, //控制评价的显示
    tipInner:'',
    show3: false,//控制打电话/复制按钮
    isShowTeacher: false
  },
  onReady: function(){
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(options){
    var query = options.id.split(',')
    // console.log("replaceRecordDetail="+query)
    var that = this;
    this.setData({
      id: query[0],
      status: query[1],
      teacherKind: query[2], //求代课老师的kind
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      teacherCode: wx.getStorageSync('teacherCode'),
      kind: wx.getStorageSync('kind'), //当前登录老师的kind
      noAuditing: wx.getStorageSync('noAuditing'),
      // semester: this.data.semesterArr[publicJs.flagSemester()-1].value,
      // schoolYear: publicJs.flagYear(),
      openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')
    })
    // console.log('load='+this.data.kind)
    // 判断是否登录
    if(!this.data.teacherToken){
      publicJs.resultTip('请登陆',function(){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            })
    }

    // 获取设备高度
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          heigh: res.windowHeight - 55
        })
      }
    });

    this.getInfo();
  },

   // 关闭弹窗
  closeFloat: function(e){
    publicJs.closeFloat(e,this)
  },


  // 接受代课 推消息给求代课, 教管
  accept:function(e){
    var that = this;
    // var formId = e.detail.formId;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var data = {};
    var adminPage = '/task/daikeAuditingDetail/daikeAuditingDetail';
    var teacherPage = '/set/replaceDetail/replaceDetail';
    var id = this.data.id;
    var query = {
      appid: appId,
      // formid:formId,
      adminpage: adminPage,
      teacherpage: teacherPage,
      timestamp: stamp,
      token: token
    }
    var option = {
      api:'api/LessonLeave/SaveTeacherLessonLeaveAccept/'+id,
      query: query,
      type: 'post',
      data: data
    }
    wx.showLoading({
      title:'申请中...',
      success: function(){
        requests.request(option, function(res){
          saveRes(res);
        })
        function saveRes(res){
          // var resData = JSON.parse(res.data);
          var resData = res.data;
          if(resData.ResultType == 0){
            publicJs.resultTip('您已接受邀请',function(){
              wx.redirectTo({url:'/pages/replaceRecord/replaceRecord'})
            })
  
          }else if(resData.ResultType == 7){
            // console.log(resData.Message)
            if(resData.Message == '未获取到接单教师信息！'){
              publicJs.resultTip('暂无权限',function(){
                wx.redirectTo({url:'/pages/main/main'})
              })
            }else if(resData.Message == '只能接其他老师的代课！'){
              publicJs.resultTip('只能接其他老师的代课请求',function(){
                wx.redirectTo({url:'/pages/main/main'})
              })
            }
          }
          setTimeout(()=>{
            wx.hideLoading()
          },500)
        }
      }
    })
       
  },
  // 放弃
  giveUp: function(){
    wx.redirectTo({url:'/pages/main/main'})
  },
  // 查看课表
  goSchedule: function(){
    wx.redirectTo({url:'/search/schedule/schedule'})
  },
  // 查看代课评价
  lookEvaluate: function(){
    this.setData({showEvaluate: true})
  },
  submit: function(){
    wx.redirectTo({url:'/pages/main/main'})
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
  // 获取信息
  getInfo: function(){
    var that = this;
    // console.log("teacherKind="+that.data.teacherKind)
    // console.log("kind="+that.data.kind)
    // 进入页面, 先判断教师类型能否接课
    // kind  2,1  kind自己的类型, teacherKind求代课教师的类型
    // 如果是教师发的求代课 教管和助教都不能接
    if(that.data.teacherKind == 2){
      if(that.data.kind == 100){ //教管不能接课,直接进入到任务页
        publicJs.resultTip('不具备接课资格',function(){
          wx.redirectTo({url:'/pages/main/main?activeIndex=2&tip=0'})
        })

      }else if(that.data.kind == 1){ // 助教不能接课, 直接进入录入页
        publicJs.resultTip('不具备接课资格',function(){
          wx.redirectTo({url:'/pages/main/main?activeIndex=0&tip=0'})
        })

      }else{
        getInfos();
      }
      // 如果是助教发的求代课 教管和教师都不能接
    }else if(that.data.teacherKind == 1){
      if(that.data.kind == 100){ //教管不能接课,直接进入到任务页
        publicJs.resultTip('不具备接课资格',function(){
          wx.redirectTo({url:'/pages/main/main?activeIndex=2&tip=0'})
        })
      }else if(that.data.kind == 2){ // 教师不能接课, 直接进入录入页
        publicJs.resultTip('不具备接课资格',function(){
          wx.redirectTo({url:'/pages/main/main?activeIndex=0&tip=0'})
        })

      }else{
        getInfos();
      }
    }else{
      getInfos();
    }
    function getInfos(){
      var stamp = new Date().getTime();
        var token = that.data.teacherToken;
        var status = that.data.status;
        var id = that.data.id
        var query = {
          appid:appId,
          timestamp:stamp,
          token:token,
        }
        var option = {
          api:'api/LessonLeave/GetTeacherLessonLeaveBy/'+id,
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
              if(resData){
                newInfos.id = resData.Id;
                newInfos.sClassCode = resData.sClassCode;
                newInfos.sClassName = resData.sClassName;
                newInfos.sTeacherName = resData.sTeacherName;
                newInfos.sTeacherPhone = resData.sTeacherPhone;
                newInfos.sTeacherCode = resData.sTeacherCode;
                newInfos.sTeacherName = resData.sTeacherName;
                newInfos.sTeacherName1 = resData.sChangeTeacherName;
                newInfos.sTeacherPhone1 = resData.sChangeTeacherPhone;
                newInfos.sTeacherCode1 = resData.sChangeTeacherCode;
                newInfos.nLessonNo = resData.nLessonNo;
                newInfos.SectBegin = resData.SectBegin;
                newInfos.sTime = resData.sTime;
                newInfos.sTopic = resData.sTopic;
                newInfos.dtDate = resData.dtDate.substr(5,5).replace('-','月')+'日 '+resData.sTime;
                newInfos.sStatus = resData.sStatus;
                newInfos.nStatus = resData.nStatus;
                newInfos.sAreaName = resData.sAreaName;
                newInfos.time = publicJs.daojishi(resData.SectBegin.replace(/\-/g,'/').replace('T',' '));
                newInfos.nLeaveType = resData.nLeaveType;
                newInfos.sLeavePicUrl = resData.sLeavePicUrl;
                newInfos.nPicAduit = resData.nPicAduit;
                newInfos.sComment = resData.sComment?resData.sComment:'还没有评价呦~';
                that.setData({notesArr: newInfos});
                if(newInfos.nStatus>=1){
                  that.setData({isShowTeacher: true})
                }
              }else{
                publicJs.resultTip('代课申请已取消',function(){
                 wx.reLaunch({ url: '/pages/main/main'})
                })
              }
                  
              // 判断代课的状态, 显示不同的弹窗
              if(newInfos.nStatus >= 1){ //已经被接受
                if(that.data.teacherCode != newInfos.sTeacherCode1){
                  that.setData({tipInner:'手快有手慢无，下次再努力吧~',show1: true })
                }
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
    
    }
    
  },
})


