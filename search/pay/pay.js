
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;

Page({
  data: {
    tabBarArr:[
      {id:0,txt:'录入',classname:'icon-write',changeTextColor:'#888',isChange: false},
      {id:1,txt:'查询',classname:'icon-searchactive',changeTextColor:'#1FBB1C',isChange: true},
      {id:2,txt:'任务',classname:'icon-tasking',changeTextColor:'#888',isChange: false},
      {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888',isChange: false},
    ],
    isShowPayInfo:false,
    showModalStatus: false, //控制导航显示
    isopen:'open',  //控制菜单显示
    teacherName: '', //教师名称
    teacherToken:'', //教师token
    timestamp: '',
    yearArr:app.globalData.yearArr,
    semesterArr: [
      {id: 4, ind: 1, value: '暑假'},
      {id: 1, ind: 2, value: '秋季'},
      {id: 2, ind: 3, value: '寒假'},
      {id: 3, ind: 4, value: '春季'}
    ],
    yearTypeArr: [
      {id: 0, item:2018, value: '2018年春季',semester:3},
      {id: 1, item:2018, value: '2018年暑假',semester:4},
    ],
    stageTypeArr: [
      {id: 0,ind: 0, value: '0期'},
      {id: 1,ind: 1, value: '1期'},
      {id: 2,ind: 2, value: '2期'},
      {id: 3,ind: 3, value: '3期'},
      {id: 4,ind: null,value: '正式合计'},
    ],
    yearTypeInn: '2018年春季',
    stageInn: '0期',
    stage: 1,
    nSemester: 2,
    nSemester1:3,
    arr:[],
    inpStr: '',
    show1: false, //控制下拉弹窗
    basePayInfos:[],
    ids: 0, //记录点击的是哪个点名情况
    stageShow: false, //某期没有课程时显示
    isAjaxOver:false,
    bonusDetailArr:[],
    count: 0,
    num: 0,
    // 日期参数
    // weekArr:[  '一', '二', '三', '四', '五', '六','日'],
    monthArr:[1,2,3,4,5,6,7,8,9,10,11,12],
    yearArr1:[2017,2018,2019],
    hasEmptyGrid: false,
    showPicker: false,
    dateInfos:[],
    today: 0,
    canTip: false,
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(option){
    var that = this;
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      noAuditing: wx.getStorageSync('noAuditing'),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')
    })
    // 存储绩效页面下拉框的值
    wx.setStorageSync('yearTypeIndex',0)
    wx.setStorageSync('stageIndex',0)
    wx.setStorageSync('semesterIndex',3);
    // 获取手机宽高
    publicJs.getSystem(that,function(){
      that.setData({heigh: that.data.windowHeight - 55})
    });
    // 获取设备高度
    // wx.getSystemInfo({
    //   success: function(res) {
    //     that.setData({
    //       windowHeight: res.windowHeight,
    //       windowWidth: res.windowWidth,
    //       heigh: res.windowHeight - 55
    //     })
    //   }
    // });
     //设置年份
    this.setData({
      // schoolYear:new Date().getFullYear(),
      semester: this.data.semesterArr[0].value, // 默认显示暑假
      nSemester:this.data.semesterArr[0].id,  //默认请求暑假的数据
      schoolYear: 2018,
      schoolYear1: 2018,
      nSemester1: 3,
      stageInn: this.data.stageTypeArr[4].value,
      stage: null
    })
    // console.log(publicJs.flagSemester()-1)
    // this.setData({
    //   // schoolYear:new Date().getFullYear(),
    //   semester: this.data.semesterArr[publicJs.flagSemester()-1].value,
    //   nSemester: this.data.semesterArr[3].id,
    //   schoolYear: 2018,
    //   schoolYear1: 2018,
    //   nSemester1: 3,
    //   stageInn: this.data.stageTypeArr[4].value,
    //   stage: null
    // })


    var date = new Date(); //当前日期
    var cur_day = date.getDate(); //当前日
    var cur_year = date.getFullYear(); //当前年份
    var cur_month = date.getMonth()+1; //当前月份
    // var cur_month = option.selectMonth; //当前月份
    var change_year = date.getFullYear(); //当前年份
    var change_month = date.getMonth()+1; //当前月份
    // var change_month = option.selectMonth; //当前月份
    this.setData({
      date:cur_year+'-'+cur_month+'-'+cur_day,
      current:date.getMonth(),
      current1:date.getFullYear()
    });
    this.setData({
      cur_year,
      cur_month,
      cur_day,
      change_year,
      change_month,
      nowYear:date.getFullYear(),
      nowMonth:date.getMonth() + 1,
      date:cur_year+'-'+cur_month+'-'+cur_day
    });
    wx.setStorageSync('month',cur_month)
    this.getBasePayInfo();
    console.log(456)
    this.getBonueInfo();
    console.log(789)
  },
  onShow:function(){
    // 存储绩效页面下拉框的值
    this.setData({
      stageIndex: wx.getStorageSync('stageIndex'),
      // semesterIndex: wx.getStorageSync('semesterIndex'),
      yearTypeIndex: wx.getStorageSync('yearTypeIndex'),
      stageInn: wx.getStorageSync('stageInn'),
    })
    console.log(this.data.yearTypeIndex)
    console.log(this.data.stageIndex)
    // if(this.data.yearTypeIndex == 0){
    //   this.setData({
    //     stageTypeArr: [{id: 0, ind: null, value: '正式合计'}],
    //     nSemester1:3,
    //     stage: null
    //   })
    //   this.setData({
    //     stageInn: this.data.stageTypeArr[0].value,
    //     yearTypeInn:this.data.yearTypeArr[this.data.yearTypeIndex].value,
    //   })
    // }else{
    //   if(this.data.stageInn == '正式合计'){
    //     this.setData({
    //       stageIndex: 0,
    //     })
    //   }
    //   this.setData({
    //     stageTypeArr: [{id: 0, ind: null, value: '正式合计'}],
    //     nSemester1:4,
    //   })

    if(this.data.yearTypeIndex == 0){ // 0 是春季
      this.setData({
        stageTypeArr: [{id: 0, ind: null, value: '正式合计'}],
        nSemester1:3,
        stage: null
      })
      this.setData({
        stageInn: this.data.stageTypeArr[0].value,
        yearTypeInn:this.data.yearTypeArr[this.data.yearTypeIndex].value,
      })
    }else{
      if(this.data.stageInn == '正式合计'){
        this.setData({
          stageIndex: 4,
        })
      }else if(this.data.stageInn == '0期'){
        this.setData({
          stageIndex: 0,
        })
      }
      console.log(this.data.stageIndex)
      this.setData({
        stageTypeArr:[{id: 0,ind: 0, value: '0期'},
            {id: 1, ind: 1, value: '1期'},
            {id: 2, ind: 2, value: '2期'},
            {id: 3, ind: 3, value: '3期'},
            {id: 4, ind: null, value: '正式合计'}],
        nSemester1:4, //暑假
      })
      
      this.setData({
        stage:this.data.stageTypeArr[this.data.stageIndex].ind,
        stageInn: this.data.stageTypeArr[this.data.stageIndex].value,
        yearTypeInn:this.data.yearTypeArr[this.data.yearTypeIndex].value,
      })
    }
    wx.setStorageSync('stageIndex',this.data.stageIndex)
    wx.setStorageSync('yearTypeIndex',this.data.yearTypeIndex)
    this.getBonueInfo();
  },
  // goDetail: function(){
  //   wx.navigateTo({url:'/search/pay_detail/pay_detail'})
  // },
  // 说明
  showInfo: function(e){
    if(e.currentTarget.id == 1){
      this.setData({
        show5: true,
        info:true
      })
    }else{
      this.setData({
        show5: true,
        info:false
      })
    }
    
  },

  
  goPayInfo(){
    wx.navigateTo({url:'/search/payInfo/payInfo'})
  },
  
  // 显示弹窗 学年
  getYear: function (e) {
    console.log(this.data.isAjaxOver)
    this.setData({arr: this.data.yearArr,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  // 显示弹窗 学期
  getSemester: function (e) {
    this.setData({arr: this.data.semesterArr,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  getYearType: function (e) {
    this.setData({arr: this.data.yearTypeArr,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  getStage: function (e) {
    if(this.data.yearTypeInn == '2018年春季'){
      this.setData({
        stageTypeArr: [{id: 0, ind: null, value: '正式合计'}],
      })
    }else{
      this.setData({
        // stageTypeArr: [{id: 0, ind: null, value: '正式合计'}],
        stageTypeArr:[{id: 0, ind: 0,value: '0期'},
            {id: 1, ind: 1, value: '1期'},
            {id: 2, ind: 2, value: '2期'},
            {id: 3, ind: 3, value: '3期'},
            {id: 4, ind: null, value: '正式合计'}],
      })
    }
    this.setData({arr: this.data.stageTypeArr,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
  },
// 获取点击的弹窗的id和value值
  getIndex:function(e){
    var inpStr = this.data.inpStr;
    this.setData({show1: false})
    if(inpStr == 'year'){
      if(this.data.schoolYear1 == e.detail.detail.dataset.id) return;
      this.setData({
        // schoolYear:e.target.dataset.id, 
        schoolYear1:e.detail.detail.dataset.id, 

      })
      this.getBasePayInfo();
      wx.setStorageSync('schoolYear1',e.detail.detail.dataset.id);
    }else if(inpStr == 'semester'){
      if(this.data.semester==this.data.arr[e.detail.detail.dataset.ind-1].value) return;
      this.setData({
        semester:this.data.arr[e.detail.detail.dataset.ind-1].value, 
        nSemester:e.detail.detail.dataset.id, 
      })
      this.getBasePayInfo();
      
    }else if(inpStr == 'yearType'){
      if(this.data.yearTypeInn==this.data.arr[e.detail.detail.dataset.id].value) return;
      this.setData({
        yearTypeInn:this.data.arr[e.detail.detail.dataset.id].value, 
      })
  
      if(e.detail.detail.dataset.id == 1){ //暑假
        this.setData({
          // stageTypeArr: [{id: 0, ind: null, value: '正式合计'}],
          stageTypeArr:[{id: 0,ind: 0, value: '0期'},
            {id: 1, ind: 1, value: '1期'},
            {id: 2, ind: 2, value: '2期'},
            {id: 3, ind: 3, value: '3期'},
            {id: 4, ind: null, value: '正式合计'}],
          schoolYear: 2018,
          nSemester1: 4
        })
        this.setData({ 
          stage: this.data.stageTypeArr[4].ind,
          stageInn:this.data.stageTypeArr[4].value,
        })
        // 存储绩效页面下拉框的值
        wx.setStorageSync('yearTypeIndex',1)
        wx.setStorageSync('stageIndex',4)
        wx.setStorageSync('semesterIndex',this.data.nSemester1)
      }else{
        this.setData({
          stageTypeArr: [{id: 0, ind: null, value: '正式合计'}],
          // stageTypeArr:[{id: 0,ind: 0, value: '0期'},
          //   {id: 1, ind: 1, value: '1期'},
          //   {id: 2, ind: 2, value: '2期'},
          //   {id: 3, ind: 3, value: '3期'},
          //   {id: 4, ind: null, value: '正式合计'}],
            schoolYear: 2018,
            nSemester1: 3,
        })
        // 存储绩效页面下拉框的值
        wx.setStorageSync('yearTypeIndex',0),
        wx.setStorageSync('stageIndex',0)
        wx.setStorageSync('semesterIndex',this.data.nSemester1)
        this.setData({
          stageInn:this.data.stageTypeArr[0].value, 
          stage: this.data.stageTypeArr[0].ind
        })
      }
    
      this.getBonueInfo();
    }else if(inpStr == 'stage'){
      if(this.data.yearTypeInn == '2018年春季'){
        if(this.data.stageInn==this.data.arr[0].value) return;
        this.setData({
          stageInn:this.data.arr[0].value, 
          show1: false,
          stage: null
        })
      }else{
        if(this.data.stageInn==this.data.arr[e.detail.detail.dataset.id].value) return;
        this.setData({
          stageInn:this.data.arr[e.detail.detail.dataset.id].value, 
          show1: false,
          stage:this.data.arr[e.detail.detail.dataset.id].ind
        })
      }
      this.getBonueInfo();
      wx.setStorageSync('stageIndex',e.detail.detail.dataset.id)
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
  // 菜单按钮
  powerDrawer: function (e) {
    publicJs.powerDrawer(e,this)
  },
  // 关闭导航
  closeNav: function(e){
    publicJs.closeNav(e,this)
  },
  // 显示年月浮层
  showFloat: function(e){
    console.log(e)
    this.setData({show: true,})
  },
  // 详情页
  goDetail: function(){
    wx.navigateTo({url:'/search/pay_detail/pay_detail'})
  },

  
  // 显示点名浮窗
  showCallDetail1: function(e){
    this.setData({
      showCall1: true,
    })
    this.getCallDetail1()
  },
  showCallDetail2: function(e){
    this.setData({
      showCall2: true,
    })
    this.getCallDetail2()
  },
  showCallDetail3: function(e){
    this.setData({
      showCall3: true,
    })
    this.getCallDetail3()
  },
  showCallDetail4: function(e){
    var ids = e.currentTarget.id;
    this.setData({
      showCall4: true,
    })
  },
  // 关闭点名浮窗
  closeCallDetail: function(){
    this.setData({
      showCall1: false,
      showCall2: false,
      showCall3: false,
      showCall4: false,
      show5: false,
      callDetailArr: []
    })
  },

  // 获取请假和未签到记录
  getCallDetail1:function(){
    var that = this;
    var stamp = new Date().getTime();
    var nYear = this.data.schoolYear1;
    var nYear1 = this.data.schoolYear;
    var nSemester = this.data.nSemester;
    var nMonth = this.data.cur_month;
    var token = this.data.teacherToken;
    
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nsemester:nSemester,
      nclassyear:nYear,
      nyear:nYear1,
      nmonth:nMonth
    }
    var option = {
      api:'api/Teacher/GetAbsenceMonthly',
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
          that.setData({isAjaxOver:true})
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            var newArr = [];
            var newArr1 = [];
            var newArr2 = [];
            console.log(resData)
            for(var i = 0 ; i < resData.length; i++){
              var now = resData[i];
              if( now.sTeacherChanged == '请假'){
                newArr.push({
                  sClassCode:now.sClassCode,
                  sClassName:now.sClassName,
                  nLessonNo:now.nLessonNo,
                  StartDate:now.StartDate.replace('/','日'),
                  sAreaName: now.sAreaName,
                  sTeacherChanged: now.sTeacherChanged,
                  nLeiJiQingJia: now.nLeiJiQingJia,
                })
              }else if(now.sTeacherChanged == '未签到'){
                newArr1.push({
                  sClassCode:now.sClassCode,
                  sClassName:now.sClassName,
                  nLessonNo:now.nLessonNo,
                  StartDate:now.StartDate.replace('/','日'),
                  sAreaName: now.sAreaName,
                  sTeacherChanged: now.sTeacherChanged,
                  nLeiJiQueQin: now.nLeiJiQueQin,
                })
              }else if(now.sTeacherChanged == '代课'){
                newArr2.push({
                  sClassCode:now.sClassCode,
                  sClassName:now.sClassName,
                  nLessonNo:now.nLessonNo,
                  StartDate:now.StartDate.replace('/','日'),
                  sAreaName: now.sAreaName,
                  sTeacherChanged: now.sTeacherChanged,
                  nLeiJiQueQin: now.nLeiJiQueQin,
                })
              }
            }
            that.setData({
              callDetailArrQingjia: newArr,
              callDetailArrQueqin: newArr1,
              callDetailArrDaike: newArr2
            })
            
            // console.log(newArr)
            // console.log(newArr1)
            // console.log(newArr2)
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
  // 获取迟到记录
  getCallDetail2:function(){
    var that = this;
    var stamp = new Date().getTime();
    var nYear = this.data.schoolYear1;
    var nYear1 = this.data.schoolYear;
    var nSemester = this.data.nSemester;
    var nMonth = this.data.cur_month;
    var token = this.data.teacherToken;
    
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nsemester:nSemester,
      nclassyear:nYear,
      nyear:nYear1,
      nmonth:nMonth
    }
    var option = {
      api:'api/Teacher/GetLateMonthly',
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
          that.setData({isAjaxOver:true})
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            var newArr = [];
            console.log(resData)
            for(var i = 0 ; i < resData.length; i++){
              var now = resData[i];
              newArr.push({
                sClassCode:now.sClassCode,
                sClassName:now.sClassName,
                nLessonNo:now.nLessonNo,
                StartDate:now.StartDate.replace('/','日'),
                nLeiJiLate:now.nLeiJiLate,
                sAreaName: now.sAreaName,
                sTeacherStatus: now.sTeacherStatus,
                sTeacherChanged: now.sTeacherChanged
              })
            }
            that.setData({callDetailArr: newArr})
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
  // 获取未点名记录
  getCallDetail3:function(){
    var that = this;
    var stamp = new Date().getTime();
    var nYear = this.data.schoolYear1;
    var nYear1 = this.data.schoolYear;
    var nSemester = this.data.nSemester;
    var nMonth = this.data.cur_month;
    var token = this.data.teacherToken;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nsemester:nSemester,
      nclassyear:nYear,
      nmonth:nMonth,
      nyear:nYear1,
    }
    var option = {
      api:'api/Teacher/GetNoStudentSignInMonthly',
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
          that.setData({isAjaxOver:true})
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            var newArr = [];
            console.log(resData)
            for(var i = 0 ; i < resData.length; i++){
              var now = resData[i];
              newArr.push({
                sClassCode:now.sClassCode,
                sClassName:now.sClassName,
                nLessonNo:now.nLessonNo,
                StartDate:now.StartDate.replace('/','日'),
                sAreaName: now.sAreaName,
                nKouKuanIndex: now.nKouKuanIndex,
                dKouKuan: now.dKouKuan,
              })
            }
            that.setData({callDetailArr: newArr})
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
  //带班量:
  getCount: function(e){
    this.setData({count : e.detail.value})
  },
  //平均人数:
  getNum: function(e){
    this.setData({num : e.detail.value})
  },
  // 课酬模拟计算
  getKechou: function(){
    var that = this;
    this.setData({
      timestamp1: new Date().getFullYear()+'/'+(new Date().getMonth()+1)+'/'+new Date().getDate()+' '+new Date().getHours()+':'+(new Date().getMinutes()+1)+':'+new Date().getSeconds()
    })
    var stamp = new Date().getTime();
    var nYear = this.data.schoolYear1;
    var nYear1 = this.data.schoolYear;
    var nSemester = this.data.nSemester;
    var nMonth = this.data.cur_month;
    var token = this.data.teacherToken;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nsemester:nSemester,
      nclassyear:nYear,
      nyear:nYear1,
      nmonth:nMonth,
      dclasscount:this.data.count,
      davgcount:this.data.num,
    }
    
    var option = {
      api:'api/Teacher/GetSalarySimulation',
      query: query,
      type: 'get',
    }
    var reg = /^[0-9]{1,}$/;
    // 验证值
    if((!this.data.count.length || !this.data.num.length) || (reg.test(this.data.count) == false|| reg.test(this.data.num) == false)){
      publicJs.resultTip('请确定您输入的值为整数')

      return;
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
            if(resData.length){
              that.setData({hPay:resData[0].dBaseSalarySimulation ,tPay:resData[0].dTotalSalarySimulation})
            }else{
              publicJs.resultTip('本期没有课程,无法模拟计算')

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
   // 绩效模拟计算
  getJiXiao: function(){
    var that = this;
    this.setData({
      timestamp1: new Date().getFullYear()+'/'+(new Date().getMonth()+1)+'/'+new Date().getDate()+' '+new Date().getHours()+':'+(new Date().getMinutes()+1)+':'+new Date().getSeconds()
    })
    var stamp = new Date().getTime();
    var nYear = this.data.schoolYear;
    var nSemester = this.data.nSemester1;
    var nMonth = this.data.cur_month;
    var token = this.data.teacherToken;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nsemester:nSemester,
      nclassyear:nYear,
      dstudentcount:this.data.count,
      sbl:this.data.num,
    }
    var option = {
      api:'api/Teacher/GetBonusSimulation',
      query: query,
      type: 'get',
    }
    var reg = /^[0-9]{1,}$/;
    // 验证值
    if((!this.data.count.length || !this.data.num.length) || (reg.test(this.data.count) == false|| reg.test(this.data.num) == false)){
      publicJs.resultTip('请确定您输入的值为整数数字')
      return;
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
            console.log(resData) 
            if(resData.length){
              that.setData({tPay1:resData[0].dTotalBonusSimulation})
            }else{
              publicJs.resultTip('本期没有课程,无法模拟计算')
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
  // 获取基础课酬的信息
  getBasePayInfo: function(){

    var that = this;
    var stamp = new Date().getTime();
    var nYear = this.data.schoolYear1;
    var nYear1 = this.data.schoolYear;
    var nSemester = this.data.nSemester;
    var nMonth = this.data.cur_month;
    var token = this.data.teacherToken;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nsemester:nSemester,
      nclassyear:nYear,
      nyear:nYear1,
      nmonth:nMonth
    }
    var option = {
      api:'api/Teacher/GetSalary',
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
            var newInfos = [];
            var resData = res.data.AppendData;
            console.log(resData)
            if(!resData.length){
              publicJs.resultTip('没有查到数据，请检查月份日期是否与学年学期相匹配',function(){
                return;
              })
              newInfos.push({
                nQingJia: '--', //请假
                nQueQin: '--', //未签到次数
                nAbsence: '--', //请假+未签到次数
                nKeQianLate: '--',//课前迟到次数
                nKeHouLate: '--',//课后迟到次数
                nNoStudentSignIn: '--',//未点名次数
                dTotalCount: '--',//班级总人数
                dAvgCount: '--',//平均人数(含修正)
                dSalary: '--',//小时课酬
                dHour: '--',//本月应上课时
                dTotalHour: '--',//本月总课时
                dTotalSalary: '--',//课酬总计
                sTotalHour: '--',//本月总课时计算公式
                dXueQiTotalSalary:'--',//本学期总课时费
              })
            }else{
              for(var i = 0 ; i < resData.length; i++){
                var now = resData[i];
                newInfos.push({
                    nQingJia: now.nQingJia == null ? '--':now.nQingJia, //请假+未签到次数
                    nQueQin: now.nQueQin == null ? '--':now.nQueQin, //请假+未签到次数
                    nAbsence: now.nAbsence == null ? '--':now.nAbsence, //请假+未签到次数
                    nKeQianLate: now.nKeQianLate== null ? '--':now.nKeQianLate,//课前迟到次数
                    nKeHouLate: now.nKeHouLate== null ? '--':now.nKeHouLate,//课后迟到次数
                    nNoStudentSignIn: now.nNoStudentSignIn==null? '--' :now.nNoStudentSignIn,//未点名次数
                    dTotalCount: now.dTotalCount == null ? '--':now.dTotalCount,//班级总人数
                    dAvgCount: now.dAvgCount == null ? '--':now.dAvgCount ,//平均人数(含修正)
                    dSalary: now.dSalary == null ? '--':now.dSalary,//小时课酬
                    dHour: now.dHour == null ? '--':now.dHour,//本月应上课时
                    dTotalHour: now.dTotalHour == null ? '--':now.dTotalHour,//本月总课时
                    dTotalSalary: now.dTotalSalary == null ? '--':now.dTotalSalary,//课酬总计
                    sTotalHour: now.sTotalHour == null ? '--':now.sTotalHour,//本月总课时计算公式
                    dXueQiTotalSalary: now.dXueQiTotalSalary == null ? '--':now.dXueQiTotalSalary,//本学期总课时费
                    monthHours: now.dMonthlyHour
                })
              }
            }
            that.setData({basePayInfos: newInfos,nQueQin:newInfos[0].nQueQin,nQingJia:newInfos[0].nQingJia})
            console.log(newInfos)
          }else if(res.data.ResultType == 7){
            
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          }
          setTimeout(()=>{
            wx.hideLoading()
            that.setData({canTip: true})
          },500)
        }
      }
     }) 
    
  },
  // 获取绩效基本信息
  getBonueInfo:function(){
    console.log(123)
    var that = this;
    var stamp = new Date().getTime();
    var nYear = this.data.schoolYear;
    var nSemester = this.data.nSemester1;
    var token = this.data.teacherToken;
    var nClassQiShu = this.data.stage;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nsemester:nSemester,
      nclassyear:nYear,
      nclassqishu: nClassQiShu
    }
    var option = {
      api:'api/Teacher/GetBonus',
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
            console.log(resData)
            if(resData.length){
              var newArr = [];
              if(!resData.length){
                that.setData({
                  stageShow: true
                })
              }else{
                that.setData({
                  stageShow: false
                })
                var total = 0;
                for(var i = 0 ; i < resData.length; i++){
                  var now = resData[i];
                  newArr.push({
                    sNewArea: now.sNewArea, //校区
                    s1Yuan: now.s1Yuan == '非一元班'? '非0元班':now.s1Yuan, //1元班
                    qishu: now.nClassQiShu,
                    dTotalCount: now.dTotalCount,  //总人数
                    dTotalSBCount: now.dTotalSBCount, //升班人数
                    dTotalSBL: now.dTotalSBL, //升班率
                    sBonus: now.sBonus, //档位奖金
                    sTotalBonus: now.sTotalBonus, //总绩效奖金
                    dNextMinSBL: now.dNextMinSBL == null? '--':now.dNextMinSBL, //下一档续报率目标
                    dNextLevelNeedSbCount: now.dNextLevelNeedSbCount == null ? '--':now.dNextLevelNeedSbCount, //下一档还需续报人数
                    dNextBonus: now.dNextBonus == null ? '--':now.dNextBonus, //下一档位奖金
                  })
                  total += Number(now.sTotalBonus);
                }
                that.setData({bonusDetailArr: newArr,total: total})
                wx.setStorageSync('qishu',nClassQiShu)
              }
            }else{
              that.setData({bonusDetailArr: [],total: 0})
            }
          }else if(res.data.ResultType == 7){
            if(nYear == 2017){
              publicJs.resultTip('2017暑假以前无绩效数据！')

              var newArr = [];
              newArr.push({
                  qishu: '--',
                  dTotalCount: '--',  //总人数
                  dTotalSBCount: '--', //升班人数
                  dTotalSBL: '--', //升班率
                  sBonus: '--', //档位奖金
                  sTotalBonus: '--', //总绩效奖金
                  dNextMinSBL: '--', //下一档续报率目标
                  dNextLevelNeedSbCount: '--', //下一档还需续报人数
                  dNextBonus: '--', //下一档位奖金
                })
              
              that.setData({bonusDetailArr: newArr})
            }else{
              publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            

            }
          }
          setTimeout(()=>{
            wx.hideLoading()
          },500)
        }
      }
     })
   
  },


  
  
  // 改变月的背景色并关闭浮层
  changeBgColor: function(e){
    // 恢复初始样式
    // for(var i = 0 ; i < this.data.days.length; i++){
    //   this.data.days[i].classInfo = []
    // }
    // this.setData({days:this.data.days,cur_day:1,isFirst:1})
    var cur = e.target.dataset.cur
    this.setData({
      show:false,
      cur_year:this.data.cur_year,
      cur_month: cur,
      change_year:this.data.cur_year,
      change_month: cur,
      nowYear:new Date().getFullYear(),
      nowMonth:new Date().getMonth()+1,
      cur_month:cur,
      cur_day:1
    })
    this.setData({
      date:this.data.cur_year+'-'+(this.data.cur_month)+'-'+this.data.cur_day
    })
    wx.setStorageSync('month',this.data.cur_month)
    this.calculateEmptyGrids(this.data.cur_year, cur);
    this.calculateDays(this.data.cur_year, cur);
  },
  // 改变年的背景色
  changeBgColor1: function(e){
    var cur = e.target.dataset.cur
    this.setData({
      cur_year:cur,
      change_year: cur,
      schoolYear: cur
    })
    // this.setData({
    //   date:this.data.cur_year+'-'+this.data.cur_month+'-'+1
    // })
  },
 

  // 处理获取的天的展示
  //获取指定年的月份有多少天
  getThisMonthDays:function(year, month) {
    return new Date(year, month, 0).getDate(); 
  },
  ////获取当前月中第一天是星期几
  getFirstDayOfWeek:function(year, month) {
    return new Date(Date.UTC(year, month-1, 0)).getDay(); 
  },
  // 获取当月第一天之前的数组
  calculateEmptyGrids:function(year, month) {
    const firstDayOfWeek = this.getFirstDayOfWeek(year, month); 
    let empytGrids = [];
    if (firstDayOfWeek > 0) {
      for (var i = 0; i < firstDayOfWeek; i++) {
        empytGrids.push(i);
      }
      this.setData({
        hasEmptyGrid: true,
        empytGrids
      });
    } else {
      this.setData({
        hasEmptyGrid: false,
        empytGrids: []
      });
    }
  },
  // 获取指定月的天数的数组
  calculateDays:function(year, month) {
    var that = this;
    var days = [];
    var cur_day = new Date().getDate();
    var thisMonthDays = this.getThisMonthDays(year, month); 
    that.getBasePayInfo()
  },
  //点击两侧箭头的事件
  handleCalendar:function(e) {  
    // for(var i = 0 ; i < this.data.days.length; i++){
    //   this.data.days[i].classInfo = []
    //   this.data.days[i].choosed = false
    // }
    // this.setData({days:this.data.days,cur_day:1,isFirst:1})
    var handle = e.currentTarget.dataset.handle;
    // 弹框上的值
    var cur_year = this.data.cur_year;
    var cur_month = this.data.cur_month;
    // 日历上的值
    var change_year = this.data.change_year;
    var change_month = this.data.change_month;
    // 当前时间
    var nowYear = new Date().getFullYear();
    var nowMonth = new Date().getMonth()+1;
    var nowDay = new Date().getDate();

    // 之前的日期
    if (handle === 'prev') {
      change_month = change_month - 1;
      cur_month = cur_month - 1;
      
      if (change_month < 1){
        cur_year = cur_year - 1;
        cur_month = 12;
        change_year = change_year - 1;
        change_month = 12;
      }
      if(change_year < nowYear -1){
        cur_year = nowYear;
        cur_month = nowMonth;
      }else if(change_year >= nowYear+1){
        cur_year = change_year
      }

    } else {
      // var newYear = change_year;
      change_month = change_month + 1;
      cur_month = cur_month + 1;
      
      if (change_month > 12){
        cur_year = cur_year + 1;
        cur_month = 1;
        change_year = change_year + 1;
        change_month = 1;
      }
      if(change_year > nowYear +1){
        cur_year = nowYear;
        cur_month = nowMonth;
      }else if(change_year <= nowYear-1){
        cur_year = change_year
      }
    }
      this.setData({
        date:change_year+'-'+change_month+'-'+1,
        cur_year: cur_year,
        cur_month: cur_month,
        change_year: change_year,
        change_month: change_month,
        cur_day: 1,
        schoolYear: change_year,
      })
      console.log(this.data.schoolYear)
      this.getBasePayInfo();
      // wx.setStorageSync('month',this.data.cur_month)
      // this.calculateEmptyGrids(change_year, change_month);
      // this.calculateDays(change_year, change_month);
  },
  // 选择每天的日期改变状态
  tapDayItem:function(e) {
    var idx = e.currentTarget.dataset.idx;
    var days = this.data.days;
    for(var i = 0 ; i < days.length; i++){
      days[i].choosed = false;
    }
    days[ idx ].choosed = !days[ idx ].choosed;
    this.setData({
      days,
      cur_day: days[idx].day,
    });
    this.setData({classContent:days[idx].classInfo})
  },
})
