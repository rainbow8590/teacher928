
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
      {id:0,txt:'录入',classname:'icon-writeactive',changeTextColor:'#1FBB1C',isChange: true},
      {id:1,txt:'查询',classname:'icon-search',changeTextColor:'#888',isChange: false},
      {id:2,txt:'任务',classname:'icon-tasking',changeTextColor:'#888',isChange: false},
      {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888',isChange: false},
    ],
    kejieArr:[
      {id: 2, value: '第2讲'}
    ],
    classInfo:[],
    classes: [],
    teacherName:'',
    // schoolYear: new Date().getFullYear(),
    semester:'秋季',
    showModalStatus: false,
    isopen:'open',
    show:false, //控制弹窗的显示
    show1:false, //控制转发弹窗的显示

    tipKejieIndex: 0, //第几讲
    arr: [],//公共数组
    inpStr:'',//公共字符串
    classInn:'',
    kejieInn:'第2讲',
    studentsList: [],//学生信息集合
    resultH: 400, //表体的高度,
    classStr: '',//选择的班级信息
    zoomShow: false,
    isAjaxOver: true
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(option){

    this.parent = option.parent;
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      tipClassIndex: wx.getStorageSync('tipClassIndex'),
      tipKejieIndex: wx.getStorageSync('tipKejieIndex'),
      semesterIndex: wx.getStorageSync('semesterIndex'),
      year: wx.getStorageSync('year'),
      classInfo: wx.getStorageSync('classInfo'),
      noAuditing: wx.getStorageSync('noAuditing'),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity'),
      parentTarget: option.parent
    })

    if(this.parent == 'enterdoor'){
      wx.setNavigationBarTitle({
        title: '进门考--成绩录入'
      })
    }else{
      wx.setNavigationBarTitle({
        title: '出门考--成绩录入'
      })
    }

    // console.log(this.data.classInfo)

    if(this.parent == 'outdoor'){
      this.setData({nClassTypeCode: this.data.classInfo[this.data.tipClassIndex].nClassTypeCode})
    }
    console.log(this.data.tipClassIndex)
    // 设置班级
    var choiceClass = this.data.classInfo[this.data.tipClassIndex]
    this.setData({classStr:choiceClass.classCode + choiceClass.sClassName, kemu:choiceClass.kemu})
    // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      if(that.data.parentTarget == 'enterdoor'){
         that.setData({resultH: that.data.windowHeight -45 - 42 - 14 -40-45-15-15 -56}) 
      }else{
        that.setData({resultH: that.data.windowHeight -45 - 42 - 14 -40 - 56}) 
      }
    });


    var classInfo = this.data.classInfo
    for(var i = 0 ; i < classInfo.length; i++){
      this.data.classes.push({id:i,value:classInfo[i].grade})
    }
    this.setData({classes: this.data.classes,classInn:this.data.classes[this.data.tipClassIndex].value})
    wx.setStorageSync('classes', this.data.classes)


    var lesson = classInfo[this.data.tipClassIndex].lessonNumber;
    // if(this.parent == 'enterdoor'){
    //   this.setData({kejieArr:[{id: 2, value: '第2讲'}]})
    //   for(var i = 2 ; i <= lesson; i++){
    //     this.data.kejieArr.push({id: i, value: '第'+i+'讲'});
    //   }
    //   this.setData({kejieArr: this.data.kejieArr});
    //   // this.data.kejieArr.splice(0,1);
    //   this.setData({kejieArr: this.data.kejieArr});
    // }else{
    //   this.setData({kejieArr:[{id: 1, value: '第1讲'}]})
    //   for(var i = 1 ; i <= lesson; i++){
    //     this.data.kejieArr.push({id: i, value: '第'+i+'讲'});
    //   }
    //   this.setData({kejieArr: this.data.kejieArr});

    //   this.setData({kejieArr: this.data.kejieArr});
    //   console.log(this.data.kejieArr)
    // }

      if(this.parent == 'enterdoor'){
        this.data.kejieArr = [{id: 1, value: '请选择'}];
        for(var i = 2 ; i <= lesson; i++){
          this.data.kejieArr.push({id: i, value: '第'+i+'讲'});
        }
      }else{
        this.data.kejieArr = [{id: 0, value: '请选择'}];
        for(var i = 1 ; i <= lesson; i++){
          this.data.kejieArr.push({id: i, value: '第'+i+'讲'});
        }
      }

      this.setData({kejieArr: this.data.kejieArr});

      this.data.kejieArr.shift();
      this.setData({kejieArr: this.data.kejieArr});
        
      if(this.parent == 'outdoor'){
        // 数学科目不要第7和第15讲
        if(this.data.classInfo[this.data.tipClassIndex].sDeptName.indexOf('小学数学') != -1){
            this.editKejie(this, 6 ,14)
            this.setData({kejieInn:'第'+this.data.tipKejieIndex+'讲'})
          }else{
            this.setData({kejieArr: this.data.kejieArr,kejieInn:this.data.kejieArr[this.data.tipKejieIndex-1].value})
          }
          
      }else{
        this.setData({kejieArr: this.data.kejieArr,kejieInn:this.data.kejieArr[this.data.tipKejieIndex-2].value})
      }
      
    


    if(this.parent == 'enterdoor'){
      this.getScore();
    }else{
      this.getOutStudentList()
    }
  },
  editKejie:function(obj, num1, num2){
    // obj.data.kejieArr.splice(num1,1)
    obj.data.kejieArr.splice(num2,1)
    var newKejie = [];
    console.log(obj.data.kejieArr)
    for(var j = 1; j <= obj.data.kejieArr.length;j++){
       newKejie.push({id: j,value:obj.data.kejieArr[j-1].value})
    }
    obj.setData({kejieArr: newKejie});
  },
  onShow: function(){
    if(wx.getStorageSync('isSubmit')){
      this.getOutStudentList()
    }
  },
  getClass: function (e) {
    // console.log(e.detail.detail)
    if(this.data.isAjaxOver){
      this.setData({arr: this.data.classes,inpStr: e.detail.detail})
      this.selectPopup.showPopup()
    }
  },
  getKejie: function (e) {
    console.log(e)
    console.log('detail='+ e.detail.detail)
    if(this.data.isAjaxOver){
      this.setData({arr: this.data.kejieArr,inpStr: e.detail.detail})
      this.selectPopup.showPopup()
    }
    
  },
  changeValue(e){
    this.data.studentsList[e.target.dataset.index].Score = Number(e.detail.value);
    this.setData({studentsList: this.data.studentsList})
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
      // if(this.data.classInn == this.data.arr[e.detail.detail.dataset.id].value) return;
      this.setData({
        classInn:this.data.arr[e.detail.detail.dataset.id].value, 
        tipClassIndex:e.detail.detail.dataset.id, 
      })
      // 设置班级
      var choiceClass = this.data.classInfo[this.data.tipClassIndex]
      this.setData({classStr:choiceClass.classCode + choiceClass.sClassName, kemu:choiceClass.kemu})

      if(this.parent == 'enterdoor'){
        this.getScore();
      }else{
        this.setData({nClassTypeCode: this.data.classInfo[this.data.tipClassIndex].nClassTypeCode})
        this.getOutStudentList()
      }

        var lesson = this.data.classInfo[this.data.tipClassIndex].lessonNumber;
      if(this.parent == 'enterdoor'){
        this.data.kejieArr = [{id: 1, value: '请选择'}];
        for(var i = 2 ; i <= lesson; i++){
          this.data.kejieArr.push({id: i, value: '第'+i+'讲'});
        }
      }else{
        this.data.kejieArr = [{id: 0, value: '请选择'}];
        for(var i = 1 ; i <= lesson; i++){
          this.data.kejieArr.push({id: i, value: '第'+i+'讲'});
        }
      }
      
      this.setData({kejieArr: this.data.kejieArr});
      this.data.kejieArr.shift();
      this.setData({kejieArr: this.data.kejieArr});
        
      if(this.parent == 'outdoor'){
        // 数学科目不要第7和第15讲
        if(this.data.classInfo[this.data.tipClassIndex].sDeptName.indexOf('小学数学') != -1){
            this.editKejie(this, 6 ,14)
            this.setData({kejieInn:'第'+this.data.tipKejieIndex+'讲'})
          }else{
            this.setData({kejieArr: this.data.kejieArr,kejieInn:this.data.kejieArr[this.data.tipKejieIndex-1].value})
          }
          
      }else{
        this.setData({kejieArr: this.data.kejieArr,kejieInn:this.data.kejieArr[this.data.tipKejieIndex-2].value})
      }
      
    
    

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
    }else if(inpStr == 'kejie'){  //课节

      
      /*
      this.setData({
        // kejieInn:this.data.arr[e.detail.detail.dataset.id-2].value, 
        // tipKejieIndex:e.detail.detail.dataset.id, 
        kejieInn:this.data.arr[e.detail.detail.dataset.id-2].value, 
        tipKejieIndex:this.data.arr[e.detail.detail.dataset.id].value.replace('第','').replace('讲',''), 
      })
 */
      if(this.parent == 'outdoor'){
        if(this.data.kejieInn == this.data.arr[e.detail.detail.dataset.id-1].value) return;
        if(this.data.classInfo[this.data.tipClassIndex].sDeptName.indexOf('小学数学') != -1){
            this.setData({
              kejieInn:this.data.arr[e.detail.detail.dataset.id-1].value, 
              tipKejieIndex:this.data.arr[e.detail.detail.dataset.id-1].value.replace('第','').replace('讲',''), 
            })
        }else{
          this.setData({
          kejieInn:this.data.arr[e.detail.detail.dataset.id-1].value, 
          tipKejieIndex:this.data.arr[e.detail.detail.dataset.id-1].value.replace('第','').replace('讲',''), 
        })
        }
        
      }else{
        if(this.data.kejieInn == this.data.arr[e.detail.detail.dataset.id-2].value) return;
        this.setData({
          kejieInn:this.data.arr[e.detail.detail.dataset.id-2].value, 
          tipKejieIndex:this.data.arr[e.detail.detail.dataset.id-2].value.replace('第','').replace('讲',''), 
        })
      }

      if(this.parent == 'enterdoor'){
        this.getScore();
      }else{
        this.getOutStudentList();
      }
      
      // 缓存选择的课节
      wx.setStorageSync('tipKejieIndex',this.data.tipKejieIndex);
    }
  },

  // 菜单按钮
  powerDrawer: function (e) {
    console.log(121212)
    publicJs.powerDrawer(e,this)
  },
  // 关闭导航
  closeNav: function(e){
    publicJs.closeNav(e,this)
  },

  // 验证分数
  checkScore: function(e){
    var score = Number(e.detail.value);
    var reg = /^\d+(\.\d{1})?$/
    if(score >100){
      this.setData({isFocus: false})
      publicJs.resultTip('分数必须小于等于100')
      return;
    }else if(!reg.test(score)){
      this.setData({isFocus: false})
      publicJs.resultTip('只能保留一位小数')
      return;
    }
  },
  // 获取学生姓名分数
  getScore: function(){
    if(this.data.isAjaxOver==false) return;
    this.data.isAjaxOver = false
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var ClassCode = this.data.classInfo[this.data.tipClassIndex].classCode;
    var studentNum = this.data.classInfo[this.data.tipClassIndex].studentNumber;
    var lessonNum = this.data.tipKejieIndex ;

    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nlessonno:lessonNum,
      pageindex:1,
      pagesize:100,
      sclasscode:ClassCode,
    }
  
    var option = {
      api:'api/JinMenKao',
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
          var resData = res.data;
          if(resData.ResultType == 0){
            that.data.studentsList = [];
            var studentInfos = resData.AppendData;
            if(!studentInfos.length){
              that.setData({studentsList:that.data.studentsList ,isAjaxOver: true})
            }else{

              for(var i = 0 ; i < studentInfos.length; i++){
                var student = studentInfos[i]
                that.data.studentsList.push({
                  sStudentCode: student.sStudentCode,
                  sClassCode: student.sClassCode,
                  sName: student.sStudentName,
                  sCardCode: student.sCardCode,
                  nLessonNo: student.nLessonNo,
                  ScoreType: student.ScoreType,
                  Score: student.Score,
                  changeLessonState:student.changeLessonState,
                  tipText:student.changeLessonState == '调出'?'调出不可录':'满分100分',
                  disable:student.changeLessonState == '调出'? true :false
                })
              }
              for(var i = 0 ; i < that.data.studentsList.length; i++){
                var curS = that.data.studentsList[i];
                (function(i){
                  if(curS.changeLessonState == '正常' || curS.changeLessonState == '调入' || curS.changeLessonState == '转入' ){
                    that.setData({tipText: "满分100分"})
                  }else if(curS.changeLessonState == '调出'){
                    that.setData({tipText: "调出不可录"})
                  }
                })(i);
              }
              that.setData({studentsList:that.data.studentsList ,isAjaxOver: true})
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
  // 储存学生分数
  saveScore: function(e){
    var that = this;
    var token = this.data.teacherToken; // token值
    var nxuebu = this.data.nXueBu;   //学部信息
    var stamp = new Date().getTime();  //时间戳
    var studentSize = this.data.classInfo[this.data.tipClassIndex].studentNumber;
    var ClassCode = this.data.classInfo[this.data.tipClassIndex].classCode;
    var datas = e.detail.value;

    console.log(this.data.studentsList)
   
    /*var arr = [];
    var arr1 = [];
    for(var k in datas){
     var str = k + '=' + datas[ k ]
      arr.push(str);
    }
    console.log(datas)
    for(var i = 0 ; i < arr.length; i+=6){
      arr1.push({
        "sClassCode": arr[i].substr(arr[i].indexOf('=')+1),
        "nLessonNo": Number(arr[i+1].substr(arr[i+1].indexOf('=')+1)),
        "sCardCode": arr[i+2].substr(arr[i+2].indexOf('=')+1) == "" ? null : arr[i+2].substr(arr[i+2].indexOf('=')+1),
        "sStudentCode": arr[i+3].substr(arr[i+3].indexOf('=')+1),
        "ScoreType": Number(arr[i+4].substr(arr[i+4].indexOf('=')+1)),
        "Score": Number(arr[i+5].substr(arr[i+5].indexOf('=')+1)),
      })
    }
    var arr2 = [];
    for(var i = 0; i < arr1.length; i++){
      if(arr1[i].Score !=0){
        console.log(arr1[i].Score)
        arr2.push(arr1[i])
      }
    }
 */
    var arr2 = [];
    for(var i = 0; i < this.data.studentsList.length; i++){
      if(this.data.studentsList[i].Score !=0 && this.data.studentsList[i].Score != null){
        // console.log(arr1[i].Score)
        arr2.push(this.data.studentsList[i])
      }
    }
    if(!arr2.length){
      publicJs.resultTip('没有要保存的数据')
      return;
    }


    var query = {
      appid: appId,
      timestamp: stamp,
      token: token
    }
    var option = {
      api: 'api/JinMenKao',
      query: query,
      type: 'post',
      data: arr2
    }
    wx.showLoading({
      title:'保存中',
      success: function(){
        requests.request(option, function(res){
          saveRes(res);
        })
        function saveRes(res){
          var resData = res.data;
          // var resD = JSON.parse(res.data)
          if(resData.ResultType == 0){
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
            setTimeout(()=>{
              wx.navigateBack({ delta: 1 })
            },1000)
          }else if(resData.ResultType == 7){
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
  // 获取出门考的学生列表及状态
  getOutStudentList: function(){
    if(this.data.isAjaxOver==false) return;
    this.data.isAjaxOver = false
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var ClassCode = this.data.classInfo[this.data.tipClassIndex].classCode;
    var studentNum = this.data.classInfo[this.data.tipClassIndex].studentNumber;
    var lessonNum = this.data.tipKejieIndex;

    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nlessonno:lessonNum,
      pageindex:1,
      pagesize:100,
      sclasscode:ClassCode,
    }
  
    var option = {
      api:'api/LessonEndPaper/GetLessonEndPaperClassStudent',
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
          var resData = res.data;
          if(resData.ResultType == 0){
            that.data.studentsList = [];
            var studentInfos = resData.AppendData;
            if(!studentInfos.length){
              that.setData({studentsList:that.data.studentsList })
            }else{
              var classEndTime = studentInfos[0].SectEnd.replace('T',' ');
              classEndTime = classEndTime.replace(/\-/g,'/');
              console.log(classEndTime)
              classEndTime = new Date(classEndTime).getTime();
              // var classEndTime = new Date('2018/8/14 10:00:00').getTime();
              var taskEndtime = classEndTime+ 12*60*60*1000;
              var nowTime = new Date().getTime();
              that.setData({
                nowTime:nowTime,
                classEndTime: classEndTime,
                taskEndtime: taskEndtime
              })
              
              for(var i = 0 ; i < studentInfos.length; i++){
                var student = studentInfos[i]
                that.data.studentsList.push({
                  sStudentCode: student.sStudentCode,
                  sClassCode: student.sClassCode,
                  sClassTypeCode: student.sClassTypeCode,
                  sName: student.sStudentName,
                  sCardCode: student.sCardCode,
                  nLessonNum: student.nLessonNo,
                  // ScoreType: student.ScoreType,
                  dStudentTotalScore: student.dStudentTotalScore,
                  // Score: student.Score,
                  nClassYear:student.nClassYear,
                  nSemester:student.nSemester,
                  nFromLessonNo:student.nFromLessonNo,
                  sFromClassCode:student.sFromClassCode,
                  changeLessonState:student.changeLessonState,
                  // changeLessonState:'调出',
                  tipText:student.changeLessonState == '调出'?'调出不可录':'满分100分',
                  // disable:student.changeLessonState == '调出'? true :false
                })
              }


              that.setData({studentsList:that.data.studentsList })
            }
          }else if(res.data.ResultType == 3){
              publicJs.resultTip(res.data.Message,function(){
                wx.navigateBack({delta:1})
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
            that.setData({isAjaxOver: true})
          },500)
        }
      }
    })
  },
  // 跳转到录入页面
  goOutScore: function(e){
    var index = e.target.dataset.index;
    var studentInfo = this.data.studentsList[index]
    studentInfo.sClassTypeCode = this.data.nClassTypeCode
    studentInfo.kemu = this.data.kemu
    // studentInfo.kemu = '英语'
    studentInfo.isOverTime =  this.data.nowTime < this.data.taskEndtime ?false: true
    wx.navigateTo({url:'/write/outScore/outScore?query='+JSON.stringify(studentInfo)})
  }
})
