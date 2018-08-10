
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
      {id:0,txt:'录入',classname:'icon-write',changeTextColor:'#888',isChange: true},
      {id:1,txt:'查询',classname:'icon-search',changeTextColor:'#888',isChange: false},
      {id:2,txt:'任务',classname:'icon-tasking',changeTextColor:'#888',isChange: false},
      {id:3,txt:'工具',classname:'icon-settingactive',changeTextColor:'#1FBB1C',isChange: false},
    ],
    isopen: 'open',
    dates:[],
    now: false,
    nowIndex: -1,
    src:'../images/ask.png',
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(option){
    console.log(option)
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      noAuditing: wx.getStorageSync('noAuditing'),
      identity: wx.getStorageSync('identity'),
      dates: JSON.parse(option.dates),
      nowDate: getTwo(new Date().getMonth()+1)+'.'+getTwo(new Date().getDate())
    })
    this.tipDate = this.data.nowDate;
    function getTwo(num){
      return num > 9? num :'0'+num
    }

    // 获取手机宽高
    var that = this;
    publicJs.getSystem(that, function(){
      that.setData({resultH: that.data.windowHeight-55-90-56})
    })
    this.getStudentsList();
  },
  onShareAppMessage: function(e){
    var id = e.target.id;
    var student = this.data.students[id]
    var that = this;
    var sign = md51.md5(student.OrderCode+student.sStudentCode+student.nXueKe.toString()+student.sTeacherCode+"Teacher");
    var infos = {
      Sign: sign,
      OrderCode: student.OrderCode,
      sTeacherCode: student.sTeacherCode,
      sClassTypeCode: student.sClassTypeCode,
      sStudentCode: student.sStudentCode,
      nXueKe: student.nXueKe,
      sXueKe: student.sXueKe,
      nXueBu: student.nXueBu,
      sStudentName: student.sStudentName,
      sGradeName: student.sGradeName,
      sParents1Phone: student.sParents1Phone,
    }
    var nGrade = student.nGrade;
    var nXueKe = student.nXueKe;
    var Pageurl = '';
    
    if(!infos.OrderCode|| !infos.sTeacherCode|| !infos.sStudentCode|| !infos.nXueKe){
      publicJs.resultTip('转发失败,请联系管理员解决')
      return;
    }
    // 100 新一年级  106 新初一   109 新高一
    if(nGrade == 100){
      Pageurl =  '/set/questionnaireXiaoXue/questionnaireXiaoXue?id='+ JSON.stringify(infos)
    }else if(nGrade == 106){
      Pageurl = '/set/questionnaireChuZhong/questionnaireChuZhong?id='+ JSON.stringify(infos)
    }
    return {
      title: '调查问卷',
      path: Pageurl, 
      imageUrl:that.data.src,
      success: function(res){
        // wx.navigateTo({url:Pageurl})
      }
    }
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
  closeFloat: function(e){
    publicJs.closeFloat(e,this)
  },
  // 获取电话号码
  getPhone: function(e){
    console.log(e)
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
  // 复制电话号码
  copy: function(e){
    var that = this;
    this.copyFun(this.phone,function(res){
      that.setData({show3: false})
    })
  },
  // 复制京东卡号码
  copyCode: function(e){
    this.copyFun(e.currentTarget.dataset.code,function(res){
      publicJs.resultTip('编号已复制到剪贴板')
      // wx.showModal({
      //   title: '提示',
      //   content: '编号已复制到剪贴板',
      //   showCancel: false,
      // })
    })
  },
  // 复制 函数
  copyFun: function(code,callback){
    wx.setClipboardData({
      data: code,
      success: function(res) {
        wx.getClipboardData({
          success: function(res) {
            callback(res)
          }
        })
      }
    })
  },
  // 切换日期
  changeDate: function(e){
    var date = e.target.dataset.date;
    if(this.tipDate != date){
      this.tipDate = date;
      this.setData({nowDate: date});
      this.getStudentsList();
    }
  },
  // 获取学生列表
  getStudentsList:function(){
    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken;
    var dtdate = this.data.nowDate;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      dtdate:dtdate
    }
    var option = {
      api:'api/JDCard/GetNewStudentListForJDCard',
      query: query,
      type: 'get',
    }
    requests.request(option, function(res){
      getRes(res);
    })
    function getRes(res){
      console.log(res)
      var resData = res.data.AppendData;
      var students = [];
      if(res.data.ResultType == 0){
        for(var i = 0 ; i < resData.length; i++){
          var student = resData[i];
          students.push({
            sClassCode: student.sClassCode,
            sClassName: student.sClassName,
            sTimeQuanTumName: student.sTimeQuanTumName,
            sTime: student.sTime.substr(0,5),
            sStudentName: student.sStudentName,
            sStudentCode: student.sStudentCode,
            sParents1Phone: student.sParents1Phone,
            nGrade: student.nGrade,
            sGradeName: student.sGradeName,
            sXueKe: student.sXueKe,
            nXueKe: student.nXueKe,
            JDCardNo: student.JDCardNo,
            nXueKe: student.nXueKe,
            bGiveJDCard: student.bGiveJDCard,
            bSendAddGroupMessage: student.bSendAddGroupMessage,
            bSubmitQuestionnaire: student.bSubmitQuestionnaire,
            OrderCode: student.OrderCode,
            sTeacherCode: student.sTeacherCode,
            sClassTypeCode: student.sClassTypeCode,
            OldStudentPhone: student.OldStudentPhone,
            nXueBu: student.nXueBu,
          })
        }
        that.setData({students:students})
      }else if(res.data.ResultType == 7){
          publicJs.resultTip(res.data.Message)
          if(res.data.Message == '身份验证失败'){
            wx.clearStorageSync();
            wx.reLaunch({ url: '/pages/index/index'})
          }
      
      }
    }
  },
  //发送短信
  sendMsg: function(e){
    var that = this;

    var id = e.target.id;
    var student = this.data.students[id];
    console.log(student)
    var sOldStudentPhone = student.OldStudentPhone;
    var sStudentCode = student.sStudentCode;
    var sStudentName = student.sStudentName;
    var sClassCode = student.sClassCode;
    var sClassName = student.sClassName;

    if(!sOldStudentPhone){
      publicJs.resultTip('学员是自行报名的，没有推荐老生')
      return;
    }
    var stamp = new Date().getTime();
    var token = this.data.teacherToken;
    var query = {
      appid: appId,
      timestamp: stamp,
      token: token
    }
    var data = {
      sOldStudentPhone:sOldStudentPhone, 
      sStudentCode:sStudentCode, 
      sStudentName:sStudentName, 
      sClassCode:sClassCode, 
      sClassName:sClassName
    }
    var option = {
      api:'api/JDCard/SendAddGroupMessage',
      query: query,
      type: 'post',
      data: data
    }
    requests.request(option, function(res){
      getRes(res);
    })
    function getRes(res){
      console.log(res)
      var resData = res.data.AppendData;
      if(res.data.ResultType == 0){
        wx.showToast({
          title: '短信已发出',
          icon: 'success',
          duration: 2000,
        })  
      }else if(res.data.ResultType == 7){
        // publicJs.resultTip('短信发送失败，请稍后再试，或联系管理员解决')
        publicJs.resultTip(res.data.Message)
        if(res.data.Message == '身份验证失败'){
          wx.clearStorageSync();
          wx.reLaunch({ url: '/pages/index/index'})
        }
            
      }
    }
  },
  // 发放京东卡
  gaveJDcard: function(e){
    var that = this;
    var id = e.target.id;
    var student = this.data.students[id];
    var OrderCode = student.OrderCode;
    var studentcode = e.target.dataset.studentcode;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken;
    var query = {
      appid: appId,
      timestamp: stamp,
      token: token,
      sstudentcode: studentcode,
      ordercode: OrderCode,
    }

    var option = {
      api:'api/JDCard/GiveOutJDCard',
      query: query,
      type: 'post',
      data:{}
    }
    requests.request(option, function(res){
      getRes(res);
    })
    function getRes(res){
      console.log(res)
      var resData = res.data.AppendData;
      if(res.data.ResultType == 0){
        wx.showToast({
          title: '京东卡发放成功',
          icon: 'success',
          duration: 2000,
        })
        student.bGiveJDCard = true;
        student.JDCardNo = resData.JDCardNo;
        that.setData({students: that.data.students})
      }else if(res.data.ResultType == 1){
        publicJs.resultTip('该学生已经发放过京东卡!',function(){
          student.bGiveJDCard = true;
          student.JDCardNo = resData.JDCardNo;
          that.setData({students: that.data.students})
        });
      }else if(res.data.ResultType == 7){
        // publicJs.resultTip('没有可供发放的京东卡!')
        publicJs.resultTip(res.data.Message)
        if(res.data.Message == '身份验证失败'){
          wx.clearStorageSync();
          wx.reLaunch({ url: '/pages/index/index'})
        }
            
      }
    }
  },
  // 复制表格地址
  copyurl: function(e){
    console.log(e)
    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken;
    var dtdate = this.data.nowDate;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      dtdate:dtdate
    }
    var option = {
      api:'api/JDCard/ExportNewStudentListForJDCard',
      query: query,
      type: 'get',
    }
    requests.request(option, function(res){
      getRes(res);
    })
    function getRes(res){
      console.log(res)
      if(res.data.ResultType == 0){
        var url = res.data.AppendData.Url;
        wx.setClipboardData({
          data: url,
          success: function(res) {
            wx.getClipboardData({
              success: function(res) {
                publicJs.resultTip('下载地址已复制, 非安卓用户请粘贴到PC端浏览器下载');
              }
            })
          }
        })
      }else if(res.data.ResultType == 1){
        publicJs.resultTip('当日没有学员报名')
      }else if(res.data.ResultType == 7){
        // publicJs.resultTip('请稍后重试');
        publicJs.resultTip(res.data.Message)
        if(res.data.Message == '身份验证失败'){
          wx.clearStorageSync();
          wx.reLaunch({ url: '/pages/index/index'})
        }
            
      }
    }
  },
  // 查看调查问卷
  goQuestionResult: function(e){
    var id = e.currentTarget.dataset.id;
    var student = this.data.students[id];
    console.log(student.bSubmitQuestionnaire)
    if(!student.bSubmitQuestionnaire){
      publicJs.resultTip('该生未提交调查问卷');
      return;
    }
    var nGrade = student.nGrade;
    var sStudentCode = student.sStudentCode;
    var nXueKe = student.nXueKe;
    var sGradeName = student.sGradeName;
    if(nGrade == 100){
      wx.navigateTo({url:'/set/questionnaireXiaoXue/questionnaireXiaoXue?sStudentCode='+sStudentCode+'&nXueKe='+nXueKe+'&sGradeName='+sGradeName})
    }else if(nGrade == 106){
      console.log(106)
      wx.navigateTo({url:'/set/questionnaireChuZhong/questionnaireChuZhong?sStudentCode='+sStudentCode+'&nXueKe='+nXueKe+'&sGradeName='+sGradeName})
    }
  }
})
