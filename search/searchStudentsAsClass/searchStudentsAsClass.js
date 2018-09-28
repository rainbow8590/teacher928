
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

    gradeArr:[
      {id:1, grade: 7,value:'初一上学期'},
      {id:2, grade: 7,value:'初一下学期'},
      {id:1, grade: 8,value:'初二上学期'},
      {id:2, grade: 8,value:'初二下学期'},
      {id:1, grade: 9,value:'初三上学期'},
      {id:2, grade: 9,value:'初三下学期'},
      {id:1, grade: 10,value:'高一上学期'},
      {id:2, grade: 10,value:'高一下学期'},
      {id:1, grade: 11,value:'高二上学期'},
      {id:2, grade: 11,value:'高二下学期'},
      {id:1, grade: 12,value:'高三上学期'},
      {id:2, grade: 12,value:'高三下学期'}
    ],
    scoreArr:[
      {kemu:'语文',Score:'',TotalScore:''},
      {kemu:'数学',Score:'',TotalScore:''},
      {kemu:'英语',Score:'',TotalScore:''},
      {kemu:'物理',Score:'',TotalScore:''},
      {kemu:'化学',Score:'',TotalScore:''}
    ],
    
    teacherName:'',
    // schoolYear: 2017,
    semester:'秋季',
    showModalStatus: false,
    isopen:'open',
    classInfo: [], //班级信息数组
    classes:[],
    tipClassIndex:0,
    show: false,//控制弹窗显示
    classInn:'',//显示的班级字符串
    gradeInn:'', //显示的年级字符串
    inpStr:'',   //公共显示的字符串
    infos:[],
    infosScore:[],
    lessonNumber:0, //总课节数,
    lessonNumArr: [],  //课节数组
    studentNumber:60,
    theadH: 60,//表头的高度
    classStr:'',
    sNameW:178,
    flagBubble: true,

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
    scrollLZheng:0,
    
    localShow: false, //控制指示标志的显示
    flagGrade: 1, //标示小学还是中学
    gradeFlag: 1, //标示上学期还是下学期
    criticalValue: 0, //滑动到左侧的临界值
    criticalAllValue: 363, //+ 65*2, //触发加载分数的临界值
    scoreShow: true,
    flagAjax: false, //限制在滑动过程中只加载一次
    currentItem: -1,
    currentItem1: -1,
    currentItem2: -1,
    showUp: false, //控制升班情况浮层
    showLoad:false, //控制加载文字的显示
    atSide: 0,//判断是否在边界
    time1: 0,
    time2: 0,
    isAjaxOver: false,
    isAjaxOver1: false,

    show3: false,//控制打电话/复制按钮
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
  },
  onLoad: function(opton){
    var that = this;
    that.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      tipClassIndex: wx.getStorageSync('tipClassIndex'),
      schoolYear: wx.getStorageSync('schoolYear'),
      semesterIndex: wx.getStorageSync('semesterIndex'),
      classInfo: wx.getStorageSync('classInfo'),
      localShow: wx.getStorageSync('localShow'),
      flagGrade: wx.getStorageSync('flagGrade'),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')
    })
    this.setData({classGrade:this.data.classInfo[this.data.tipClassIndex].nGrade})

    // 只有小学有高思杯成绩及排名
    if(this.data.classGrade < 7){
      this.setData({criticalAllValue: 373}) //+65*2
    }else{
      this.setData({criticalAllValue: 373})
    }
 
    // 显示提示
    if(this.data.localShow.length == 0){
      this.setData({localShow: true})
    }
    var allHeight = 45 + 42 + 60 ;
    // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({
          heigh: that.data.windowHeight - allHeight,
          theadH: that.data.theadH,
          criticalValue: that.data.criticalAllValue - (that.data.windowWidth - that.data.sNameW)
      })
    });
    // 设置班级
    var choiceClass = this.data.classInfo[this.data.tipClassIndex]
    this.setData({classStr:choiceClass.sClassCode + choiceClass.sClassName})

    //组装班级id和名称
    var classInfo = that.data.classInfo
    for(var i = 0 ; i < classInfo.length; i++){
      that.data.classes.push({id:i,value:classInfo[i].times})
    }
    that.setData({
      classes: that.data.classes,
      classInn:that.data.classes[that.data.tipClassIndex].value,
      gradeInn:that.data.gradeArr[0].value,
      grade:this.data.classInfo[this.data.tipClassIndex].nGrade
    })
    that.getCurrentGradeType();
  },
  onHide: function(){
    this.setData({flagAjax: false })
  },

  // 显示弹窗 班级
  getClass: function (e) {
    this.setData({arr: this.data.classes,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  getGrade: function (e) {
    // console.log(e)
    this.setData({arr: this.data.gradeArr,inpStr: e.detail.detail})
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
      this.setData({
        classInn:this.data.arr[e.detail.detail.dataset.id].value, 
        tipClassIndex:e.detail.detail.dataset.id, 
        flagAjax: false,
      })
      // 缓存选择的班级信息的编号
      wx.setStorageSync('tipClassIndex',this.data.tipClassIndex);
      // 设置班级
      var choiceClass = this.data.classInfo[this.data.tipClassIndex]
      this.setData({classStr:choiceClass.sClassCode + choiceClass.sClassName})
    }else if(inpStr == 'grade'){
      if(this.data.gradeInn == this.data.arr[e.detail.detail.dataset.index].value) return;
      this.setData({
        gradeInn:this.data.arr[e.detail.detail.dataset.index].value, 
        clickGrafeIndex:e.detail.detail.dataset.index, 
        gradeFlag: e.detail.detail.dataset.id, 
        grade: e.detail.detail.dataset.grade,
        flagAjax: false
      })
    }
    this.setData({ 
      saveOldLeft: 0,
      scrollL: 0,
      saveOldTop: 0,
      scrollT: 0,
      atSide: 0
    })
    this.getStudentsData();
  },
  // 菜单按钮
  powerDrawer: function (e) {
    publicJs.powerDrawer(e,this)
  },
  // 点击改变tabBar颜色
  changeColor: function(e){
    publicJs.changeColor(e,this)
  },
  // 关闭导航
  closeNav: function(e){
    publicJs.closeNav(e,this)
  },
  // 关闭弹窗
  closeFloat: function(e){
    publicJs.closeFloat(e,this)
  },
  // 获取默认期
  getCurrentGradeType:function(){
    var that = this;
    var flagGrade = this.data.flagGrade;
    if(flagGrade ==1){
      this.setData({
        gradeInn:this.data.gradeArr[0].value
      })
      that.getStudentsData();
    }else{
      var stamp = new Date().getTime();
      // 年级
      var grade = this.data.classInfo[this.data.tipClassIndex].nGrade;
      // 教师token
      var token = this.data.teacherToken;
      var query = {
        appid: appId,
        timestamp:stamp,
        token:token,
        grade:grade
      }
      var option = {
        api:'api/CurrentGradeType',
        query: query,
        type: 'get',
      }
      requests.request(option, function(res){
        getRes(res);
      })
      function getRes(res){
        var msg = res.data.Message
        if(res.data.ResultType == 0){
          that.setData({
            gradeInn:msg
          })
          if(msg.indexOf('上学期') != -1){
            that.setData({
              gradeFlag:1
            })
          }else if(msg.indexOf('下学期') != -1){
            that.setData({
              gradeFlag:2
            })
          }
          that.getStudentsData();
        }else if(res.data.ResultType == 7){
         publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          
        }
      }
      
    }
  },
  // 获取学生信息
  getStudentsData: function(){
    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken
    var classCode = this.data.classInfo[this.data.tipClassIndex].sClassCode;
    var grade = this.data.grade;
    var gradeFlag = this.data.gradeFlag;
    var  flagGrade = this.data.flagGrade;  //小学还是中学
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      classcode:classCode,
      grade:grade,
      gradeflag:gradeFlag,
    }
    var option = {
      api:'api/SchoolStudentScore/GetSchoolClass',
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
            var resData = res.data.AppendData;
            that.setData({
              studentNumber:resData.length,
              contentH :60*resData.length+10
            })
            var newInfos = [];
            var reg = /[|]/g;
            for(var i = 0 ; i < resData.length; i++){
              var info = resData[i];
              newInfos.push({
                id: i,
                sId: info.StudentCode,
                sName: info.StudentName,
                sPhone:info.Phone,
                sSchool: info.SchoolName == null|| info.SchoolName== ""? '--': (info.District=="" ? info.SchoolName : '['+info.District +']'+info.SchoolName),
                isOthersubject: info.QiTaXueKe == null? '否':'是',
                sOthersubject: info.QiTaXueKe,
                sExperimentalType: info.ExperimentalType == null? "--":info.ExperimentalType,
                sbInfo: !info.sbInfo.length?"--":info.sbInfo.replace(reg,' '),
                sbInfoArrLength: info.sbInfo.length ?info.sbInfo.match(/[\u4e00-\u9fa5]{2}:[\u4e00-\u9fa5]{2}/g).length:0,
                sShengQiTaXueKeFlag: info.ShengQiTaXueKe!= null? '是':'否',
                sShengQiTaXueKe: info.ShengQiTaXueKe!= null? info.ShengQiTaXueKe:"",
                sShengQiTaXueKeContent: info.sShengQiTaXueKe,
                sbClassCodes:info.sbClassCodes,
                sScore: info.sScore?info.sScore.split(','):['--'],
                sRank: info.sRank?info.sRank.split(','):['--'],
                sGrade: info.sGrade?info.sGrade.split(','):[''],
                sSubject: info.sSubject?info.sSubject.split(','):[''],
                code: info.StudentCodeXXTEA,
              })
            }
            // console.log(newInfos)
            that.setData({infos: newInfos,isAjaxOver: true})
          }
          setTimeout(()=>{
            wx.hideLoading()
          },500)
        }
      }
    })
   
  },
  // 获取学生信息
  getStudentsScore: function(){
    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken
    var classCode = this.data.classInfo[this.data.tipClassIndex].sClassCode;
    var grade = this.data.grade;
    var gradeFlag = this.data.gradeFlag;
    var flagGrade = this.data.flagGrade;  //小学还是中学
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      classcode:classCode,
      grade:grade,
      gradeflag:gradeFlag,
    }
    var option = {
      api:'api/SchoolStudentScore/GetSchoolScore',
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
            that.setData({studentNumber:resData.length})
            var newInfos = [];
            
            for(var i = 0 ; i < resData.length; i++){
              var info = resData[i];
              newInfos.push({
                id: i,
                sId: info.StudentCode,
                sName: info.StudentName,
                QiZhong: info.QiZhong ,
                QiMo:info.QiMo,
              })
            }

            // 处理成绩
            for(var i = 0 ; i <newInfos.length; i++ ){
              // 处理期中成绩
              var qiZhongArr = [
                {kemu:'语文',Score:'',TotalScore:''},
                {kemu:'数学',Score:'',TotalScore:''},
                {kemu:'英语',Score:'',TotalScore:''},
                {kemu:'物理',Score:'',TotalScore:''},
                {kemu:'化学',Score:'',TotalScore:''}
              ];
              var cur = newInfos[i]
              for(var j=0;j< cur.QiZhong.length; j++){
                arrs(cur.QiZhong[j],qiZhongArr)
              }
              // 处理期末成绩
              var QiMoArr = [
                {kemu:'语文',Score:'',TotalScore:''},
                {kemu:'数学',Score:'',TotalScore:''},
                {kemu:'英语',Score:'',TotalScore:''},
                {kemu:'物理',Score:'',TotalScore:''},
                {kemu:'化学',Score:'',TotalScore:''}
              ];
              for(var j=0;j< cur.QiMo.length; j++){
                arrs(cur.QiMo[j],QiMoArr)
              }
              if(flagGrade == 1){
                cur.QiZhong = that.data.scoreArr
                cur.QiMo = that.data.scoreArr
              }else{
                cur.QiZhong = qiZhongArr
                cur.QiMo = QiMoArr
              }
            }
            
            // 整合信息
            for(var i= 0; i < newInfos.length; i++){
              that.data.infos[i].QiZhong = newInfos[i].QiZhong
              that.data.infos[i].QiMo = newInfos[i].QiMo
            }
            that.setData({infos: that.data.infos})

            function arrs(cur,arr){
              if(cur['XueKeName'] == '语文'){
                  arr[0] ={
                    kemu:'语文',
                    Score:cur['Score']==null?'':cur['Score'],
                    TotalScore:cur['TotalScore']==null?'':cur['TotalScore']
                  }
                }else if(cur['XueKeName'] == '数学'){
                  arr[1] ={
                    kemu:'数学',
                    Score:cur['Score']==null?'':cur['Score'],
                    TotalScore:cur['TotalScore']==null?'':cur['TotalScore']
                  }
                }else if(cur['XueKeName'] == '英语'){
                  arr[2] ={
                    kemu:'英语',
                    Score:cur['Score']==null?'':cur['Score'],
                    TotalScore:cur['TotalScore']==null?'':cur['TotalScore']
                  }
                }else if(cur['XueKeName'] == '物理'){
                  arr[3] ={
                    kemu:'物理',
                    Score:cur['Score']==null?'':cur['Score'],
                    TotalScore:cur['TotalScore']==null?'':cur['TotalScore']
                  }
                }else if(cur['XueKeName'] == '化学'){
                  arr[4] ={
                    kemu:'化学',
                    Score:cur['Score']==null?'':cur['Score'],
                    TotalScore:cur['TotalScore']==null?'':cur['TotalScore']
                  }
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
  // 显示升班信息
  showShengbanDetail: function(e){
    var idx = e.currentTarget.dataset.idx;
    //没有升班内容就不再请求加载
    var sbInfo = this.data.infos[idx].sbInfo;
    if(sbInfo == '--') return;

    // this.setData({showUp:true});
    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken
    var ClassCodes = this.data.infos[idx].sbClassCodes
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      classcodes:ClassCodes,
    }
    var option = {
      api:'api/SchoolStudentScore/GetSBClassInfo',
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
            for(var i = 0 ; i < resData.length; i++){
              newInfos.push({
                sAreaName:resData[i].sAreaName,
                sClassCode:resData[i].sClassCode,
                sClassName:resData[i].sClassName,
                sPrintTeachers:resData[i].sPrintTeachers,
                sPrintTime:resData[i].sPrintTime
              })
            }
            that.setData({shengbanArr: newInfos,isAjaxOver1:true})
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

  // 显示气泡
  showTip: function(e){
    // console.log(e)
    var that = this;
    var flagBubble = this.data.flagBubble;
    var id = e.currentTarget.dataset.id;
    if(flagBubble){
      that.setData({ flagBubble:false})
      that.setData({currentItem: id})
      setTimeout(()=>{
        that.setData({
          currentItem: id+1000,
          flagBubble:true
        })
      },2000)
    }else{
      return;
    }
  },
  // 显示气泡
  showTip1: function(e){
    var that = this;
    var flagBubble = this.data.flagBubble;
    var id = e.currentTarget.dataset.id;
    if(flagBubble){
      that.setData({ flagBubble:false})
      that.setData({currentItem1: id})
      setTimeout(()=>{
        that.setData({
          currentItem1: id+1000,
          flagBubble:true
        })
      },2000)
    }else{
      return;
    }
  },
  // 显示气泡
  showTip2: function(e){
    var that = this;
    var flagBubble = this.data.flagBubble;
    var id = e.currentTarget.dataset.id;
    if(flagBubble){
      that.setData({ flagBubble:false})
      that.setData({currentItem2: id})
      setTimeout(()=>{
        that.setData({
          currentItem2: id+1000,
          flagBubble:true
        })
      },2000)
    }else{
      return;
    }
  },
  hideBubble:function(e){
    // 前几其它地方隐藏气泡
    if(e.target.dataset.bubble != 'bubble'){
        this.setData({
          currentItem: 1000,
          currentItem1: 1000,
          currentItem2: 1000,
          flagBubble:true
        })
      }
  },
  // 点击隐藏向左滑动的提示
  hideZoom:function(){
    this.setData({localShow: false})
    wx.setStorageSync('localShow',this.data.localShow)
  },
  // 查看分析报告
  // goReport: function(e){
  //   var grade = e.target.dataset.grade;
  //   var subject = e.target.dataset.subject;
  //   var code = e.target.dataset.code;
  //   if(!grade || !subject) return;
  //   wx.navigateTo({url: '/pages/webView/webView?grade='+grade+'&subject='+subject+'&code='+code})
  // },
  // 滑动
  touchstart: function(e){
    // console.log(e)
    var nameW = 178;
    var allContentH = 60*this.data.studentNumber+10;
    var allHeight = 45 + 42 + 60+10 ;
    // this.time1 = (new Date()).valueOf();
    if(this.data.classGrade >= 7){
      if(Math.abs(this.data.saveOldLeft) >= this.data.criticalValue-5){
        var allContentW = this.data.criticalAllValue + 10*70+7;
        this.setData({
          scoreShow: true
        })
      }else{
        
        if(this.data.flagAjax){
          var allContentW = this.data.criticalAllValue + 10*70+7;
        }else{
          var allContentW = this.data.criticalAllValue;
        }
        this.setData({
          scoreShow: true,
        })
      }
    }else{
      var allContentW = this.data.criticalAllValue;
      this.setData({
        scoreShow: false,
      })
    }

    this.setData({
       contentH: allContentH,
       contentW: allContentW,
       heigh:this.data.windowHeight - allHeight
    })
    if(this.data.heigh >= this.data.contentH){
      this.setData({
        heigh:this.data.contentH
      })
    }else if(this.data.contentW <= this.data.windowWidth - nameW ){
      this.setData({
        contentW: this.data.windowWidth - nameW,
        scrollL: 0
      })
    }
    
    var sX = 0,sY = 0;
    sX = e.touches[0].clientX;
    sY = e.touches[0].clientY;
    this.setData({ startX: sX ,startY: sY});
  },
  touchmove: function(e){
      var scrollLZheng;
      var nameW = 178;
      var mX = 0,mY = 0;
      mX = e.touches[0].clientX;
      mY = e.touches[0].clientY;
      var lineX = Math.abs(mX - this.data.startX);
      var lineY = Math.abs(mY - this.data.startY);

      var mXpx = mX - this.data.startX + this.data.saveOldLeft;
      var mYpx = mY - this.data.startY + this.data.saveOldTop;

      if(this.data.saveOldLeft == -(this.data.contentW-(this.data.windowWidth - this.data.sNameW)) && mX - this.data.startX <= 0){
        return;
      }

      // 如果lineX >lineY  那么就是水平方向滑动
      if(lineX > lineY){
        if (mXpx >= 0) { //已经滑动到第一项
          mXpx = 0
        }else if(mXpx <= this.data.windowWidth- this.data.contentW - nameW) { //已经滑动到最后一项
          mXpx = this.data.windowWidth - this.data.contentW - nameW ;

          this.setData({scrollLZheng:Math.abs(this.data.windowWidth - this.data.contentW - nameW )});
         // scrollLZheng = Math.abs(this.data.windowWidth - this.data.contentW - nameW )
        }else{
          mXpx = mX - this.data.startX + this.data.saveOldLeft;
          this.setData({scrollLZheng:Math.abs(mXpx)-6});
          // scrollLZheng=Math.abs(mXpx)-6;

          if(this.data.contentW < 500){
              if(this.data.scrollLZheng >= this.data.criticalValue -20 && this.data.scrollLZheng <= this.data.criticalValue){ //滑动到边界了
                this.setData({atSide: 1})
                if(this.data.classGrade >= 7){
                  this.setData({showLoad: true})
                }else{
                  this.setData({showLoad: false})
                }
              }else{
                this.setData({atSide: 0,showLoad: false})
              }
          }else{
             this.setData({atSide: 1,showLoad: false})
          }
        
        }
        this.setData({ scrollL: Math.ceil(mXpx),scrollLZheng:this.data.scrollLZheng, scrollT: this.data.saveOldTop});
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
        this.setData({ scrollL: this.data.saveOldLeft, scrollT:Math.ceil(mYpx)});
      }
  },
  touchend: function(e){
    var scrollL = this.data.scrollL;
    var scrollT = this.data.scrollT;

    // 触摸结束是否在边界
    if(this.data.atSide == 1){
      if(this.data.flagAjax == false){
        this.setData({
          flagAjax: true,
        })
        if(this.data.gradeFlag != undefined && this.data.classGrade >= 7){
          this.getStudentsScore();
          this.setData({
            showLoad: true,
            contentW : this.data.criticalAllValue + 10*70+7
          })
        }else{
          this.setData({
            showLoad: false,
            contentW : this.data.criticalAllValue
          })
        }
      }
      
    }
    this.setData({ saveOldLeft: scrollL, saveOldTop: scrollT})
  },

  // 获取电话号码
  getPhone: function(e){
    // console.log(e)
    this.phone = e.currentTarget.dataset.phone;
    this.setData({show3: true})
  },
  // 打电话:
  callPhone: function(e){
    wx.makePhoneCall({
      phoneNumber: this.phone
    })
    this.setData({show3: false})
  }, 
  // 复制
  copy: function(e){
    var that = this;
    wx.setClipboardData({
      data: this.phone,
      success: function(res) {
        wx.getClipboardData({
          success: function(res) {
            that.setData({show3: false})
          }
        })
      }
    })
  }
})
