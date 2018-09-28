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
    tabBarArr:[
      {id:0,txt:'录入',classname:'icon-writeactive',changeTextColor:'#1FBB1C',isChange: true},
      {id:1,txt:'查询',classname:'icon-search',changeTextColor:'#888',isChange: false},
      {id:2,txt:'任务',classname:'icon-tasking',changeTextColor:'#888',isChange: false},
      {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888',isChange: false},
    ],
    gradeTermArr:[
      {id: 0,value: '上学期期中'},
      {id: 1,value: '上学期期末'},
      {id: 2,value: '下学期期中'},
      {id: 3,value: '下学期期末'},
    ],
    kejieArr:[
      {id: 2, value: '第2讲'}
    ],
    ExperimentalArr:[
      {id:0,value:'是'},
      {id:1,value:'否'},
      {id:2,value:'已分班'},
      {id:3,value:'不清楚'},
      {id:4,value:''},
    ],
    studentslist:[],//所有的学生
    setSchoolList:[],//请求回来的所有学校
    AllSchool:[],
    classInfo: [], //班级信息数组
    classes:[],
    teacherName:'',
    schoolYear: 2017,
    semester:'秋季',
    showModalStatus: false,
    isopen:'open',
    tipClassIndex:0,
    show: false,//控制弹窗显示
    show1: false,//控制学校弹窗显示
    classInn:'',//显示的班级字符串
    gradeTermInn:'',//显示的班级字符串
    inpStr:'',   //公共显示的字符串
    classStr: '',//选择的班级信息
    showScore:true,//控制显示期中期末选项
    GradeType:1,
    zoomShow: false,
    isAjaxOver: true
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
      schoolYear: wx.getStorageSync('schoolYear'),
      classInfo: wx.getStorageSync('classInfo'),
      // kind: wx.getStorageSync('kind'),
      noAuditing: wx.getStorageSync('noAuditing'),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')
    })
   // 设置班级
    var choiceClass = this.data.classInfo[this.data.tipClassIndex]
    this.setData({
      classStr:choiceClass.classCode + choiceClass.sClassName,
      gradeTermArr:[
        {id: 0,value: choiceClass.sGrade + '上学期期中'},
        {id: 1,value: choiceClass.sGrade + '上学期期末'},
        {id: 2,value: choiceClass.sGrade + '下学期期中'},
        {id: 3,value: choiceClass.sGrade + '下学期期末'},
      ]
    })

    //组装班级id和名称
    var classInfo = this.data.classInfo
    for(var i = 0 ; i < classInfo.length; i++){
      this.data.classes.push({id:i,value:classInfo[i].grade})
    }
    this.setData({classes: this.data.classes})
    this.setData({classInn:this.data.classes[this.data.tipClassIndex].value})
    wx.setStorageSync('classes',this.data.classes)
    // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({resultH: that.data.windowHeight -45 - 42 - 14 -40-45-15-15 -56})
    });
    // 获取学期上下值
    publicJs.flagTime(this);
    this.getClassList();
    this.getAllStudent();
    
  },

  getClass: function (e) {
    if(this.data.isAjaxOver){
      this.setData({arr: this.data.classes,inpStr: e.detail.detail})
      this.selectPopup.showPopup()
    }
  },
  getGradeTerm: function (e) {
    if(this.data.isAjaxOver){
      this.setData({arr: this.data.gradeTermArr,inpStr: e.detail.detail})
      this.selectPopup.showPopup()
    }
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
      })
      var choiceClass = this.data.classInfo[this.data.tipClassIndex]
      this.setData({
        classStr:choiceClass.classCode + choiceClass.sClassName,
        gradeTermArr:[
          {id: 0,value: choiceClass.sGrade + '上学期期中'},
          {id: 1,value: choiceClass.sGrade + '上学期期末'},
          {id: 2,value: choiceClass.sGrade + '下学期期中'},
          {id: 3,value: choiceClass.sGrade + '下学期期末'},
        ]
      })
      publicJs.flagTime(this)
      // 重新获取学生信息
      this.getAllStudent();
      // 缓存选择的班级信息的编号
      wx.setStorageSync('tipClassIndex',this.data.tipClassIndex);
    }else if(inpStr == 'gradeTerm'){  
      if(this.data.gradeTermInn == this.data.arr[e.detail.detail.dataset.id].value) return;
      if(Number(e.detail.detail.dataset.id) == 0 || Number(e.detail.detail.dataset.id) == 2){
        this.setData({
          gradeTermInn: this.data.arr[e.detail.detail.dataset.id].value,
          showScore: true,
          GradeType: Number(e.detail.detail.dataset.id)+1
        })
      }else{
         this.setData({
          gradeTermInn: this.data.arr[e.detail.detail.dataset.id].value,
          showScore: false,
          GradeType: Number(e.detail.detail.dataset.id)+1
        })
      }
      // console.log(this.data.GradeType)
      this.getAllStudent();
    }
  },
  scoreChange1:function(e){
    var ids = e.target.dataset.id;
    // 当获取焦点是， input 显示  view 隐藏
    this.data.studentslist[ids].onInput = false;
    this.data.studentslist[ids].isFocus = true;
    this.setData({studentslist:this.data.studentslist})
  },
  scoreChange2: function(e){
    var ids = e.target.dataset.id;
    this.data.studentslist[ids].onInput = true;
    this.data.studentslist[ids].isFocus = false;
    this.data.studentslist[ids].Score = e.detail.value;
    this.setData({studentslist:this.data.studentslist})
  },
  totalScoreChange1:function(e){
    var ids = e.target.dataset.id;
    // 当获取焦点是， input 显示  view 隐藏
    this.data.studentslist[ids].onInput1 = false;
    this.data.studentslist[ids].isFocus1 = true;
    this.setData({studentslist:this.data.studentslist})
  },
  totalScoreChange2:function(e){
    var ids = e.target.dataset.id;
    var val = e.detail.value;
    this.data.studentslist[ids].onInput1 = true;
    this.data.studentslist[ids].isFocus1 = false;
    this.data.studentslist[ids].TotalScore = e.detail.value;
    this.setData({studentslist:this.data.studentslist})
    if(val > 200){
      wx.showModal({
        title:'提示',
        content:'总分不能超过200',
        showCancel:false
      })
    }
  },
  // 退出登录
  unlogin: function(){
    publicJs.unlogin()
  },
  // 关闭弹窗
  closeFloat: function(e){
    publicJs.closeFloat(e,this)
  },
  // 关闭弹窗
  closeFloat1: function(e){
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
  // 点击改变tabBar颜色
  // changeColor: function(e){
  //   publicJs.changeColor(e,this)
  // },
  sExperimental: function(e){
     publicJs.sExperimental(e,this)
  },
  // 获取班级列表
  getClassList: function(){
    var that = this;
    // 时间戳
    var stamp = new Date().getTime();
    // 学年
    var year = this.data.schoolYear;
    // 学期
    var nSemester = this.data.semesterIndex;
    // 教师token
    var token = this.data.teacherToken;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      pagesize:50,
      pageindex:1,
      nsemester:nSemester,
      nclassyear:year,
    }
    var option = {
      api:'api/Class',
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
          that.setData({isAjaxOver: true})
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            if(resData.length == 0){
              that.setData({classes:['您此学期没有课程']});
            }else{
              classList.classList(that.data.classes,resData,that);
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
  // 获取学生信息
  getAllStudent: function(){
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var studentSize = this.data.classInfo[this.data.tipClassIndex].studentNumber;
    var classCode = this.data.classInfo[this.data.tipClassIndex].classCode;
    var nGrade = this.data.classInfo[this.data.tipClassIndex].nGrade;
    var gradetype = this.data.GradeType;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      classcode:classCode,
      grade:nGrade,
      gradetype:gradetype
    }
    var option = {
      api:'api/SchoolScore',
      query: query,
      type: 'get',
    }
    wx.showLoading({
      title:'努力加载中',
      success: function(){
        requests.request(option, function(res){
          getRes(res);
        })
        function getRes(res){
          that.setData({isAjaxOver: true})
          var resData = res.data;
          if(resData.ResultType == 0){
            that.data.studentslist = [];
            var studentInfos = resData.AppendData;
            console.log(studentInfos)
            if(!studentInfos.length){
              that.setData({studentslist:that.data.studentslist})
            }else{
              for(var i = 0 ; i < studentInfos.length; i++){
                  var student = studentInfos[i]
                  that.data.studentslist.push({
                    StudentName: student.StudentName, 
                    StudentCode: student.StudentCode, 
                    XueKe: student.XueKe, 
                    Grade: student.Grade,
                    GradeType: student.GradeType,
                    Score: student.Score == null? "" : student.Score,
                    TotalScore:student.TotalScore == null? "" : student.TotalScore,
                    isFocus: false,
                    isFocus1: false,
                    onInput:true,
                    onInput1:true
                  })
                }
              that.setData({studentslist:that.data.studentslist})
            }
            
          }
          setTimeout(()=>{
            wx.hideLoading()
          },500)
        }
      }
    })
    
  },
  // 储存学生信息
  saveInfos: function(e){
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
    
    for(var i = 0 ; i < arr.length; i+=6){
      arr1.push({
        "StudentCode": arr[i].substr(arr[i].indexOf('=')+1),
        "XueKe": Number(arr[i+1].substr(arr[i+1].indexOf('=')+1)),
        "Grade": Number(arr[i+2].substr(arr[i+2].indexOf('=')+1) == "" ? null : arr[i+2].substr(arr[i+2].indexOf('=')+1)),
        "GradeType": Number(arr[i+3].substr(arr[i+3].indexOf('=')+1)) ,
        "Score": Number(arr[i+4].substr(arr[i+4].indexOf('=')+1)) == 0? null:Number(arr[i+4].substr(arr[i+4].indexOf('=')+1)),
        "TotalScore": Number(arr[i+5].substr(arr[i+5].indexOf('=')+1)) == 0? null:Number(arr[i+5].substr(arr[i+5].indexOf('=')+1)),
      })
    }

    var arr2 = [];
    for(var i = 0; i < arr1.length; i++){
      if(arr1[i].Score|| arr1[i].TotalScore){
        arr2.push(arr1[i])
      }
    }
    console.log(arr2)
    if(arr2.length == 0){
      publicJs.resultTip('没有要保存的数据')
       return;
    }
    var query = {
      appid: appId,
      timestamp: stamp,
      token: token
    }
    var option = {
      api:'api/SchoolScore',
      query: query,
      type: 'post',
      data: arr2
    }
    wx.showLoading({
      title:'保存中',
      success: function(){
        requests.request(option,function(res){
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
            });
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

})


