let requests = require('../../utils/requests.js');
let publicJs = require('../../utils/public.js');
let GetUnhandleOutClassApplyCount = require('../../utils/GetUnhandleOutClassApplyCount.js');
let saveFormId = require('../../utils/saveFormId.js');
let mta= require('../../utils/mta_analysis.js');
const app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;
Page({
  data:{
    activeIndex:0,
    schoolSrc:'icon-school',
    scoreSrc:'icon-score',
    progerssSrc:'icon-schoolprogress',
    callSrc:'icon-call',
    perparelessonSrc:'icon-preparelesson',
    classSrc: 'icon-class',
    studentsSrc: 'icon-card',
    scheduleSrc: 'icon-calendar',
    noticeSrc: 'icon-remind',
    taskSrc: 'icon-dollar',
    daikeSrc: 'icon-daikeicon',
    auditingSrc: 'icon-zhang',
    taskingIconSrc: 'icon-daikeicon',
    scorePicSrc:'icon-scorepic',
    replaceSrc: 'icon-replace',
    taskSrc: 'icon-task',
    clockSrc: 'icon-clock',
    ticketSrc: 'icon-ticket',
    sum:0, //京东券总和
    showCall: false, // 显示课堂点名
    num:-1,
    noAuditing: 0, 
    noSchoolProgress:0, //未录入公立校进度的班级数量
    smallTop: '144rpx',
    showArr:[true,false,false,false],
    isShowAfterClassTask: false,// 控制显示课后作业进度
    isShowTeacherConclusion: false,// 控制显示教师寄语
    isShowTrainModule: false, // 控制显示实习任务
  },
  onLoad(option){
    mta.Page.init();
    let that = this;
    if(Number(option.tip) == 0 || Number(option.tip) == 1  ){
      for(let i = 0 ; i <this.data.showArr.length; i++ ){
        if(i == option.activeIndex){
          this.data.showArr[option.activeIndex] = true;
        }else{
          this.data.showArr[i] = false;
        }
      }
    }
    this.setData({
      showArr:this.data.showArr,
      activeIndex: Number(option.activeIndex),
      teacherToken:wx.getStorageSync('teacherToken'),
      teacherCode:wx.getStorageSync('teacherCode'),
      noAuditing: wx.getStorageSync('noAuditing'),
      identity: wx.getStorageSync('identity'),
      openId:wx.getStorageSync('openId'),
    })

    // this.isShowAfterClassAndTeacher()

    // 设置标题
    if(this.data.activeIndex == 0){
      wx.setNavigationBarTitle({title: '录入'})
    }else if(this.data.activeIndex == 1){
      wx.setNavigationBarTitle({title: '查询'})
    }else if(this.data.activeIndex == 2){
      wx.setNavigationBarTitle({title: '任务'})
    }else if(this.data.activeIndex == 3){
      wx.setNavigationBarTitle({title: '工具'})
    }
    publicJs.getSystem(that,function(){
      that.setData({resultH: that.data.windowHeight - 56})
      if(that.data.windowWidth < 360){
          that.setData({
            smallTop: '40rpx'
          })
        }
    });
    if(this.data.identity!= 100 && this.data.identity!=101 && this.data.identity!=102){
      this.getSynthesize();
      // this.isCourse();
      // GetUnhandleOutClassApplyCount.GetUnhandleOutClassApplyCount(this);
      // this.getDateList();
    }
    // this.demo123();
  },
  onShow(option){
    // if(this.data.identity!= 100 && this.data.identity!=101 && this.data.identity!=102){
    //   this.getDateList();
    //   if(this.data.identity == 1){ //教师才有退班审核操作
    //     GetUnhandleOutClassApplyCount.GetUnhandleOutClassApplyCount(this);
    //   }
    // }
  },
  // 点击切换tab
  tabClick(e){
    saveFormId.saveFormId(this,appId,appKey);
    let idIndex = e.currentTarget.id;
    for(let i = 0; i < this.data.showArr.length; i++){
      if(idIndex== i){
        this.data.showArr[i] = true
      }else{
        this.data.showArr[i] = false
      }
    }
    if(this.data.identity!=100 && this.data.identity!=101 && this.data.identity!=102){
      if(idIndex == 0){
        wx.setNavigationBarTitle({title: '录入'})
      }else if(idIndex == 1){
        wx.setNavigationBarTitle({title: '查询'})
      }else if(idIndex == 2){
        wx.setNavigationBarTitle({title: '任务'})
      }else if(idIndex == 3){
        wx.setNavigationBarTitle({title: '工具'})
      }
    }
    if(this.data.identity == 102){ // 教管A
      if(idIndex == 0){
        wx.setNavigationBarTitle({title: '录入'})
      }else{
        publicJs.resultTip('暂无权限')
        return;
      }
    }else if(this.data.identity == 101){ // 教管B
      if(idIndex == 2){
        wx.setNavigationBarTitle({title: '任务'})
      }else{
        publicJs.resultTip('暂无权限')
        return;
      }
    }else if(this.data.identity==100){ // 教管A教管B
      if(idIndex == 0){
        wx.setNavigationBarTitle({title: '任务'})
      }else if(idIndex == 2){
        wx.setNavigationBarTitle({title: '录入'})
      }else{
        publicJs.resultTip('暂无权限')
        return;
      }
    }

    this.setData({
      activeIndex:idIndex,
      showArr:this.data.showArr
    });
  },

  // choose(){
  //   wx.chooseImage({
  //     count: 1, // 默认9
  //     sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
  //     sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
  //     success: function (res) {
  //       // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
  //       var tempFilePaths = res.tempFilePaths
  //     }
  //   })
  // },

  // 滑动切换tab
  swiperChange(e){
    let current = e.detail.current; 
    if(current == 0){
      wx.setNavigationBarTitle({title: '录入'})
    }else if(current == 1){
      wx.setNavigationBarTitle({title: '查询'})
    }else if(current == 2){
      wx.setNavigationBarTitle({title: '任务'})
    }else if(current == 3){
      wx.setNavigationBarTitle({title: '工具'})
    }
    this.setData({
      activeIndex:current,
    });
  },
  // 跳转 到高思乐享
  goDiscount(){
    // mta.Event.stat("discount",{});
    //wx.navigateTo({ url: '/write/discount/discount' });
    var teacherCode = this.data.teacherCode;
    var teacherToken = this.data.teacherToken;
    wx.navigateToMiniProgram({
      appId: 'wxa9c0e8a43e373d42',
      path: '/pages/discount?teacherCode='+teacherCode+'&teacherToken='+teacherToken,
      extraData: {},
      // envVersion: 'trial', // 体验版
      // envVersion: 'develop', // 开发版
      envVersion: 'release', // 线上版
      success(res) {
        console.log(res)
       // 打卡成功
      }
    })

  },
  // 跳转 公立校信息
  goSchool(e){
    mta.Event.stat("school_infos",{});
    if(this.data.identity == 100 || this.data.identity == 101 || this.data.identity == 102){
      publicJs.resultTip('暂无权限')
      return;
    }
    publicJs.goPage(e,this,'/write/schoolInfos/schoolInfos')
  },
  // 跳转 进考门
  goScore(e){
    mta.Event.stat("entrance_door",{});
    if(this.data.identity == 100 || this.data.identity == 101 || this.data.identity == 102){
      publicJs.resultTip('暂无权限')
      return;
    }
    publicJs.goPage(e,this,'/write/entranceDoor/entranceDoor?parent=enterdoor')
  },
  // 跳转 出考门
  goOutScore(e){
    mta.Event.stat("out_door",{});
    if(this.data.identity == 100 || this.data.identity == 101 || this.data.identity == 102){
      publicJs.resultTip('暂无权限')
      return;
    }
    publicJs.goPage(e,this,'/write/entranceDoor/entranceDoor?parent=outdoor')
  },
  // 跳转 课堂点名
  goCall(e){
    mta.Event.stat("class_call",{});
    if(this.data.identity == 100 || this.data.identity == 101 || this.data.identity == 102){
      publicJs.resultTip('暂无权限')
      return;
    }
    publicJs.goPage(e,this,'/write/classCall/classCall')
  },
  // 备课评分
  goPrepareLessons(e){
    mta.Event.stat("class_call",{});
    publicJs.goPage(e,this,'/write/prepareLesson/prepareLesson')
  },
  // 课后作业评分
  goAfterClassTask(e){
    mta.Event.stat("class_call",{});
    publicJs.goPage(e,this,'/write/afterClassTask/afterClassTask')
  },
  // 教师寄语
  goTeacherConclusion(e){
    mta.Event.stat("class_call",{});
    publicJs.goPage(e,this,'/write/teacherConclusion/teacherConclusion')
  },
  // 跳转 公立校进度
  goSchoolProgress(e){
    mta.Event.stat("school_progress",{});
    if(this.data.identity == 100 || this.data.identity == 101 || this.data.identity == 102){
      publicJs.resultTip('暂无权限')
      return;
    }
    publicJs.goPage(e,this,'/write/schoolProgress/schoolProgress')
  },
  // 通知公告
  goNotice(e){
    mta.Event.stat("notice",{})
    //获取新老校区
    
    publicJs.goPage(e,this,'/search/notice1/notice1')
  },
  // 续报排行
  goRank(e){
    mta.Event.stat("notice",{})
    // this.getRankingAreaType(e);
    publicJs.goPage(e,this,'/search/rank/rank?area='+this.area)
    
  },
  // 学生信息
  goStudentInfos(e){
    mta.Event.stat("search_student_info",{})
    publicJs.goPage(e,this,'/search/searchStudentInfo/searchStudentInfo')
  },
  // 我的班级
  goMyClass(e){
    mta.Event.stat("search_class_info",{})
    publicJs.goPage(e,this,'/search/searchClassInfo/searchClassInfo')
  },
  // 高思校历
  goSchedule(e){
    mta.Event.stat("schedule",{})
    publicJs.goPage(e,this,'/search/schedule/schedule')
  },
  // 薪酬绩效
  goPay(e){
    mta.Event.stat("pay",{})
    // publicJs.goPage(e,this,'/search/pay/pay')
    publicJs.goPage(e,this,'/search/periodPay/periodPay')
  },
  // 听课日历
  goLessonDate(e){
    mta.Event.stat("pay",{})
    publicJs.goPage(e,this,'/search/lessonDate/lessonDate')
  },
  // 代课记录
  goReplaceRecord(e){
    mta.Event.stat("replace_record",{})
    publicJs.goPage(e,this,'/search/replaceRecord/replaceRecord')
  },
  // 教管代课审核
  goDaikeShenhe(e){
    mta.Event.stat("daike_auditing",{})
    publicJs.goPage(e,this,'/task/daikeAuditing/daikeAuditing')
  },
  // 实习任务
  goPracticeTask(e){
    mta.Event.stat("daike_auditing",{})
    publicJs.goPage(e,this,'/task/practiceTask/practiceTask')
  },
  // 实习任务
  goCommont(e){
    mta.Event.stat("daike_auditing",{})
    publicJs.goPage(e,this,'/search/commont/commont')
  },
  // 教师退班审核
  goAuditing(e){
    //教管无权限
    if(this.data.identity == 100 || this.data.identity == 101 || this.data.identity == 102){
      publicJs.resultTip('暂无权限')
      return;
    }
    mta.Event.stat("auditing",{})
    publicJs.goPage(e,this,'/task/auditing/auditing')
  },
  // 成绩单
  scorePic(e){
    mta.Event.stat("score_pic",{})
    publicJs.goPage(e,this,'/set/scorePic/scorePic')
  },
  // 求 代课
  replace(e){
    mta.Event.stat("replace",{})
    publicJs.goPage(e,this,'/set/replace/replace')
  },
  // 任务卡
  task(e){
    mta.Event.stat("task_card",{})
    publicJs.goPage(e,this,'/set/taskCard/taskCard')
  },
  // 催打卡
  clock(e){
    mta.Event.stat("card_index",{})
    publicJs.goPage(e,this,'/set/cardIndex/cardIndex')
  },
  // 京东券
  ticket(e){
    if(!this.isAjaxOver) return;
    mta.Event.stat("jd_ticket",{})
    publicJs.goPage(e,this,'/set/JDticket/JDticket?dates=' + JSON.stringify(this.data.dates))
  },
  // 京东券
  reportCard(e){
    mta.Event.stat("report",{})
    publicJs.goPage(e,this,'/set/report/report')
  },
  // 判断今日是否有课
  isCourse(){
    let that = this;
    let stamp = new Date().getTime();
    let token = this.data.teacherToken;
    let query = {
      appid: appId,
      timestamp:stamp,
      token:token
    }
    let option = {
      api:'api/SignIn/ISCourse',
      query: query,
      type: 'get',
    }
    requests.request(option,function(res){
      getRes(res);
    })
    function getRes(res){
      if(res.data.ResultType == 0){
        if(res.data.AppendData == 0){
          that.setData({showCall: false}) 
        }else{
          that.setData({showCall: true})
        }
      }else if(res.data.ResultType == 7){
        publicJs.resultTip(res.data.Message)
        if(res.data.Message == '身份验证失败'){
          wx.clearStorageSync();
          wx.reLaunch({ url: '/pages/index/index'})
        }
      }
    }
  },
  // 获取时间列表
  getDateList(){
    let that = this;
    let stamp = new Date().getTime();
    let token = this.data.teacherToken;
    // let startDate = '2018-03-08';
    let query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      // dtstartdate:startDate
    }
    let option = {
      api:'api/JDCard/GetNewStudentCountForJDCard',
      query: query,
      type: 'get',
    }
    requests.request(option, function(res){
      getRes(res);
    })
    function getRes(res){
      // console.log(res)
      that.isAjaxOver = true;
      let resData = res.data.AppendData;
      let dates = [];
      let sum = 0;
      if(res.data.ResultType == 0){
        for(let i = 0 ; i < resData.length; i++){
          sum += Number(resData[i].nNewCount);
          dates.push({
            dtDate: resData[i].dtDate.substr(5).replace('-','.'),
            nNewCount: resData[i].nNewCount
          })
        }
        that.setData({dates: dates,sum: sum})
      }else if(res.data.ResultType == 7){
        publicJs.resultTip(res.data.Message)
        if(res.data.Message == '身份验证失败'){
          wx.clearStorageSync();
          wx.reLaunch({ url: '/pages/index/index'})
        }
            
      }
    }
  },

  //获取是否显示 课后作业评分和老师寄语
  isShowAfterClassAndTeacher(){
    let that = this;
    let stamp = new Date().getTime();
    let token = this.data.teacherToken;
    let query = {
      appid: appId,
      timestamp:stamp,
      token:token,
    }
    let option = {
      api:'api/SummerTask/GetShowmodule',
      query: query,
      type: 'get',
    }
    requests.request(option, function(res){
      getRes(res);
    })
    function getRes(res){
      let resData = res.data.AppendData;
      
      if(res.data.ResultType == 0){
        // ["HomeworkTask", "Remark"]
        if(isInArray('HomeworkTask')){
          that.setData({isShowAfterClassTask: true})
        }
        if(isInArray('Remark')){
          that.setData({isShowTeacherConclusion: true})
        }
        if(isInArray('TeacherTrain')){
          that.setData({isShowTrainModule: true})
        }
    
      }else if(res.data.ResultType == 7){
        publicJs.resultTip(res.data.Message)
        if(res.data.Message == '身份验证失败'){
          wx.clearStorageSync();
          wx.reLaunch({ url: '/pages/index/index'})
        }
            
      }

      function isInArray(value){
        for(var i = 0; i < resData.length; i++){
            if(value === resData[i]){
                return true;
            }
        }
        return false;
      }
    }
  },

  getRankingAreaType: function(e){
    var that = this;
    var stamp = new Date().getTime();
    var nSemester = publicJs.flagSemester();
    var token = this.data.teacherToken;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nclassyear: new Date().getFullYear(),
      nsemester: nSemester,
    }
    var option = {
      api:'api/Teacher/GetTeacherRankingAreaType',
      query: query,
      type: 'get',
    }
    wx.showLoading({
      title:'努力加载中...',
      success: function(){
        requests.request(option, function(res){
          getRes(res)
        })
        function getRes(res){
          console.log(res)
          if(res.data.ResultType == 0){
            var result = res.data.AppendData[0];
            var area = null;
            if(result.sTeacherAreaType.indexOf('老校区')!= -1){
              area = '老校区';
            }else{
              area = '新校区';
            }
              publicJs.goPage(e,that,'/search/rank/rank?area='+area)
            
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


  // 综合接口  获取退班审核 / 京东卡日期 / 今日是否有课 / 新老校区教师
  getSynthesize: function(e){
    var that = this;
    var stamp = new Date().getTime();
    var nSemester = publicJs.flagSemester();
    var token = this.data.teacherToken;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nclassyear: new Date().getFullYear(),
      nsemester: nSemester,
    }
    var option = {
      api:'api/System/GetFocus',
      query: query,
      type: 'get',
    }
    wx.showLoading({
      title:'努力加载中...',
      success: function(){
        requests.request(option, function(res){
          that.isAjaxOver = true;
          getRes(res)
        })
        function getRes(res){
          console.log(res)
          if(res.data.ResultType == 0){
            // 今日有课
            if(res.data.AppendData.CourseCount> 0){
              that.setData({showCall: true}) 
            }else{
              that.setData({showCall: false})
            }
            // 代课审核
            that.setData({noAuditing: res.data.AppendData.UnhandleOutClassApplyCount})
            wx.setStorageSync('noAuditing',res.data.AppendData.UnhandleOutClassApplyCount)

            // 京东卡
            let dates = [];
            let sum = 0;
            for(let i = 0 ; i < res.data.AppendData.JDCard.length; i++){
              sum += Number(res.data.AppendData.JDCard[i].nNewCount);
              dates.push({
                dtDate: res.data.AppendData.JDCard[i].dtDate.substr(5).replace('-','.'),
                nNewCount: res.data.AppendData.JDCard[i].nNewCount
              })
            }
            that.setData({dates: dates,sum: sum})

            // 课后作业及老师寄语 教师培训任务
            if(isInArray('HomeworkTask')){
              that.setData({isShowAfterClassTask: true})
            }
            if(isInArray('Remark')){
              that.setData({isShowTeacherConclusion: true})
            }
            if(isInArray('TeacherTrain')){
              that.setData({isShowTrainModule: true})
            }
            function isInArray(value){
              for(var i = 0; i < res.data.AppendData.SummerTaskShowmodule.length; i++){
                  if(value === res.data.AppendData.SummerTaskShowmodule[i]){
                      return true;
                  }
              }
              return false;
            }

            // 新老校区
            var result = res.data.AppendData.TeacherAreaType;
            that.area = null;
            if(result.indexOf('老校区')!= -1){
              that.area = '老校区';
            }else{
              that.area = '新校区';
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


  demo: function(){
    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      
    }
    var option = {
      api:'api/AssistTeacher/GetCommentTeacherInfo',
      query: query,
      type: 'get',
    }
    wx.showLoading({
      title:'努力加载中...',
      success: function(){
        requests.request(option, function(res){
          getRes(res)
        })
        function getRes(res){
          console.log(res)
          if(res.data.ResultType == 0){
            
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


   demo123: function(){
    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken;
    var query = {
      appid: appId,
      // timestamp:stamp,
      // token:token,
    }
    var data = {"Phone":"17611582929",
      "TeacherCode":"BJ13859",
      "AreaCode":"BCADA888",
      "Channel":0}

    var option = {
      api:'api/Activity/SubVoucher',
      query: query,
      type: 'post',
      data:data
    }
    wx.showLoading({
      title:'努力加载中...',
      success: function(){
        requests.request(option, function(res){
          getRes(res)
        })
        function getRes(res){
          console.log(res)
          // if(res.data.ResultType == 0){
            
          // }else if(res.data.ResultType == 7){
          //   publicJs.resultTip(res.data.Message)
          //   if(res.data.Message == '身份验证失败'){
          //     wx.clearStorageSync();
          //     wx.reLaunch({ url: '/pages/index/index'})
          //   }
            
          // }
          setTimeout(()=>{
            wx.hideLoading()
          },500)
        }
      }
    })
  }
})