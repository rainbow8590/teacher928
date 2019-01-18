
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
var sortClassAsWeek = require('../../utils/sortClassAsWeek.js');
var sortClassAsQi = require('../../utils/sortClassAsQi.js');
var transform = require('../../utils/transform.js');
var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;
Page({
  data: {
    schoolSrc:'../images/school.gif',
    scoreSrc:'../images/score.gif',
    tabBarArr:[
      {id:0,txt:'录入',classname:'icon-write',changeTextColor:'#888',isChange: false},
      {id:1,txt:'查询',classname:'icon-searchactive',changeTextColor:'#1FBB1C',isChange: true},
      {id:2,txt:'任务',classname:'icon-tasking',changeTextColor:'#888',isChange: false},
      {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888',isChange: false},
    ],
    // yearArr:app.globalData.yearArr,
    yearArr:[
      {id: new Date().getFullYear() - 1 , value: new Date().getFullYear() - 1 },
      {id: new Date().getFullYear(), value: new Date().getFullYear()},
      {id: new Date().getFullYear()+1, value: new Date().getFullYear()+1}
    ],
    semesterArr: app.globalData.semesterArr,
    chioseArr:[
      {classe:'active',value:'按班级'},
      {classe:'',value:'按人名'}
    ],
    wordsArr:[],
    tipStr:'搜索结果为空，请检查您学生姓名或手机号',
    showTip: false,
    windowHeight:400,
    windowWidth: 375,
    resultH: 400,//显示结果的外框高度
    classInfo: [],
    schoolYear: new Date().getFullYear(),
    semester:'秋季',
    showModalStatus: false,
    isopen:'open',
    teacherName: '', //教师名称
    teacherToken:'', //教师token
    classInfo:[], //课程信息

    classes: [], //班级
    studentsArr: [1], //学生列表
    nSemester: 1, //学年
    tipClassIndex: 0,//点击的班级或学生序号
    show:false, //控制弹窗显示
    searchIfshow: true, //控制班级或人名显示
    searchIfshow1: false, //控制班级或人名显示
    searchH: 45,//搜索部分的高度
    sName:'',//搜索学生姓名
    sPhone:'',//搜索学生电话
    choiseId:1,//查询选择的类型
    flagGrade: 1, //小学1  初中高中2
    zoomShow: false,
    currentWordIndex: 0, //当前字母的序号
    wordHeight: 0,
    isAjaxOver: false,


    // 圆半径
    radius: 260,
    showCanvas: false,
  },

  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(){
    this.startY = this.endY = 0;
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      noAuditing: wx.getStorageSync('noAuditing'),
      nSemester: publicJs.flagSemester(),
      semester: publicJs.flagSemester() == 4? this.data.semesterArr[0].value:this.data.semesterArr[publicJs.flagSemester()].value,
      schoolYear: publicJs.flagYear(),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')
    })
     wx.setStorageSync('schoolYear',this.data.schoolYear);
     wx.setStorageSync('semesterIndex',this.data.semester);
 
    // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({resultH: that.data.windowHeight - 45- 42 - 56 -10})
    });

    this.searchStudents();
    // this.draw(0,100);
  },

  
  getName: function(e){
    // console.log(e)
    if(e.detail.value == ''){
      this.setData({showTip: false})
      if(e.detail.cursor == 0){
        this.searchStudents();
      }
    }else{
      this.setData({sName: e.detail.value})
    }
  },
  getPhone: function(e){
    if(e.detail.value == ''){
      this.setData({showTip: false})
      if(e.detail.cursor == 0){
        this.searchStudents();
      }
    }else{
      this.setData({sPhone: e.detail.value})
    }
  },

 
  // 显示弹窗 学年
  getYear: function (e) {
    this.setData({arr: this.data.yearArr,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
    this.setData({
      sName:'',
      sPhone:'',
    })
  },
  // 显示弹窗 学期
  getSemester: function (e) {
    this.setData({arr: this.data.semesterArr,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
    this.setData({
      sName:'',
      sPhone:'',
    })
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

  getIndex:function(e){
    var inpStr = this.data.inpStr;
    this.setData({show: false})
    if(inpStr == 'year'){ //年份
      if(this.data.schoolYear==e.detail.detail.dataset.id) return;
      this.setData({
        schoolYear:e.detail.detail.dataset.id, 
      })
      // 缓存选择的年份
      wx.setStorageSync('schoolYear',e.detail.detail.dataset.id);
    }else if(inpStr == 'semester'){ //学期
      if(this.data.semester==this.data.arr[e.detail.detail.dataset.id-1].value) return;
      this.setData({
        semester:this.data.arr[e.detail.detail.dataset.id-1].value, 
        nSemester:this.data.arr[e.detail.detail.dataset.id-1].semester, 
      })
      // 缓存选择的学期的编号
      wx.setStorageSync('semesterIndex',e.detail.detail.dataset.id);
    }
    this.searchStudents();
  },

  // 获取一个学生的信息
  goStudentInfo: function(e){
    var id = e.currentTarget.dataset.index;
    wx.setStorageSync('studentInfo',this.data.studentsArr[id]);
    var classCode = this.data.studentsArr[id].sClassCode;
    var studentCode = this.data.studentsArr[id].sStudentCode;
    var studentGrade = this.data.studentsArr[id].nGrade;
    var studentSgrade = this.data.studentsArr[id].sGrade;
    wx.navigateTo({url:'/search/searchStudentAsName/searchStudentAsName?classCode='+classCode+'&studentCode='+studentCode+'&studentGrade='+studentGrade+'&studentSgrade='+studentSgrade});
    
  },

  // 获取年级
  getGrade:function(){
    var that = this;
    // 时间戳
    var stamp = new Date().getTime();
    // 年级
    var grade = this.data.classInfo[this.data.tipClassIndex].nGrade;
    // 教师token
    var token = this.data.teacherToken;
    var query = {
      appid:appId,
      grade:grade,
      timestamp:stamp,
      token:token
    }
    var option = {
      api:'api/IsSchool',
      query: query,
      type: 'get',
    }
    requests.request(option, function(res){
      getRes(res);
    })
    function getRes(res){
      if(res.data.ResultType == 0){
        if(res.data.Message == '小学'){
          that.setData({
            flagGrade: 1
          })
          wx.setStorageSync('flagGrade',1)
        }else{
          that.setData({
            flagGrade: 2
          })
          wx.setStorageSync('flagGrade',2)
        }
        wx.navigateTo({url:'/search/searchStudentsAsClass/searchStudentsAsClass'})
      }else if(res.data.ResultType == 7){
        publicJs.resultTip(res.data.Message)
        if(res.data.Message == '身份验证失败'){
          wx.clearStorageSync();
          wx.reLaunch({ url: '/pages/index/index'})
        }
            
        
      }
    }
    
  },
  
  searchStudent: function(e){
    //本季度所有学生
    var studentsArr = this.data.studentsArr1;
    // 学生姓名
    var sName = this.data.sName;
    // 学生电话
    var sPhone = this.data.sPhone;
    var regName = null;
    var regName1 = new RegExp('^'+sName,"i");
    var regName2 = new RegExp('['+ sName +']{1,}',"g");

    var regPhone1 = /^1[3|4|5|7|8][0-9]\d{8}$/;
    var reg1 = /[A-Za-z]+/i;
    // 区分正则
    if(sName){
      if(reg1.test(sName)){
        regName = regName1;
      }else{
        regName = regName2;
      }
    }
    var searchArr = [];
    for(var i = 0 ; i < studentsArr.length; i++){
      var cur = studentsArr[i];
      // 按名称查
      if(!sPhone){
        if(sName){
          if(!reg1.test(sName)){// 如果是汉字
            if(regName.test(studentsArr[i].sStudentName)){
              regName.test(studentsArr[i].sStudentName)
              searchArr.push(studentsArr[i]);
            }
          }else{ //是拼音
            if(regName.test(studentsArr[i].ConvertPinyin)){
              searchArr.push(studentsArr[i]);
            }
          }
        }else{
          publicJs.resultTip('请输入查询条件')
          
          return;
        }
      }
      //按手机号码查
      if(!sName){
        if(sPhone){
          if(regPhone1.test(sPhone)){
            if(sPhone == cur.sPhone ){
              searchArr.push(studentsArr[i]); 
            }
          }else{
            publicJs.resultTip('您输入的手机号码格式不正确')
           
            return;
          }
        }
      }
    }
    this.setData({studentsArr: searchArr})
  },
  //获取本季度的学生
  searchStudents: function(){
    var that = this;
    // 时间戳
    var stamp = new Date().getTime();
    // 学年
    var year = this.data.schoolYear;
    // 学期
    var nSemester = this.data.nSemester;
    // 教师token
    var token = this.data.teacherToken;
    this.setData({
      sName:'',
      sPhone:'',
      showTip:false
    })
    var query = {
      appid:appId,
      nclassyear: year,
      nsemester: nSemester,
      pageindex: 1,
      pagesize: 1000,
      timestamp: stamp,
      token: token
    }
    var option = {
      api:'api/TeacherStudent',
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
          that.setData({wordsArr: []})
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            // console.log(resData)
            if(resData.length == 0){
              that.setData({studentsArr:[]});
            }else{
              that.data.studentsArr = [];
              var studentsListArr = [];
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
                var kemu = cur.sDeptName.substr(2,3);  //学科
               
                  var grade = times +' '+ cur.sGrade + kemu;
                studentsListArr.push({
                  SectBegin: cur.SectBegin,  //开课日期
                  grade: grade,  //所在班级+日期
                  sStudentName:cur. sStudentName, //学生姓名
                  sStudentCode: cur.sStudentCode, //学生编号
                  sClassCode: cur.sClassCode, //班级编号
                  sClassName: cur.sClassName, // 班级全称
                  sPhone: cur.sParents1Phone, //手机号
                  nGrade: cur.nGrade, //年级数字
                  sGrade: cur.sGrade, //年级汉字
                  ConvertPinyin: cur.sStudentName? transform.ConvertPinyin(cur.sStudentName):null,
                  ucfirst: cur.sStudentName? transform.ConvertPinyin(cur.sStudentName).substr(0,1).toUpperCase(): '#'
                })
              }
              // 处理wordArr;
              for(var i= 0; i < studentsListArr.length; i++){
                that.data.wordsArr.push(studentsListArr[i].ucfirst)
              }
              var  ass = quchong(that.data.wordsArr)
              that.setData({wordsArr:ass.sort()})

              that.setData({studentsArr:studentsListArr,studentsArr1:studentsListArr,wordHeight: 18*that.data.wordsArr.length})
              wx.setStorageSync('studentsInfo',studentsListArr)
            }
            that.setData({isAjaxOver: true})
          }
          setTimeout(()=>{
            wx.hideLoading()
          },500)
        }
      }
    })
    
  },
  // 班级列表
  getClassList: function(){
   
  },

  // 按字母检索
  selectStudents: function(e){
    var studentsArr = this.data.studentsArr1;
    var val = e.target.dataset.content;
    var ids = e.target.id;
    this.setData({
      currentWordIndex: ids,
      sName: '',
      sPhone: ''
    })
    var reg = new RegExp('['+ val +']',"g");
    var searchArr = [];
    for(var i = 0 ; i < studentsArr.length; i++){
      var cur = studentsArr[i]
      if(cur.ucfirst.match(reg)){
        searchArr.push(cur)
      }
    }
    this.setData({studentsArr: searchArr})
  }
})

function quchong(arr){
  var newArr = [];
  var json = {}
 for(var i = 0; i < arr.length; i++){
  if(!json[arr[i]]){
   newArr.push(arr[i]);
   json[arr[i]] = 1;
  }
 }
 return newArr;
}