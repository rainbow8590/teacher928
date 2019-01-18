var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
var sortClassAsQi = require('../../utils/sortClassAsQi.js');

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
    teacherName:'',
    showModalStatus: false, //控制导航显示
    isopen:'open',  //控制菜单显示
    teacherName: '', //教师名称
    teacherToken:'', //教师token
    showArrow:true, //显示当前tab的箭头
    yearTypeArr: [
      {id: 0, item:2018, value: '2018年春季'},
      {id: 1, item:2018, value: '2018年暑假'},
    ],
    stageTypeArr: [
      {id: 0,ind:0, value: '0期'},
      {id: 1,ind:1, value: '1期'},
      {id: 2,ind:2, value: '2期'},
      {id: 3,ind:3, value: '3期'},
      {id: 4,ind:null, value: '正式合计'},
    ],
    yearTypeInn: '',
    stageInn: '',
    showSB: true,
    flagBubble: true,
    // currentItem: -1,
    classesInfo:[1],
    isAjaxOver: false
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(option){
    var that = this;
    wx.setStorageSync('flagAtPayList',false)
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      stageIndex: wx.getStorageSync('stageIndex'),
      semesterIndex: wx.getStorageSync('semesterIndex'),
      yearTypeIndex: wx.getStorageSync('yearTypeIndex'),
      month: wx.getStorageSync('month'),
      qishu: wx.getStorageSync('qishu'),
      noAuditing: wx.getStorageSync('noAuditing'),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity'),
      target: option.target ? option.target : null
    })
    var that = this;
    if(this.data.target){
      this.setData({schoolYear: new Date().getFullYear(),nSemester1:publicJs.flagSemester()})
      publicJs.getSystem(that,function(){
        that.setData({heigh: that.data.windowHeight - 55-50})
      });
    }else{
      console.log(this.data.yearTypeIndex , 11111111)
      if(this.data.yearTypeIndex == 0){ //春季
        this.setData({
          stageTypeArr: [
            {id: 4,ind:null, value: '正式合计'},
          ]
        })
        this.setData({
          stageInn: this.data.stageTypeArr[0].value
        })
      }else{
        this.setData({
          // stageTypeArr: [{id: 4,ind:null, value: '正式合计'}]
          stageTypeArr: [
            {id: 0,ind:0, value: '0期'},
            {id: 1,ind:1, value: '1期'},
            {id: 2,ind:2, value: '2期'},
            {id: 3,ind:3, value: '3期'},
            {id: 4,ind:null, value: '正式合计'},
          ]
          })
        this.setData({
          stageInn: this.data.stageTypeArr[this.data.stageIndex].value
        })
      }
      wx.setStorageSync('stageInn',this.data.stageInn)
      this.setData({
        yearTypeInn: this.data.yearTypeArr[this.data.yearTypeIndex].value,
        schoolYear: this.data.yearTypeArr[this.data.yearTypeIndex].item,
        nSemester1:this.data.semesterIndex,
      })
      publicJs.getSystem(that,function(){
        that.setData({heigh: that.data.windowHeight - 55- 42-70})
      });
    }
    this.getClassInfos();
  },

  getYearType: function (e) {
    this.setData({arr: this.data.yearTypeArr,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  getStage: function (e) {
    this.setData({arr: this.data.stageTypeArr,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  // 关闭弹窗
  closePopup: function(e){
    // this.setData({show1:false})
    this.selectPopup.closePopup()
  },
  // 获取点击的弹窗的id和value值
  getIndex:function(e){
    var inpStr = this.data.inpStr;
    this.setData({show1:false})
    if(inpStr == 'yearType'){
      if(this.data.yearTypeInn == this.data.arr[e.detail.detail.dataset.id].value) return;
      // 改变下拉框的值, 以便返回的时候, 父级页面获取新的数据
      wx.setStorageSync('flagAtPayList',true)
      this.setData({
        yearTypeInn:this.data.arr[e.detail.detail.dataset.id].value, 
      })
      if(e.detail.detail.dataset.id == 1){ // 暑假
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
          qishu: this.data.stageTypeArr[4].ind
        })
        // 存储绩效页面下拉框的值
        wx.setStorageSync('yearTypeIndex',1)
        wx.setStorageSync('stageIndex',4)
      }else{
        this.setData({
          stageTypeArr: [{id: 4,ind:null, value: '正式合计'}],
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
        this.setData({
          stageInn:this.data.stageTypeArr[0].value, 
          stage: this.data.stageTypeArr[0].ind,
          qishu: this.data.stageTypeArr[0].ind
        })
      }
      this.getClassInfos();
    }else if(inpStr == 'stage'){
      if(this.data.yearTypeInn == '2018年春季'){
        if(this.data.stageInn==this.data.arr[0].value) return;
        wx.setStorageSync('flagAtPayList',true)
        this.setData({
          stageInn:this.data.arr[0].value, 
          stage: null,
        })
        wx.setStorageSync('yearTypeIndex',0)
      }else{
        if(this.data.stageInn==this.data.arr[e.detail.detail.dataset.id].value) return;
        wx.setStorageSync('flagAtPayList',true)

        this.setData({
          stageInn:this.data.arr[e.detail.detail.dataset.id].value, 
          stage: e.detail.detail.dataset.ind,
          qishu: e.detail.detail.dataset.ind
        })
        wx.setStorageSync('yearTypeIndex',1)
      }
      
      this.getClassInfos();
      wx.setStorageSync('stageIndex',e.detail.detail.dataset.id)
      wx.setStorageSync('stageInn',this.data.stageInn)
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
  // 点击改变tabBar颜色
  // changeColor: function(e){
  //   publicJs.changeColor(e,this)
  // },
  //显示未升班名单
  showSb: function(e){
    var that = this;
    var ids = e.currentTarget.dataset.id ;
    for(var i = 0; i < this.data.classesInfo.length; i++){
      if(i == ids){
        this.data.classesInfo[ids].showSB = false
        this.setData({
          classesInfo: this.data.classesInfo,
          sClassCode: this.data.classesInfo[ids].sClassCode,
          ids: ids
        })
      }
    }
    this.getSbStudents();
  },
  //显示未升班名单
  hideSb: function(e){
    var that = this;
    var ids = e.currentTarget.dataset.id ;
    console.log(ids)
    for(var i = 0; i < this.data.classesInfo.length; i++){
      if(i == ids){
        this.data.classesInfo[ids].showSB = true
        this.setData({
          classesInfo: this.data.classesInfo
        })
      }
    }
  },
  // 获取班级详情
  getClassInfos: function(){
    var that = this;
    var stamp = new Date().getTime();
    var nYear = this.data.schoolYear;
    var nSemester = this.data.nSemester1;
    var qishu = this.data.qishu;
    var token = this.data.teacherToken;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nsemester:nSemester,
      nclassyear:nYear,
      nclassqishu:qishu
    }
    var option = {
      api:'api/Teacher/GetTeacherPromotionClass',
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
            if(resData.length){
              for(var i = 0 ; i < resData.length; i++){
                var now = resData[i];
                newInfos.push({
                  id: i,
                  sClassCode: now.sClassCode,
                  sClassQiShu: now.sClassQiShu,
                  sTime: now.sTime,
                  sClassName: now.sClassName,
                  sClassQiShu: now.sClassQiShu,
                  nCurrentCount: now.nCurrentCount,
                  nSbNum: now.nSbNum,
                  lbl: (now.lbl*100).toFixed(2)+'%',
                  showSB: true,
                })
              }
              console.log(newInfos)
              if(newInfos[0].sClassQiShu.indexOf('期') != -1){
                var newInfos1 = that.sortClassAsQi(newInfos)
              }else{
                var newInfos1 = that.sortClassAsWeek(newInfos)
              }
              that.setData({classesInfo: newInfos1})
            }else{
              that.setData({classesInfo: []})
            }
          }else if(res.data.ResultType == 7){
            publicJs.resultTip('2017年暑假以前无绩效数据',function(){
              wx.reLaunch({ url: '/search/pay/pay'})
            })
          }
          setTimeout(()=>{
            wx.hideLoading()
          },500)
        }
        
      }
     })
    
  },
  // 获取未升班人员
  getSbStudents: function(){
    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken;
    var sClassCode = this.data.sClassCode;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      sclasscode:sClassCode
    }
    var option = {
      api:'api/Teacher/GetClassNotSBStudent',
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
            var newInfos = [];
            var resData = res.data.AppendData;
            console.log(resData)
            for(var i = 0 ; i < resData.length; i++){
              var now = resData[i];
              newInfos.push({
                sQiTaXueKe : now.sQiTaXueKe == null? '未续报课程':now.sQiTaXueKe,
                sStudentCode: now.sStudentCode,
                sStudentName: now.sStudentName,
                sNewStudent: now.sNewStudent,
                currentItem: -1,
              })
            }
           //将获取的数据拼接到对应的班级数据中
            that.data.classesInfo[that.data.ids].sbNames = newInfos;
           that.setData({classesInfo: that.data.classesInfo})
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
  // 点击名称显示升班详情
  showDetail: function(e){
    var that = this;
    var flagBubble = this.data.flagBubble;
    var id = e.currentTarget.dataset.id;
    var ind = e.currentTarget.dataset.ind;
    if(flagBubble == true){
      this.data.classesInfo[id].sbNames[ind].currentItem = ind;
      that.setData({ flagBubble:false})
      that.setData({classesInfo: this.data.classesInfo})
      setTimeout(()=>{
        that.data.classesInfo[id].sbNames[ind].currentItem = ind+1000;
        that.setData({ 
          classesInfo: that.data.classesInfo,
          flagBubble: true
        })
      },2000)
    }
  },
  
  //按期排序
  sortClassAsQi:function(qiArr){
    for(var i = 0 ; i < qiArr.length; i++){
      var cur = qiArr[i];
      var timeStr = cur.sTime;
      var sClassQiShu = cur.sClassQiShu;
      var timeNum = Number(timeStr.substr(0,4).split(':').join(''))
      if(sClassQiShu.indexOf('零期') != -1){
          cur.totalTime = 1110000+timeNum
      }else if(sClassQiShu.indexOf('一期')!= -1){
          cur.totalTime = 2220000+timeNum
      }else if(sClassQiShu.indexOf('二期')!= -1){
          cur.totalTime = 3330000+timeNum
      }else if(sClassQiShu.indexOf('三期')!= -1){
          cur.totalTime = 4440000+timeNum
      }
    }

    // 先排日期 
    var newQiArr = this.quickSort(qiArr,'totalTime',false);
    console.log(newQiArr)
    // 排时间
    
    return newQiArr ;
  },
  quickSort:function(arr,name,snum){
    //如果数组<=1,则直接返回
    if(arr.length<=1){return arr;}
      var pivotIndex=Math.floor(arr.length/2);
      //找基准，并把基准从原数组删除
      var pivot=arr.splice(pivotIndex,1)[0];
      var middleNum=pivot[name];
      // 定义左右数组
      var left=[];
      var right=[];
      //比基准小的放在left，比基准大的放在right
      if(snum){
        for(var i=0;i<arr.length;i++){
          if(Number(arr[i][name])<=Number(middleNum) ){
            left.push(arr[i]);
          }else{
            right.push(arr[i]);
        }
      }
    }else{
      for(var i=0;i<arr.length;i++){
        if(arr[i][name]<=middleNum){
          left.push(arr[i]);
        }else{
          right.push(arr[i]);
        }
      }
    }
    //递归,返回所需数组
    return this.quickSort(left,name,snum).concat([pivot],this.quickSort(right,name,snum));
  },
  sortClassAsWeek: function(week){
    for(var i = 0 ; i < week.length; i++){
      var cur = week[i];
      var timeStr = cur.sTime;
      var sClassQiShu = cur.sClassQiShu
      var timeNum = Number(timeStr.substr(0,4).split(':').join(''))
      if(sClassQiShu.indexOf('周一上午') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 1110000 + timeNum;
      }else if(sClassQiShu.indexOf('周一下午') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 1120000 + timeNum;
      }else if(sClassQiShu.indexOf('周一夜晚') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 1130000 + timeNum;
      }else if(sClassQiShu.indexOf('周二上午') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 2210000 + timeNum;
      }else if(sClassQiShu.indexOf('周二下午') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 2220000 + timeNum;
      }else if(sClassQiShu.indexOf('周二夜晚') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 2230000 + timeNum;
      }else if(sClassQiShu.indexOf('周三上午') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 3310000 + timeNum;
      }else if(sClassQiShu.indexOf('周三下午') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 3320000 + timeNum;
      }else if(sClassQiShu.indexOf('周三夜晚') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 3330000 + timeNum;
      }else if(sClassQiShu.indexOf('周四上午') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 4410000 + timeNum;
      }else if(sClassQiShu.indexOf('周四下午') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 4420000 + timeNum;
      }else if(sClassQiShu.indexOf('周四夜晚') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 4430000 + timeNum;
      }else if(sClassQiShu.indexOf('周五上午') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 5510000 + timeNum;
      }else if(sClassQiShu.indexOf('周五下午') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 5520000 + timeNum;
      }else if(sClassQiShu.indexOf('周五夜晚') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 5530000 + timeNum;
      }else if(sClassQiShu.indexOf('周六上午') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 6610000 + timeNum;
      }else if(sClassQiShu.indexOf('周六下午') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 6620000 + timeNum;
      }else if(sClassQiShu.indexOf('周六夜晚') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 6630000 + timeNum;
      }else if(sClassQiShu.indexOf('周日上午') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 7710000 + timeNum;
      }else if(sClassQiShu.indexOf('周日下午') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 7720000 + timeNum;
      }else if(sClassQiShu.indexOf('周日夜晚') != -1){
        cur.saveTimes = sClassQiShu;
        cur.times = 7730000 + timeNum;
      }
    }

    week.sort(function(a,b){
      return a.times - b.times
    })
    // for(var i = 0 ; i < week.length; i++){
    //   var cur = week[i];
    //   cur['sTimes'] = cur['saveTimes'];
    // }
    console.log(week)
    return week;
  }

})