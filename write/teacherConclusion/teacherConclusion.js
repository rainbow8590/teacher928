
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
// var sortClassAsWeek = require('../../utils/sortClassAsWeek.js');
// var sortClassAsQi = require('../../utils/sortClassAsQi.js');

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
    yearArr:[{id: new Date().getFullYear(), value: new Date().getFullYear()}],
    semesterArr: [{id: 4, value: '暑假'}],
    schoolYear: new Date().getFullYear(),
    semester:'秋季',
    showModalStatus: false, //控制导航显示
    isopen:'open',  //控制菜单显示
    teacherName: '', //教师名称
    teacherToken:'', //教师token
    classInfo:[], //课程信息
    classes: [], //班级
    nSemester: 1,  //学年
    tipClassIndex: 0, //点击的第几个班级
    show:false, //控制弹窗显示
    arr:[], //公共数组
    inpStr:'',   //公共显示的字符串
    classInn: '',  //显示的班级字符串
    getkind: 1, // 查询类型 基本/期中期末
    zoomShow: false,
    isAjaxOver: false, //判断数据请求是否完成
    date: new Date().getFullYear()+'/'+(new Date().getMonth()+1)+'/'+new Date().getDate()
  },
  onReady: function(){
    this.selectPopup = this.selectComponent("#selectPopup");
  },
  onLoad: function(){
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      noAuditing: wx.getStorageSync('noAuditing'),
      nSemester: 4,
      semester: '暑假',
      schoolYear:2018,
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')
    })
    wx.setStorageSync('schoolYear',this.data.schoolYear);
    wx.setStorageSync('tipClassIndex',this.data.tipClassIndex);
    wx.setStorageSync('kind',this.data.kind);
    this.getClassList();
  },
  onShow:function(){
    // 区分条件是 用户是第一次进入还是从下级返回的,通过tipClassIndex来区分
    var oldIndex = this.data.tipClassIndex;
    var newIndex = wx.getStorageSync('tipClassIndex');
   if(wx.getStorageSync('classes')){
      this.setData({classes:wx.getStorageSync('classes')});
    }
    if(newIndex){
      // 如果两个值一样 说明是第一次进入或进入后没有选择班级就进入下一级页面
      if(oldIndex == newIndex){
        wx.setStorageSync('tipClassIndex',this.data.tipClassIndex); 
      }
      // 两个值不一样，说明是从下级页面返回的
      else{
        this.setData({
          classInn: this.data.classes[wx.getStorageSync('tipClassIndex')].value
        })
      }
    }
  },
  // 显示弹窗 学年
  getYear: function (e) {
    console.log(e)
    this.setData({arr: this.data.yearArr,inpStr: e.detail.detail.dataset.id})
    this.selectPopup.showPopup()
  },
  // 显示弹窗 学期
  getSemester: function (e) {
    this.setData({arr: this.data.semesterArr,inpStr: e.detail.detail.dataset.id})
    this.selectPopup.showPopup()
  },
  // 显示弹窗 班级
  getClass: function (e) {
    this.setData({arr: this.data.classes,inpStr: e.detail.detail.dataset.id})
    this.selectPopup.showPopup()
  },
  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
  },
  
  
  
  // 菜单按钮
  powerDrawer: function (e) {
    console.log(e)
    publicJs.powerDrawer(e,this)
  },
  // 关闭导航
  closeNav: function(e){
    publicJs.closeNav(e,this)
  },

  // 获取类型（基础信息/期中期末）
  getKind: function(e){
    this.setData({getkind: Number(e.detail.value)})
    wx.setStorageSync('getkind',this.data.kind);
  },
  // 获取点击的弹窗的id和value值
  getIndex:function(e){
    var inpStr = this.data.inpStr;
    this.setData({show: false})
    if(inpStr == 'year'){
      if(this.data.schoolYear == e.detail.detail.dataset.id) return;
      // this.setData({
      //   schoolYear:e.detail.detail.dataset.id, 
      //   classInn: this.data.classes[0].value
      // })
      // this.getClassList();
      wx.setStorageSync('schoolYear',e.detail.detail.dataset.id);
    }else if(inpStr == 'semester'){
      if(this.data.semester=='暑假') return;
      // this.setData({
      //   semester:this.data.arr[e.detail.detail.dataset.id-1].value, 
      //   nSemester:e.detail.detail.dataset.id, 
      //   classInn: this.data.classes[0].value
      // })
      // this.getClassList();
      // wx.setStorageSync('semesterIndex',e.detail.detail.dataset.id);
    }else if(inpStr == 'class'){
      if(this.data.sClassCode == this.data.arr[e.detail.detail.dataset.id].sClassCode) return;
      this.setData({
        sClassCode:this.data.arr[e.detail.detail.dataset.id].sClassCode, 
        classInn:this.data.arr[e.detail.detail.dataset.id].value, 
        tipClassIndex:e.detail.detail.dataset.id, 
      })
      // 缓存选择的班级信息的编号
      wx.setStorageSync('tipClassIndex',this.data.tipClassIndex);
    }
  },
  
 
  // 点击确定
  goDetail: function(){
    if(this.data.classes.length == 1 && this.data.classes[0].value == '您此学期没有课程') return;
    wx.navigateTo({url:'/write/teacherConclusionEdit/teacherConclusionEdit'})
    // if(this.data.getkind == 1){
    //   wx.navigateTo({url:'/write/schoolBase/schoolBase'})
    // }else if(this.data.getkind == 2){
    //   this.getGrade()
    // }
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
      nsemester:nSemester,
      nclassyear:year,
    }
  
    var option = {
      api:'api/SummerTask/GetClass',
      query: query,
      type: 'get',
    }
    wx.showLoading({
      title:'努力加载中...',
      success: function(){
        requests.request(option,function(res){
          getRes(res);
        })
        function getRes(res){
          console.log(res.data)
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            that.setData({isAjaxOver: true});
     
              if(resData.length){
                var classes = [];
                for(var i = 0 ; i < resData.length; i++){
                  classes.push({
                    value:resData[i].sTimeName,
                    sClassCode: resData[i].sClassCode,
                    sClassName: resData[i].sClassName,
                    SectBegin: resData[i].SectBegin
                  })
                }
                // paixu
                  console.log(classes[0].value)
                if(classes[0].value.indexOf('期') != -1){
                  //按‘期’排序
                  classes = that.sortClassAsQi(classes);
                }else{
                  // 按‘星期’排序
                  // classes = sortClassAsWeek.sortClassAsWeek(classes);
                }

                for(var i = 0 ; i < classes.length; i++){
                  classes[i].id = i;
                }


                that.setData({classes: classes})
                that.setData({classInn: that.data.classes[0].value, kejieInn:2 , sClassCode:that.data.classes[0].sClassCode})
                // wx.setStorageSync('tipClassIndex',0)
                wx.setStorageSync('classInfo',classes)
                wx.setStorageSync('classes',classes)
            }else{
              that.setData({
                classInn: '您此学期没有课程',
                classes:[],
              });
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
  sortClassAsQi: function(qiArr){

      for(var i = 0 ; i < qiArr.length; i++){
        // var timeStr = qiArr[i].times;
        // // var timeStr = qiArr[i].sTime;
        // var timeNum = Number(timeStr.split(':').join('').substr(-4));
        // var dateAll = qiArr[i].SectBegin;
        var tIndex = qiArr[i].SectBegin.indexOf('T');
        var dateD = qiArr[i].SectBegin.substr(0,tIndex).split('-').join('');  // 20180412
        var dateT = Number(qiArr[i].SectBegin.slice(tIndex+1).split(':').join(''));
        qiArr[i].dateD = dateD;
        qiArr[i].dateT = dateT;
      }
      console.log(11)
      console.log(qiArr)
      // 先排日期 
      var newQiArr = this.quickSort(qiArr,'dateD',false);

      // 排时间
      for(var j = 0 ; j < newQiArr.length-1; j++){
        for(var k = 0; k <newQiArr.length- j -1; k++){
          if(newQiArr[k].dateD == newQiArr[k + 1].dateD){
            if(newQiArr[k].dateT > newQiArr[k+1].dateT){
              var now = newQiArr[k];
              newQiArr[k]= newQiArr[k+1];
              newQiArr[k+1] = now;
            }
          }
        }
      }
      return newQiArr ;
  },  
  quickSort: function(arr,name,snum){
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
