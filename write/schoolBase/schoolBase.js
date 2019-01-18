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
    typeInn:'',//显示的班级字符串
    inpStr:'',   //公共显示的字符串
    kind: 1, // 查询类型 基本/期中期末
    classStr: '',//选择的班级信息
    showScore:false,//控制显示期中期末选项
    zoomShow: false,
    isAjaxOver: true,
    isAjaxOver1: false
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(options){

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
    this.setData({classStr:choiceClass.classCode + choiceClass.sClassName})

    //组装班级id和名称
    var classInfo = this.data.classInfo
    for(var i = 0 ; i < classInfo.length; i++){
      this.data.classes.push({id:i,value:classInfo[i].grade})
    }
    this.setData({classes: this.data.classes})
    this.setData({classInn:this.data.classes[this.data.tipClassIndex].value})
    wx.setStorageSync('classes',this.data.classes)
    
    this.getAllStudent();
    this.getClassList();
    // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({resultH: that.data.windowHeight -45 - 42 - 14 -40-45-15-15 -56})
    });
    
  },
  // // 改变班级相关值
  // getClass: function (e) {
  //   publicJs.getClass(e,this)
  // },
  getClass: function (e) {
    if(this.data.isAjaxOver){
      this.setData({arr: this.data.classes,inpStr: e.detail.detail})
      this.selectPopup.showPopup();
    }
  },
  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
  },
   // 关闭弹窗
  closeFloat: function(e){
    publicJs.closeFloat(e,this)
  },
   // 关闭弹窗
  closeFloat1: function(e){
    publicJs.closeFloat(e,this)
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
      this.setData({classStr:choiceClass.classCode + choiceClass.sClassName})
      // 重新获取学生信息
      this.getAllStudent();
      // 缓存选择的班级信息的编号
      wx.setStorageSync('tipClassIndex',this.data.tipClassIndex);
    }else if(inpStr == 'experimental'){  //实验班
      this.data.studentslist[this.data.numb].sExperimentalType = this.data.ExperimentalArr[e.detail.detail.dataset.id].value;
      this.setData({
        studentslist: this.data.studentslist,
        experimentalIndex:e.detail.detail.dataset.id, 
      })
    }
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
  // 点击改变tabBar颜色
  // changeColor: function(e){
  //   publicJs.changeColor(e,this)
  // },
  sExperimental: function(e){
     publicJs.sExperimental(e,this)
  },
  checkSchool: function(e){
    // console.log(e)
    this.setData({
      show1: true,
      schoolnum:e.target.dataset.schoolnum
    })
  },
  getIndex1:function(e){
    console.log(e.target.dataset.id )
    console.log(this.data.schoolnum)
    var studentslist = this.data.studentslist;
    studentslist[this.data.schoolnum].sSchoolName = '['+ e.target.dataset.district + ']'+ e.target.dataset.schoolname;
    studentslist[this.data.schoolnum].schoolDistrict =  e.target.dataset.district 
    studentslist[this.data.schoolnum].schoolId =  e.target.dataset.id 
    this.setData({
      studentslist:this.data.studentslist,
      show1: false,
      setSchoolList:this.data.AllSchool,
      inpValue:''
    })
    console.log(this.data.studentslist)
  },
  writeVlaue:function(e){
    this.setData({
      inpValue1: e.detail.value
    })
  },
  getIndex2:function(e){
    this.setData({
      show2: true,
      show1: false
    })
  },
  otherSchool: function(){
    var studentslist = this.data.studentslist;
    // console.log(this.data.schoolnum)
    studentslist[this.data.schoolnum].sSchoolName = this.data.inpValue1;
    this.setData({
      studentslist:this.data.studentslist,
      show2: false,
      inpValue1:''
    })
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
    if(this.data.isAjaxOver==false) return;
    this.data.isAjaxOver = false;
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var studentSize = this.data.classInfo[this.data.tipClassIndex].studentNumber;
    var ClassCode = this.data.classInfo[this.data.tipClassIndex].classCode;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      pagesize:studentSize,
      pageindex:1,
      sclasscode:ClassCode,
    }
    var option = {
      api:'api/Record',
      query: query,
      type: 'get',
    }
    wx.showLoading({
      title:'努力加载中',
      success: function(){
        requests.request(option,function(res){
          getRes(res);
        })
        function getRes(res){
          var resData = res.data;
          if(resData.ResultType == 0){
            that.data.studentslist = [];
            var studentInfos = resData.AppendData;
            if(!studentInfos.length){
              that.setData({studentslist:that.data.studentslist,isAjaxOver: true})
            }else{
              if(studentInfos[0].nXueBu == 1){
                that.setData({isShow:false})
                addArr();
              }else if(studentInfos[0].nXueBu == 2 || studentInfos[0].nXueBu == 3){
                that.setData({isShow:true})
                addArr();
              }
              that.setData({studentslist:that.data.studentslist,nXueBu: studentInfos[0].nXueBu,isAjaxOver: true})
              console.log(that.data.studentslist)
              that.getAllSchool();
            }
            
            // 组装数组
            function  addArr(){
              for(var i = 0 ; i < studentInfos.length; i++){
                var student = studentInfos[i]
                that.data.studentslist.push({
                  sName: student.sStudentName, 
                  sStudentCode: student.sStudentCode, 
                  nXueBu: student.nXueBu, 
                  sExperimentalType: student.sExperimentalType==null? '':student.sExperimentalType,
                  sSchoolName: student.sSchoolName == null?'':(student.sDistrict=="" ? student.sSchoolName : '['+student.sDistrict +']'+student.sSchoolName),
                  schoolDistrict:student.sDistrict,
                  schoolId:student.nSchoolID
                })
              }
            }
          }
          setTimeout(()=>{
            wx.hideLoading()
            that.setData({isAjaxOver: true})
          },500)
        }
      }
    })
   
  },
  // 获取全部学校列表
  getAllSchool: function(){
    // 设置setSchoolList的值
    var that = this;
    var token = this.data.teacherToken; // token值
    var nxuebu = this.data.nXueBu;   //学部信息
    var stamp = new Date().getTime();  //时间戳
    var sName = this.data.sName;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nxuebu:nxuebu,
    }
    var option = {
      api:'api/School',
      query: query,
      type: 'get',
    }
    requests.request(option, function(res){
      getRes(res)
    })
    function getRes(res){
      var resData = res.data;
      that.data.AllSchool = [];
      // console.log(resData)
      if(resData.ResultType == 0){
        var schoolInfos = resData.AppendData;
        for(var i = 0 ; i < schoolInfos.length; i++){
          var school = schoolInfos[i]
          that.data.setSchoolList.push({
            schoolDistrict:school.sDistrict,
            schoolName:school.sName,
            schoolId:school.ID
          })
        }
        that.setData({
          setSchoolList: that.data.setSchoolList,
          AllSchool: that.data.setSchoolList,
          isAjaxOver1: true
        })
      }
    }
    

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
        "sStudentCode": arr[i].substr(arr[i].indexOf('=')+1),
        "sDistrict": arr[i+1].substr(arr[i+1].indexOf('=')+1),
        "sExperimentalType": arr[i+2].substr(arr[i+2].indexOf('=')+1) == "" ? null : arr[i+2].substr(arr[i+2].indexOf('=')+1),
        "nSchoolID": Number(arr[i+3].substr(arr[i+3].indexOf('=')+1)),
        "nXueBu": Number(arr[i+4].substr(arr[i+4].indexOf('=')+1)),
        "sSchoolName": arr[i+5].substr(arr[i+5].indexOf('=')+1),
      })
    }
    console.log(arr1)
    // return;
    // 删除海淀区
    for(var i = 0 ; i < arr1.length; i++){
      var schoolStr = arr1[i].sSchoolName;
  
      if(arr1[i].sSchoolName.lastIndexOf(']') != -1){
        arr1[i].sSchoolName = arr1[i].sSchoolName.slice(arr1[i].sSchoolName.lastIndexOf(']')+1)
      }
    }
    var arr2 = [];
    for(var i = 0; i <arr1.length; i++){
      if(arr1[i].sSchoolName!='' || arr1[i].sExperimentalType!=null){
        arr2.push(arr1[i])
      }
    }
    console.log(arr2)
    var query = {
      appid: appId,
      timestamp: stamp,
      token: token
    }
    var option = {
      api:'api/Record',
      query: query,
      type: 'post',
      data: arr1
    }
    console.log(option.arr1)
    wx.showLoading({
      title:'保存中',
      success: function(){
        requests.request(option,function(res){
          saveRes(res)
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
  // 筛选学校
  selectName: function(e){
    var allSchool = this.data.AllSchool;
    var len = allSchool.length;
    var values = e.detail.value;
    this.setData({
      inpValue: e.detail.value,
      selectSchoolList:[]
    })
    this.data.selectSchoolList = [];
    if(this.data.inpValue.length != 0){
      for(var i = 0 ; i <len; i++){
        var school = allSchool[i];
        if(school.schoolName.indexOf(values) != -1){
          this.data.selectSchoolList.push(school)
        }
      }
      this.setData({setSchoolList:this.data.selectSchoolList})
    }else{
      this.setData({setSchoolList:this.data.AllSchool})
    }
  },

})
