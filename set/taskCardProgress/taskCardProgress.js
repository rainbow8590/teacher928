//index.js
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
var setTime = require('../../utils/setTime.js');
//获取应用实例
const app = getApp();

Page({
  data: {
    taskArr:[],
    teacherName:'',
    schoolYear: 2018,
    semester:'秋季',
    showModalStatus: false,
    isopen:'open',
    showWrap:true,
    hasStudent: true,
    hours:0,
    mins:0,
    secs: 0,
    flag:false,//控制按钮是否可以点击
    queryArr:[],//转发携带的参数
    showLogin:false, //控制退出登陆按钮
    zoomShow: false,
    isComplete: false
    
  },
  onLoad: function(){
    this.setData({
      hasStudent: wx.getStorageSync('hasStudent'),
      studentTask: wx.getStorageSync('studentTask'),
      studentMessage: wx.getStorageSync('studentMessage'),
      queryArr: wx.getStorageSync('queryArr'),
    })

    if(this.data.hasStudent){
      this.setData({showWrap:true})
    }else{
      this.setData({showWrap:false})
    }

    this.getClassTaskInfo();
    this.getStudentTask();
    this.setTime()
  },
  
  //倒计时
  setTime: function(){
    var that = this;
    var timer = null;
    set();
    timer = setInterval(set,60000);
    function set(){
      var obj = setTime.setTime(that.data.queryArr[3]);
      //判断条件
      if( obj.day == '00' && obj.hour == '00' && obj.min == '00' && obj.sec== '00'){
        // console.log(1111);
        clearInterval(timer)
        that.setData({
          flag: true
        })
      }
      that.setData({
        TimeStr:obj.day+'天'+obj.hour+'小时'+obj.min+'分'
      })

    }
  },
  // 退出登录
  unlogin: function(){
    wx.clearStorageSync();
    wx.reLaunch({ url: '/set/parentLogin/parentLogin'});
  },
  checkRadio: function(e){

    var id = e.currentTarget.dataset.id;
    var flag = e.currentTarget.dataset.complete;
    this.data.taskArr[id].isComplete = !flag;
    this.setData({taskArr:this.data.taskArr})
    console.log(this.data.taskArr)
  },
  // 发送任务数据
  postTask: function(e){
    var that = this;
    var classCode = that.data.queryArr[0];
    var keJieId = that.data.queryArr[1];
    var token = that.data.studentMessage;

    var stamp = new Date().getTime();  //时间戳
    var datas = e.detail.value;

    var arr2 = [];
    var arr1 = [];
    for(var k in datas){
     var str = k + '=' + datas[ k ]
      arr2.push(str);
    }

    for(var i = 0 ; i < arr2.length; i+=3){
      arr1.push({
        "sPunchCardCode": arr2[i].substr(arr2[i].indexOf('=')+1),
        "sItemName": arr2[i+1].substr(arr2[i+1].indexOf('=')+1),
        "isComplete": arr2[i+2].substr(arr2[i+2].indexOf('=')+1)
      })
    }
    // 保存选中的项；
     var newArr = [];

    for(var i = 0 ; i < arr1.length; i++){
      if(arr1[i].isComplete == 'true'){
        newArr[newArr.length] = arr1[i]
      }
    }
    
    var strDatas = JSON.stringify(newArr);
    var query1 = 'appid=web&timestamp='+stamp+'&token='+token;
    var query2 = query1+'&'+strDatas+'test';
    var sign = md51.md5(query2);
    var query = query1 + '&sign=' + sign;

    var taskArr = this.data.taskArr;
    var arr = [];
    var strArr = [];
    for(var i = 0 ; i < taskArr.length; i++){
      arr.push(taskArr[i].isComplete)
      if(taskArr[i].isComplete == false){
        strArr.push(taskArr[i].task);
      }
    }

    if(arr.indexOf(false) == -1){
      wx.showModal({
        title: '提示',
        content: '恭喜你，所有任务全部完成！',
        showCancel: false,
        success:function(){
          save()
        }
      })
    }else if(arr.indexOf(true) == -1){
      wx.showModal({
        title: '提示',
        content: '还没有开始做作业嘛，可得抓紧啦！',
        showCancel: false
      })
      return;
    }
    // 部分未完成
    if(strArr.length){
      var str = strArr.join('、');
      wx.showModal({
        title: '提示',
        content: '态度积极，常伴不离。尚缺'+ str +'项，万勿忘记',
        showCancel: false,
        success:function(){
          save()
        }
      })
    }

    function save(){

      wx.showLoading({
      title:'保存中',
      success: function(){
        requests.requestPost('api/StudentPunch?'+ query,newArr,function(res){
          var resData = res.data;
          var resD = JSON.parse(res.data)
          if(resD.ResultType == 0){
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            });
            // setTimeout(()=>{
            //   wx.navigateBack({ delta: 1 })
            // },1000)
          }
          setTimeout(()=>{
            wx.hideLoading()
          },500)

        })
      }
    })
    }
  
  },
  // 获取班级打卡信息
  getClassTaskInfo:function(){
    var that = this;
    var stamp = new Date().getTime();
    var classCode = this.data.queryArr[0];
    var keJieId = this.data.queryArr[1];
    // var token = this.data.queryArr[4]; // 老师的token
    var token = this.data.studentMessage;
    

    var query1 = 'appid=web&nLessonNo='+ keJieId +'&sClassCode='+classCode+'&timestamp='+stamp+'&token='+token;

    var query2 = {
      appid: 'web',
      timestamp:stamp,
      token:token,
      nlessonno:keJieId,
      sclasscode:classCode,
    }
    var signS = publicJs.sortQuery(query2)
    var sign = md51.md5(signS+'test'); 


    var query = query1 + '&sign=' + sign;
    wx.showLoading({
      title:'努力加载中...',
      success: function(){
        requests.requestGet('api/StudentPunch/GetLinkInfo?'+ query,function(res){
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            var endTime1 = resData.dtEndDate.split('T');
            var endTime = endTime1.join(' ');
            that.setData({
              futureTime:endTime,
              className:resData.sClassName,
              alreadyCount:resData.AlreadyCount,
              noAlreadyCount:resData.TotalCount - resData.AlreadyCount,
              kejieIndex:resData.nLessonNo,
            });
            
          }
           setTimeout(()=>{
              wx.hideLoading()
            },500)
          
        })
      }
    })
  },
  // 获取学生打卡信息
  getStudentTask: function(){
    var that = this;
    var stamp = new Date().getTime();
    var classCode = this.data.queryArr[0];
    var keJieId = this.data.queryArr[1];
    var token = this.data.studentMessage;

    var query1 = 'appid=web&nLessonNo='+ keJieId +'&sClassCode='+classCode+'&timestamp='+stamp+'&token='+token;

    var query2 = {
      appid: 'web',
      timestamp:stamp,
      token:token,
      nlessonno:keJieId,
      sclasscode:classCode,
    }
    var signS = publicJs.sortQuery(query2)
    var sign = md51.md5(signS+'test'); 
    
    var query = query1 + '&sign=' + sign;
    wx.showLoading({
      title:'努力加载中...',
      success: function(){
        requests.requestGet('api/StudentPunch?'+ query,function(res){
          var resData = res.data.AppendData;
          if(res.data.ResultType == 0){
            that.data.taskArr = [];
            for(var i = 0 ; i < resData.TaskItems.length; i++){
              var cur = resData.TaskItems[i];
              that.data.taskArr.push({
                id:i,
                task:cur.sItemName,
                sCode:cur.sCode ,
                isComplete: cur.IsFinish==null ? false : true
              })
            }
            that.setData({taskArr: that.data.taskArr,showLogin:false})
          }else if(res.data.ResultType == 6){
            that.setData({showLogin:true})
            wx.hideLoading()
            wx.showModal({
              title: '提示',
              content: '您登录的学员并未报名本课程，请退出登录并尝试切换账号，或检查是否进错班级',
              showCancel: false
            })
          }
          setTimeout(()=>{
              wx.hideLoading()
            },500)
        })
      }
    })
  },
  // 退出登陆
  unlogin1:function(){
    wx.clearStorageSync();
    var str = this.data.queryArr[0]+','+this.data.queryArr[1]+','+this.data.queryArr[2]
    wx.redirectTo({url:'/set/parentLogin/parentLogin?id='+str})
  }
  
 
})
