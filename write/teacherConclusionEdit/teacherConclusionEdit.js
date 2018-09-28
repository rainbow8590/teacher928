
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
    isAjaxOver: true,
    noRemark: 0,
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
    
    // 设置班级
    var choiceClass = this.data.classInfo[this.data.tipClassIndex]
    this.setData({
      classStr:choiceClass.sClassCode + choiceClass.value,
      nowClassCode: this.data.classInfo[this.data.tipClassIndex].sClassCode
    })
    // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({resultH: that.data.windowHeight -54 - 42  -40 -55})
    });


    // var classInfo = this.data.classInfo
    
    this.setData({
      classes: this.data.classInfo,
      classInn:this.data.classInfo[this.data.tipClassIndex].value})
    wx.setStorageSync('classes', this.data.classInfo)
    this.getScore();
  },
  onShow(){
    // 保存寄語后 顯示已填寫
    var student = wx.getStorageSync('student')
    if(student){
      this.getScore();
      wx.removeStorageSync('student')
    }

  },
  getClass: function (e) {
    this.setData({arr: this.data.classes,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
  },
  goSubmit:function(e){
    var index = e.target.dataset.index;
    
    wx.navigateTo({url:'/write/teacherConclusionSubmit/teacherConclusionSubmit?index='+index})
  },
  // 获取点击的弹窗的id和value值
  getIndex:function(e){
    var inpStr = this.data.inpStr;
    this.setData({show: false})
    if(inpStr == 'class'){  //班级
      if(this.data.nowClassCode == this.data.arr[e.detail.detail.dataset.id].sClassCode) return;
      this.setData({
        classInn:this.data.arr[e.detail.detail.dataset.id].value, 
        tipClassIndex:e.detail.detail.dataset.id, 
        nowClassCode : this.data.arr[e.detail.detail.dataset.id].sClassCode
      })
      // 设置班级
      var choiceClass = this.data.classInfo[this.data.tipClassIndex]
      this.setData({classStr:choiceClass.sClassCode + choiceClass.value})
      this.getScore();

      // 重新渲染课节
      // this.data.kejieArr = [];
      // var lesson = this.data.classInfo[this.data.tipClassIndex].lessonNumber;
      // for(var i = 2 ; i <= 8; i++){
      //   this.data.kejieArr.push({id: i, value: '第'+i+'讲'});
      // }

      // this.setData({kejieArr: this.data.kejieArr});

      // var flagArr = [];
      // for(var i = 0; i < this.data.kejieArr.length; i++){
      //   if(this.data.kejieInn == this.data.kejieArr[i].value){
      //     flagArr.push(0)
      //   }else{
      //     flagArr.push(1)
      //   }
      // }

      // if(flagArr.indexOf(0)!= -1){
      //   this.setData({kejieInn: this.data.kejieArr[flagArr.indexOf(0)].value});
      // }else{
      //   this.setData({kejieInn: this.data.kejieArr[0].value});
      // }


      // 缓存选择的班级信息的编号
      wx.setStorageSync('tipClassIndex',this.data.tipClassIndex);
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
    var score = Number(e.detail.value);
    if(score >100){
      publicJs.resultTip('分数必须小于等于100')
      return;
    }
  },
  // 获取学生
  getScore: function(){
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var ClassCode = this.data.classInfo[this.data.tipClassIndex].sClassCode;

    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      pageindex:1,
      pagesize:200,
      sclasscode:ClassCode,
    }
  
    var option = {
      api:'api/SummerTask/GetClassTaskRemark',
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
            var noRemark = 0;
            if(!studentInfos.length){
              that.setData({studentsList:that.data.studentsList ,isAjaxOver: true,noRemark: noRemark})
            }else{
              for(var i = 0;i < resData.AppendData.length; i++){
                if(!resData.AppendData[i].Remark){
                  noRemark++;
                }
                resData.AppendData[i].id = i;
                resData.AppendData[i].sClassCode = ClassCode;
                resData.AppendData[i].sClassName = that.data.classInfo[that.data.tipClassIndex].sClassName;
              }
              that.setData({studentsList:resData.AppendData,isAjaxOver: true,noRemark: noRemark})
              wx.setStorageSync('RemarkStudentsList',that.data.studentsList)
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
 
})
