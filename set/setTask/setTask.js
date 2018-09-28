//index.js
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
// var check = require('../../utils/check.js');

//获取应用实例
var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;

// 日期弹层的设置
const date = new Date()
const years = [];
const months = [];
const days = [];
const hours = [];
const mins = [];

for (let i = 2017; i <= date.getFullYear()+1; i++) {
  years.push(""+i)
}

for (let i = 1 ; i <= 12; i++) {
  if(i < 10){
    i =  '0' + i;
  }
  months.push(""+i)
}

for (let i = 1 ; i <= 31; i++) {
  if(i < 10){
    i =  '0' + i;
  }
  days.push(""+i)
}

for (let i = 0 ; i <= 23; i++) {
  if(i < 10){
    i =  '0' + i;
  }
  hours.push(""+i)
}

for (let i = 0 ; i <= 59; i++) {
  if(i < 10){
    i =  '0' + i;
  }
  mins.push(""+i)
}


Page({
  data: {
    kejieArr:[
      {id: 1, value: '第1讲'}
    ],
    taskArr:[],//从后台获取的任务卡数组
    newTaskArr:[], //新增加的任务卡数组
    classInfo: [], //班级信息数组
    classes:[],
    teacherName:'',
    schoolYear: new Date().getFullYear(),
    semester:'秋季',
    showModalStatus: false,
    isopen:'open',
    show:false, //控制弹窗的显示
    tipKejieIndex: 2, //第几讲
    arr: [],//公共数组
    inpStr:'',//公共字符串
    classInn:'',
    kejieInn:'第2讲',
    month:'',//截止日
    clock:'',//截止日
    classStr: '',//选择的班级信息
    classCode:'',
    kejieIndex:0,
    endTime:'',
    showTime: false, //是否显示截止时间
    taskTemplateArr:[],// 获取到的模板任务
    addTaskTemplateArr:[],//添加的模板任务
    AllTemplateArr:[],//所有模板任务
    status: 0, //课节获取任务卡的状态值
    zoomShow: false,
    isAjaxOver: false,

    // 日期的数据
    years: years,
    year: date.getFullYear(),
    months: months,
    month1: 2,
    days: days,
    day: 2,
    hours: hours,
    hour: 9,
    mins: mins,
    min: 16,
    showPicker: false,
    value:[]
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
  },
  // 改变日期
  bindChange: function(e) {

    const val = e.detail.value
    this.setData({
      year: this.data.years[val[0]],
      month1: this.data.months[val[1]],
      day: this.data.days[val[2]],
      hour:this.data.hours[val[3]],
      min: this.data.mins[val[4]],
      value:[val[0],val[1],val[2],val[3],val[4]],
      
    })
    this.setData({
      endTime:this.data.year+'-'+this.data.month1+'-'+this.data.day+' '+this.data.hour+':'+this.data.min+':00'
    })
    // console.log(this.data.identity)
  },

  showPicker: function(){
    this.setData({showPicker: true})
  },
  closePickerFloat: function(e){
    // console.log(e)
    if(e.target.dataset.id !== "pickerFloat" && e.target.dataset.id !== "write" ){
      this.setData({showPicker: false})
    }
  },
  onLoad: function(){
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      tipClassIndex: wx.getStorageSync('tipClassIndex'),
      tipKejieIndex: wx.getStorageSync('tipKejieIndex'),
      semesterIndex: wx.getStorageSync('semesterIndex'),
      schoolYear: wx.getStorageSync('schoolYear'),
      classInfo: wx.getStorageSync('classInfo'),
      kind: wx.getStorageSync('kind'),
      identity: wx.getStorageSync('identity')
    })

     //设置年份
    // this.setData({
    //   yearArr:[
    //     {id: new Date().getFullYear() - 1 , value: new Date().getFullYear() - 1 },
    //     {id: new Date().getFullYear(), value: new Date().getFullYear()},
    //   ]
    // })

    // 设置班级编号及课节
    this.setData({
      classCode:this.data.classInfo[this.data.tipClassIndex].classCode,
    })
    //组装班级id和名称
    var classInfo = this.data.classInfo;
    // console.log(classInfo)
    // 设置班级
    var choiceClass = this.data.classInfo[this.data.tipClassIndex]
    this.setData({classStr:choiceClass.classCode + choiceClass.sClassName})

    for(var i = 0 ; i < classInfo.length; i++){
      this.data.classes.push({id:i,value:classInfo[i].grade})
    }
    this.setData({classes: this.data.classes})
    this.setData({classInn:this.data.classes[this.data.tipClassIndex].value})
    wx.setStorageSync('classes', this.data.classes)

    //设置课节
    this.data.kejieArr = [{id:0,value:'布置任务模板'}];
    for(var j = 1; j <= classInfo[this.data.tipClassIndex].lessonNumber;j++){
      this.data.kejieArr.push({id: j, value: '第'+ j +'讲'})
    }
    // 删除‘请选择’项
    // this.data.kejieArr.shift();
    this.setData({kejieArr: this.data.kejieArr})

    // 布置模板项的显示
    if(this.data.tipKejieIndex == 0){
      this.setData({showTime: false})
      this.getTaskTemplate();
      this.setData({tipKejieIndex: 0})
      this.setData({kejieInn:'布置任务模板'})
    }else{
      this.setData({showTime: true})
      this.setData({kejieInn:this.data.kejieArr[this.data.tipKejieIndex].value})
      this.getEndTime();
      this.getTask();
    }

    // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({resultH: that.data.windowHeight - 90-52-32-109-30})
    });
   /* // 手机宽高
    wx.getSystemInfo({
      success: function(res) {
        that.setData({windowHeight: res.windowHeight})
        that.setData({windowWidth: res.windowWidth})
        that.setData({resultH: res.windowHeight - 90-52-32-109-30})
      }
    });*/
  },
  onShow: function(){
    // 获取缓存的值
    var tipClassIndex = wx.getStorageSync('tipClassIndex')
    var tipKejieIndex = wx.getStorageSync('tipKejieIndex')
    // 如果获取的缓存值和data里的值不相等，那么在下级页面中改变了值，就要进行重新请求数据
    if(this.data.tipClassIndex != tipClassIndex || this.data.tipKejieIndex != tipKejieIndex){
      this.setData({
        tipClassIndex: tipClassIndex,
        tipKejieIndex: tipKejieIndex
      })
      this.setData({classInn:this.data.classes[tipClassIndex].value})
      this.setData({kejieInn:this.data.kejieArr[tipKejieIndex].value})
      this.getEndTime();
      this.getTask();
    }
  },
  // 拼接时间
  getTime: function(){
    // 处理输入的时间
    var reg = /[\u4e00-\u9fa5]/;
    var monthArr = this.data.month.split(reg);
    monthArr.pop()
    for(var i = 0 ; i < monthArr.length; i++){
      if(monthArr[i].length == 1 && monthArr[i] < 10){
        monthArr[i] = '0' +monthArr[i]
      }
    }
    var fullyear = this.data.yearStr;
    var times = monthArr.join('-') + ' ' + this.data.clock+':00';
    wx.setStorageSync('futureTime',times)
    this.setData({
      endTime:times
    })
  },

  // 显示弹窗 学年
  getClass: function (e) {
    this.setData({arr: this.data.classes,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  // 显示弹窗 学期
  getKejie: function (e) {
    // console.log(e)
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
      if(this.data.classInn==this.data.arr[e.detail.detail.dataset.id].value) return;
      if(this.data.tipKejieIndex== 0){
        this.setData({ showTime: false })
      }else{
        this.setData({ showTime: true })
      }
      this.setData({
        classInn:this.data.arr[e.detail.detail.dataset.id].value, 
        tipClassIndex:e.detail.detail.dataset.id, 
        show: false,
      })
      
      this.setData({
        classCode:this.data.classInfo[this.data.tipClassIndex].classCode
      })

      // 设置班级
      var choiceClass = this.data.classInfo[this.data.tipClassIndex]
      this.setData({classStr:choiceClass.classCode + choiceClass.sClassName})

      // 重新渲染课节
      this.data.kejieArr = [{id:0,value:'布置任务模板'}];
      var lesson = this.data.classInfo[this.data.tipClassIndex].lessonNumber;
      for(var i = 1 ; i <= lesson; i++){
        this.data.kejieArr.push({id: i, value: '第'+i+'讲'});
      }

      //判断课节是否存在
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

      if(this.data.tipKejieIndex== 0){
        this.getTaskTemplate();
      }else{
        this.getTask();
        this.getEndTime();
      }
      // 缓存选择的班级信息的编号
      wx.setStorageSync('tipClassIndex',this.data.tipClassIndex);

    }else if(inpStr == 'kejie'){  //课节
      if(e.detail.detail.dataset.id == 0){ //选择了布置任务模板
        if(this.data.kejieInn=='布置任务模板') return;
        this.setData({showTime: false})
        this.setData({tipKejieIndex: 0})
        this.setData({kejieInn:'布置任务模板'})
        this.getTaskTemplate();
      }else{
        if(this.data.kejieInn==this.data.arr[e.detail.detail.dataset.id].value) return;
        this.setData({
          kejieInn:this.data.arr[e.detail.detail.dataset.id].value, 
          tipKejieIndex:e.detail.detail.dataset.id, 
          showTime: true
        })
        this.setData({
          kejieIndex:this.data.tipKejieIndex
        })
       this.getTask();
       this.getEndTime();
      }
      // 缓存选择的班级信息的编号
      wx.setStorageSync('tipKejieIndex',e.detail.detail.dataset.id);

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

  // 获取截止时间
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
    requests.request(option, function(res){
      getRes(res);
    })
    function getRes(res){
      if(res.data.ResultType == 0){
        wx.hideLoading()
        var arr = res.data.AppendData;
        var dates = arr.Date.substr(0,arr.Date.indexOf(' '));
        var times = arr.Time.substr(0,arr.Time.lastIndexOf(':'))
        var datesStr = '';
        var datesArr = dates.split('/');
        var timesArr = times.split(':');
        if(datesArr[1]<10){
          datesArr[1] = '0'+datesArr[1];
        }


        that.setData({
          year: years[years.indexOf(datesArr[0])],
          month1: months[months.indexOf(datesArr[1])],
          day: days[days.indexOf( Number(datesArr[2])< 10? "0"+Number(datesArr[2]) : datesArr[2] )],
          hour:hours[hours.indexOf(timesArr[0])],
          min: mins[mins.indexOf(timesArr[1])],
          value:[
            years.indexOf(datesArr[0]),
            months.indexOf(datesArr[1]),
            days.indexOf(Number(datesArr[2])< 10? "0"+Number(datesArr[2]) : datesArr[2] ),
            hours.indexOf(timesArr[0]),
            mins.indexOf(timesArr[1])
          ]
        })

        // 表单提交的时间
        that.setData({
          endTime:that.data.year+'-'+that.data.month1+'-'+that.data.day+' '+that.data.hour+':'+that.data.min+':00'
        })
      }
    }
    
  },


  /*===== 模板任务卡 =====*/
  // 获取模板
  getTaskTemplate: function(){
    var that = this;
    // 时间戳
    var stamp = new Date().getTime();
    // 班级编号
    var classCode = this.data.classInfo[this.data.tipClassIndex].classCode;
    // 教师token
    var token = this.data.teacherToken;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      sclasscode:classCode,
    }
    var option = {
      api:'api/PunchTemplate',
      query: query,
      type: 'get',
    }
    wx.showLoading({
      title:'努力加载中...',
      success: function(){
        requests.request(option, function(res){
          getRes(res)
        })
        function getRes(res){
           var AllTemplateArr = [];
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            for(var i = 0; i < resData.length; i++){
              AllTemplateArr.push({
                id: resData[i].ID,
                task: resData[i].Name,
                classCode: resData[i].ClassCode,
                dateTime: resData[i].DateTime,
                isDelete:false,
                foucs: false
              })
            }
            that.setData({AllTemplateArr:AllTemplateArr,isAjaxOver:true})
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
  // 保存模板
  postTaskTemplate: function(e){
    console.log(e)
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var datas = e.detail.value;

    var arr = [];
    var arr1 = [];
    for(var k in datas){
     var str = k + '=' + datas[ k ]
      arr.push(str);
    }
    for(var i = 0 ; i < arr.length; i+=3){
      arr1.push({
        "sClassCode": arr[i].substr(arr[i].indexOf('=')+1),
        "ID": arr[i+1].substr(arr[i+1].indexOf('=')+1) == ""? null:arr[i+1].substr(arr[i+1].indexOf('=')+1),
        "sName": arr[i+2].substr(arr[i+2].indexOf('=')+1)
      })
    }
    console.log(arr1)
    // 去除空任务卡
    for(var i = 0 ; i < arr1.length; i++){
      if(arr1[i].sName == ''){
        arr1.splice(i,1)
      }
    }
    
    var reg=/\+/g;
    console.log(arr1)
    for(var i = 0 ; i < arr1.length; i++){
      var cur = arr1[i].sName;
      if(reg.test(cur)){
        publicJs.resultTip('任务名称不能含"+"号')

        return;
      }
    }
    var query = {
      appid: appId,
      timestamp: stamp,
      token:token
    }
    var option = {
      api:'api/PunchTemplate',
      query: query,
      type: 'post',
      data: arr1
    }

    wx.showLoading({
      title:'保存中',
      success: function(){
        requests.request(option, function(res){
          
          getRes(res)
        })
        function getRes(res){
          // console.log(res)
          setTimeout(()=>{
            wx.hideLoading();
          },500)
          var resData = res.data;
          // var resD = JSON.parse(res.data)
          if(resData.ResultType == 0){
            
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000,
              success: function(){
                console.log('保存成功')
                setTimeout(()=>{
                  wx.navigateBack({
                        delta: 1
                      })
                },1000)
                
                // wx.redirectTo({url:'/pages/taskCard/taskCard?tipClassIndex='+that.data.tipClassIndex})
              }
            })
          }
          
        }
      }
    })
    
  },
  // 添加模板任务
  addTaskTemplate: function(){
    if(this.data.AllTemplateArr.length >=7){
      publicJs.resultTip('最多建立7个任务卡')

      return;
    }
    if(this.data.newTaskArr.length && this.data.AllTemplateArr[this.data.AllTemplateArr.length-1].task == ""){
      this.data.AllTemplateArr[this.data.AllTemplateArr.length-1].focus = true;
      this.setData({AllTemplateArr: this.data.AllTemplateArr})
      return;
    }

    this.data.AllTemplateArr.push({
      id: null,
      task: '',
      focus:true,
      classCode: this.data.classInfo[this.data.tipClassIndex].classCode,
      isDelete:true
    })
    this.setData({
      AllTemplateArr:this.data.AllTemplateArr
    })
  },
  // 模板获取值
  templateGetInpVal1:function(e){
    var id = Number(e.target.dataset.index);
    if(e.detail.value == ''){
      publicJs.resultTip('任务名称不能为空')

      this.data.AllTemplateArr[id].focus = true;
      return;
    }
    this.data.AllTemplateArr[id].task = e.detail.value
    this.data.AllTemplateArr[id].focus = false
    this.setData({

      AllTemplateArr:this.data.AllTemplateArr
    })
  },
  // 选择或删除模板任务
  checkRadio:function(e){
    var ids = e.currentTarget.dataset.id;
    var AllTemplateArr = this.data.AllTemplateArr;
    AllTemplateArr.splice(ids,1)
    this.setData({AllTemplateArr:this.data.AllTemplateArr})
  },



  /*====  课节任务卡   =====*/
  // 选择或删除任务
  checkRadio1:function(e){
    var ids = e.currentTarget.dataset.id;
    var newTaskArr = this.data.newTaskArr;
    newTaskArr.splice(ids,1)
    this.setData({newTaskArr:this.data.newTaskArr})
  },
  // 选择或删除任务 根据status来确定
  checkRadio2:function(e){
    var status = this.data.status;
    var ids = e.currentTarget.dataset.id;
    var taskArr = this.data.taskArr;
    if(status == 1 || status == 0){
      // 获取的是默认值或模板任务卡时可以删，否则不能删
      taskArr.splice(ids,1)
      this.setData({taskArr:this.data.taskArr})
    }
  },
  // 添加任务
  addTask:function(){
    if(this.data.taskArr.length + this.data.newTaskArr.length >=7){
      publicJs.resultTip('最多建立7个任务卡')
      
      return;
    }

    if(this.data.newTaskArr.length && this.data.newTaskArr[this.data.newTaskArr.length-1].task == ""){
      this.data.newTaskArr[this.data.newTaskArr.length-1].focus = true;
      this.setData({newTaskArr: this.data.newTaskArr})
      return;
    }
    this.data.newTaskArr.push({
      focus: true,
      task:'',
      sCode:null,
    })
    this.setData({newTaskArr: this.data.newTaskArr})
   
  },
  // 课节获取值
  getInpVal1:function(e){
    var id = Number(e.target.dataset.index);
    if(e.detail.value == ''){
      publicJs.resultTip('任务名称不能为空')
      
      return;
    }
    this.data.taskArr[id].task = e.detail.value
    this.data.taskArr[id].focus = false;
    this.setData({taskArr: this.data.taskArr})
  },
  // 课节获取值
  getInpVal2:function(e){
    var id = Number(e.target.dataset.index);
    if(e.detail.value == ''){
      publicJs.resultTip('任务名称不能为空')
     
      return;
    }
    this.data.newTaskArr[id].task = e.detail.value
    this.data.newTaskArr[id].focus = false;
    this.setData({newTaskArr: this.data.newTaskArr})

  },
  // 获取课节任务卡
  getTask: function(){
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
      sclasscode:classCode
    }
    var option = {
      api:'api/PunchTemplateOperation',
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
            that.setData({newTaskArr:[],taskArr:[]})
            var arr = res.data.AppendData.PunchInitiItems;
            // 设置获取的任务卡状态值
            that.setData({status: res.data.AppendData.nTaskType})
            // 处理任务卡数组
            var newA = [];
            for(var i = 0 ; i < arr.length; i++){
              var json = {task:'',code:""}
              json['task'] =  arr[i].sName;
              json['code'] =  arr[i].sCode;
              newA.push(json)
            }
            that.setData({taskArr: newA,isAjaxOver: true})
          }else if(res.data.ResultType == 7){
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
            
          }
          setTimeout(()=>{
            wx.hideLoading();
          },500)
        }
      }
    })
    
  },
  // 保存课节任务卡
  postTask:function(e){
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var studentSize = this.data.classInfo[this.data.tipClassIndex].studentNumber;
    var ClassCode = this.data.classInfo[this.data.tipClassIndex].classCode;
    var datas = e.detail.value;
    var arr = [];
    var arr1 = [];
    for(var k in datas){
     var str = k + '=' + datas[ k ]
      arr.push(str);
    }
    if(arr.length == 0){
      publicJs.resultTip('最少设置一个任务卡')
  
      return;
    }

    for(var i = 0 ; i < arr.length; i+=5){
      arr1.push({
        "sClassCode": arr[i].substr(arr[i].indexOf('=')+1),
        "nLessonNo": arr[i+1].substr(arr[i+1].indexOf('=')+1),
        "dtEndDate": arr[i+2].substr(arr[i+2].indexOf('=')+1),
        "sItemName": arr[i+3].substr(arr[i+3].indexOf('=')+1),
        "sCode": arr[i+4].substr(arr[i+4].indexOf('=')+1) == ''? null: arr[i+4].substr(arr[i+4].indexOf('=')+1),
      })
    }

    var query = {
      appid:appId,
      timestamp:stamp,
      token:token
    }
    var option = {
      api:'api/PunchTask',
      query: query,
      type: 'post',
      data: arr1
    }

    wx.showLoading({
      title:'保存中',
      success: function(){
        requests.request(option,function(res){
          getRes(res);
        })
        function getRes(res){
          var resData = res.data;
          // var resD = JSON.parse(res.data)
          if(resData.ResultType == 0){
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000,
              success: function(){
                wx.navigateTo({url:'/set/taskProgress/taskProgress?page=setTask'})
              }
            });
          }
          setTimeout(()=>{
            wx.hideLoading();
          },500)
        }
      }
    })
    
  },

})
