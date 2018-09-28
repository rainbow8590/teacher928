
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
    classInfo:[],
    classes: [],
    teacherName:'',
    // schoolYear: new Date().getFullYear(),
    semester:'秋季',
    showModalStatus: false,
    isopen:'open',
    show:false, //控制弹窗的显示
    show1:false, //控制转发弹窗的显示

    tipKejieIndex: 0, //第几讲
    arr: [],//公共数组
    inpStr:'',//公共字符串
    classInn:'',
    kejieInn:'第2讲',
    studentsList: [],//学生信息集合
    resultH: 400, //表体的高度,
    classStr: '',//选择的班级信息
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
      year: wx.getStorageSync('year'),
      classInfo: wx.getStorageSync('classInfo'),
      noAuditing: wx.getStorageSync('noAuditing'),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')
    })
    
    console.log(this.data.classInfo)
    // 设置班级
    var choiceClass = this.data.classInfo[this.data.tipClassIndex]
    this.setData({classStr:choiceClass.sClassCode + choiceClass.value})
    // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({resultH: that.data.windowHeight -45 - 42 - 14 -40-45-15-15 -56})
    });


    // var classInfo = this.data.classInfo
    // for(var i = 0 ; i < classInfo.length; i++){
    //   this.data.classes.push({id:i,value:classInfo[i].grade})
    // }
    this.setData({classes: this.data.classInfo,classInn:this.data.classInfo[this.data.tipClassIndex].value})
    wx.setStorageSync('classes', this.data.classes)

    
    // for(var j = 2; j <= classInfo[this.data.tipClassIndex].lessonNumber;j++){
    //   this.data.kejieArr.push({id: j, value: '第'+ j +'讲'})
    // }
    for(var j = 3; j <= 8;j++){
      this.data.kejieArr.push({id: j, value: '第'+ j +'讲'})
    }
  
    // 删除‘请选择’项
    // this.data.kejieArr.shift();
    console.log(this.data.tipKejieIndex)
    this.setData({kejieArr: this.data.kejieArr,kejieInn:this.data.kejieArr[this.data.tipKejieIndex-2].value})
    // this.setData({kejieArr: this.data.kejieArr,kejieInn:this.data.kejieArr[this.data.tipKejieIndex-1].value})
    this.getScore();

  },
  getClass: function (e) {
    this.setData({isFocus: false})
    this.setData({arr: this.data.classes,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  getKejie: function (e) {
    this.setData({isFocus: false})
    this.setData({arr: this.data.kejieArr,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
  },
  // 获取点击的弹窗的id和value值
  getIndex:function(e){
    var inpStr = this.data.inpStr;
    
    if(inpStr == 'class'){  //班级
       if(this.data.sClassCode == this.data.arr[e.detail.detail.dataset.id].sClassCode) return;
      this.setData({
        sClassCode:this.data.arr[e.detail.detail.dataset.id].sClassCode, 
        classInn:this.data.arr[e.detail.detail.dataset.id].value, 
        tipClassIndex:e.detail.detail.dataset.id, 
      })
      // 设置班级
      var choiceClass = this.data.classInfo[this.data.tipClassIndex]
      this.setData({classStr:choiceClass.sClassCode + choiceClass.value})

      this.getScore();

      // 重新渲染课节
      this.data.kejieArr = [];
      for(var i = 2 ; i <= 8; i++){
        this.data.kejieArr.push({id: i, value: '第'+i+'讲'});
      }

      this.setData({kejieArr: this.data.kejieArr});

      var flagArr = [];
      for(var i = 0; i < this.data.kejieArr.length; i++){
        if(this.data.kejieInn == this.data.kejieArr[i].value){
          flagArr.push(0)
        }else{
          flagArr.push(1)
        }
      }

      if(flagArr.indexOf(0)!= -1){
        this.setData({kejieInn: this.data.kejieArr[flagArr.indexOf(0)].value});
      }else{
        this.setData({kejieInn: this.data.kejieArr[0].value});
      }


      // 缓存选择的班级信息的编号
      wx.setStorageSync('tipClassIndex',this.data.tipClassIndex);
    }else if(inpStr == 'kejie'){  //课节
      // console.log(e.detail.detail.dataset.id)
      if(this.data.kejieInn == this.data.arr[e.detail.detail.dataset.id-2].value) return;
      this.setData({
        kejieInn:this.data.arr[e.detail.detail.dataset.id-2].value, 
        tipKejieIndex:e.detail.detail.dataset.id, 
      })
      this.getScore();
      // 缓存选择的课节
      wx.setStorageSync('tipKejieIndex',this.data.tipKejieIndex);
    }

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
    var score = e.detail.value;
    var index = e.target.dataset.index;
    var reg = /^\d+(\.\d{1})?$/;
    this.setData({isFocus: false})
    if(score.length){
      if(Number(score) >100  || !reg.test(Number(score))){
        this.data.studentsList[index].Score = score +' 分数输入错误!'
        this.data.studentsList[index].isShowError = true;
        this.setData({studentsList: this.data.studentsList})
      }else{
        this.data.studentsList[index].Score = score;
        this.data.studentsList[index].isShowError = false;
        this.setData({studentsList: this.data.studentsList})
      }
    }
  },
  changeTextC: function(e){
    var score = e.detail.value;
    var index = e.target.dataset.index;
    if(score.indexOf(' 分数输入错误!') != -1){
      score = score.slice(0,score.indexOf(' 分数输入错误!'))
    }
    this.data.studentsList[index].Score = score;
    this.data.studentsList[index].isShowError = false;
    this.setData({studentsList: this.data.studentsList})
  },

  // 获取学生姓名分数
  getScore: function(){
    if(this.data.isAjaxOver==false) return;
    this.data.isAjaxOver = false;
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var ClassCode = this.data.classInfo[this.data.tipClassIndex].sClassCode;
    var lessonNum = this.data.tipKejieIndex;

    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nlessonno:lessonNum,
      pageindex:1,
      pagesize:200,
      sclasscode:ClassCode,
    }
  
    var option = {
      api:'api/SummerTask/GetClassStudent',
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
          that.setData({show: false})
          var resData = res.data;
          if(resData.ResultType == 0){
            that.data.studentsList = [];
            var studentInfos = resData.AppendData;
            if(!studentInfos.length){
              that.setData({studentsList:that.data.studentsList})
            }else{

              for(var i = 0 ; i < studentInfos.length; i++){
                var student = studentInfos[i]
                that.data.studentsList.push({
                  sStudentCode: student.sStudentCode,
                  sClassCode: student.sClassCode,
                  sName: student.sStudentName,
                  // sCardCode: student.sCardCode,
                  nLessonNum: student.nLessonNo,
                  // ScoreType: student.ScoreType,
                  Score: student.Score,
                  changeLessonState:student.changeLessonState,
                  tipText:student.changeLessonState == '调出'?'调出不可录':'满分100分',
                  disable:student.changeLessonState == '调出'? true :false,
                  isShowError: false
                })
              }
           
              that.setData({studentsList:that.data.studentsList })
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
            that.setData({isAjaxOver: true})
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
   
    for(var i = 0 ; i < this.data.studentsList.length ; i++){
      if(this.data.studentsList[i].isShowError){
        publicJs.resultTip('分数输入错误，请检查后再提交！')
        return;
      }
    }

    var arr = [];
    var arr1 = [];
    for(var k in datas){
     var str = k + '=' + datas[ k ]
      arr.push(str);
    }
    console.log(datas)
    for(var i = 0 ; i < arr.length; i+=4){
      arr1.push({
        "sClassCode": arr[i].substr(arr[i].indexOf('=')+1),
        "nLessonNo": Number(arr[i+1].substr(arr[i+1].indexOf('=')+1)),
        "sStudentCode": arr[i+2].substr(arr[i+2].indexOf('=')+1),
        "Score": arr[i+3].substr(arr[i+3].indexOf('=')+1),
      })
    }
    var arr2 = [];
    for(var i = 0; i < arr1.length; i++){
      if(arr1[i].Score != '' ){
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
      api: 'api/SummerTask/SubTaskScore',
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
          if(resData.ResultType == 0){
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
            setTimeout(()=>{
              wx.navigateBack({ delta:1 })
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
