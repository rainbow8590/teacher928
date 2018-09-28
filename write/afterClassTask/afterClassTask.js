
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
      {id:0,txt:'录入',classname:'icon-writeactive',changeTextColor:'#1FBB1C',isChange: true},
      {id:1,txt:'查询',classname:'icon-search',changeTextColor:'#888',isChange: false},
      {id:2,txt:'任务',classname:'icon-tasking',changeTextColor:'#888',isChange: false},
      {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888',isChange: false},
    ],
    yearArr:[{id: new Date().getFullYear(), value: new Date().getFullYear()}],
    semesterArr: [{id: 4, value: '暑假'}],
    kejieArr:[{id: 2, value: 2 }],
    // kejieArr:[{id: 0, value: '请选择'}],
    classInfo: [], //班级信息数组
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
    tipKejieIndex: 2, //点击的第几个课节
    show:false, //控制弹窗显示
    arr:[], //公共数组
    inpStr:'',   //公共显示的字符串
    classInn: '',  //显示的班级字符串
    kejieInn: null, //课节字符串
    zoomShow: false,
    isAjaxOver: true
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
    wx.setStorageSync('tipClassIndex',this.data.tipClassIndex);
    wx.setStorageSync('tipKejieIndex',this.data.tipKejieIndex);
    this.getClassList();
  },
  onShow:function(){
    this.setData({
      tipClassIndex: wx.getStorageSync('tipClassIndex'),
      tipKejieIndex: wx.getStorageSync('tipKejieIndex'),
    })
    if(wx.getStorageSync('classes')){
      this.setData({classes:wx.getStorageSync('classes')})
    }
    console.log(this.data.classes)
    // 区分条件是 用户是第一次进入还是从下级返回的
    // 如果是第一次进入本页面
    if(!this.data.classes.length){
      this.setData({
        kejieInn:this.data.kejieArr[this.data.tipKejieIndex-2].value
      })
    }else{
      if(this.data.tipKejieIndex == 2){
        this.setData({
          kejieInn:this.data.kejieArr[this.data.tipKejieIndex-2].value
        })
      }else{
        this.setData({
          kejieInn:this.data.kejieArr[this.data.tipKejieIndex-2].value
          // kejieInn:this.data.kejieArr[this.data.tipKejieIndex].value
        })
      }
      console.log(this.data.classes)
      this.setData({
        classInn:this.data.classes[this.data.tipClassIndex].value,
        sClassCode:this.data.classes[this.data.tipClassIndex].sClassCode,
      })
    }
  },
  // 显示弹窗 学年
  getYear: function (e) {
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
     console.log(this.data.classes)
    if(this.data.classes[0].value == '您此学期没有课程') return;
    this.setData({arr: this.data.classes,inpStr: e.detail.detail.dataset.id})
    this.selectPopup.showPopup()
  },
  // 显示弹窗 班级
  getKejie: function (e) {
   
    if(this.data.classInn == '您此学期没有课程') return;
    
    this.setData({arr: this.data.kejieArr,inpStr: e.detail.detail.dataset.id})
    this.selectPopup.showPopup()
  },
  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
  },
  //  // 关闭弹窗
  // closeFloat: function(e){
  //   publicJs.closeFloat(e,this)
  // },
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
  goScore: function(){
    if(this.data.kejieInn == '无课节' && this.data.classInn == '您此学期没有课程'){
      publicJs.resultTip('您此学期没有课程');
      return;
    };
  
    wx.navigateTo({url:'/write/afterClassTaskScore/afterClassTaskScore'})
  },
  // 获取点击的弹窗的id和value值
  getIndex:function(e){
    var inpStr = this.data.inpStr;
    this.setData({show: false})
    if(inpStr == 'year'){
      if(this.data.schoolYear==e.detail.detail.dataset.id) return;
      // this.setData({
      //   schoolYear:e.detail.detail.dataset.id, 
      //   classInn: this.data.classes[0].value
      // })
      // this.getClassList();
      // wx.setStorageSync('schoolYear',e.detail.detail.dataset.id);
    }else if(inpStr == 'semester'){
      if(this.data.semester=='暑假') return;
      // if(this.data.semester==this.data.arr[e.detail.detail.dataset.id-1].value) return;
      // this.setData({
      //   semester:this.data.arr[e.detail.detail.dataset.id-1].value, 
      //   nSemester:e.detail.detail.dataset.id, 
      //   classInn: this.data.classes[0].value,
      //   tipClassIndex: 0,
      // })
      // this.getClassList();
      // wx.setStorageSync('semesterIndex',e.detail.detail.dataset.id);
    }else if(inpStr == 'class'){
      console.log(this.data.sClassCode)
      console.log(this.data.arr[e.detail.detail.dataset.id].sClassCode)
      if(this.data.sClassCode == this.data.arr[e.detail.detail.dataset.id].sClassCode) return;
      this.setData({
        sClassCode:this.data.arr[e.detail.detail.dataset.id].sClassCode, 
        classInn:this.data.arr[e.detail.detail.dataset.id].value, 
        tipClassIndex:e.detail.detail.dataset.id, 
      })
      // 获取课节数组
      // this.data.kejieArr = [{id: 1, value: '请选择'}]
      // this.data.kejieArr = [{id: 0, value: '请选择'}]
      // var lesson = this.data.classInfo[this.data.tipClassIndex].lessonNumber;
      for(var i = 3 ; i <= 8; i++){
        this.data.kejieArr.push({id: i, value: i});
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
    }else if(inpStr == 'kejie'){

      this.setData({
        kejieInn:this.data.arr[e.detail.detail.dataset.id-2].value, 
        // kejieInn:this.data.arr[e.detail.detail.dataset.id].value, 
        tipKejieIndex:e.detail.detail.dataset.id, 
      })
      // 缓存选择的课节
      wx.setStorageSync('tipKejieIndex',this.data.tipKejieIndex);
    }
  },
  // 获取班级列表
  getClassList: function(){
    if(this.data.isAjaxOver==false) return;
    this.data.isAjaxOver = false;
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
            
     
              if(resData.length){
                var classes = [];
                for(var i = 0 ; i < resData.length; i++){
                  classes.push({
                    // id: i,
                    value:resData[i].sTimeName,
                    sClassCode: resData[i].sClassCode,
                    sClassName: resData[i].sClassName,
                    SectBegin: resData[i].SectBegin
                  })
                }
                // paixu
                  // console.log(classes[0].value)
                if(classes[0].value.indexOf('期') != -1){
                  //按‘期’排序
                  classes = that.sortClassAsQi(classes);
                }
                for(var i = 3 ; i <= 8; i++){
                  that.data.kejieArr.push({id: i, value: i});
                }
                that.setData({kejieArr: that.data.kejieArr});


                for(var i = 0 ; i < classes.length; i++){
                  classes[i].id = i;
                }

                console.log(classes)
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
            that.setData({isAjaxOver: true});
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
