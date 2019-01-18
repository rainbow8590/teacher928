
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
// var upload = require('../../utils/upload.js');

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
    nSemester: 1,
    activeIndex:0,
    yearArr:app.globalData.yearArr,
    semesterArr: app.globalData.semesterArr,
    checkKejieArr:[],
    vacationArr:[
      {id: 3, value: '病假',checked: false},
      {id: 1, value: '事假',checked: false},
    ],
    show1: false, //控制选择课节的弹窗
    show2: false, //控制选择事假/病假的弹窗
    show: false, //年份和学期的弹窗
    classCode: '',
    lessonNo: 0,
    nLeaveType: 0,
    isAjaxOver: false
    // noLessonArr:[1],
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(){
    var that = this;

    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      teacherKind: wx.getStorageSync('kind'),
      noAuditing: wx.getStorageSync('noAuditing'),
      semester: publicJs.flagSemester() == 4? this.data.semesterArr[0].value:this.data.semesterArr[publicJs.flagSemester()].value,
      nSemester: publicJs.flagSemester(),
      schoolYear: publicJs.flagYear(),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')
    })
    // console.log(this.data.teacherKind)
    // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({heigh: that.data.windowHeight - 55})
    });
    /*// 获取设备高度
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          heigh: res.windowHeight - 55
        })
      }
    });*/
    
    this.getNextLesson();
    this.getLessonNotes();
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
  // 显示弹窗 学年
  getYear: function (e) {
    this.setData({arr: this.data.yearArr,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  // 显示弹窗 学期
  getSemester: function (e) {
    this.setData({arr: this.data.semesterArr,inpStr: e.detail.detail})
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
    if(inpStr == 'year'){ //年份
      if(this.data.schoolYear == e.detail.detail.dataset.id) return;
      this.setData({
        schoolYear:e.detail.detail.dataset.id, 
      })
      this.getNextLesson();
      this.getLessonNotes();
      // 缓存选择的年份
      wx.setStorageSync('schoolYear',e.detail.detail.dataset.id);
    }else if(inpStr == 'semester'){ //学期
      if(this.data.semester==this.data.arr[e.detail.detail.dataset.id-1].value) return;
      this.setData({
        semester:this.data.arr[e.detail.detail.dataset.id-1].value, 
        nSemester:this.data.arr[e.detail.detail.dataset.id-1].semester, 
   
      })
      this.getNextLesson();
      this.getLessonNotes();
      // 缓存选择的学期的编号
      wx.setStorageSync('semesterIndex',e.detail.detail.dataset.id);
    }
  },
  
  //显示课节弹窗
  checkKejie: function(e){
    // console.log(e)
    // console.log(this.data.noLessonArr)
    var ids = e.currentTarget.dataset.id;
    this.setData({
      sClassCode: this.data.noLessonArr[ids].sClassCode,
      sClassName: this.data.noLessonArr[ids].sClassName,
      // sTeacherName: this.data.noLessonArr[ids].sTeacherName,
      // SectBegin: this.data.noLessonArr[ids].lessonArr.SectBegin,
      checkKejieArr: this.data.noLessonArr[ids].lessonArr,
      show1: true 
    });
  },
  //选择课节
  radioChange: function(e){
    var ids = Number(e.detail.value);
    
    // console.log(this.data.checkKejieArr)
    this.setData({
      nLessonNo:this.data.checkKejieArr[ids].nLessonNo,
      show1: false,
      show2:true
    })
  },
  //选择事假/病假
  radioChange1: function(e){
    // console.log(e)
    var ids = Number(e.detail.value);
    this.setData({nLeaveType:ids})
  },
  goDetail: function(e){
    // console.log(e)
    var ids = e.currentTarget.dataset.id;
    var lessonId = this.data.notesArr[ids].id;
    var status = this.data.notesArr[ids].nStatus;
    var teacherKind = this.data.notesArr[ids].teacherKind;
    // var teacherKind = this.data.teacherKind;
    var data = lessonId +','+status+','+teacherKind;
    wx.navigateTo({url:'/set/replaceDetail/replaceDetail?id='+data})
  },
  // 获取未上课信息
  getNextLesson: function(){
    var that = this;
    var stamp = new Date().getTime();
    var nYear = this.data.schoolYear;
    var nSemester = this.data.nSemester;
    var token = this.data.teacherToken;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nsemester:nSemester,
      nclassyear:nYear,
    }
    var option = {
      api:'api/LessonLeave/GetTeacherNextLesson',
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
          console.log(112122)
          console.log(res)
          that.setData({noLessonArr: [],isAjaxOver: true})
          if(res.data.ResultType == 0){
            var newInfos = [];
            var kejieArr = []; //组装课节信息
            var resData = res.data.AppendData;
            var len = 0;
            var k = 0;
            if(!resData.length){
              setTimeout(()=>{
                wx.hideLoading()
              },500)
              return;
            }
            for(var i = 0; i < resData.length; i++){
              var cur = resData[i];
              for(var j = i; j <= resData.length; j++){
                var now = resData[j];
                //如果j 循环到最后了, 代表循环完成了, 就停止
                if(j == resData.length){
                  console.log(newInfos)
                  that.setData({noLessonArr: newInfos})
                  setTimeout(()=>{
                    wx.hideLoading()
                  },500)
                  return;
                }
                if(cur.sClassCode == now.sClassCode){
                  //相同课程的不同课次信息
                  if(now.IsApplied == ''){
                    kejieArr.push({
                      dtDate: now.dtDate.substr(5,5).replace('-','月'),
                      nLessonNo:now.nLessonNo,
                      sTopic: now.sTopic,
                      SectBegin: now.SectBegin.replace(/\-/g,'/').replace('T',' '),
                    })
                  }
                  //相同课程的公共信息
                  newInfos[len]={
                    sClassQiShu: cur.sClassQiShu,
                    sTime: cur.sTime.substr(0,5),
                    sClassName: cur.sClassName,
                    sClassCode: cur.sClassCode,
                    nLessonNo: cur.nLessonNo,
                    lessonArr:kejieArr,
                  }
                }else{
                  i = j-1;
                  len++;
                  kejieArr = [];
                  break;
                }
              }
            }
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
  // 提交申请 推消息给教管
  saveNextLesson: function(e){
    var that = this;
    if(that.data.nLeaveType == 0){
      publicJs.resultTip('请选择请假类型')

    }else{
      save();
    }
    function save(){
      // var formId = e.detail.formId;
      var page = '/task/daikeAuditingDetail/daikeAuditingDetail';
      
      var token = that.data.teacherToken; // token值
      var stamp = new Date().getTime();  //时间戳
      var data = {
        sClassCode: that.data.sClassCode,
        nLessonNo: that.data.nLessonNo,
        nLeaveType: that.data.nLeaveType,
        // formId: formId,
        adminPage: page
      }
      var query ={
        'appid':appId,
        'timestamp':stamp,
        'token':token
      }
      var option = {
        api:'api/LessonLeave/SaveTeacherLessonLeave',
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
            // console.log(result)
            if(resData.ResultType == 0){
              publicJs.resultTip('提交成功',function(){
                var data = {
                    id: result.Id,
                    classCode: result.sClassCode,
                    className: result.sClassName,
                    sTeacherName: result.sTeacherName,
                    sTeacherPhone: result.sTeacherPhone,
                    sTeacherName1: result.sChangeTeacherName,
                    sTeacherPhone1: result.sChangeTeacherPhone,
                    lessonNo: result.nLessonNo,
                    SectBegin: result.SectBegin,
                    daoJiShi: publicJs.daojishi(result.SectBegin),
                    top: result.sTopic,
                    time: result.dtDate.substr(5,5).replace('-','月')+'日 '+result.sTime,
                    area: result.sAreaName,
                    status: result.nStatus,
                    teacherKind: result.nKind
                  }
                  that.setData({show2:false,teacherKind:data.teacherKind})
                  var id = data.id +','+data.status+','+data.teacherKind;
                  // console.log("replace="+id)
                  wx.navigateTo({url:'/set/replaceDetail/replaceDetail?id='+id})
              })
              
            }else if(resData.ResultType == 7){
              // publicJs.resultTip('该课程已有求代课申请！')
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
  //获取代课申请
  getLessonNotes: function(){
    var that = this;
    var stamp = new Date().getTime();
    var nYear = this.data.schoolYear;
    var nSemester = this.data.nSemester;
    var token = this.data.teacherToken;
    var query = {
      appid:appId,
      timestamp:stamp,
      token:token,
      nsemester:nSemester,
      nclassyear:nYear,
    }
    var option = {
      api:'api/LessonLeave/GetTeacherLessonLeave',
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
          console.log(res)
          that.setData({isAjaxOver: true})
          if(res.data.ResultType == 0){
            var newInfos = [];
            var resData = res.data.AppendData;
            console.log(resData)
            
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
                  nLeaveType: cur.nLeaveType,
                  teacherKind: cur.nKind
                })
              }
              that.setData({notesArr: newInfos})
            
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
  //上传病假条
  upload: function(e){
    var page = '/task/daikeAuditingDetail/daikeAuditingDetail'
    requests.chooseAndSave(this,e,appId,page);
  },
  


})


