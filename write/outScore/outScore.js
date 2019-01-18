
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

    classInfo:[],
    classes: [],
    teacherName:'',
    // schoolYear: new Date().getFullYear(),
    semester:'秋季',
    showModalStatus: false,
    isopen:'open',
    show:false, //控制弹窗的显示

    resultH: 400, //表体的高度,
    classStr: '',//选择的班级信息
    zoomShow: false,
    isAjaxOver: false,
    questions:[
      // {id: 0, flag:0},  flag:0 是对的题目  1 是错的题目
    ],
    Scores:[], // 分数集合
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(option){
    console.log(option)
    // wx.setStorageSync('isSubmit',false)
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
      query: JSON.parse(option.query)
    })
    // console.log(this.data.query)
    // 设置班级
    var choiceClass = this.data.classInfo[this.data.tipClassIndex]
    this.setData({classStr:choiceClass.classCode + choiceClass.sClassName})
    wx.setNavigationBarTitle({
        title: this.data.query.sName
      })
    // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({resultH: that.data.windowHeight -55-50-56 -75})
    });
    this.getQuestions();
  },
  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
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
  // 获取题目
  getQuestions: function(){
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
      nlessonno:this.data.query.nLessonNum,
      sclasstypecode:this.data.query.sClassTypeCode,
      nclassyear:this.data.query.nClassYear,
      nsemester:this.data.query.nSemester,
      sstudentcode:this.data.query.sStudentCode,
    }
  
    var option = {
      api:'api/LessonEndPaper/GetLessonEndPaperStudentScore',
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
          console.log('jiazai zhong ')
          console.log(res)
          var resData = res.data;
          if(resData.ResultType == 0){
            if(resData.AppendData.length){
              var totalScore = 0;
              
              if(that.data.query.kemu =='英语'){ //判断题
                if(that.data.query.dStudentTotalScore== null){
                  for(var i = 0 ; i < resData.AppendData.length; i++){
                    var now = resData.AppendData[i];
                    now.dStudentScore = now.dTopicScore;
                    totalScore += now.dTopicScore;
                    now.flag = 0;
                  }
                }else{
                  for(var i = 0 ; i < resData.AppendData.length; i++){
                    var now = resData.AppendData[i];
                    totalScore += now.dStudentScore;
                    if(now.dStudentScore == now.dTopicScore){
                      now.flag = 0;
                    }else{
                      now.flag = 1;
                    }
                  }
                }
                
                that.setData({totalScore:totalScore,questions:resData.AppendData})
              }else{
                if(that.data.query.dStudentTotalScore== null){
                  for(var i = 0 ; i < resData.AppendData.length; i++){
                    var now = resData.AppendData[i];
                    now.focus = false;
                  }
                  that.setData({totalScore:0,questions:resData.AppendData})
                }else{
                  for(var i = 0 ; i < resData.AppendData.length; i++){
                    var now = resData.AppendData[i];
                    totalScore += now.dStudentScore;
                    now.focus = false;
                  }
                  that.setData({totalScore:totalScore,questions:resData.AppendData})
                }
              }
            }
            that.setData({isAjaxOver: true})
          }else if(res.data.ResultType == 3){
              publicJs.resultTip(res.data.Message,function(){
                wx.navigateBack({delta:2})
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
  // 储存显示提示框
  saveScoreModal(){
    var that = this;
    var questions = this.data.questions;
    var ques = [];
    for(var i = 0; i < questions.length; i++){
     ques.push({
          "nTopicIndex": questions[i].nTopicIndex,
          "nTopicType": questions[i].nTopicType,
          "nTopicId": questions[i].nTopicId,
          "dTopicScore": questions[i].dTopicScore,
          "dStudentScore": questions[i].dStudentScore== null? null : Number(questions[i].dStudentScore)
        })
    }
    var falgArr = true;
    for(var i = 0; i < ques.length; i++){
      if(ques[i].dStudentScore == null){
        falgArr = false;
        publicJs.resultTip('每小题都需要录入分数')
        break;
      }
    }
    

    if(falgArr){
      this.ques = ques;
      var str = '学员出门考得分：'+this.data.totalScore+',请核对输入是否正确';
      wx.showModal({
        title: '提示',
        content: str,
        success: function(res) {
          if (res.confirm) {
            that.saveScore();
          } else if (res.cancel) {
            
          }
        }
      })
    }


    
  },
  // 储存学生分数
  saveScore: function(e){
    var that = this;
    var token = this.data.teacherToken; // token值
    var nxuebu = this.data.nXueBu;   //学部信息
    var stamp = new Date().getTime();  //时间戳
    
    
    // console.log(ques)
    // return;
    var data = {
      "sStudentCode": this.data.query.sStudentCode,
      "sClassTypeCode": this.data.query.sClassTypeCode,
      "nClassYear": this.data.query.nClassYear,
      "nSemester": this.data.query.nSemester,
      "sClassCode": this.data.query.sClassCode,
      "nLessonNo": this.data.query.nLessonNum,
      "sFromClassCode": this.data.query.sFromClassCode,
      "nFromLessonNo": this.data.query.nFromLessonNo,
      "nPaperId": this.data.questions[0].nPaperId,
      "topicList": this.ques
    }

    var query = {
      appid: appId,
      timestamp: stamp,
      token: token
    }
    var option = {
      api: 'api/LessonEndPaper/SaveLessonEndPaperStudentScore',
      query: query,
      type: 'post',
      data: data
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
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
            setTimeout(()=>{
              wx.setStorageSync('isSubmit',true)
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
  // 全对 全错
  check:function(e){
    var that = this;
    var questions = this.data.questions;
    var targetBtn = e.target.dataset.btn;
    if(targetBtn == 'yes'){
      changeType(0)
    }else{
      changeType(1)
    }
    function changeType(type){
      var totalScore = 0;
      
      if(type == 1){
        totalScore = 0;
        for(var i = 0 ; i < questions.length; i++){
          questions[i].dStudentScore = 0;
          questions[i].flag = 1
        }
      }else{
        for(var i = 0 ; i < questions.length; i++){
          questions[i].flag = type;
          questions[i].dStudentScore = questions[i].dTopicScore;
          totalScore+=questions[i].dTopicScore;
          questions[i].flag = 0;
        }
      }
      that.setData({questions: questions,totalScore:totalScore})
    }
  },
  checkOne: function(e){
    console.log(e)
    var index = e.target.dataset.index;
    var questions = this.data.questions;
    if(questions[index].flag == 0){
      questions[index].flag = 1
      questions[index].dStudentScore = 0;
      this.data.totalScore -= questions[index].dTopicScore;
    }else{
      questions[index].flag = 0;
      questions[index].dStudentScore = questions[index].dTopicScore;
      this.data.totalScore += questions[index].dStudentScore;
    }
    this.setData({questions:questions,totalScore:this.data.totalScore})
  },
  // 非英语
  writeScore: function(e){
    var index = e.target.dataset.index;
    
    var val = e.detail.value ==''? null : e.detail.value;
    var reg = /^[0-9]+([.]{1}[0-9]{0,1})?$/;
    //console.log(e.detail.value)
    // console.log(!reg.test(val))
    if(val> this.data.questions[index].dTopicScore || (!reg.test(val)&&val!=null)){
      // this.data.questions[index].focus = false;
      this.setData({questions: this.data.questions})
      publicJs.resultTip('不能超过最高分, 且能填写一位小数',function(){
        return;
      })
    }
    /*else if(val < 0 || (!reg.test(val)&&val!=null)){
      // this.data.questions[index].focus = false;
      this.setData({questions: this.data.questions})
      publicJs.resultTip('不能低于最低分,且能填写一位小数',function(){
        return;
      })
    }*/
    else{
      // this.data.questions[index].focus = true;
      this.data.questions[index].dStudentScore = val;
      this.setData({questions: this.data.questions})
      var totalScore = 0;
      for(var i = 0 ; i <  this.data.questions.length; i++){
        var now =  this.data.questions[i];
        totalScore += ((now.dStudentScore == null||now.dStudentScore == 0||now.dStudentScore == '')?0:Number(now.dStudentScore));
      }
       totalScore = totalScore.toFixed(1);
       if(totalScore.indexOf('.0')!= -1){
        totalScore = totalScore.substr(0,totalScore.indexOf('.'))
       }
      this.setData({totalScore: totalScore})
    }

  },
  // blurScore:function(e){
  //   var index = e.target.dataset.index;
  //   this.data.questions[index].focus = false;
  //   this.setData({questions: this.data.questions})
  // },
  focusScore:function(e){
    var index = e.target.dataset.index;
    console.log(index)
    for(var i = 0 ; i < this.data.questions.length; i++){
      this.data.questions[i].focus = false;
    }
    this.data.questions[index].focus = true;
    this.setData({questions: this.data.questions})
  },
  minScore: function(e){
    var index = e.target.dataset.index;
    this.data.questions[index].dStudentScore = 0
    this.setData({questions: this.data.questions})
    var totalScore = 0;
    for(var i = 0 ; i <  this.data.questions.length; i++){
      this.data.questions[i].focus = false;
      var now =  this.data.questions[i];
      totalScore += ((now.dStudentScore == null||now.dStudentScore == 0||now.dStudentScore == '')?0:Number(now.dStudentScore));
    }
    // this.data.questions[index].focus = false;
    this.setData({totalScore: totalScore,questions: this.data.questions})
  },
  maxScore: function(e){
    var index = e.target.dataset.index;
    this.data.questions[index].dStudentScore = this.data.questions[index].dTopicScore
    this.setData({questions: this.data.questions})
    var totalScore = 0;
    for(var i = 0 ; i <  this.data.questions.length; i++){
      this.data.questions[i].focus = false;
      var now =  this.data.questions[i];
      totalScore += ((now.dStudentScore == null||now.dStudentScore == 0||now.dStudentScore == '')?0:Number(now.dStudentScore));
    }
    // this.data.questions[index].focus = false;
    this.setData({totalScore: totalScore,questions: this.data.questions})
  }
 
})
