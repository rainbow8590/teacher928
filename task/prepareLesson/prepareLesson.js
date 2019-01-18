
var publicJs = require('../../utils/public.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
//获取应用实例
const app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;
Page({
  data: {
    tabBarArr:[
      {id:0,txt:'录入',classname:'icon-write',changeTextColor:'#888',isChange: true},
      {id:1,txt:'查询',classname:'icon-search',changeTextColor:'#888',isChange: false},
      {id:2,txt:'任务',classname:'icon-taskingactive',changeTextColor:'#1FBB1C',isChange: false},
      {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888',isChange: false},
    ],
    zoomShow: false,
    showModalStatus: false,//控制导航显示
    isopen: 'open',//控制菜单按钮显示
    lessons:[{},{},{},{}],
    checkLessons:null,
    areaindex:0,
    schoolindex:0,
    showDialog: false,
    showEnd: false, 
    area:[],
    schools:[{AreaCode:'0000',AreaName:''}],
    areaClass:[],
    isEndPage: false,
    showTip: false ,// 控制显示提示可约课节数
    showDate: false, //控制显示课节弹窗
    dates:[],
    selectLessonNo:'',


  },
  onReady: function(){
    this.selectPopup = this.selectComponent("#selectPopup");
  },
  onLoad:function(){
    wx.setStorageSync('PerpareLesson', false)
    var that = this;
    this.isAjaxOver = true;
    this.pageNum = 1;
    this.selectArea = 0;
    this.selectSchool = 0;
    this.setData({
      teacherToken:wx.getStorageSync('teacherToken'),
      teacherName: wx.getStorageSync('teacherName'),
      identity: wx.getStorageSync('identity')
    })
    // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({contentH: that.data.windowHeight})
    });
      this.getArea();

    
    
  },

  scrolltolower: function(e){
    console.log(this.data.isEndPage)
    console.log(this.isAjaxOver)
    if(this.data.isEndPage) return;
    if(this.isAjaxOver == true){
      this.pageNum ++;
      this.getAreaClass(this.pageNum);
    }
  },
  getScrollTop: function(e){
    // console.log(e)
    this.setData({scrollTop: e.detail.scrollTop})
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
  // 点击改变tabBar颜色
  changeColor: function(e){
    publicJs.changeColor(e,this);
  },

  bindPickerChangeArea: function(e){
    this.selectArea = e.detail.value;
    this.setData({areaindex: e.detail.value,schoolindex:0,areaClass:[]})

    this.getAreaClass(1)
  },
  bindPickerChangeSchool: function(e){
    console.log(e.detail.value)
    this.selectSchool = e.detail.value;
    this.setData({schoolindex: e.detail.value,areaClass:[]})
    this.getAreaClass(1);
  },
  /*// 获取地区
  getPrefecture: function(){
    this.setData({arr: this.data.pullArr,inpStr: e.detail.detail.dataset.id})
    this.selectPopup.showPopup()
  },
  // 获取学校
  getSchools: function(){
    this.setData({arr: this.data.pullArr,inpStr: e.detail.detail.dataset.id})
    this.selectPopup.showPopup()
  },*/
  checkChange: function(e){
    console.log(e)
    this.selectRdaio = e.detail.value;
    var selectClass = this.data.areaClass[e.detail.value];
    console.log(selectClass.ClassLesson)

    for(var j = 0; j < selectClass.ClassLesson.length; j++){
        selectClass.ClassLesson[j].LessonDate = selectClass.ClassLesson[j].LessonDate.substr(0, 10)
        selectClass.ClassLesson[j].active = false
        console.log(selectClass.ClassLesson[j].LessonDate)
    }
    // console.log(selectClass.ClassLesson)
    this.setData({checkLessons:selectClass,dates: selectClass.ClassLesson})
  },
  checkDate: function(e){
    console.log(e)
    // 获取选取的那一讲次
    // this.selectDate = e.detail.value;
    
  },
  addClass(e){
    console.log(e)
    this.data.dates.map((item,index) => {
      item.active = false
    })
    this.data.dates[e.target.dataset.index].active = true;
    this.setData({
      dates: this.data.dates,
      selectLessonNo:this.data.dates[e.target.dataset.index].LessonNo,
      selectLessonDate:this.data.dates[e.target.dataset.index].LessonDate, 
      // showDate: false,
      // showDialog: true
    })
  },
  closeLessonMask(){
    this.setData({showDate: false,selectLessonNo:'',selectLessonDate:''})
  },
  // 预约确认弹窗
  showModal: function(){
    this.setData({showDate: true})
    /*var that = this;
    wx.showModal({
      title: '提示',
      confirmText:'预约',
      content: '确认预约该课程？',
      success: function(res) {
        if (res.confirm) {
          that.preLessons()
        }
      }
    })*/
  },
  showModal1(){
    if(this.data.selectLessonNo+'' == '' || this.data.selectLessonDate+'' ==''){
      publicJs.resultTip('请选择日期')
      return;
    }
    this.setData({showDialog: true})
  },
  giveup: function(){
    this.setData({showDialog: false})
  },
  // 预约
  preLessons: function(){
    this.setData({showDialog: false,showDate: false})
    var that = this;
    var token = this.data.teacherToken;
    var stamp = new Date().getTime();
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
    }
    
    // console.log(this.data.checkLessons)
    // return;
    var data = {
      "ClassCode": this.data.checkLessons.ClassCode,
      // "LessonNo": this.data.checkLessons.LessonNo,
      "LessonNo": this.data.selectLessonNo,
      "XueBu": this.data.checkLessons.XueBu,
      "XueKe": this.data.checkLessons.XueKe,
      "LessonDate": this.data.selectLessonDate
    }
    
    var option = {
      api:'api/TeacherTrain/SubReserveClass',
      query: query,
      type: 'post',
      data: data
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
            publicJs.resultTip(res.data.Message,function(){
              that.setData({selectLessonNo:'',selectLessonDate:''})
              // 预约了
              wx.setStorageSync('PerpareLesson', true)
              //预约成功, 返回上一页
              wx.navigateBack({detail:1})
            });
            
          }else if(res.data.ResultType == 7){
            // publicJs.resultTip('预约失败',)
            wx.showModal({
              title: '预约失败',
              content: res.data.Message,
              showCancel: false,
              success: function(){}
            })
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
   //筛选校区
  getArea: function(){
    var that = this;
    var token = this.data.teacherToken;
    var stamp = new Date().getTime();
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
    }
    var option = {
      api:'/api/TeacherTrain/GetAreaInfo',
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

            var resData = res.data.AppendData;
            var area = [];
            var schools = [];
            if(resData&& resData.length){
              // 请求可预约的节数
              that.getWeeKNum();
              for(var i = 0 ; i < resData.length; i++){
                area.push(resData[i].Regionalism);
                schools.push(resData[i].AreaInfo)
              }
              that.setData({area: area,schools:schools})
              that.getAreaClass(1);
            }else{
              publicJs.resultTip('没有可预约的班级',function(){
                wx.navigateBack({delta: 1})
              })
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
  //获取校区的班级
  getAreaClass: function(pageNum){

    if(!this.isAjaxOver) return;
    // this.setData({showEnd: false})
    this.isAjaxOver = false;
    var that = this;
    var token = this.data.teacherToken;
    var stamp = new Date().getTime();
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      areacode:this.data.schools[this.selectArea][this.selectSchool].AreaCode,
      pagesize:5,
      pageindex: pageNum
    }
    var option = {
      api:'api/TeacherTrain/GetClassList',
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
            var resData = res.data.AppendData;
            if(resData&&resData.length>0){
              for(var i = 0; i < resData.length; i++){
                var item = resData[i];
                item.SemesterName = item.Semester == 1?'秋季班':(item.Semester == 2?'寒假班':(item.Semester == 3?'春季班':'暑假班'))
                item.dtDate = item.dtDate.substr(5,5)
                item.BeginDate = item.BeginDate.substr(5,5)
                item.EndDate = item.EndDate.substr(5,5)
                
              }

              console.log(resData)
              that.setData({areaClass: that.data.areaClass.concat(resData)})
            }else{
              that.setData({showEnd: true,isEndPage:true})
            }
            that.isAjaxOver = true;

            console.log(that.data.areaClass)
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
  //获取本周约课的次数
  getWeeKNum: function(){
    
    var that = this;
    var token = this.data.teacherToken;
    var stamp = new Date().getTime();
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,

    }
    var option = {
      api:'api/TeacherTrain/GetWeekListenCount',
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
            that.setData({weekNum:res.data.Message ,showTip: true}) ;
            /*if(resData.length){
              for(var i = 0; i < resData.length; i++){
                var item = resData[i];
                item.SemesterName = item.Semester == 1?'秋季班':(item.Semester == 2?'寒假班':(item.Semester == 3?'春季班':'暑假班'))
                item.dtDate = item.dtDate.substr(0,item.dtDate.indexOf('T'))
              }
              that.setData({areaClass: that.data.areaClass.concat(resData)})
            }else{
              that.setData({showEnd: true})
            }*/
            
            console.log(that.data.areaClass)
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
 
})
