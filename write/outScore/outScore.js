
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
    tabBarArr:[
      {id:0,txt:'录入',classname:'icon-writeactive',changeTextColor:'#1FBB1C',isChange: true},
      {id:1,txt:'查询',classname:'icon-search',changeTextColor:'#888',isChange: false},
      {id:2,txt:'任务',classname:'icon-tasking',changeTextColor:'#888',isChange: false},
      {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888',isChange: false},
    ],

    classInfo:[],
    classes: [],
    teacherName:'',
    // schoolYear: new Date().getFullYear(),
    semester:'秋季',
    showModalStatus: false,
    isopen:'open',
    show:false, //控制弹窗的显示

    resultH: 400, //表体的高度,
    classStr: '',//选择的班级信息
    zoomShow: false,
    isAjaxOver: false,
    questions:[
      {id: 0, flag:0},
      {id: 1, flag:0},
      {id: 2, flag:1},
    ]
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(){

    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      tipClassIndex: wx.getStorageSync('tipClassIndex'),
      tipKejieIndex: wx.getStorageSync('tipKejieIndex'),
      semesterIndex: wx.getStorageSync('semesterIndex'),
      year: wx.getStorageSync('year'),
      classInfo: wx.getStorageSync('classInfo'),
      noAuditing: wx.getStorageSync('noAuditing'),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity'),

    })
    
    // 设置班级
    var choiceClass = this.data.classInfo[this.data.tipClassIndex]
    this.setData({classStr:choiceClass.classCode + choiceClass.sClassTypeName})
    // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({resultH: that.data.windowHeight -45 - 42 - 14 -40-45-15-15 -56})
    });
  },
  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
  },

  // 菜单按钮
  powerDrawer: function (e) {
    console.log(121212)
    publicJs.powerDrawer(e,this)
  },
  // 关闭导航
  closeNav: function(e){
    publicJs.closeNav(e,this)
  },

  // 验证分数
  checkScore: function(e){
    var score = Number(e.detail.value);
    var reg = /^\d+(\.\d{1})?$/
    if(score >100){
      this.setData({isFocus: false})
      publicJs.resultTip('分数必须小于等于100')
      return;
    }else if(!reg.test(score)){
      this.setData({isFocus: false})
      publicJs.resultTip('只能保留一位小数')
      return;
    }
  },
  // 获取题目
  getScore: function(){
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var ClassCode = this.data.classInfo[this.data.tipClassIndex].classCode;
    var studentNum = this.data.classInfo[this.data.tipClassIndex].studentNumber;
    var lessonNum = this.data.tipKejieIndex;

    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nlessonno:lessonNum,
      pageindex:1,
      pagesize:100,
      sclasscode:ClassCode,
    }
  
    var option = {
      api:'api/JinMenKao',
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
          var resData = res.data;
          if(resData.ResultType == 0){
            that.data.studentsList = [];
            var studentInfos = resData.AppendData;
            if(!studentInfos.length){
              that.setData({studentsList:that.data.studentsList ,isAjaxOver: true})
            }else{

              for(var i = 0 ; i < studentInfos.length; i++){
                var student = studentInfos[i]
                that.data.studentsList.push({
                  sStudentCode: student.sStudentCode,
                  sClassCode: student.sClassCode,
                  sName: student.sStudentName,
                  sCardCode: student.sCardCode,
                  nLessonNum: student.nLessonNo,
                  ScoreType: student.ScoreType,
                  Score: student.Score,
                  changeLessonState:student.changeLessonState,
                  tipText:student.changeLessonState == '调出'?'调出不可录':'满分100分',
                  disable:student.changeLessonState == '调出'? true :false
                })
              }
              for(var i = 0 ; i < that.data.studentsList.length; i++){
                var curS = that.data.studentsList[i];
                (function(i){
                  if(curS.changeLessonState == '正常' || curS.changeLessonState == '调入' || curS.changeLessonState == '转入' ){
                    that.setData({tipText: "满分100分"})
                  }else if(curS.changeLessonState == '调出'){
                    that.setData({tipText: "调出不可录"})
                  }
                })(i);
              }
              that.setData({studentsList:that.data.studentsList ,isAjaxOver: true})
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
  // 储存学生分数
  saveScore: function(e){
    var that = this;
    var token = this.data.teacherToken; // token值
    var nxuebu = this.data.nXueBu;   //学部信息
    var stamp = new Date().getTime();  //时间戳
    var studentSize = this.data.classInfo[this.data.tipClassIndex].studentNumber;
    var ClassCode = this.data.classInfo[this.data.tipClassIndex].classCode;
    var datas = e.detail.value;
   
    var arr = [];
    var arr1 = [];
    for(var k in datas){
     var str = k + '=' + datas[ k ]
      arr.push(str);
    }
    console.log(datas)
    for(var i = 0 ; i < arr.length; i+=6){
      arr1.push({
        "sClassCode": arr[i].substr(arr[i].indexOf('=')+1),
        "nLessonNo": Number(arr[i+1].substr(arr[i+1].indexOf('=')+1)),
        "sCardCode": arr[i+2].substr(arr[i+2].indexOf('=')+1) == "" ? null : arr[i+2].substr(arr[i+2].indexOf('=')+1),
        "sStudentCode": arr[i+3].substr(arr[i+3].indexOf('=')+1),
        "ScoreType": Number(arr[i+4].substr(arr[i+4].indexOf('=')+1)),
        "Score": Number(arr[i+5].substr(arr[i+5].indexOf('=')+1)),
      })
    }
    var arr2 = [];
    for(var i = 0; i < arr1.length; i++){
      if(arr1[i].Score !=0){
        console.log(arr1[i].Score)
        arr2.push(arr1[i])
      }
    }
    console.log(arr2)
    if(!arr2.length){
      publicJs.resultTip('没有要保存的数据')
      return;
    }
    var query = {
      appid: appId,
      timestamp: stamp,
      token: token
    }
    var option = {
      api: 'api/JinMenKao',
      query: query,
      type: 'post',
      data: arr2
    }
    wx.showLoading({
      title:'保存中',
      success: function(){
        requests.request(option, function(res){
          saveRes(res);
        })
        function saveRes(res){
          var resData = res.data;
          // var resD = JSON.parse(res.data)
          if(resData.ResultType == 0){
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
            setTimeout(()=>{
              wx.navigateBack({ delta: 1 })
            },1000)
          }else if(resData.ResultType == 7){
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
  // 全对 全错
  check:function(e){
    var that = this;
    var questions = this.data.questions;
    var targetBtn = e.target.dataset.btn;
    if(targetBtn == 'yes'){
      changeType(0)
    }else{
      changeType(1)
    }
    function changeType(type){
      console.log(type)
      for(var i = 0 ; i < questions.length; i++){
        questions[i].flag = type;
      }
      that.setData({questions: questions})
    }
  },
  checkOne: function(e){
    console.log(e)
    var index = e.target.dataset.index;
    var questions = this.data.questions;
    if(questions[index].flag == 0){
      questions[index].flag = 1
    }else{
      questions[index].flag = 0
    }
    this.setData({questions:questions})
  }
 
})
