
var classList = require('../../utils/classList.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
var sortClassAsQi = require('../../utils/sortClassAsQi.js');
var sortClassAsWeek = require('../../utils/sortClassAsWeek.js');
var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;
Page({
  data: {
    schoolYear: new Date().getFullYear(),
    semester:'秋季',
    semester: publicJs.flagSemester(),
    classInn:'',

    // yearArr:app.globalData.yearArr,
    yearArr:[
      {id: new Date().getFullYear(), value: new Date().getFullYear()},
    ],
    // semesterArr: app.globalData.semesterArr,
    semesterArr: [
      {id: 1, semester:1,value: '秋季'},
    ],
    zoomShow: false,
    isAjaxOver: false,
    showModalStatus: false,//控制导航显示
    isopen:'open',//控制菜单按钮显示
    show: false,//控制公共弹窗显示
    tipClassIndex:0,
    classLists:[],
    isShowTip:false, // 控制说明
    seeNum: 0,
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(){
    this.setData({
      identity: wx.getStorageSync('identity'),
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      
      // nSemester: publicJs.flagSemester(),
      // semester: publicJs.flagSemester() == 4? this.data.semesterArr[0].value:this.data.semesterArr[publicJs.flagSemester()].value,
      nSemester: 1,
      semester: '秋季',
      schoolYear: publicJs.flagYear(),

    })

    var that = this;
    
    that.getPrimaryClass()
    

  },

  onShareAppMessage: function(){
    var that = this;
    var classCode = this.data.classLists[this.data.tipClassIndex].classCode;
    return {
      title: '查看成绩报告',
      path: '/set/parentLogin/parentLogin?from=report',
      imageUrl:'/pages/images/report.jpg',
      success: function(res){
        //wx.navigateTo({url:'/set/parentLogin/parentLogin?from=report'})
      }
    }
  },
  showTip:function(){
    this.setData({isShowTip: true})
  },
  closeZoom: function(){
    this.setData({isShowTip: false})
  },


  // 显示弹窗 学年
  getYear: function (e) {
    console.log(e)
    if(this.data.isAjaxOver){
      this.setData({arr: this.data.yearArr,inpStr: e.detail.detail})
      this.selectPopup.showPopup()
    }
  },
  // 显示弹窗 学期
  getSemester: function (e) {
    if(this.data.isAjaxOver){
      this.setData({arr: this.data.semesterArr,inpStr: e.detail.detail})
      this.selectPopup.showPopup()
    }
  },
  getClass: function (e) {
    if(this.data.isAjaxOver){
      this.setData({arr: this.data.classes,inpStr: e.detail.detail})
      this.selectPopup.showPopup();
    }
  },
  // 获取点击的弹窗的id和value值
  getIndex:function(e){
    var that = this;
    var inpStr = this.data.inpStr;
    this.setData({show: false})
    if(inpStr == 'year'){ //年份
      if(this.data.schoolYear==e.detail.detail.dataset.id) return;
      this.setData({
        schoolYear:e.detail.detail.dataset.id, 
        tipClassIndex: 0,
      })
     
      // that.getPrimaryClass()
      // that.getStudents()
      
    }else if(inpStr == 'semester'){ //学期
      if(this.data.semester==this.data.arr[e.detail.detail.dataset.id-1].value) return;
      this.setData({
        semester:this.data.arr[e.detail.detail.dataset.id-1].value, 
        nSemester:this.data.arr[e.detail.detail.dataset.id-1].semester, 
        tipClassIndex:0
      })
    
      // that.getPrimaryClass()
      // that.getStudents()
      
    }else if(inpStr == 'class'){ //班级
      console.log(e.detail.detail.dataset.id)
      if(this.data.classInn ==this.data.arr[e.detail.detail.dataset.id].value) return;
      this.setData({
        classInn:this.data.arr[e.detail.detail.dataset.id].value,
        tipClassIndex:this.data.arr[e.detail.detail.dataset.id].id
      })
      // that.getPrimaryClass()
      that.getStudents()
    }
  },
  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
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
  // 获取小学班级
  getPrimaryClass:function(){

    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken;


    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nsemester:this.data.nSemester,
      nclassyear:this.data.schoolYear
    }
    var option = {
      api:'api/StudentScore/GetMidFinalClass',
      query: query,
      type: 'get',
    }

    wx.showLoading({
      title:'加载中......',
      success: function(){
        requests.request(option,function(res){
           wx.hideLoading()
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            var classArr = [];
            if(resData.length){


              for(var i = 0 ; i < resData.length; i++){
                var cur = resData[i];
                var dotIndex = cur.sTime.indexOf(',');
                var lineIndex = cur.sTime.indexOf('-');

                if(dotIndex == -1){
                  // var times = cur.sPrintTime.slice(0,lineIndex); //上课时间
                  var times = cur.sTimeQuanTumName+' '+cur.sTime.slice(0,lineIndex); //上课时间
                }else{
                  // var times = cur.sPrintTime.slice(dotIndex+1,lineIndex);
                  var times = cur.sTimeQuanTumName+' '+cur.sTime.slice(dotIndex+1,lineIndex)
                }

                var sClassName = cur.sClassName;  //班级名称
                var studentNumber = cur.studentNum; //学生数量
                var lessonNumber = cur.nLesson; //课节数量
                var SectBegin = cur.SectBegin; //排序时间

                if(!SectBegin){
                  if(cur.sTime){
                    SectBegin = cur.dtBeginDate+'T'+cur.sTime.slice(0,lineIndex)+':00'
                  }else{
                    SectBegin = cur.dtBeginDate+'T00:00:00';
                  }
                }
                var grade = times +' '+ cur.sGrade ;

                classArr.push({
                  SectBegin: SectBegin,
                  grade: grade,
                  classCode: cur.sClassCode,
                  times: times,
                  sTime: cur.sTime,
                  sClassName: sClassName,
                  studentNumber: studentNumber,
                  sTimeQuanTumName:cur.sTimeQuanTumName,
                  sGradeName:cur.sGradeName,
                  sXueKe:cur.sXueKe,
                  dtBeginDate:cur.dtBeginDate, //开始时间
                })
              }
  
              var weeks = [];
              var qis = [];
              for(var i = 0; i < classArr.length; i++){
                if(classArr[i].sTimeQuanTumName.indexOf('期') != -1){
                  qis.push(classArr[i])
                }else if(classArr[i].sTimeQuanTumName.indexOf('周') != -1){
                  weeks.push(classArr[i])
                }
              }
        
              if(weeks.length){
                weeks = sortClassAsWeek.sortClassAsWeek(weeks)
              }
              if(qis.length){
                qis = sortClassAsQi.sortClassAsQi(qis)
              }
              var newClassArr = weeks.concat(qis);

              console.log(newClassArr)

              // var newClassArr = sortClassAsWeek.sortClassAsWeek(classArr);

              // 给班级排序
             /* if(resData[0].sTimeQuanTumName.indexOf('期') != -1){
                // 按‘期’排序
                var newClassArr = sortClassAsQi.sortClassAsQi(classArr);
             
              }else{
                // 按‘星期’排序
                var newClassArr = sortClassAsWeek.sortClassAsWeek(classArr);
              }*/
              var classArr1 = []
              for(var i = 0 ; i < newClassArr.length; i++){
                classArr1.push({
                  id: i,
                  value: newClassArr[i].sTimeQuanTumName + ' ' + newClassArr[i].sTime.substr(0,newClassArr[i].sTime.indexOf('-')) +' '+newClassArr[i].sGradeName+newClassArr[i].sXueKe
                })
              }
              that.setData({classLists:newClassArr,classes: classArr1,isAjaxOver: true,classInn:classArr1[that.data.tipClassIndex].value})
              console.log(that.data.classLists)
              that.getStudents();
            }else{
              that.setData({classLists:[],isAjaxOver: true})
            }
             wx.hideLoading()
            
          }else if(res.data.ResultType == 7){
           publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          }
        })
      }
    })
  },
  // 获取班级对应的学生
  getStudents:function(){

    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken;
    var classCode = this.data.classCode;

    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      sclasscode:this.data.classLists[this.data.tipClassIndex].classCode,
      nscoretype: 102  //考试类型：102期中，103期末
    }
    var option = {
      api:'api/StudentScore/GetMidFinalClassStudent',
      query: query,
      type: 'get',
    }

    wx.showLoading({
      title:'加载中......',
      success: function(){
        requests.request(option,function(res){
           wx.hideLoading()
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            console.log(resData)
            var seeNum = 0;
            for(var i = 0; i < resData.length; i++){
              if(resData[i].sStudentState == '已查看'){
                seeNum++;
              }
            }
            that.setData({studentList:resData,seeNum:seeNum})
            
          }else if(res.data.ResultType == 7){
           publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          }
        })
      }
    })
  },
  goSee: function(e){
    var classCode = this.data.classLists[this.data.tipClassIndex].classCode;
    var studentcode = this.data.studentList[e.target.dataset.id].sStudentCode;
    wx.navigateTo({url: '/set/seeReport/seeReport?studentCode='+studentcode+'&classCode='+classCode+'&token='+this.data.teacherToken})
  }
})

