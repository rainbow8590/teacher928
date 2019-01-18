
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
      {id:0,txt:'录入',classname:'icon-write',changeTextColor:'#888',isChange: false},
      {id:1,txt:'查询',classname:'icon-search',changeTextColor:'#888',isChange: true},
      {id:2,txt:'任务',classname:'icon-taskingactive',changeTextColor:'#1FBB1C',isChange: false},
      {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888',isChange: false},
    ],
    teacherName:'',
    showModalStatus: false, //控制导航显示
    isopen:'open',  //控制菜单显示
    teacherToken:'', //教师token
    showArrow:true, //显示当前tab的箭头
    nSemester: 1,
    activeIndex:0,
    semesterArr: [
      {id: 1, value: '秋季'},
      {id: 2, value: '寒假'},
      {id: 3, value: '春季'},
      {id: 4, value: '暑假'}
    ],
    pullArr:[
      {id: 0,ind: 0,value:'申请中'},
      {id: 1,ind: 1,value:'待审批'},
      {id: 2,ind: 2,value:'已审批'},
      {id: 3,ind: 3,value:'超时'},
      {id: 4,ind: 4,value:'完成'},
    ],
    pullInn: '待审批',
    status: 1,
    // show: false, //审核选想
    showImg: false,
    imgSrc:'', //病假图片
    // classCode: '',
    notesArr:[],
    isAjaxOver:false
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(){
    this.page = 1;
    var that = this;
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      noAuditing: wx.getStorageSync('noAuditing'),
      // semester: this.data.semesterArr[publicJs.flagSemester()-1].value,
      nSemester: this.data.semesterArr[publicJs.flagSemester()-1].id,
      schoolYear: publicJs.flagYear(),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')

    })
    // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({heigh: that.data.windowHeight - 55})
    });

    this.setData({
      yearArr:[
        {id: new Date().getFullYear() - 1 , value: new Date().getFullYear() - 1 },
        {id: new Date().getFullYear(), value: new Date().getFullYear()},
      ]
    })
    this.getAuditingNotes();
  },
  // 退出登录
  unlogin: function(){
    publicJs.unlogin()
  },
   // 关闭弹窗
  closeFloat: function(e){
    publicJs.closeFloat(e,this)
  },
  // 关闭弹窗
  closeFloat1: function(e){
    var ids = e.currentTarget.dataset.ids;
    this.data.notesArr[ids].showImg = false;
    this.setData({notesArr: this.data.notesArr})
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
  getAuditing: function (e) {
    // console.log(e)
    this.setData({arr: this.data.pullArr,inpStr: e.detail.detail})
    this.selectPopup.showPopup();
  },
  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
  },
  // 预览病假条
  previewImg:function(){
    wx.previewImage({
      current: this.data.imgSrc, // 当前显示图片的http链接
      urls: [this.data.imgSrc] // 需要预览的图片http链接列表
    })
  },

  // 获取点击的弹窗的id和value值
  getIndex:function(e){
    var inpStr = this.data.inpStr;
    this.setData({show: false})
    if(inpStr == 'auditing'){  //班级
      if(this.data.pullInn == this.data.arr[e.detail.detail.dataset.id].value) return;
      this.setData({
        pullInn:this.data.arr[e.detail.detail.dataset.id].value, 
        status:this.data.arr[e.detail.detail.dataset.id].ind, 
        show: false,
        // status: e.target.dataset.ind,
        notesArr:[],
        scrollTop: 0
      })
      this.page = 1;
      this.getAuditingNotes();
    }
  },
 
  goDetail: function(e){
    var ids = e.currentTarget.dataset.id;
    var lessonId = this.data.notesArr[ids].id;
    var status = this.data.notesArr[ids].nStatus;
    var teacherKind = this.data.notesArr[ids].teacherKind;
    var data= lessonId +','+status+','+teacherKind;
    wx.navigateTo({url:'/task/daikeAuditingDetail/daikeAuditingDetail?id='+data})
  },
  scrolltolower: function(e){
    // console.log(e)
    if(this.isAjaxOver == true){
      this.page ++;
      this.getAuditingNotes();
    }
  },
  getScrollTop: function(e){
    // console.log(e)
    this.setData({scrollTop: e.detail.scrollTop})
  },
  //获取申请信息
  getAuditingNotes: function(){
    this.isAjaxOver = false;
    var that = this;
    var stamp = new Date().getTime();
    var nYear = this.data.schoolYear;
    var nSemester = this.data.nSemester;
    var token = this.data.teacherToken;
    var status = this.data.status;
    var page = this.page;
    var query = {
      appid:appId,
      timestamp:stamp,
      token:token,
      pagesize:10,
      pageindex:this.page,
      status:status,
    }
    var option = {
      api:'api/LessonLeave/GetTeacherLessonLeaveAduit',
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
            // var newInfos = [];
            var resData = res.data.AppendData;
            if(!resData){
              if(that.page == 1 && res.data.Message=='超过最大页数！'){
                that.setData({notesArr: [] })
              }else if(that.page!= 1 && res.data.Message=='超过最大页数！'){
              }
              that.setData({isAjaxOver: true})
            }else{
              for(var i = 0 ; i < resData.length; i++){
                var cur = resData[i];
                that.data.notesArr.push({
                  i: i,
                  id: cur.Id,
                  sClassCode: cur.sClassCode,
                  sClassName: cur.sClassName,
                  sTeacherName: cur.sTeacherName,
                  nLessonNo: cur.nLessonNo,
                  SectBegin: cur.SectBegin,
                  sTime: cur.sTime,
                  sTopic: cur.sTopic,
                  dtDate: cur.dtDate.substr(5,5).replace('-','月')+'日 '+cur.sTime,
                  sStatus:cur.sStatus,
                  nStatus:cur.nStatus,
                  sAreaName:cur.sAreaName,
                  time:publicJs.daojishi(cur.SectBegin.replace(/\-/g,'/').replace('T',' ')),
                  nLeaveType:cur.nLeaveType,
                  sLeavePicUrl:cur.sLeavePicUrl,
                  nPicAduit:cur.nPicAduit,
                  showImg:false,
                  teacherKind: cur.nKind
                })
              }
              that.setData({notesArr: that.data.notesArr,isAjaxOver: true})
            }
            that.isAjaxOver = true;
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
  // 查看病假条
  lookLeaveImg: function(e){

    this.tipId = e.target.dataset.id;
    this.LeaveId = this.data.notesArr[e.target.dataset.id].id;
    this.data.notesArr[e.target.dataset.id].showImg = true;
    var src = this.data.notesArr[e.target.dataset.id].sLeavePicUrl
    this.setData({ imgSrc: src,notesArr: this.data.notesArr});

    wx.setStorageSync('LeaveId',this.LeaveId)
  },
  // 审批请假条 推给 求代课 
  saveLeave: function(e){
    var that = this;
    var token = this.data.teacherToken; 
    var stamp = new Date().getTime();  
    var status = e.detail.target.dataset.status;
    var data = {};
    var strDatas = JSON.stringify(data);
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
      api:'api/LessonLeave/SaveTeacherLessonLeavePicAduit/'+ that.LeaveId ,
      query: query,
      type: 'post',
      data: data
    }
    wx.showLoading({
      title:'保存中',
      success: function(){
        requests.request(option,function(res){
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
              that.data.notesArr[that.tipId].nPicAduit = 1;
            }else if(status == 0){
              that.data.notesArr[that.tipId].nPicAduit = 0;
            }
            that.data.notesArr[that.tipId].showImg = false;
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


})


