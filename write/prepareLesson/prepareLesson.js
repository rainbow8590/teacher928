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
      {id:0,txt:'录入',classname:'icon-writeactive',changeTextColor:'#1FBB1C'},
      {id:1,txt:'查询',classname:'icon-search',changeTextColor:'#888'},
      {id:2,txt:'任务',classname:'icon-tasking',changeTextColor:'#888'},
      {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888'},
    ],
    isopen:'open',
    zoomShow: false,
    isAjaxOver: true,
    teacherName:'',
    isShowPopup: false,
    showModalStatus: false,
    show: false,
    yearInn: new Date().getFullYear(),
    semesterInn: '',
    kejieInn: '',
    teachers:[
      {name:'张三三'},
      {name:'张三三'},
      {name:'张三三'},
    ],
    gradeXuekeStr:'',
    yearArr:[
      {id: new Date().getFullYear() - 1 , value: new Date().getFullYear() - 1 },
      {id: new Date().getFullYear(), value: new Date().getFullYear()}
    ],
    semesterArr:app.globalData.semesterArr,
    kejieArr:[
    ],
    prepareYear: new Date().getFullYear(),
    prepareSemester: publicJs.flagSemester(),
    prepareKejie:1,
    
  },
  onReady: function(){
    this.selectPopup = this.selectComponent("#selectPopup");
  },
  onLoad: function(){
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      noAuditing: wx.getStorageSync('noAuditing'),
      identity: wx.getStorageSync('identity'),
      prepareYear: wx.getStorageSync('prepareYear')?wx.getStorageSync('prepareYear'):new Date().getFullYear(),
      prepareSemester: wx.getStorageSync('prepareSemester')? wx.getStorageSync('prepareSemester'):publicJs.flagSemester(),
      prepareKejie: wx.getStorageSync('prepareKejie')?wx.getStorageSync('prepareKejie'):1,
    })
    console.log()
    for(var i = 1; i <= 15; i++){
      this.data.kejieArr.push({id: i, value: '第'+ i +'讲'})
    }
    this.setData({kejieArr: this.data.kejieArr})

    // console.log(this.data.prepareSemester,this.data.prepareKejie)
    this.setData({
      yearInn:this.data.prepareYear,
      semesterInn: this.data.prepareSemester == 4 ? this.data.semesterArr[0].value:this.data.semesterArr[this.data.prepareSemester].value,
      kejieInn:this.data.kejieArr[this.data.prepareKejie-1].value
    });

    
    wx.setStorageSync('prepareYear',this.data.prepareYear);
    wx.setStorageSync('prepareKejie',this.data.prepareKejie);
    // wx.setStorageSync('prepareSemester',this.data.prepareSemester);

    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({resultH: that.data.windowHeight - 90 -41 -56})
    });
   
    // this.getGradeXueke();
  },
  onShow: function(){
    this.getGradeXueke();
  },
  // 菜单按钮
  powerDrawer: function (e) {
    publicJs.powerDrawer(e,this)
  },
  // 关闭导航
  closeNav: function(e){
    publicJs.closeNav(e,this)
  },
  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
  },
  // 显示弹窗 学年
  getYear: function (e) {
    console.log(e)
    this.setData({arr: this.data.yearArr,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  // 显示弹窗 学期
  getSemester: function (e) {
    this.setData({arr: this.data.semesterArr,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  // 显示弹窗 班级
  getKejie: function (e) {
    this.setData({arr: this.data.kejieArr,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  // 获取点击的弹窗的id和value值
  getIndex:function(e){
    var inpStr = this.data.inpStr;
    this.selectPopup.closePopup()
     console.log(e.detail.detail.dataset.id)
    if(inpStr == 'year'){  
      if(this.data.yearInn == e.detail.detail.dataset.id) return;
      this.setData({
        yearInn: e.detail.detail.dataset.id, 
        prepareYear: e.detail.detail.dataset.id
      })
      wx.setStorageSync('prepareYear',e.detail.detail.dataset.id);

    }else if(inpStr == 'semester'){
      if(this.data.semesterInn==this.data.arr[e.detail.detail.dataset.id-1].value) return;
      this.setData({
        semesterInn:this.data.arr[e.detail.detail.dataset.id-1].value, 
        nSemester:this.data.arr[e.detail.detail.dataset.id-1].semester, 
        prepareSemester: this.data.arr[e.detail.detail.dataset.id-1].semester
      })
      wx.setStorageSync('prepareSemester',this.data.arr[e.detail.detail.dataset.id-1].semester);
    }else if(inpStr == 'kejie'){
      if(this.data.kejieInn==this.data.arr[e.detail.detail.dataset.id-1].value) return;
      this.setData({
        kejieInn: this.data.arr[e.detail.detail.dataset.id-1].value, 
        prepareKejie: e.detail.detail.dataset.id
      })
      // 缓存选择的课节
      wx.setStorageSync('prepareKejie',e.detail.detail.dataset.id);
    }
    this.getTeacherList();
    
  },
  goTeacher:function(e){
    console.log(e)
    var index = e.currentTarget.dataset.index;
    var teacherName = this.data.teachers[index].TeacherName;
    var year = this.data.prepareYear;
    var semester =this.data.prepareSemester==4? this.data.semesterArr[0].value:this.data.semesterArr[this.data.prepareSemester].value;
    var semesterNum = this.data.prepareSemester;
    var kejie = this.data.kejieInn;
    var kejieNum = this.data.prepareKejie;
    wx.navigateTo({url: '/write/prepareLessonTeacher/prepareLessonTeacher?index='+index+'&year='+year+'&semester='+semester+'&kejie='+kejie+'&semesterNum='+semesterNum+'&kejieNum='+kejieNum+'&teacherName='+teacherName})
  },
  getGradeXueke: function(){
    this.setData({isAjaxOver: false})
    var that = this;
    var token = this.data.teacherToken;
    var stamp = new Date().getTime(); 
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token
    }
    var option = {
      api:'api/PrepareLesson/GetTeacherDept',
      query: query,
      type: 'get',
    }
 
        requests.request(option, function(res){
          getRes(res);
          console.log(123)
          that.getTeacherList();
        })
        function getRes(res){
          // wx.hideLoading()
          var resData = res.data;
          if(resData.ResultType == 0){
            that.DeptCode = resData.AppendData.DeptCode;
            wx.setStorageSync('DeptCode',that.DeptCode)
            that.setData({gradeXuekeStr:resData.AppendData.DeptName});
          }else if(res.data.ResultType == 7){
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          }
        }
    
  },
  getTeacherList: function(){
    // if(this.data.isAjaxOver==false) return;
    // this.data.isAjaxOver = false;
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      classyear: that.data.prepareYear,
      semester: that.data.prepareSemester,
      lesson: that.data.prepareKejie,
      deptcode:that.DeptCode
    }
    var option = {
      api:'api/PrepareLesson/GetTeacherPreparesLesson',
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
          var data = resData.AppendData;
          if(resData.ResultType == 0){
            var teachers = [];
            for(var i = 0; i < data.length; i++){
              teachers.push({
                TeacherName:data[i].TeacherName,
                TeacherCode:data[i].TeacherCode,
                GradeXuke:data[i].GradeXuke,
                JiaoAnNum:0,
                JiaoXueNum:0,
                isShowJiaoAn: false,
                isShowJiaoXue: false,
              })
            }
            // 操作数
            for(var i = 0; i < teachers.length; i++){
              var teacher = teachers[i];
              for(var k = 0; k < teacher.GradeXuke.length; k++){
                var grade = teacher.GradeXuke[k];
                var JiaoanNum = grade.LessonPlan == 0? 0:(grade.LessonPlan == 2?1:0)
                var JiaoxueNum = grade.LessonTeacher == 0? 0:(grade.LessonTeacher == 2?1:0)
                teacher.JiaoAnNum += JiaoanNum;
                teacher.JiaoXueNum += JiaoxueNum;
                if(grade.LessonPlan == 1) teacher.isShowJiaoAn = true
                if(grade.LessonTeacher == 1) teacher.isShowJiaoXue = true
              }
            }
            console.log(teachers)
            that.setData({teachers: teachers})
          }else if(res.data.ResultType == 7){
            // 当前教管没有下辖老师
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          }
          setTimeout(()=>{
            wx.hideLoading();
            that.setData({isAjaxOver: true})
          },500)

        }
      }
    })
  },

})