var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
var enjoy = require('../../utils/enjoy.js');

//获取应用实例
var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;

Page({
  data: {
     tabBarArr:[
      {id:0,txt:'录入',classname:'icon-writeactive',changeTextColor:'#1FBB1C'},
      {id:1,txt:'查询',classname:'icon-search',changeTextColor:'#888'},
      {id:2,txt:'任务',classname:'icon-tasking',changeTextColor:'#888'},
      {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888'},
    ],
    isopen:'open',
    zoomShow: false,
    isAjaxOver: false,
    teacherName:'',
    isShowPopup: false,
    showModalStatus: false,
    reasonStr:'请填写未参加备课原因',
    textareaValue: ''
  },
  onLoad: function(option){
    this.option = option;
    console.log(option)
    this.setData({
      index: option.index,
      year: option.year,
      semester: option.semester,
      kejie: option.kejie,
      semesterNum: option.semesterNum,
      kejieNum: option.kejieNum,
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      noAuditing: wx.getStorageSync('noAuditing'),
      identity: wx.getStorageSync('identity'),
      DeptCode: wx.getStorageSync('DeptCode'),
      
    })
    console.log(this.data.DeptCode)
    wx.removeStorageSync('target')
    wx.setNavigationBarTitle({
      title:option.teacherName
    })
    this.getTeacherList();
  },
  onShow: function(){
    console.log('back')
    var target = wx.getStorageSync('target');
    var isSubmit = wx.getStorageSync('isSubmit');
    if(target == 'btn' && isSubmit){
      this.getTeacherList();
    }
  },
  goScore: function(e){
    var id = e.target.dataset.id;
    wx.setStorageSync('targets',e.target.dataset.target)
    wx.setStorageSync('target','btn')
    var data = {
      teacher: this.data.teacher,
      id: id,
      year:this.data.year,
      semester: this.data.semester,
      kejie:this.data.kejie,
      semesterNum:this.data.semesterNum,
      kejieNum:this.data.kejieNum,
      target:'btn'
    }
    // wx.navigateTo({url: '/write/prepareLessonScore/prepareLessonScore?option='+ JSON.stringify(this.option)+'&id='+id+'&target=btn'})
    wx.navigateTo({url: '/write/prepareLessonScore/prepareLessonScore?data='+ JSON.stringify(data)})
  },
  lookScore: function(e){
    var id = e.currentTarget.dataset.id;
    wx.setStorageSync('targets',e.currentTarget.dataset.target)
    wx.setStorageSync('target','item')
    var data = {
      teacher: this.data.teacher,
      id: id,
      year:this.data.year,
      semester: this.data.semester,
      kejie:this.data.kejie,
      semesterNum:this.data.semesterNum,
      kejieNum:this.data.kejieNum,
      target:'item'
    }
     wx.navigateTo({url: '/write/prepareLessonScore/prepareLessonScore?data='+ JSON.stringify(data)})
  },
  showArea:function(e){
    var str = e.target.dataset.id;
    this.tipButtonId = e.target.dataset.index;
    if(str == 'beiKe'){
      this.setData({reasonStr:'请填写未参加备课原因',reasonTarget:'教学表现'})
    }else{
      this.setData({reasonStr:'请填写未提交教案原因',reasonTarget:'教案'})
    }
    // 获取code
    this.setData({reasonIndex: this.tipButtonId})
    this.getReason();
  },
  lookReason: function(e){
    var str = e.target.dataset.id;
    var reasonIndex = e.target.dataset.index;
    console.log(e)
    if(str == 'beiKe'){
      this.setData({reasonTitle:'未参加备课原因:',reasonTarget:'教学表现'})
    }else{
      this.setData({reasonTitle:'未提交教案原因:',reasonTarget:'教案'})
    }
    this.setData({reasonIndex:reasonIndex})

    this.getReason();
    // this.setData({})
  },
  close: function(e){
    if(e.target.dataset.id=="float")
      this.setData({showFloatArea:false, showFloatText: false})
  },
  giveup: function(e){
    this.setData({showFloatArea:false, showFloatText: false})
  },
  getTextareaValue: function(e){
    this.textareaValue = e.detail.value;
  },

  // 提交原因
  submits:function(){
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var reg = /^\s+$/;
    console.log(reg.test(this.textareaValue))
    // console.log(this.textareaValue.length)

    if(reg.test(this.textareaValue) || !this.textareaValue){

      wx.showModal({
        title:'提示',
        content:'原因不能为空',
      })
      return;
    }
    // if(!this.textareaValue){
    //   wx.showModal({
    //     title:'提示',
    //     content:'原因不能为空',
    //   })
    //   return;
    // }


    this.textareaValue = enjoy.utf16toEntities(this.textareaValue);


    
    var data = [{Code: this.data.Code , Answer:this.textareaValue}]
    var jsonData = {
      "ClassYear": this.data.year,
      "Semester": this.option.semesterNum,
      "DeptCode": this.data.DeptCode,
      "Lesson": this.option.kejieNum,
      "Grade": this.data.teacher.GradeXuke[this.tipButtonId].Grade,
      "TeacherCode": this.data.teacher.TeacherCode,
      "AnswerKind": 1,
      "FromPrepareLessonScoreItem": data
    }

    var query = {
      appid: appId,
      timestamp: stamp,
      token: token
    }
    var option = {
      api: 'api/PrepareLesson/SaveTeacherScore',
      query: query,
      type: 'post',
      data: jsonData
    }
    wx.showLoading({
      title:'保存中',
      success: function(){
        requests.request(option, function(res){
          saveRes(res);
        })
        function saveRes(res){
          var resData = res.data;
          if(resData.ResultType == 0){
            wx.showToast({
              title: '提交成功',
              icon: 'success',
              duration: 2000
            })
          that.setData({showFloatArea:false, showFloatText: false})
          that.textareaValue = null;
          if(that.data.reasonTarget=='教学表现'){
            that.data.teacher.GradeXuke[that.tipButtonId].LessonTeacher = 1
          }else if(that.data.reasonTarget=='教案'){
            that.data.teacher.GradeXuke[that.tipButtonId].LessonPlan = 1
          }
          that.setData({teacher:that.data.teacher})
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
  // 查看原因
  getReason: function(){
    console.log(this.data.reasonIndex)
    var that = this;
    var token = this.data.teacherToken;
    var stamp = new Date().getTime(); 
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      classyear: this.data.year,
      semester :this.option.semesterNum,
      lesson: this.option.kejieNum,
      kindfirst :this.data.reasonTarget,
      teachercode : this.data.teacher.TeacherCode,
      deptcode: this.data.DeptCode,
      grade:this.data.teacher.GradeXuke[this.data.reasonIndex].Grade,
    }
    var option = {
      api:'api/PrepareLesson/GetNotScoreReason',
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

          wx.hideLoading()

          var resData = res.data;
          if(resData.ResultType == 0){
           that.setData({
            answer: res.data.AppendData.Answer?enjoy.uncodeUtf16(res.data.AppendData.Answer):null,
            Code: res.data.AppendData.Code
          })
          if(res.data.AppendData.Answer){
            that.setData({showFloatText: true})
          }else{
            that.setData({showFloatArea: true})
          }
          }else if(res.data.ResultType == 7){
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          }
        }
      }
    })
  },
  getTeacherList: function(){
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      classyear: that.data.year,
      semester: that.data.semesterNum,
      lesson: that.data.kejieNum,
      deptcode:that.data.DeptCode
    }
    var option = {
      api:'api/PrepareLesson/GetTeacherPreparesLesson',
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
          wx.hideLoading()
          
          var resData = res.data;
          var data = resData.AppendData;
          if(resData.ResultType == 0){
            var teachers = [];
            for(var i = 0; i < data.length; i++){
              teachers.push({
                TeacherName:data[i].TeacherName,
                TeacherCode:data[i].TeacherCode,
                GradeXuke:data[i].GradeXuke,
                JiaoAnNum:0,
                JiaoXueNum:0,
                isShowJiaoAn: false,
                isShowJiaoXue: false,
              })
            }
            // 操作数
            for(var i = 0; i < teachers.length; i++){
              var teacher = teachers[i];
              for(var k = 0; k < teacher.GradeXuke.length; k++){
                var grade = teacher.GradeXuke[k];
                var JiaoanNum = grade.LessonPlan == 0? 0:(grade.LessonPlan == 2?1:0)
                var JiaoxueNum = grade.LessonTeacher == 0? 0:(grade.LessonTeacher == 2?1:0)
                teacher.JiaoAnNum += JiaoanNum;
                teacher.JiaoXueNum += JiaoxueNum;
                if(grade.LessonPlan == 1) teacher.isShowJiaoAn = true
                if(grade.LessonTeacher == 1) teacher.isShowJiaoXue = true
              }
            }
            console.log(teachers)
            that.setData({teacher: teachers[that.data.index]})
          }else if(res.data.ResultType == 7){
            // 当前教管没有下辖老师
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          }
          
            
          
        }
      }
    })
  },
  // 过滤表情
  utf16toEntities: function(str) { 
    var patt=/[\ud800-\udbff][\udc00-\udfff]/g; // 检测utf16字符正则 
    str = str.replace(patt, function(char){ 
            var H, L, code; 
            if (char.length===2) { 
                H = char.charCodeAt(0); // 取出高位 
                L = char.charCodeAt(1); // 取出低位 
                code = (H - 0xD800) * 0x400 + 0x10000 + L - 0xDC00; // 转换算法 
                return "&#" + code + ";"; 
            } else { 
                return char; 
            } 
        }); 
    return str; 
  },
  //反编译表情
  uncodeUtf16: function(str){
    var reg = /\&#.*?;/g;
    var result = str.replace(reg,function(char){
        var H,L,code;
        if(char.length == 9 ){
            code = parseInt(char.match(/[0-9]+/g));
            H = Math.floor((code-0x10000) / 0x400)+0xD800;
            L = (code - 0x10000) % 0x400 + 0xDC00;
            return unescape("%u"+H.toString(16)+"%u"+L.toString(16));
        }else{
            return char;
        }
    });
    return result;
  },
 


})