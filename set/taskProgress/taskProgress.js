
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;
Page({
  data: {
    kejieArr:[
      {id: 1, value: '第1讲'}
    ],
    taskArr:[],
    classInfo:[],
    classes: [],
    teacherName:'',
    schoolYear: 2017,
    semester:'秋季',
    showModalStatus: false,//控制导航的显示
    isopen:'open', //控制菜单的显示
    show:false, //控制弹窗的显示
    show1:false, //控制转发弹窗的显示

    tipKejieIndex: 0, //第几讲
    arr: [],//公共数组
    inpStr:'',//公共字符串
    classInn:'',
    kejieInn:'第1讲',
    futureTime:'',//到期时间
    huors:0,
    mins:0,
    secs:0,
    src:'../images/logo.png',
    showBtn: true,
    linkBth:false, //显示转发链接图片按钮是否可用
    taskH: 20,
    taskF: true,
    sRemainTime:'',//剩余时间
    // 滑动所需值
    windowWidth: 0,  //手机宽度
    windowHeight: 0,//手机高度
    pixelRatio:2,//手机像素比
    startX: 0, //触摸开始的X坐标
    startY: 0, //触摸开始的Y坐标
    saveOldLeft: 0, //触摸结束的X坐标
    saveOldTop: 0, //触摸结束的Y坐标
    contentH: 300, //表格内容的总高度
    contentW: 888, //表格内容的总宽度
    heigh: 200, //内容区的高度
    scrollL: 0, //滑动的X值
    scrollT: 0,  //滑动的Y值
    nameW:65, // 名字的宽度
    zoomShow: false,
    isAjaxOver: false
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
  },
  onLoad: function(option){
    this.page = option.page
    // console.log(this.page)
    var that = this;
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      tipClassIndex: wx.getStorageSync('tipClassIndex'),
      tipKejieIndex: wx.getStorageSync('tipKejieIndex'),
      semesterIndex: wx.getStorageSync('semesterIndex'),
      schoolYear: wx.getStorageSync('schoolYear'),
      classInfo: wx.getStorageSync('classInfo'),
      futureTime: wx.getStorageSync('futureTime'),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')
      // cardIndex: wx.getStorageSync('cardIndex'),
    })

    // 渲染倒计时
    // this.setTime();
    var classInfo = this.data.classInfo;
    for(var i = 0 ; i < classInfo.length; i++){
      this.data.classes.push({id:i,value:classInfo[i].grade})
    }
    this.setData({classes: this.data.classes,classInn:this.data.classes[this.data.tipClassIndex].value})

    for(var j = 1; j <= classInfo[this.data.tipClassIndex].lessonNumber;j++){
      this.data.kejieArr.push({id: j, value: '第'+ j +'讲'})
    }

    console.log(this.data.tipKejieIndex)
    // 删除‘请选择’项
    this.data.kejieArr.shift();
    this.setData({kejieArr: this.data.kejieArr,kejieInn:this.data.kejieArr[this.data.tipKejieIndex-1].value})
    publicJs.getSystem(that)
 
    //只有从cardIndex进入的taskprogress页面才获取最近上完的课节, 从设置任务卡页面进入的,显示老师选择的课节
    if(this.page == 'cardIndex'){
      this.getEndKejie();
    }else{
      this.getTask();
    }
    this.getEndTime();
  },

  forward:function(){
    // this.setData({showBtn: false,show1: true,showBtn1: true})
    // classCode 和  tipKejieIndex
    var id= this.data.classInfo[this.data.tipClassIndex].classCode +','+this.data.tipKejieIndex
    wx.navigateTo({ url: '/set/taskLink/taskLink?id='+id})
  },
  // 显示弹窗 学年
  getClass: function (e) {
    this.setData({arr: this.data.classes,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  // 显示弹窗 学期
  getKejie: function (e) {
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
    this.setData({show: false})
    if(inpStr == 'class'){  //班级
      if(this.data.classInn == this.data.arr[e.detail.detail.dataset.id].value) return;
      // console.log(this.data.arr)
      this.setData({
        classInn:this.data.arr[e.detail.detail.dataset.id].value, 
        tipClassIndex:e.detail.detail.dataset.id, 
        // tipKejieIndex:2,
      })
      // this.getStudentInfo();
      this.getTask();
      this.getEndTime();

      // 重新渲染课节
      this.data.kejieArr = []
      var lesson = this.data.classInfo[this.data.tipClassIndex].lessonNumber;
      for(var i = 1 ; i <= lesson; i++){
        this.data.kejieArr.push({id: i, value: '第'+i+'讲'});
      }

      // 判断课节是否存在
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

      this.setData({kejieArr: this.data.kejieArr});

      
      // 缓存选择的班级信息的编号
      wx.setStorageSync('tipClassIndex',this.data.tipClassIndex);
    }else if(inpStr == 'kejie'){  //课节
      if(this.data.kejieInn == this.data.arr[e.detail.detail.dataset.id-1].value) return;
      this.setData({
        kejieInn:this.data.arr[e.detail.detail.dataset.id-1].value, 
        tipKejieIndex:e.detail.detail.dataset.id, 
      })
      // this.getStudentInfo();
      this.getTask();
      this.getEndTime();

      // 缓存选择的课节
      wx.setStorageSync('tipKejieIndex',this.data.tipKejieIndex);
    }
  },
  // 菜单按钮
  powerDrawer: function (e) {
    publicJs.powerDrawer(e,this)
  },
  // 关闭导航
  closeNav: function(e){
    publicJs.closeNav(e,this)
  },
  // 关闭弹窗
  closeFloat: function(e){
    publicJs.closeFloat(e,this)
  },
  // 退出登录
  unlogin: function(){
    publicJs.unlogin()
  },
  //获取最新课节
  getEndKejie: function(callBack){
    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken;
    var classCode = this.data.classInfo[this.data.tipClassIndex].classCode;
    var query1 = 'appid='+appId+'&sClassCode='+classCode+'&timestamp='+stamp+'&token='+token;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      sclasscode:classCode,
    }
    
    var option = {
      api:'api/Class/GetClassEndLesson',
      query: query,
      type: 'get',
    }
    wx.showLoading({
      title:'努力加载中...',
      success: function(){
        requests.request(option,function(res){
          if(res.data.ResultType == 0){
            if(res.data.AppendData>=1){
              that.setData({
                tipKejieIndex:res.data.AppendData,
                kejieInn:that.data.kejieArr[res.data.AppendData-1].value
              });
            }else{
              publicJs.resultTip('所选班级还没有开课呦~~',function(){
                wx.navigateBack({
                  delta: 1
                })
              })
            }
          }
          
          
          that.getTask();

          setTimeout(()=>{
            wx.hideLoading();
          },500)
        })
      }
    })    
  },
 // 获取任务卡
  getTask: function(){
    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken;
    // 班级编码
    var classCode = this.data.classInfo[this.data.tipClassIndex].classCode;
    // var classCode = 'BJ17Q1502';
    // 课节号码
    var kejieIndex = this.data.tipKejieIndex;
    // var kejieIndex = 1;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nlessonno:kejieIndex,
      sclasscode:classCode,
    }
    var option = {
      api:'api/PunchTask',
      query: query,
      type: 'get',
    }

        requests.request(option, function(res){
          getRes(res);
        })
        function getRes(res){
          wx.getSystemInfo({
            success: function(res) {
              that.setData({
                windowHeight: res.windowHeight,
                windowWidth: res.windowWidth,
              })
            }
          });
          if(res.data.ResultType == 0){
            var arr = res.data.AppendData;
            that.setData({studentNumber:res.data.AppendData.length-1})
            // 处理原始数据
            for(var i =0; i <arr.length; i++ ){
              var cur = arr[i];
              for(var k in cur.Tasks){
                if(cur.Tasks[k] == null){
                  delete cur.Tasks[k]
                }
              }
            }
            // 处理标题
            var newArr = [];
            for(var k in arr[0].Tasks){
              if(arr[0].Tasks[k] != ""){
                newArr.push(arr[0].Tasks[k])
              }
            }
            that.setData({taskArr:newArr})
            // console.log(that.data.taskArr)
          
            
            // 如果获取的任务数量为空，那么就不能显示转发链接
            if(that.data.taskArr.length == 0){
              that.setData({linkBth:true})
            }else{
              that.setData({linkBth:false})
            }

            /* 处理学生*/
            arr.shift();
            for(var i = 0 ; i < arr.length; i++){
              var cur = arr[i].Tasks
              arr[i]['newTask'] = ''
              for(var k in cur){
                if(cur[k] != null){
                  arr[i]['newTask'] += cur[k] + ','
                }
              }
              arr[i].newTask = arr[i].newTask.split(',')
              arr[i].newTask = arr[i].newTask.splice(0,arr[i].newTask.length-1);
            }
            that.setData({resultArr:arr})
            // console.log(arr)
            for(var i = 0 ; i <  that.data.taskArr.length; i++){
              if(that.data.taskArr[i].length> 4){
                that.setData({taskH:40,taskF:false})
              }else{
                that.setData({taskH:20,taskF:false})
              }
            }
            var allHeight = 45+42+that.data.taskH+20+44+15+15;
            // 设置宽度
            var getContentWidth = 70*that.data.taskArr.length+100;
            var screenWidth = that.data.windowWidth - that.data.nameW;
            if(getContentWidth>screenWidth){
              that.setData({contentW:getContentWidth})
            }else{
              that.setData({contentW:screenWidth,scrollL:0})
            }
            // 设置高度
            that.setData({
              heigh:that.data.windowHeight - allHeight,
              isAjaxOver: true,
            })
            
            
          }else if(res.data.ResultType == 7){
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          }
        }                                       
  },
  
  // 截止时间
  getEndTime: function(){
    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken;
    // 班级编码
    var classCode = this.data.classInfo[this.data.tipClassIndex].classCode;
    // 课节号码
    var kejieIndex = this.data.tipKejieIndex;
     var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nlessonno:kejieIndex,
      sclasscode:classCode,
    }
    var option = {
      api:'api/PunchEndDate',
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
            var arr = res.data.AppendData;
            var dates = arr.Date.substr(0,arr.Date.indexOf(' '));
            var times = arr.Time.substr(0,arr.Time.lastIndexOf(':'))

            var datesStr = '';

            var datesArr = dates.split('/');
            if(datesArr[1]<10){
              datesArr[1] = '0'+datesArr[1];
            }
            datesStr = datesArr[1]+'月'+datesArr[2]+'日'
            that.setData({
              yearStr:datesArr[0],
              month:datesStr,
              clock:times
            })

            // 处理输入的时间
            var reg = /[\u4e00-\u9fa5]/;
            var monthArr = that.data.month.split(reg);
            monthArr.pop()
            for(var i = 0 ; i < monthArr.length; i++){
              if(monthArr[i].length == 1 && monthArr[i] < 10){
                monthArr[i] = '0' +monthArr[i]
              }
            }
            var times = that.data.yearStr +'/'+monthArr.join('/') + ' ' + that.data.clock+':00';
            that.setData({futureTime:times}) 
            var timer = setInterval(set,1000);

            function set(){
              //设置未来时间
              var Ftime = new Date(that.data.futureTime);
              var FtimeMs = Ftime.getTime();
             
              //获取本地时间
              var Ltime = new Date();
              var LtimeMs = Ltime.getTime();

              //获取时间差的秒数
              var diff = (FtimeMs - LtimeMs)/1000;
              
              //获取时间差的天
              var day = Math.floor(diff / (24*60*60));
              //获取时间差的时
              var hour = parseInt(diff /(60*60) %24);
              //获取时间差的分
              var mins = getTwo(parseInt(diff/60%60));
              //获取时间差的秒
              var secs = getTwo(parseInt(diff % 60));

              //处理个位数
              function getTwo(num){
                return num < 10? '0' + num : num
              }
              var hours = getTwo(day*24 + hour)

              if(diff < 0){
                clearInterval(timer);
                that.setData({
                  hours:'00',
                  mins:'00',
                  secs:'00'
              })

              }else{
                that.setData({
                  hours:hours,
                  mins:mins,
                  secs:secs
                })
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
  // 滑动
  touchstart: function(e){
    var that = this;
    // console.log(e)
    var nameW = 65;

    // 6 任务卡的数量 
     if(this.data.taskF){
      var allContentH = 40*that.data.studentNumber
      var allHeight = 45+42+40+44+15+15;
    }else{
      var allContentH = 40*that.data.studentNumber
      var allHeight = 45+42+60+44+15+15;
    }

     this.setData({
       contentH: allContentH,
    })


    var sX = 0,sY = 0;
    sX = e.touches[0].clientX;
    sY = e.touches[0].clientY;
    this.setData({ startX: sX ,startY: sY});
  },
  touchmove: function(e){
    var nameW = 65;
    var mX = 0,mY = 0;
    mX = e.touches[0].clientX;
    mY = e.touches[0].clientY;
    var lineX = Math.abs(mX - this.data.startX);
    var lineY = Math.abs(mY - this.data.startY);

    var mXpx = mX - this.data.startX + this.data.saveOldLeft;
    var mYpx = mY - this.data.startY + this.data.saveOldTop;
    
    // 如果lineX >lineY  那么就是水平方向滑动
    if(lineX > lineY){
      if (mXpx >= 0) { //已经滑动到第一项
        mXpx = 0
      }else if(mXpx <= this.data.windowWidth- this.data.contentW - nameW) { //已经滑动到最后一项
        mXpx = this.data.windowWidth - this.data.contentW - nameW
      }else{
        var mXpx = mX - this.data.startX + this.data.saveOldLeft;
      }
      this.setData({ scrollL: mXpx, scrollT: this.data.saveOldTop});
    }

    // 如果lineX <lineY  那么就是垂直方向滑动
    if(lineX < lineY){
      if(mYpx >= 0){
        mYpx = 0 
      }else if(mYpx <= this.data.heigh - this.data.contentH){
        mYpx = this.data.heigh - this.data.contentH
      }else{
        var mYpx = mY - this.data.startY + this.data.saveOldTop;
      }
      if(40*this.data.studentNumber < this.data.heigh){
        mYpx = 0;
      }
      this.setData({ scrollL: this.data.saveOldLeft, scrollT:mYpx });
    }
  },
  touchend: function(e){
    var scrollL = this.data.scrollL;
    var scrollT = this.data.scrollT;
    this.setData({ saveOldLeft: scrollL, saveOldTop: scrollT})
  },

})

