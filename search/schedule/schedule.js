
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
      {id:0,txt:'录入',classname:'icon-write',changeTextColor:'#888',isChange: false},
      {id:1,txt:'查询',classname:'icon-searchactive',changeTextColor:'#1FBB1C',isChange: true},
      {id:3,txt:'任务',classname:'icon-tasking',changeTextColor:'#888',isChange: false},
      {id:2,txt:'工具',classname:'icon-setting',changeTextColor:'#888',isChange: false},
    ],
    showModalStatus: false, //控制导航显示
    isopen:'open',  //控制菜单显示
    teacherName: '', //教师名称
    teacherToken:'', //教师token
    noticeType: 3, // 默认获取任务, -1是智库
    taskArr:[], //任务数组
    thinkArr:[], //智库数组
    // 日期参数
    weekArr:[  '一', '二', '三', '四', '五', '六','日'],
    monthArr:[1,2,3,4,5,6,7,8,9,10,11,12],
    yearArr:[new Date().getFullYear()-1,new Date().getFullYear(),new Date().getFullYear()+1],
    hasEmptyGrid: false,
    showPicker: false,
    dateInfos:[],
    today: '',
    isFirst: 0,
    classContent:null
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(){
    this.timer = null;
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

    var date = new Date(); //当前日期
    var cur_day = date.getDate(); //当前日
    var cur_year = date.getFullYear(); //当前年份
    var cur_month = date.getMonth() + 1; //当前月份
    var change_year = date.getFullYear(); //当前年份
    var change_month = date.getMonth() + 1; //当前月份
    this.setData({
      date:cur_year+'-'+cur_month+'-'+cur_day,
      current:date.getMonth(),
      current1:date.getFullYear()
    });

    this.calculateEmptyGrids(cur_year, cur_month);
    clearInterval(this.timer)
    this.calculateDays(cur_year, cur_month);
    // this.timer = setInterval(()=>{
    //   this.calculateDays(cur_year, cur_month);
    // },5000)
    
 
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
    this.getPic();
  },
  onHide: function(){
    clearInterval(this.timer)
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

  // 获取信息
  getDateInfos: function(callback){
    var that = this;
    // 时间戳
    var stamp = new Date().getTime();
    // 学年
    var year = this.data.schoolYear;
    // 学期
    var nSemester = this.data.nSemester;
    // 教师token
    var token = this.data.teacherToken;
    // 获取信息的类型
    var date = this.data.date;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      date:date,
    }
    var option = {
      api:'api/Calendar/MonthCourse',
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
            var result = res.data.AppendData;
            // console.log(result)
          
            that.setData({dateInfos:result})
            callback();

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
  // 获取校历
  getPic:function(){
    var that = this;
    // 时间戳
    var stamp = new Date().getTime();
    // 学年
    var year = this.data.schoolYear;

    // 教师token
    var token = this.data.teacherToken;
    // 获取信息的类型
    var date = this.data.date;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
    }
    var option = {
      api:'api/Calendar/GetSchoolCalendar',
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
            that.setData({
              picSrc:res.data.AppendData
            })
            
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
  previewImage: function(){
    var that = this;
    wx.previewImage({
      current: that.data.picSrc, // 当前显示图片的http链接
      urls: [that.data.picSrc], // 需要预览的图片http链接列表
    })
  },

  
  // 显示年月浮层
  showFloat: function(e){
    // console.log(e)
    this.setData({show: true})
  },
  // 改变月的背景色并关闭浮层
  changeBgColor: function(e){
    // 恢复初始样式
    for(var i = 0 ; i < this.data.days.length; i++){
      this.data.days[i].classInfo = []
    }
    this.setData({days:this.data.days,cur_day:1,isFirst:1})
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
    this.calculateEmptyGrids(this.data.cur_year, cur);
    this.calculateDays(this.data.cur_year, cur);

  },
  // 改变年的背景色
  changeBgColor1: function(e){
    var cur = e.target.dataset.cur
    this.setData({
      cur_year:cur,
      change_year: cur
    })
    // this.setData({
    //   date:this.data.cur_year+'-'+this.data.cur_month+'-'+1
    // })
  },

  // 点击今天回到当日
  tapToday:function(e){
    this.setData({classContent:null})
    this.setData({today:e.target.dataset.now})
    var date = new Date(); //当前日期
    var cur_day = date.getDate(); //当前日
    var cur_year = date.getFullYear(); //当前年份
    var cur_month = date.getMonth() + 1; //当前月份
    this.setData({
      date:cur_year+'-'+cur_month+'-'+cur_day
    })
    this.calculateEmptyGrids(cur_year, cur_month);
    this.calculateDays(cur_year, cur_month);
    this.setData({
      cur_year: cur_year,
      cur_month: cur_month,
      cur_day: cur_day,
      current: cur_month-1,
      current1: cur_year,
      change_year: new Date().getFullYear(),
      change_month: new Date().getMonth()+1,
    })
    // console.log(this.data.days[this.data.cur_day-1])
    this.data.days[this.data.cur_day-1].choosed = true
    this.setData({
      classContent:this.data.dateInfos[this.data.cur_day-1].CalendarList,
      days:this.data.days
    })
    // console.log(this.data.dateInfos)
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
    clearInterval(this.timer)
    var that = this;
    var days = [];
    var cur_day = new Date().getDate();
    var thisMonthDays = this.getThisMonthDays(year, month); 
    

    this.getDateInfos(function(){
      for (var i = 0; i < that.data.dateInfos.length; i++) {
        if(that.data.dateInfos[i].CalendarList.length){
          for(var a = 0; a < that.data.dateInfos[i].CalendarList.length; a++ ){
            that.data.dateInfos[i].CalendarList[a].player=[{}]
          }
        }
        days.push({
          day: i+1,
          choosed: false,
          classInfo: that.data.dateInfos[i].CalendarList,
        });
      }

        if(that.data.isFirst == 0 || that.data.today == 'today'){
           //有课就请求直播信息
          if( that.data.dateInfos[cur_day-1].CalendarList.length>0 ){
              var idx = cur_day-1;
              new Promise(function(resolve){
                that.setPlayer(that.data.dateInfos, idx, that.data.dateInfos[idx].CalendarList,'CalendarList',function(){
                  resolve(that.resultArr)
                })
              }).then(function(datas){
                // 如果当日有直播信息, 就轮询
                for(var i = 0; i < datas.length; i++){
                  if(datas[i] != '没有对应的直播课'){
                    that.timer = setInterval(()=>{
                      that.setPlayer(that.data.dateInfos, idx, that.data.dateInfos[idx].CalendarList,'CalendarList',function(){})
                    },5000)
                    break;
                  }
                }
             
              })
          }else{

           that.setData({classContent:[] })
          // that.setData({classContent:that.data.dateInfos[cur_day-1].CalendarList })
          }
        }else{
          //有课就请求直播信息
          console.log(that.data.dateInfos[0])
          if( that.data.dateInfos[0].CalendarList.length>0 ){
            /*that.setPlayer(that.data.dateInfos, 0, that.data.dateInfos[0].CalendarList,'CalendarList')
            that.timer = setInterval(()=>{
              that.setPlayer(that.data.dateInfos, 0, that.data.dateInfos[0].CalendarList,'CalendarList')
            },5000)*/
            new Promise(function(resolve){
                that.setPlayer(that.data.dateInfos, 0, that.data.dateInfos[0].CalendarList,'CalendarList',function(){
                  resolve(that.resultArr)
                })
              }).then(function(datas){
                // 如果当日有直播信息, 就轮询
                for(var i = 0; i < datas.length; i++){
                  if(datas[i] != '没有对应的直播课'){
                    console.log(1111111)
                    that.timer = setInterval(()=>{
                      that.setPlayer(that.data.dateInfos, 0, that.data.dateInfos[0].CalendarList,'CalendarList',function(){})
                    },5000)
                    break;
                  }
                }
                  
              })
              
          }else{

           that.setData({classContent:[] })
          // that.setData({classContent:that.data.dateInfos[0].CalendarList })
           }
        }
      
      that.setData({
        days:days
      });
    });
  },
  //点击两侧箭头的事件
  handleCalendar:function(e) {  
    clearInterval(this.timer)
    this.setData({classContent:null})
    this.setData({today:""})
    for(var i = 0 ; i < this.data.days.length; i++){
      this.data.days[i].classInfo = []
      this.data.days[i].choosed = false
    }
    // console.log(this.data.days)
    this.setData({days:this.data.days,cur_day:1,isFirst:1})
    var handle = e.currentTarget.dataset.handle;
    // 弹框上的值
    var cur_year = this.data.cur_year;
    var cur_month = this.data.cur_month;
    // 日历上的值
    var change_year = this.data.change_year;
    var change_month = this.data.change_month;
    // var current = this.data.current;
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
        cur_day: 1
      })

      this.calculateEmptyGrids(change_year, change_month);

      this.calculateDays(change_year, change_month);
      // 切换月份时, 如果1号有课,显示深绿颜色
      if(this.data.dateInfos[0].CalendarList.length>0){
        this.data.days[0].choosed = true;
      }
      this.setData({days: this.data.days})

  },
  // 选择每天的日期改变状态
  tapDayItem:function(e) {
    clearInterval(this.timer)
    this.setData({classContent:null})
    var that = this;
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

    // that.setData({classContent:this.data.days[idx]['classInfo']})

    //有课就请求直播信息

    if( this.data.days[idx].classInfo.length ){
      /*this.setPlayer(this.data.days, idx, this.data.days[idx].classInfo,'classInfo')
      this.timer = setInterval(()=>{
        this.setPlayer(this.data.days, idx, this.data.days[idx].classInfo,'classInfo')
      },5000)*/
      new Promise(function(resolve){
        that.setPlayer(that.data.days, idx, that.data.days[idx].classInfo,'classInfo',function(){
          resolve(that.resultArr)
        })
        
      }).then(function(datas){
        clearInterval(that.timer)
        // 如果当日有直播信息, 就轮询
        for(var i = 0; i < datas.length; i++){
          if(datas[i] != '没有对应的直播课'){
            that.timer = setInterval(()=>{
               that.setPlayer(that.data.days, idx, that.data.days[idx].classInfo,'classInfo',function(){})
            },5000)
            break;
          }
        }
      })
      
      // that.setData({classContent:this.data.days[idx]['classInfo']})
    }else{
    
      that.setData({classContent:this.data.days[idx]['classInfo']})
    }
   
  },
  //请求直播课并赋值
  setPlayer(fatherArr, index, classInfos, classInfo,callback){
    var that = this;
    var newPlayerArr = [];
    for(var j = 0 ; j < classInfos.length; j++) {
      var kk = new Promise(resolve=>{
          var that = this;
          var stamp = new Date().getTime();
          var token = that.data.teacherToken;
          var query = {
            appid: appId,
            timestamp:stamp,
            token:token,
            sclasscode:classInfos[j].sCode,
            nlessonno:classInfos[j].nLessonNo
          }
          var option = {
            api:'api/Calendar/OnlineClass',
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
                  resolve(res.data.AppendData);
                }else if(res.data.ResultType == 3){
                  resolve('没有对应的直播课');
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
      })
      newPlayerArr.push(kk)
    }
    Promise.all(newPlayerArr).then(res=>{
      console.log(res)
      that.resultArr = res;
      for(var k = 0 ; k < classInfos.length; k++){
        (function(k){
          newPlayerArr[k].then(data=>{
            // console.log(data)
            if(data != '没有对应的直播课'){
              for(var n = 0 ; n < data.length; n++){
                var reg = /\-/g;
                data[n].BeginTime = data[n].beginTime.replace('T',' ').substr((data[n].beginTime.indexOf('-')+1),11)
                data[n].beginTime = data[n].beginTime.replace('T',' ').replace(reg,'/')
                data[n].endTime = data[n].endTime.replace('T',' ').replace(reg,'/')
                var cha = 15*60*1000;
                // 当前时间小于开课时间15分钟 是未开始 0
                // 当前时间大于开课前十五分钟小于结课时间, 是上课中 1
                // 当前时间大于结课时间  是已下课  2
                if( new Date().getTime() < (new Date(data[n].beginTime) - cha) ){
                  data[n]['status'] = 0;
                }else if(new Date().getTime() > (new Date(data[n].beginTime) - cha) && new Date().getTime() < new Date(data[n].endTime) ){
                  data[n]['status'] = 1;
                }else if(new Date().getTime() > new Date(data[n].endTime) ){
                  data[n]['status'] = 2;
                }
              }
              classInfos[k]['player']  = data;
              that.setData({fatherArr:fatherArr})
              that.setData({classContent:fatherArr[index][classInfo]})
            }else{
              classInfos[k]['player']  = [];
              that.setData({fatherArr:fatherArr})
              that.setData({classContent:fatherArr[index][classInfo]})
            }
            
            //console.log(data)
            //console.log(that.data.classContent)
          })
        })(k)
      }

      callback();
    })
    
  },
  //获取直播课信息
  getlivePlayer: function(sClassCode, nLessonNo){
    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      sclasscode:sClassCode,
      nlessonno:nLessonNo
    }
    var option = {
      api:'api/Calendar/OnlineClass',
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
            // console.log(res)
            if(res.data.ResultType == 0){
              //resolve(res.data.AppendData);
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
  //查看学生
  goPlayStudengPage(e){
    console.log(e.target.dataset)
    var inds = e.target.dataset
    var data = this.data.classContent[inds.fatherindex].player[inds.childindex];
    data.className = this.data.classContent[inds.fatherindex].title
    console.log(data)
    wx.navigateTo({url:'/search/playerStudents/playerStudents?content='+JSON.stringify(data)})
  },
  goRoom(e){
    var inds = e.target.dataset
    var roomId =this.data.classContent[inds.fatherindex].player[inds.childindex].roomId;
    var status =this.data.classContent[inds.fatherindex].player[inds.childindex].status;
    var sclasscode =this.data.classContent[inds.fatherindex].sCode;
    var nlessonno =this.data.classContent[inds.fatherindex].nLessonNo;
    // console.log(this.data.classContent[inds.fatherindex].player)
    // var nlessonno =this.data.classContent[inds.fatherindex].status;
    console.log(this.data.classContent[inds.fatherindex])
    // return;
    wx.navigateTo({url:'/search/playerRoom/playerRoom?roomid='+roomId+'&sclasscode='+sclasscode+'&nlessonno='+nlessonno+'&status='+status})
  },
  onUnload: function(){
    clearInterval(this.timer)
  },
  
})


