
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
      {id:0,txt:'录入',classname:'icon-write',changeTextColor:'#1FBB1C',isChange: true},
      {id:1,txt:'查询',classname:'icon-searchactive',changeTextColor:'#888',isChange: false},
      {id:2,txt:'任务',classname:'icon-tasking',changeTextColor:'#888',isChange: false},
      {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888',isChange: false},
    ],
    scoreArr:[
      {kemu:'语文',Score:'',TotalScore:''},
      {kemu:'数学',Score:'',TotalScore:''},
      {kemu:'英语',Score:'',TotalScore:''},
      {kemu:'物理',Score:'',TotalScore:''},
      {kemu:'化学',Score:'',TotalScore:''}
    ],
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
    teacherName:'',
    schoolYear: 2017,
    semester:'秋季',
    showModalStatus: false,
    isopen:'open',
    showTip: false,
    theadH: 60,//表头的高度
    classStr:'',
    sNameW:178,
    infos:[],
    // lessonNumber:0, //总课节数,
    // lessonNumArr: [],  //课节数组
    studentCode: '',
    classCode:'',
    flagBubble: true,

    // 滑动所需值
    windowWidth: 0,  //手机宽度
    windowHeight: 0,//手机高度
    pixelRatio:2,//手机像素比
    startX: 0, //触摸开始的X坐标
    startY: 0, //触摸开始的Y坐标
    saveOldLeft: 0, //触摸结束的X坐标
    saveOldTop: 0, //触摸结束的Y坐标
    contentH: 300, //表格内容的总高度
    contentW: 3000, //表格内容的总宽度
    heigh: 300, //内容区的高度
    scrollL: 0, //滑动的X值
    scrollLZheng: 0, //滑动的X值
    scrollT: 0,  //滑动的Y值
    localShow:false,
    // zoomShow: false,

    criticalValue: 0, //滑动到左侧的临界值
    criticalAllValue: 373,//+65*2, //触发加载分数的临界值  65*2=高思杯两列的宽度
    scoreShow: true,
    flagAjax: false, //限制在滑动过程中只加载一次

    currentItem: -1,
    currentItem1: -1,
    currentItem2: -1,
    showUp:false,
    atSide: 0,
    showLoad: false,
    atSide: 0,//判断是否在边界

    isAjaxOver:false,
    isAjaxOver1:false,
    show3: false,//控制打电话/复制按钮
  },

  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
  },
  onLoad: function(options){
    console.log(options)
    this.setData({
      localShow: wx.getStorageSync('localShow'),
      identity: wx.getStorageSync('identity')
    })

    if(this.data.localShow.length == 0){
      this.setData({localShow: true})
    }


    var that = this;
    that.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      studentInfo: wx.getStorageSync('studentInfo'),
      studentCode: options.studentCode,
      classCode: options.classCode,
      studentGrade: options.studentGrade,
      studentSgrade:options.studentSgrade,
      flagGrade: Math.floor(options.studentGrade)<=6? 1:2,
    })

    // 只有小学有高思杯成绩及排名
    if(this.data.studentGrade < 7){
      this.setData({criticalAllValue: 373})//+65*2
    }else{
      this.setData({criticalAllValue: 373})
    }

    this.getCurrentGradeType();
    // 获取手机宽高
    publicJs.getSystem(that,function(){
      that.setData({criticalValue: that.data.criticalAllValue - (that.data.windowWidth - that.data.sNameW)})
    });

    
    // 设置班级
    var choiceStudent = this.data.studentInfo;
    var grade = choiceStudent.grade;
    var className = choiceStudent.sClassName;
    var classTime = choiceStudent.grade.substr(0,grade.lastIndexOf(' '));
    // var classTime = choiceStudent.grade;
    this.setData({
      StudentName: choiceStudent.sStudentName+'同学',
      StudentPhone: choiceStudent.sPhone,
      classTime: classTime,
      className: className,
      gradeTermArr:[
        {id: 0,grade: this.data.studentGrade,value: this.data.studentSgrade + '上学期'},
        {id: 1,grade: this.data.studentGrade,value: this.data.studentSgrade + '下学期'},
      ]
    })
    publicJs.flagTime(this)
  },
  onHide: function(){
    this.setData({flagAjax: false })
  },
  getIndex:function(e){
    var inpStr = this.data.inpStr;
    this.setData({show: false})
    if(inpStr == 'gradeTerm'){  
      if(this.data.gradeTermInn == this.data.arr[e.detail.detail.dataset.index].value) return;
      this.setData({
        gradeTermInn: this.data.arr[e.detail.detail.dataset.index].value, 
        clickGrafeIndex:e.detail.detail.dataset.index, 
        gradeFlag: e.detail.detail.dataset.id, 
        studentGrade: e.detail.detail.dataset.grade,
        flagAjax: false
      })
      // console.log(this.data.gradeFlag)
      this.getStudentData();
    }
  },

 // 显示弹窗 
  getGradeTerm: function (e) {
    // console.log(e)
    this.setData({arr: this.data.gradeTermArr,inpStr: e.detail.detail})
    this.selectPopup.showPopup()
  },
  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
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
  // 隐藏提示
  hideZoom:function(){
    this.setData({localShow: false})
    wx.setStorageSync('localShow',this.data.localShow)
  },
 
  getCurrentGradeType:function(){
    var that = this;
    var flagGrade = this.data.flagGrade;
    if(flagGrade ==1){
      that.getStudentData();
    }else{
      // 时间戳
      var stamp = new Date().getTime();
      // 年级
      var grade = this.data.studentGrade;
      // 教师token
      var token = this.data.teacherToken;
      var query = {
        appid: appId,
        timestamp:stamp,
        token:token,
        grade:grade,
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
          that.getStudentData();
        }else if(res.data.ResultType == 7){
          publicJs.resultTip('请重新登陆',function(){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            })
          
        }
      }
    }
    
  },

  // 获取学生信息
  getStudentData: function(){
    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken
    var classCode = this.data.classCode;
    var studentCode = this.data.studentCode;
    var grade = this.data.studentGrade;
    var gradeFlag = this.data.gradeFlag; //上学学期
    var flagGrade = this.data.flagGrade;  //小学还是中学
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      classcode:classCode,
      grade:grade,
      gradeflag:gradeFlag,
      studentcode:studentCode
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
          getRes(res)
        })
        function getRes(res){
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            that.setData({
              studentNumber:resData.length,
              contentH :60*resData.length+10
            })
            var newInfos = [];
            var reg = /[|]/g;
            console.log(resData)
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
                // sb: info.sb == null?"--":info.sb.replace(reg,' '),
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
            that.setData({infos: newInfos,isAjaxOver:true})
          }
          setTimeout(()=>{
            wx.hideLoading()
          },500)
        }
      }
    })
   
  },
  // 查看分析报告
  goReport: function(e){
    var grade = e.target.dataset.grade;
    var subject = e.target.dataset.subject;
    var code = e.target.dataset.code;
    if(!grade || !subject) return;
    wx.navigateTo({url: '/pages/webView/webView?grade='+grade+'&subject='+subject+'&code='+code})
  },
  // 获取学生信息
  getStudentScore: function(){
    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken
    var classCode = this.data.classCode;
    var studentCode = this.data.studentCode;
    var grade = this.data.studentGrade;
    var gradeFlag = this.data.gradeFlag;
    var  flagGrade = this.data.flagGrade;  //小学还是中学
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      classcode:classCode,
      grade:grade,
      gradeflag:gradeFlag,
      studentcode:studentCode
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
  // 显示气泡
  showTip: function(e){
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
  // 显示升班信息
  showShengbanDetail: function(e){
    var idx = e.currentTarget.dataset.idx;

    //没有升班内容就不再请求加载
    var sbInfo = this.data.infos[idx].sbInfo;
    if(sbInfo == '--') return;

    // 获取详细信息
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
            that.setData({shengbanArr: newInfos,isAjaxOver1:true});
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
  // 查看分析报告
  // goWebView: function(e){
  //   wx.navigateTo({url: '/pages/webView/webView'})
  // },
  
  // 滑动
  touchstart: function(e){
    var nameW = 178;
    var allContentH = 60*this.data.studentNumber+10;
    var allHeight = 45 + 42 + 60+10;
    if(this.data.studentGrade >= 7){
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

    // console.log(allContentW)
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
    var nameW = 178;
    var mX = 0,mY = 0;
    mX = e.touches[0].clientX;
    mY = e.touches[0].clientY;
    var lineX = Math.abs(mX - this.data.startX);
    var lineY = Math.abs(mY - this.data.startY);

    var mXpx = mX - this.data.startX + this.data.saveOldLeft;
    var mYpx = mY - this.data.startY + this.data.saveOldTop;

    if(this.data.saveOldLeft == -(this.data.contentW+6-(this.data.windowWidth - this.data.sNameW)) && mX - this.data.startX <= 0){
      return;
    }

    // 如果lineX >lineY  那么就是水平方向滑动
    if(lineX > lineY){
      if (mXpx >= 0) { //已经滑动到第一项
        mXpx = 0
      }else if(mXpx <= this.data.windowWidth- this.data.contentW - nameW) { //已经滑动到最后一项
        mXpx = this.data.windowWidth - this.data.contentW - nameW ;

        this.setData({scrollLZheng:Math.abs(this.data.windowWidth- nameW - this.data.contentW -6  )});
        
      }else{
        mXpx = mX - this.data.startX + this.data.saveOldLeft;
        this.setData({scrollLZheng:Math.abs(mXpx)-6});
        if(this.data.contentW < 500){
            if(this.data.scrollLZheng >= this.data.criticalValue - 20 && this.data.scrollLZheng <= this.data.criticalValue){ //滑动到边界了
              this.setData({atSide: 1,showLoad: true})
            }else{
              this.setData({atSide: 0,showLoad: false})
            }
        }else{
           this.setData({atSide: 1,showLoad: false})
        }
      
      }
      this.setData({ scrollL: mXpx, });
    }
  },
  touchend: function(e){
    var scrollL = this.data.scrollL;
    var scrollT = this.data.scrollT;
    // console.log(this.data.atSide)
    // 触摸结束是否在边界
    if(this.data.atSide == 1){
      if(this.data.flagAjax == false){
        this.setData({
          flagAjax: true,
        })
        if(this.data.gradeFlag != undefined && this.data.studentGrade >= 7){
          this.getStudentScore();
          this.setData({
            showLoad: false,
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
    this.setData({ saveOldLeft: scrollL})
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
