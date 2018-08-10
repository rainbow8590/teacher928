
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
var phone = require('../../utils/phone.js');

var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;

Page({
  data: {
    tabBarArr:[
      {id:0,txt:'录入',classname:'icon-write',changeTextColor:'#888',isChange: false},
      {id:1,txt:'查询',classname:'icon-search',changeTextColor:'#888',isChange: true},
      {id:2,txt:'任务',classname:'icon-taskingactive',changeTextColor:'#1FBB1C',isChange: false},
      {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888',isChange: false},
    ],
    teacherName:'',
    showModalStatus: false, //控制导航显示
    isopen:'open',  //控制菜单显示
    teacherToken:'', //教师token
    show1: false,//控制评价
    show2: false,//控制取消代课
    show3: false,//控制打电话/复制按钮
    isShowTeacher: false, //控制是否显示教师
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(options){
    var query = options.id.split(',')
    var that = this;
    // console.log("daikeAuditingDetail="+query)
    this.setData({
      id: query[0],
      status: query[1],
      teacherKind: query[2],
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      noAuditing: wx.getStorageSync('noAuditing'),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')
    })
   // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({heigh: that.data.windowHeight - 55})
    });
    // 获取设备高度
    // wx.getSystemInfo({
    //   success: function(res) {
    //     that.setData({
    //       windowHeight: res.windowHeight,
    //       windowWidth: res.windowWidth,
    //       heigh: res.windowHeight - 55
    //     })
    //   }
    // });
    this.getInfo();
  },
  onShareAppMessage: function(){
    var that = this;
    var data = this.data.id+','+this.data.status+','+that.teacherKind;
    // console.log("daikeAuditingDetail="+data)
    return {
      title: '有新的代课请求',
      path: '/search/replaceRecordDetail/replaceRecordDetail?id='+data,
      // imageUrl:that.data.src,
      success: function(res){
        // that.setData({show1: false,showBtn: true,showBtn1: false})
        // wx.redirectTo({ url: '/pages/parentLogin/parentLogin?id='+infos });
      }
    }
  },
  // 关闭弹窗
  closeFloat1: function(e){
    // var ids = e.currentTarget.dataset.ids;
    this.data.notesArr.showImg = false;
    this.setData({notesArr: this.data.notesArr})
    publicJs.closeFloat(e,this)
  },
  // 关闭弹窗
  closeFloat: function(e){
    publicJs.closeFloat(e,this)
  },
  // 点击改变tabBar颜色
  // changeColor: function(e){
  //   publicJs.changeColor(e,this)
  // },

  // 预览病假条
  previewImg:function(){
    wx.previewImage({
      current: this.data.imgSrc, // 当前显示图片的http链接
      urls: [this.data.imgSrc] // 需要预览的图片http链接列表
    })
  },
  //同意 推 代课 / 求代课
  sure: function(e){
    var that = this;
    // var formId = e.detail.formId;
    var status = e.detail.target.dataset.status;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var data = {};
    var teacherPage = '/set/replaceDetail/replaceDetail';
    var changeTeacherPage = '/search/replaceRecordDetail/replaceRecordDetail';
    var ids = this.data.id;
    var query = {
      appid: appId,
      // formid:formId,
      teacherpage:teacherPage,
      changeteacherpage:changeTeacherPage,
      status:status,
      timestamp:stamp,
      token:token
    }
    var option = {
      api:'api/LessonLeave/SaveTeacherLessonLeaveAduit/'+ids,
      query: query,
      type: 'post',
      data: data
    }

    wx.showLoading({
      title:'提交中...',
      success: function(){
        requests.request(option,function(res){
          saveRes(res);
        })
        function saveRes(res){
          // var resData = JSON.parse(res.data);
          var resData = res.data;
          var result = resData.AppendData
          if(resData.ResultType == 0){
            publicJs.resultTip('提交成功',function(){
              wx.redirectTo({ url: '/task/daikeAuditing/daikeAuditing'});
            })

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
  // 获取信息
  getInfo: function(){
    var that = this;
    var stamp = new Date().getTime();
    var token = this.data.teacherToken;
    var status = this.data.status;
    var id = this.data.id
    var query = {
      appid:appId,
      timestamp:stamp,
      token:token,
    }
    var option = {
      api:'api/LessonLeave/GetTeacherLessonLeaveBy/'+id,
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
            var newInfos = {};
            var resData = res.data.AppendData;
            if(resData){
                newInfos.id = resData.Id;
                newInfos.sClassCode = resData.sClassCode;
                newInfos.sClassName = resData.sClassName;
                newInfos.sTeacherName = resData.sTeacherName;
                newInfos.sTeacherPhone = resData.sTeacherPhone;
                newInfos.sTeacherName1 = resData.sChangeTeacherName;
                newInfos.sTeacherPhone1 = resData.sChangeTeacherPhone;
                newInfos.nLessonNo = resData.nLessonNo;
                newInfos.SectBegin = resData.SectBegin;
                newInfos.sTime = resData.sTime;
                newInfos.sTopic = resData.sTopic;
                newInfos.dtDate = resData.dtDate.substr(5,5).replace('-','月')+'日 '+resData.sTime;
                newInfos.sStatus =resData.sStatus;
                newInfos.nStatus =resData.nStatus;
                newInfos.sAreaName =resData.sAreaName;
                newInfos.time = publicJs.daojishi(resData.SectBegin.replace(/\-/g,'/').replace('T',' '));
                // newInfos.chaoshi = that.chaoshi(resData.SectBegin).day+'天'+that.chaoshi(resData.SectBegin).hour+'时'+that.chaoshi(resData.SectBegin).min+'分';

                newInfos.nLeaveType = resData.nLeaveType;
                newInfos.sLeavePicUrl = resData.sLeavePicUrl;
                newInfos.nPicAduit = resData.nPicAduit;
                newInfos.showImg = false;
                newInfos.teacherKind = resData.nKind, // 获取求代课老师的kind
                that.setData({notesArr: newInfos})
                that.teacherKind = newInfos.teacherKind;
                if(newInfos.nStatus>=1){
                  that.setData({isShowTeacher: true})
                }
            }else{
              publicJs.resultTip('代课申请已取消',function(){
                  wx.reLaunch({ url: '/task/daikeAuditing/daikeAuditing'})
                })
  
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
  // 审批请假条 推给求代课
  saveLeave: function(e){
    var that = this;
    var token = this.data.teacherToken; 
    var stamp = new Date().getTime();  
    var status = e.detail.target.dataset.status;
 
    var pageurl = '/task/daikeAuditingDetail/daikeAuditingDetail';
    var query = {
      appid: appId,
      // formid:formId,
      teacherpage:pageurl,
      status:status,
      timestamp:stamp,
      token:token
    }
    var option = {
      api:'api/LessonLeave/SaveTeacherLessonLeavePicAduit/'+ that.LeaveId,
      query: query,
      type: 'post',
      data: {}
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
            if(status == 1){
              that.data.notesArr.nPicAduit = 1;
            }else if(status == 0){
              that.data.notesArr.nPicAduit = 0;
            }
            that.data.notesArr.showImg = false;
            that.setData({notesArr: that.data.notesArr});

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

  // 获取电话号码
  getPhone: function(e){
    phone.getPhone(this, e)
  },
  // 打电话:
  callPhone: function(e){
    phone.callPhone(this, e)
  },
  // 复制
  copy: function(e){
    phone.copy(this, e)
  },
  // 超时时间
  chaoshi: function(beginTime){
    beginTime = beginTime.replace(/\-/g,'/').replace('T',' ')
    var diff = (new Date().getTime() - new Date(beginTime).getTime())/1000;
    //获取时间差的天
    var day = getTwo(Math.floor(diff / (24*60*60)));
    //获取时间差的时
    var hour = getTwo(parseInt(diff /(60*60) %24));
    //获取时间差的分
    var min = getTwo(parseInt(diff/60%60));
    //获取时间差的秒
    var sec = getTwo(parseInt(diff % 60));

    //处理个位数
    function getTwo(num){
      return num < 10? '0' + num : num
    }
    // var hours = getTwo(day*24 + hour)
    return {
      day:day,
      hour:hour,
      min:min,
      sec:sec
    }
  },
  //查看病假条
  lookLeaveImg: function(e){
    this.LeaveId = this.data.notesArr.id;
    this.data.notesArr.showImg = true;
    var src = this.data.notesArr.sLeavePicUrl
    this.setData({ imgSrc: src,notesArr: this.data.notesArr});

    // wx.setStorageSync('LeaveId',this.LeaveId)
  },
  
})


