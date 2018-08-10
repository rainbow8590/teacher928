
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
    yearArr:app.globalData.yearArr,
    semesterArr: app.globalData.semesterArr,
    kejieArr:[
      {id: 1, value: '请选择'}
    ],
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
    tipKejieIndex: 0, //点击的第几个课节
    show:false, //控制弹窗显示
    arr:[], //公共数组
    inpStr:'',   //公共显示的字符串
    classInn: '',  //显示的班级字符串
    kejieInn: '请选择', //课节字符串
    zoomShow: false,
    isAjaxOver: false,
    hasClass: true
  },
  onReady: function(){
    this.selectPopup = this.selectComponent("#selectPopup");
  },
  onLoad: function(option){
    //根据点击的模块进行不同的操作
    this.parent = option.parent;
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      noAuditing: wx.getStorageSync('noAuditing'),
      //nSemester: this.parent == 'outdoor'? 1:publicJs.flagSemester(),
      nSemester: publicJs.flagSemester(),
      schoolYear: publicJs.flagYear(),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')
    })
    this.setData({
       semester: this.data.nSemester == 4? this.data.semesterArr[0].value:this.data.semesterArr[this.data.nSemester].value,
    })

    wx.setStorageSync('tipClassIndex',this.data.tipClassIndex);
    wx.setStorageSync('tipKejieIndex',this.data.tipKejieIndex);
    
    this.differenceModule();
  },
  onShow:function(){
    this.setData({
      tipClassIndex: wx.getStorageSync('tipClassIndex'),
      tipKejieIndex: wx.getStorageSync('tipKejieIndex'),
    })
    if(wx.getStorageSync('classes')){
      this.setData({classes:wx.getStorageSync('classes')})
    }
    // 区分条件是 用户是第一次进入还是从下级返回的
    // 如果是第一次进入本页面
    if(!this.data.classes.length){
      this.setData({
        kejieInn:this.data.kejieArr[this.data.tipKejieIndex].value
      })
    }else{
      if(this.data.tipKejieIndex == 0){
        this.setData({
          kejieInn:this.data.kejieArr[this.data.tipKejieIndex].value
        })
      }else{
        this.setData({
          kejieInn:this.data.kejieArr[this.data.tipKejieIndex-1].value
        })
      }
      this.setData({
        classInn:this.data.classes[this.data.tipClassIndex].value,
      })
    }
  },
  // 区分父级模块
  differenceModule: function(){
    // 获取进门考的班级
    if(this.parent == 'enterdoor'){
      this.getClassList();
    }else if(this.parent == 'outdoor'){
      this.getOutClassList();
    }
  },
  // 显示弹窗 学年
  getYear: function (e) {
    if(this.parent == 'enterdoor'){
      this.setData({arr: this.data.yearArr,inpStr: e.detail.detail.dataset.id})
    }else if(this.parent == 'outdoor'){
      this.setData({arr: [{id: new Date().getFullYear(), value: new Date().getFullYear()}],inpStr: e.detail.detail.dataset.id})
    }
    
    this.selectPopup.showPopup()
  },
  // 显示弹窗 学期
  getSemester: function (e) {
    if(this.parent == 'enterdoor'){
      this.setData({arr: this.data.semesterArr,inpStr: e.detail.detail.dataset.id})
    }else if(this.parent == 'outdoor'){
      this.setData({arr: this.data.semesterArr,inpStr: e.detail.detail.dataset.id})
      // this.setData({arr: [{id: 2, semester:1,value: '秋季'}],inpStr: e.detail.detail.dataset.id})
    }
    
    this.selectPopup.showPopup()
  },
  // 显示弹窗 班级
  getClass: function (e) {
    this.setData({arr: this.data.classes,inpStr: e.detail.detail.dataset.id})
    this.selectPopup.showPopup()
  },
  // 显示弹窗 班级
  getKejie: function (e) {
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
    if(this.data.kejieInn == '请选择' && this.data.classInn == '您此学期没有课程'){
      publicJs.resultTip('您此学期没有课程');
      return;
    };
    if(this.data.kejieInn == '请选择') {
      publicJs.resultTip('请选择课节');
      return;
    }
    if(this.parent == 'enterdoor'){
      wx.navigateTo({url:'/write/entranceScore/entranceScore?parent=enterdoor'})
    }else if(this.parent == 'outdoor'){
      wx.navigateTo({url:'/write/entranceScore/entranceScore?parent=outdoor'})
    }
    
  },
  // 获取点击的弹窗的id和value值
  getIndex:function(e){
    var inpStr = this.data.inpStr;
    this.setData({show: false})
    if(inpStr == 'year'){
      if(this.data.schoolYear==e.detail.detail.dataset.id) return;
      this.setData({
        schoolYear:e.detail.detail.dataset.id, 
        classInn: this.data.classes[0].value
      })
      this.differenceModule();
      wx.setStorageSync('schoolYear',e.detail.detail.dataset.id);
    }else if(inpStr == 'semester'){
      if(this.data.semester==this.data.arr[e.detail.detail.dataset.id-1].value) return;
      this.setData({
        semester:this.data.arr[e.detail.detail.dataset.id-1].value, 
        nSemester:this.data.arr[e.detail.detail.dataset.id-1].semester, 
        classInn: this.data.classes[0].value,
        tipClassIndex: 0,
      })
      this.differenceModule();
      wx.setStorageSync('semesterIndex',e.detail.detail.dataset.id);
    }else if(inpStr == 'class'){
      if(this.data.classInn==this.data.arr[e.detail.detail.dataset.id].value) return;
      this.setData({
        classInn:this.data.arr[e.detail.detail.dataset.id].value, 
        tipClassIndex:e.detail.detail.dataset.id, 
      })
      // 获取课节数组
      this.data.kejieArr = [{id: 1, value: '请选择'}]
      var lesson = this.data.classInfo[this.data.tipClassIndex].lessonNumber;
      for(var i = 2 ; i <= lesson; i++){
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
        kejieInn:this.data.arr[e.detail.detail.dataset.id-1].value, 
        tipKejieIndex:e.detail.detail.dataset.id, 
      })
      // 缓存选择的课节
      wx.setStorageSync('tipKejieIndex',this.data.tipKejieIndex);
    }
  },
  // 进门考班级列表
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
      api:'api/Class',
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
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            that.setData({isAjaxOver: true});
            // if(resData.length == 0){
            //   that.setData({classes:['您此学期没有课程']});
            // }else{
              classList.classList(that.data.classes,resData,that);
            if(resData.length){

                that.setData({classInn: that.data.classes[0].value})
                wx.setStorageSync('tipClassIndex',0)

                // 获取课节数组
                that.data.kejieArr = [{id: 1, value: '请选择'}]
    
                var lesson = that.data.classInfo[that.data.tipClassIndex].lessonNumber;
                for(var i = 2 ; i <= lesson; i++){
                  that.data.kejieArr.push({id: i, value: i});
                }

                // 判断课节是否存在
                var flagArr = [];
                for(var i = 0; i < that.data.kejieArr.length; i++){
                  if(that.data.kejieInn == that.data.kejieArr[i].value){
                    flagArr.push(0)
                  }else{
                    flagArr.push(1)
                  }
                }
                if(flagArr.indexOf(0)!= -1){
                  that.setData({kejieInn: that.data.kejieArr[flagArr.indexOf(0)].value});
                }else{
                  that.setData({kejieInn: that.data.kejieArr[0].value});
                }
                
                that.setData({kejieArr: that.data.kejieArr});
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
  // 出门考班级列表
  getOutClassList: function(){
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
      api:'api/Class',
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
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            that.setData({isAjaxOver: true});
            // if(resData.length == 0){
            //   that.setData({classes:['您此学期没有课程']});
            // }else{
              classList.classList(that.data.classes,resData,that);
            if(resData.length){

                that.setData({classInn: that.data.classes[0].value})
                wx.setStorageSync('tipClassIndex',0)

                // 获取课节数组
                that.data.kejieArr = [{id: 1, value: '请选择'}]
    
                var lesson = that.data.classInfo[that.data.tipClassIndex].lessonNumber;
                for(var i = 2 ; i <= lesson; i++){
                  that.data.kejieArr.push({id: i, value: i});
                }

                // 判断课节是否存在
                var flagArr = [];
                for(var i = 0; i < that.data.kejieArr.length; i++){
                  if(that.data.kejieInn == that.data.kejieArr[i].value){
                    flagArr.push(0)
                  }else{
                    flagArr.push(1)
                  }
                }
                if(flagArr.indexOf(0)!= -1){
                  that.setData({kejieInn: that.data.kejieArr[flagArr.indexOf(0)].value});
                }else{
                  that.setData({kejieInn: that.data.kejieArr[0].value});
                }
                
                that.setData({kejieArr: that.data.kejieArr});
            }else{
              that.setData({hasClass: false})
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
