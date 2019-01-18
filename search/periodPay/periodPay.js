
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;

Page({
  data: {
    teacherName: '', //教师名称
    teacherToken:'', //教师token
    windowHeight:0,
    selectYear:new Date().getFullYear(),
    selectMonth:new Date().getMonth()+1,
    nowYear:new Date().getFullYear(),
    nowMonth:new Date().getMonth()+1,
    isDisMonth: true,
    titleActiveIndex:0,
    activeIndex: 0,
    showArrow: true,
    showDes: false,
    hideDes: false,
    showSimulation: false,
    hideSimulation: false,
    leftId:0,



    //绩效相关值
    yearTypeInn: '2018年暑假',
    stageInn: '0期',
    stage: 1,
    nSemester:2,
    nSemester1:3,
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
    bonusDetailArr:[],
    count: null,
    num: null,
    isAjaxOver: true,
    showPage:false,

    newKeChouOver:true, //是否显示新课酬
    newPayData:{}, //新课酬数据
  },
  onReady: function(){
    // this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
    // this.tab = this.selectComponent("#tab");
  },
  onLoad: function(){
    this.oldLeftId = 0;
    this.oldRightId = 0;
    var that = this;
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      noAuditing: wx.getStorageSync('noAuditing'),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')
    })
    // 获取手机宽高
    publicJs.getSystem(that,function(){
      that.setData({heigh: that.data.windowHeight - 55})
    });
    wx.setStorageSync('yearTypeIndex',1) // 默认暑假
    wx.setStorageSync('stageIndex',0)
    this.setData({
      semester: this.data.semesterArr[0].value, // 默认显示暑假
      nSemester:this.data.semesterArr[0].id,  //默认请求暑假的数据
      schoolYear: 2018, // 选择的年份
      schoolYear1: 2018, // 对应学期的年份
      nSemester1: this.data.semesterArr[0].id,
      stageInn: this.data.stageTypeArr[4].value,
      stage: null
    })
    var nowTime = new Date().getTime();
    var nextTime = new Date('2018/08/01 00:00:00').getTime()
    if( nowTime < nextTime){
      this.setData({showPage:false})
      this.getBasePayInfo()
    }else{
      this.setData({showPage:true})
      this.newKechou()
    }
     this.getBonueInfo();
    
  },
  onShow:function(e){
    // 获取绩效页面是否改变下拉框的值
    let flagAtPayList = wx.getStorageSync('flagAtPayList');
    console.log(flagAtPayList)
    if(flagAtPayList){
      // 存储绩效页面下拉框的值
      this.setData({
        stageIndex: wx.getStorageSync('stageIndex'),
        // semesterIndex: wx.getStorageSync('semesterIndex'),
        yearTypeIndex: wx.getStorageSync('yearTypeIndex'),
        stageInn: wx.getStorageSync('stageInn'),
      })

      console.log(this.data.stageInn, this.data.stageIndex)
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
    }
    
  },
  prevMonth(){
    if(this.data.newKeChouOver==false) return;
    this.setData({isDisMonth: false})
    this.data.selectMonth--;
    if(this.data.selectMonth == 0){
      this.data.selectYear--
      this.setData({selectMonth: 12,selectYear:this.data.selectYear})
      // return;
    }
    
    // 2018.9以前跳显示老页面
      this.setData({selectMonth: this.data.selectMonth})
      // console.log()
    if(this.data.selectMonth < 9 && this.data.selectYear <=2018){
      this.setData({showPage: false})
      this.getBasePayInfo()
    }else{
      this.setData({showPage: true})
      this.newKechou()
    }
    this.setData({activeIndex: false})
  },
  nextMonth(){
    if(this.data.selectMonth == this.data.nowMonth && this.data.selectYear == this.data.nowYear) return;
    // 只能查询本年本月之前的
    if(this.data.newKeChouOver==false) return;
    this.data.selectMonth++;

    this.setData({selectMonth:this.data.selectMonth})

    if(this.data.selectMonth == 13){
      this.data.selectYear++;
      this.setData({selectMonth: 1,selectYear:this.data.selectYear})
      // 2018.9获取老的
      if(this.data.selectYear<=2018 ){
        this.setData({showPage: false})
        this.getBasePayInfo()
      }else{
        this.newKechou()
        if((this.data.selectYear ==2018&&this.data.selectMonth>=8) || (this.data.selectYear >2018&&this.data.selectMonth>0) ){
          this.setData({showPage: true})
          // 获取新接口
          this.newKechou()
          this.setData({activeIndex:0})
          console.log(this.data.selectMonth == this.data.nowMonth, this.data.selectYear == this.data.nowYear)
          if(this.data.selectMonth == this.data.nowMonth && this.data.selectYear == this.data.nowYear){
            this.setData({isDisMonth: true})
          }
        }else{
          this.getBasePayInfo()
          this.setData({isDisMonth: false})
        }

        this.setData({activeIndex:0,showPage: true})
      }

    }else{
      if((this.data.selectYear ==2018&&this.data.selectMonth>=8) || (this.data.selectYear >2018&&this.data.selectMonth>0) ){
        this.setData({showPage: true})
        // 获取新接口
        this.newKechou()
        this.setData({activeIndex:0})
        console.log(this.data.selectMonth == this.data.nowMonth, this.data.selectYear == this.data.nowYear)
        if(this.data.selectMonth == this.data.nowMonth && this.data.selectYear == this.data.nowYear){
          this.setData({isDisMonth: true})
        }
      }else{
        this.getBasePayInfo()
        this.setData({isDisMonth: false})
      }
    }

   /* if(this.data.selectYear < this.data.nowYear){
      this.setData({isDisMonth: false})
      if(this.data.selectMonth == 12){
        this.setData({showPage: false})
        this.data.selectYear++;
        this.setData({selectMonth: 1,selectYear:this.data.selectYear})
        if(this.data.selectYear<2018){
          this.getBasePayInfo()
        }else{
          // 获取新接口
          this.newKechou()
          this.setData({activeIndex:0,showPage: true})
        }
        
      }else{

        this.data.selectMonth++;
        this.setData({selectMonth: this.data.selectMonth})
        // 2018.9以后显示新页面
        if((this.data.selectYear ==2018&&this.data.selectMonth>=8) || (this.data.selectYear >2018&&this.data.selectMonth>0) ){

          console.log('aaaaa',this.data.selectYear,this.data.selectMonth)
          this.setData({showPage: true})
          // 获取新接口
          this.newKechou()
          this.setData({activeIndex:0})
          console.log(this.data.selectMonth == this.data.nowMonth, this.data.selectYear == this.data.nowYear)
          if(this.data.selectMonth == this.data.nowMonth && this.data.selectYear == this.data.nowYear){
            this.setData({isDisMonth: true})
          }
        }else{
          this.getBasePayInfo()
        }
      }
      
    }else{
      if(this.data.selectMonth < this.data.nowMonth){
        this.data.selectMonth++;
         if(this.data.selectYear >=2018&&this.data.selectMonth>=8 ){
          this.setData({showPage: true})
          // 获取新接口
          this.newKechou()
          this.setData({activeIndex:0})
        }else{
          this.getBasePayInfo()
        }
        this.setData({selectMonth: this.data.selectMonth})
         
        if(this.data.selectMonth == this.data.nowMonth){
          this.setData({isDisMonth: true})
        }
      }else{
        this.setData({isDisMonth: true})
      }
    }*/
    // this.getBasePayInfo()
  },
  // 点击
  typeClick(e){
    var idIndex = e.target.dataset.idindex;
    this.setData({titleActiveIndex: idIndex})
  },
  // 改变
  typeSwiperChange(e){
    this.setData({titleActiveIndex: e.detail.current}) ;
  },
  
  // 点击
  tabClick(e){
    var idIndex = e.target.dataset.idindex;
    this.setData({activeIndex: idIndex})
    // if(idIndex == 0){
    //   this.setData({showArrow: true})
    // }else{
    //   this.setData({showArrow: false})
    // }
  },
  // 改变
  swiperChange(e){
    console.log(this.data.newPayData)
    // 记录之前选中的项
    this.setData({activeIndex: e.detail.current,count: '', num: '',});
    if( e.detail.current == 0){ // 滑动到第一个 . 对应学期取返回值第0项的学期
      this.oldRightId = this.data.leftId;
      this.setData({showArrow: true,leftId:this.oldLeftId,selectSemester:this.data.newPayData.list[0].nSemester})
    }else{
      this.oldLeftId = this.data.leftId;
      this.setData({showArrow: false,leftId:this.oldRightId,selectSemester:this.data.newPayData.list[1].nSemester})
    }
  },
  // 查看说明
  lookSimulation(e){
    this.setData({showSimulation: true,hideSimulation:false,simulationTarget:e.currentTarget.dataset.type})
  },
  // 关闭说明
  closeSimulation(){
    this.setData({showSimulation: false,hideSimulation:true,num:'',count:''})
  },
  // 查看说明
  lookDes(e){
    this.setData({showDes: true,hideDes:false,infoTarget:e.target.dataset.info})
  },
  // 关闭说明
  closeDes(){
    this.setData({showDes: false,hideDes:true})
  },
  // tab
  showContentDesLeft(e){
    this.setData({leftId: e.currentTarget.id})
  },
  // tab
  showContentDesRight(e){
    this.setData({leftId: e.currentTarget.id})
  },
  // 跳转列表页
  goListPage(e){
    let father = e.currentTarget.dataset.type;
    console.log(father)
    var year = publicJs.flagYear();
    wx.navigateTo({url:'/search/periodPayList/periodPayList?father='+father+'&nclassyear='+ year +'&nsemester='+this.data.selectSemester+'&nyear='+this.data.selectYear+'&nmonth='+this.data.selectMonth})
  },
  closePopup: function(e){
    this.selectPopup.closePopup()
  },
  // 详情页
  goDetail: function(){
    wx.navigateTo({url:'/search/pay_detail/pay_detail'})
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
    console.log(e)
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
  getIndex:function(e){
    var inpStr = this.data.inpStr;
    this.setData({show: false})
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
    var nYear1 = this.data.selectYear;
    var nSemester = this.data.selectSemester;
    var nMonth = this.data.selectMonth;
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
    // var nMonth = this.data.cur_month;
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
    var nMonth = this.data.selectMonth;
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
          },500)
        }
      }
     }) 
  },
  // 获取绩效基本信息
  getBonueInfo:function(){
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
  // 显示点名浮窗
  showCallDetail1: function(e){
    this.setData({
      showCall1: true,
      callDetailArrQingjia: [],
      callDetailArrQueqin: [],
      callDetailArrDaike: []
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
  // 获取请假和未签到记录
  getCallDetail1:function(){
    // if(this.data.isAjaxOver == false) return;
    // this.setData({isAjaxOver:false})
    var that = this;
    var stamp = new Date().getTime();
    var nYear = this.data.schoolYear1;
    var nYear1 = this.data.schoolYear;
    var nSemester = this.data.nSemester;
    var nMonth = this.data.selectMonth;
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
            wx.hideLoading();
            that.setData({isAjaxOver:true})
          },500)
        }
      }
     })
  },
  // 获取迟到记录
  getCallDetail2:function(){
    var that = this;
    // if(this.data.isAjaxOver == false) return;
    // that.setData({isAjaxOver:false})
    var stamp = new Date().getTime();
    var nYear = this.data.schoolYear1;
    var nYear1 = this.data.schoolYear;
    var nSemester = this.data.nSemester;
    var nMonth = this.data.selectMonth;
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
    // if(this.data.isAjaxOver == false) return;
    // that.setData({isAjaxOver:false})
    var stamp = new Date().getTime();
    var nYear = this.data.schoolYear1;
    var nYear1 = this.data.schoolYear;
    var nSemester = this.data.nSemester;
    var nMonth = this.data.selectMonth;
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


  // 新课酬接口  --- 获取课酬
  newKechou:function(){
    console.log(this.data.newKeChouOver)
    if(this.data.newKeChouOver == false) return;
    this.setData({newKeChouOver:false})
    this.setData({newPayData:[]})
    var that = this;
    var stamp = new Date().getTime();
    var nYear = this.data.selectYear;
    var nMonth = this.data.selectMonth;
    var token = this.data.teacherToken;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nmonth:nMonth,
      nyear:nYear,
    }
    var option = {
      api:'api/TeacherSalary/GetMonthSalary',
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
          that.setData({newKeChouOver:true})
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            for(var i = 0 ; i < resData.list.length; i++){
              var list = resData.list[i];
              list.dSalaryHour = list.dSalaryHour == null ? 0 : list.dSalaryHour;
              list.dSalary = list.dSalary == null ? 0 : list.dSalary;
              list.dDeduction = list.dDeduction == null ? 0 : Math.abs(list.dDeduction);
              list.dNowPlanHour = list.dNowPlanHour == null ? 0 : list.dNowPlanHour;
              list.dMonthPlanHour = list.dMonthPlanHour == null ? 0 : list.dMonthPlanHour;
              list.dLeaveHour = list.dLeaveHour == null ? 0 : list.dLeaveHour;
              list.dNoSignHour = list.dNoSignHour == null ? 0 : list.dNoSignHour;
              list.dNowHour = list.dNowHour == null ? 0 : list.dNowHour;
              list.dReplaceHour = list.dReplaceHour == null ? 0 : list.dReplaceHour;
              list.dSalaryHour = list.dSalaryHour == null ? 0 : list.dSalaryHour;
              list.dTotalCount = list.dTotalCount == null ? 0 : list.dTotalCount;
              list.dAvgCount = list.dAvgCount == null ? 0 : list.dAvgCount;
              list.nNoStudentSignInCount = list.nNoStudentSignInCount == null ? 0 : list.nNoStudentSignInCount;
              list.dNoStudentSignInDeduction = list.dNoStudentSignInDeduction == null ? 0 : Math.abs(list.dNoStudentSignInDeduction);
              list.nBeforeLateCount = list.nBeforeLateCount == null ? 0 : list.nBeforeLateCount;
              list.dBeforeLateDeduction = list.dBeforeLateDeduction == null ? 0 : Math.abs(list.dBeforeLateDeduction);
              list.nAfterLateCount = list.nAfterLateCount == null ? 0 : list.nAfterLateCount;
              list.dAfterLateDeduction = list.dAfterLateDeduction == null ? 0 : Math.abs(list.dAfterLateDeduction);
              list.nLeaveCount = list.nLeaveCount == null ? 0 : list.nLeaveCount;
              list.dLeaveDeduction = list.dLeaveDeduction == null ? 0 : Math.abs(list.dLeaveDeduction);
              list.nNoSignCount = list.nNoSignCount == null ? 0 : list.nNoSignCount;
              list.dNoSignDeduction = list.dNoSignDeduction == null ? 0 : Math.abs(list.dNoSignDeduction);
            }
            console.log(resData)
            that.setData({newPayData:resData,selectSemester:resData.list[0].nSemester})
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
