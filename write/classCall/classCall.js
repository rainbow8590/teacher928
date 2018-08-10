
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;
Page({
  data: {
    callArr:[],
    teacherName:'',
    showModalStatus: false,
    isopen:'open',
    changeW: 130,
    checkAllFlag: false, //判断全勤是否点击过
    show: false, //控制使用说明详情
    checkall:false,
    checkNum: 0,
    radioNum: 0, // 判断单选按钮是否选择过
    totalNum: 0,//总人数
    rank: 0, // 是否提交 1为提交
    ntype:0
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
  },
  onLoad: function(){
    var that = this;
    that.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity'),
    }) 
    publicJs.getSystem(that,function(){
      that.setData({height:that.data.windowHeight - 55 - 32 - 50})
    });
    
    this.getStudentsList()
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
  // 使用说明
  showTip: function(){
    this.setData({
      show: true
    })
  },
  // 退出登录
  unlogin: function(){
    publicJs.unlogin()
  },
  // 全勤 全选 
  checkAll: function(){
    var callArr =  this.data.callArr;
    var k = this.data.checkNum;
    k++;
    if(this.data.checkAllFlag == false){
      if(this.data.radioNum == 0 || this.data.radioNum ==1){
        this.setData({ checkall: true })
        for(var i = 0 ; i < callArr.length;i++){
          if(callArr[i].Score != 3){
            callArr[i].checks[0] = 'true';
            callArr[i].checks[1] = '';
            callArr[i].checks[2] = '';
          }
        }
      }
      this.setData({
        checkAllFlag: true,
        checkall: true
      })
    }else{

      if( k % 2 == 0){
        this.setData({ checkall: false })
      }else if(k % 2 != 0){
        for(var i = 0 ; i < callArr.length;i++){
          if(callArr[i].Score != 3){
            callArr[i].checks[0] = 'true';
            callArr[i].checks[1] = '';
            callArr[i].checks[2] = '';
          }
        }
        this.setData({ checkall: true })
      }
    }
    this.setData({
      checkNum: k,
      callArr: callArr
    })
  }, 
  radioChange: function(e){
    // console.log(e)
    // 选择单选按钮时 改变状态
    this.setData({ radioNum: 1});

    var arr = this.data.arr;
    var val = e.detail.value;
    var ind = e.target.dataset.ids;
    var num = 0;
    if(val ==1){
      num = 0
    }else if(val == -1){
      num = 1
    }else if(val == 0){
      num = 2
    }

    if(this.data.checkAllFlag == false){ //未曾选过
      this.setData({
        checkall: false,
      })
    }else{
      if(this.data.checkNum%2 == 0){
        this.setData({
          checkall: false
        })
      }
    }
    this.data.callArr[ind].checks[0] = '';
    this.data.callArr[ind].checks[1] = '';
    this.data.callArr[ind].checks[2] = '';
    this.data.callArr[ind].checks[num]= 'true';
    this.setData({
      callArr: this.data.callArr
    })
  },
  // 获取学生
  getStudentsList: function(){
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var query= {
      appid: appId,
      timestamp:stamp,
      token:token
    }
    var option = {
      api: 'api/SignIn/GetStudentList',
      query: query,
      type: 'get',
    }

    wx.showLoading({
      title:'努力加载中...',
      success: function(){
        requests.request(option,function(res){
          getRes(res)
        })
        function getRes(res){
          var resData = res.data.AppendData;
          if(res.data.ResultType == 0){
            var studentsArrs = [];
            var studentsArr = resData.StudentSignIn;
            var len = studentsArr.length; //总人数
            var WeidaoNum = 0; //请假人数
            for(var i = 0 ; i < studentsArr.length; i++){
              var student = studentsArr[i];
              studentsArrs.push({
                sClassCode: resData.sClassCode,
                sCardCode: student.sCardCode,
                sStudentName: student.sStudentName,
                sStudentCode: student.sStudentCode,
                lessonId: student.lessonId,
                nLessonNo: resData.nLessonNo,
                ScoreType: student.ScoreType,
                Score: student.Score,
                nType: student.Rank,
                checks:student.Score == null || student.Score == 3?['','','']:(student.Score == 1?['true','','']:(student.Score == 0?['','','true']:['','true',''])),
                tiaoRu: student.changeLessonState == "正常" ? "":"("+student.changeLessonState+")",
              })
              if(student.Score == 3){
                WeidaoNum++;
              }
            }
            var dotIndex = resData.sTime.indexOf(',');
            var lineIndex = resData.sTime.indexOf('-');

            if(dotIndex == -1){
              var times = resData.sTimeQuanTumName+' '+resData.sTime.slice(0,lineIndex); //上课时间
            }else{
              var times = resData.sTimeQuanTumName+' '+resData.sTime.slice(dotIndex+1,lineIndex)
            }

            that.setData({
              callArr: studentsArrs,
              classCode: resData.sClassCode,
              className: resData.sClassName,
              classTime: times,
              // classTime: resData.sTimeQuanTumName+resData.sTime,
              classLessonNo: resData.nLessonNo,
              totalNum: len - WeidaoNum,
              rank: studentsArr.length? studentsArr[0].Rank: null,
              isAjaxOver: true
            })
          }else if(res.data.ResultType == 7){
            publicJs.resultTip('未到点名时间',function(){
              wx.navigateBack({ delta: 1 })
            })
          }
          setTimeout(()=>{
            wx.hideLoading()
          },500)
        }
      }
    })
  },
  //保存点名信息
  saveCall: function(e){
    var targetId = e.detail.target.id;
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var datas = e.detail.value;
    var totalNum = this.data.totalNum;
    var arr = [];
    var arr1 = [];
    for(var k in datas){
     var str = k + '=' + datas[ k ]
      arr.push(str);
    }
    for(var i = 0 ; i < arr.length; i+=7){
      arr1.push({
        "sClassCode": arr[i].substr(arr[i].indexOf('=')+1),
        "sCardCode": arr[i+1].substr(arr[i+1].indexOf('=')+1),
        "sStudentCode": arr[i+2].substr(arr[i+2].indexOf('=')+1),
        "lessonId": Number(arr[i+3].substr(arr[i+3].indexOf('=')+1)),
        "nLessonNo": Number(arr[i+4].substr(arr[i+4].indexOf('=')+1)),
        "ScoreType": Number(arr[i+5].substr(arr[i+5].indexOf('=')+1)),
        "Score": arr[i+6].substr(arr[i+6].indexOf('=')+1) ,
        "nType": Number(targetId)
      })
    }

    var arr2 = [];
    for(var j = arr1.length-1 ; j >=0; j--){
      if(arr1[j].Score.length!= 0){
        arr2 = arr1.splice(j,1).concat(arr2)
      }
    }

    var queqinNum = 0;
    for(var k = 0; k < arr2.length; k++){
      if(arr2[k].Score == 0){
        queqinNum++;
      }
    }
  
    if(this.data.rank != 1){
      if(targetId == 1 ){
        if(arr2.length == totalNum){
          save();
        }else{
          publicJs.resultTip('除了请假的其他所有学生都要有出勤状态')
   
        }
      }else{
        save();
      }
    }else{
      publicJs.resultTip('已提交过点名数据',function(){
        wx.navigateBack({ delta: 1 })
      })

    }
    
    var query = {
      appid:appId,
      ntype:targetId,
      timestamp:stamp,
      token:token,
      totalcount:arr2.length-queqinNum
    }
    var option = {
      api: 'api/SignIn/SubSignIn',
      query: query,
      data: arr2,
      type: 'post'
    }
    function save(){
      wx.showLoading({
        title:'努力加载中...',
        success: function(){
          requests.request(option, function(res){
            saveRes(res)
          })
        }
      })
    }
    function saveRes(res){
      var resData = res.data;
      // var resD = JSON.parse(res.data);
      if(resData.ResultType == 0){
        if(targetId == 1){
          that.setData({rank:1,ntype:4})
          publicJs.resultTip('提交成功,后续不可更改',function(){
            wx.navigateBack({ delta: 1 })
          })
         
        }else{
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000
          })
        }
      }else if(resData.ResultType == 7){
        if(targetId == 1){
          publicJs.resultTip('无法提交！请在上课10分钟后到下课10分钟之间提交')
         
        }else{
          publicJs.resultTip('保存失败,请稍后重试')
          
        }
      }
      setTimeout(()=>{
        wx.hideLoading()
      },500)
    }
  } 
})

// 