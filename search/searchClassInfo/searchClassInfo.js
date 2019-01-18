 //index.js
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
var sortClassAsWeek = require('../../utils/sortClassAsWeek.js');
var sortClassAsQi = require('../../utils/sortClassAsQi.js');

//获取应用实例
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
    yearArr:[
      {id: new Date().getFullYear() - 1 , value: new Date().getFullYear() - 1 },
      {id: new Date().getFullYear(), value: new Date().getFullYear()},
      {id: new Date().getFullYear()+1, value: new Date().getFullYear()+1}
    ],
    // yearArr:app.globalData.yearArr,
    semesterArr: app.globalData.semesterArr,
    teacherName:'',
    schoolYear: new Date().getFullYear(),
    showModalStatus: false,
    isopen:'open',
    show: false,//控制弹窗显示
    semesterInn:'秋季', //显示的年级字符串
    inpStr:'',   //公共显示的字符串
    infos:[],
    classInfo:[1],
    theadH: 40,//表头的高度
    classStr:'',
    currentItem: 0,
    sNameW:185,
    zoomShow: false,
    nSemester: 1,  //学年

    // 滑动所需值
    windowWidth: 0,  //手机宽度
    windowHeight: 0,//手机高度
    startX: 0, //触摸开始的X坐标
    startY: 0, //触摸开始的Y坐标
    saveOldLeft: 0, //触摸结束的X坐标
    saveOldTop: 0, //触摸结束的Y坐标
    contentH: 3000, //表格内容的总高度
    contentW: 3000, //表格内容的总宽度
    heigh: 3000, //内容区的高度
    scrollL: 0, //滑动的X值
    scrollT: 0,  //滑动的Y值
    showUp: false, //控制升班情况浮层
    showNoN:false, //升班没有信息时显示
    isAjaxOver: false,
    isAjaxOver1: false
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(){
    
    // console.log(appKey) 
    var that = this;
    that.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      tipClassIndex: wx.getStorageSync('tipClassIndex'),
      noAuditing: wx.getStorageSync('noAuditing'),
      // schoolYear: wx.getStorageSync('schoolYear'),
      semesterIndex: wx.getStorageSync('semesterIndex'),
      // classInfo: wx.getStorageSync('classInfo'),
      localShow: wx.getStorageSync('localShow'),
      flagGrade: wx.getStorageSync('flagGrade'),
      nSemester: publicJs.flagSemester(),
      semesterInn: publicJs.flagSemester() == 4? this.data.semesterArr[0].value:this.data.semesterArr[publicJs.flagSemester()].value,
      schoolYear: publicJs.flagYear(),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')
    })
 
    // 显示提示
    if(this.data.localShow.length == 0){
      this.setData({localShow: true})
    }
    var allHeight = 45 + 42 + 40 + 55;
    // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({
          heigh: that.data.windowHeight - allHeight,
          theadH: that.data.theadH,})
    });
    
    this.getClassList()
  },
 
 // 显示弹窗 学年
  getYear: function (e) {
    this.setData({arr: this.data.yearArr,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  // 显示弹窗 学期
  getSemester: function (e) {
    this.setData({arr: this.data.semesterArr,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },

  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
  },
  
  // 获取点击的弹窗的id和value值
  getIndex:function(e){
    var inpStr = this.data.inpStr;
    this.setData({show: false});
    if(inpStr == 'year'){
      if(this.data.schoolYear == e.detail.detail.dataset.id) return;
      this.setData({
        schoolYear:e.detail.detail.dataset.id, 
      })
      this.getClassList();
      wx.setStorageSync('schoolYear',e.detail.detail.dataset.id);
    }else if(inpStr == 'semester'){
      if(this.data.semester==this.data.arr[e.detail.detail.dataset.id-1].value) return;
      this.setData({
        semester:this.data.arr[e.detail.detail.dataset.id-1].value, 
        nSemester:this.data.arr[e.detail.detail.dataset.id-1].semester, 
        semesterInn: this.data.arr[e.detail.detail.dataset.id-1].value, 
      })
      this.getClassList();
      wx.setStorageSync('semesterIndex',e.detail.detail.dataset.id);
    }
  },
  // 菜单按钮
  powerDrawer: function (e) {
    publicJs.powerDrawer(e,this)
  },
  // 点击改变tabBar颜色
  // changeColor: function(e){
  //   publicJs.changeColor(e,this)
  // },
  // 关闭导航
  closeNav: function(e){
    publicJs.closeNav(e,this)
  },
  // 关闭弹窗
  closeFloat: function(e){
    publicJs.closeFloat(e,this)
  },
  // 跳转到跟班情况
  goAttendant:function(e){
    console.log(e)
    wx.setStorageSync('tipClassIndex',e.currentTarget.dataset.ids)
    wx.navigateTo({url:'/search/searchStudentsAsClass/searchStudentsAsClass'})
  },
  // 跳转退跟班情况
  goQuit:function(e){
    wx.setStorageSync('tipClassIndex',e.currentTarget.dataset.ids)
    var num = e.target.dataset.num;
    if(num!=0){
      wx.navigateTo({url:'/search/searchClassInfo_Quit/searchClassInfo_Quit'})
    }
  },
  // 跳转每讲详情
  goDetail:function(e){
    wx.setStorageSync('tipClassIndex',e.target.dataset.ids)
    wx.navigateTo({url:'/search/searchClassInfo_Detail/searchClassInfo_Detail'})
  },

  // 获取班级列表
  getClassList: function(){
    var that = this;
    // 时间戳
    var stamp = new Date().getTime();
    // 学年
    var year = this.data.schoolYear;
    // 学期
    var nSemester = this.data.nSemester;
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
      api:'api/Class/GetClass',
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
              that.setData({classes:['您此学期没有课程'],classInfo:[]});
            }else{
              that.data.classes = [];
              that.data.classInfo = [];
              var classArr = [];
              that.setData({
                number: resData.length,
                contentH: 60*resData.length
              })
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

                var SectBegin = cur.SectBegin; //排序时间
                if(!SectBegin){
                  if(cur.sTime){
                    SectBegin = cur.dtBeginDate.substr(0,cur.dtBeginDate.indexOf('T'))+'T'+cur.sTime.slice(0,lineIndex)+':00'
                  }else{
                    SectBegin = cur.dtBeginDate 
                  }
                }
                
                var grade = times +' '+ cur.sGradeName ;
                if(cur.sPrintTime.indexOf(';')){
                  console.log(1233323)
                }
                classArr.push({
                  // sPrintTime:cur.sPrintTime.substr(0,cur.sPrintTime.indexOf('-')),
                  // sPrintTime:cur.sTimeQuanTumName+' '+cur.sTime.slice(0,lineIndex),
                  sClassName:cur.sClassName,
                  nCurrentCount:cur.nCurrentCount,//退班人数
                  nPreReg:cur.nPreReg,//预留人数
                  nTBCountAfter:cur.nTBCountAfter,//退班人数
                  nTBCountBefore:cur.nTBCountBefore,//退班人数
                  sTime:(cur.sPrintTime.indexOf(';')!=-1)?cur.sPrintTime.substr(0,cur.sPrintTime.indexOf(';')):cur.sPrintTime.substr(0,cur.sPrintTime.indexOf(',')),//退班人数
                  sAddress:cur.sPrintAddress, //小区
                  sRoomName:cur.sRoomName, //教室
                  sClassCode:cur.sClassCode,
                  nGrade:cur.nGrade,
                  times:times,
                  SectBegin:SectBegin, //上课时间
                  dtBeginDate:cur.dtBeginDate, //开始时间
                })
              }
              // 给班级排序
              if(classArr[0].times.indexOf('期') != -1){
                console.log()
                // 按‘期’排序
                var newClassArr = that.sortClassAsQi(classArr);
              }else{
                // 按‘星期’排序
                var newClassArr = sortClassAsWeek.sortClassAsWeek(classArr);
              }
              var j = 0;
              for(var k in newClassArr){
                j++;
                that.data.classes.push({id: j-1, value:newClassArr[k].times})
              }
              that.setData({classes:that.data.classes,classInfo:newClassArr})

              // console.log(that.data.classInfo)
              wx.setStorageSync('classInfo',newClassArr)
              wx.setStorageSync('tipClassIndex',0)
            }
            that.setData({isAjaxOver: true})
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


 
   // 退出登录
  unlogin: function(){
    publicJs.unlogin()
  },
  // 滑动
  touchstart: function(e){
    var allHeight = 45+42+40+10;
    var nameW = this.data.nameW;
    var allContentW = 447+120+20;
    var tabWidth = 56;
    publicJs.touchstart(e,this,nameW,allHeight,allContentW,tabWidth)
  },
  touchmove: function(e){
    publicJs.touchmove(e,this,185)
  },
  touchend: function(e){
    publicJs.touchend(e,this)
  },
  
   // 显示升班信息
  showShengbanDetail: function(e){
    var idx = e.currentTarget.dataset.ids;
    // 获取详细信息
    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken;
    var ClassCodes = this.data.classInfo[idx].sClassCode;
    var query = {
      appid: 'web',
      timestamp:stamp,
      token:token,
      sclasscode:ClassCodes,
    }
    var option = {
      api:'api/Class/GetClassXuBao',
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
            var newInfos = [];
            if(resData.length){
              that.setData({showNoN: false})
              for(var i = 0 ; i < resData.length; i++){
                newInfos.push({
                  sAreaName:resData[i].sAreaName,
                  sClassCode:resData[i].sClassCode,
                  sClassName:resData[i].sClassName,
                  sPrintTeachers:resData[i].sPrintTeachers,
                  sPrintTime:resData[i].sTimeQuanTumName + resData[i].sTime,
                })
              }
            }else{
              that.setData({showNoN: true})
            }
            that.setData({shengbanArr: newInfos, isAjaxOver1: true,isAjaxOver:true})
            that.setData({showUp:true});
          }
          setTimeout(()=>{
            wx.hideLoading()
          },500)
        }
      }
    })
    
  },
  // 关闭弹窗
  closeShengbanFloat: function(e){
   this.setData({
    showUp:false,
    shengbanArr: []
   })
  },
  sortClassAsQi:function (qiArr){
    for(var i = 0 ; i < qiArr.length; i++){
      var timeStr = qiArr[i].times;
      var timeNum = Number(timeStr.split(':').join('').substr(-4));
      var tIndex = qiArr[i].SectBegin.indexOf('T');
      var dateD = qiArr[i].SectBegin.substr(0,tIndex).split('-').join('');  // 20180412
      var dateT = Number(qiArr[i].SectBegin.slice(tIndex+1).split(':').join('')); // 083000
      qiArr[i].dateD = dateD;
      qiArr[i].dateT = dateT;
    }
      // 先排日期
      var newQiArr = this.quickSort(qiArr,'dateD',false);
      console.log(newQiArr)

        // 排时间
        for(var j = 0 ; j < newQiArr.length-1; j++){
          for(var k = 0; k <newQiArr.length- j -1; k++){
            if(newQiArr[k].dateD == newQiArr[k + 1].dateD){
              if(newQiArr[k].dateT > newQiArr[k+1].dateT){
                var  now = newQiArr[k];
                newQiArr[k]= newQiArr[k+1];
                newQiArr[k+1] = now;
              }
            }
          }
        }
      return newQiArr;
  },
  quickSort:function (arr,name,snum){
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
  }
})
 




