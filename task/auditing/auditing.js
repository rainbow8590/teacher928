
var publicJs = require('../../utils/public.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
//获取应用实例
const app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;
Page({
  data: {
    zoomShow: false,
    showModalStatus: false,//控制导航显示
    isopen: 'open',//控制菜单按钮显示
    pullArr:[
      {id: 0,ind: 0,value:'未审批'},
      {id: 1,ind: 1,value:'已审批'},
      {id: 2,ind: null,value:'全部'}
    ],
    pullInn: '未审批',
    pullId: 0,
    show: false,
    status: 0, 
    newArr:[],
    scrollTop: 0,
    show2: false,
    isAjaxOver1: false
  },
  onReady: function(){
    this.selectPopup = this.selectComponent("#selectPopup");
  },
  onLoad:function(){
    var that = this;
    this.page = 1;
    this.isAjaxOver = true;
    this.setData({
      teacherToken:wx.getStorageSync('teacherToken'),
      teacherName: wx.getStorageSync('teacherName'),
      // openId: wx.getStorageSync('openId'),
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
    // 校验是否在其他设备 上登陆
    requests.check(this)
    this.getOutClassApplyList();
  },
  scrolltolower: function(){
    if(this.isAjaxOver == true){
      this.page++;
      this.getOutClassApplyList();
    }
  },
  getScrollTop: function(e){
    this.setData({scrollTop: e.detail.scrollTop})
  },
  getAuditing: function (e) {
    this.setData({arr: this.data.pullArr,inpStr: e.detail.detail})
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
    if(inpStr == 'auditing'){  //班级
      if(this.data.pullInn==this.data.arr[e.detail.detail.dataset.id].value) return;
      this.setData({
        pullInn:this.data.arr[e.detail.detail.dataset.id].value, 
        tipIndex:e.detail.detail.dataset.ind, 
        status: e.detail.detail.dataset.ind,
        newArr:[],
        scrollTop: 0
      })
      this.page = 1;
      this.getOutClassApplyList();
    }
  },
  open: function(e){
    var ids = e.currentTarget.dataset.ids;
    console.log(e)
    this.setData({
      show2: true,
      openInn: this.data.studentsList[ids].reason
    })
  },
  //进入到个人详情页
  goDetail:function(e){
    var id = e.currentTarget.dataset.index;
    wx.setStorageSync('studentInfo',this.data.studentsList[id]);
    var classCode = this.data.studentsList[id].classCode;
    var studentCode = this.data.studentsList[id].studentCode;
    var studentGrade = this.data.studentsList[id].nGrade;
    var studentSgrade = this.data.studentsList[id].sGrade;
    wx.redirectTo({url:'/search/searchStudentAsName/searchStudentAsName?classCode='+classCode+'&studentCode='+studentCode+'&studentGrade='+studentGrade+'&studentSgrade='+studentSgrade});
  },
  // 获取退班学员
  getOutClassApplyList: function(){
    this.isAjaxOver = false;
    var that = this;
    var token = this.data.teacherToken;
    var stamp = new Date().getTime();
    var status = this.data.status;
    var newArr= this.data.newArr;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      pagesize:10,
      pageindex:this.page,
      status: this.data.status
    }
    var option = {
      api:'api/OutClassApply/GetOutClassApplyList',
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
          that.setData({isAjaxOver1: true})
          if(res.data.ResultType == 0){
            var resData = res.data.AppendData;
            if(!resData){
              if(that.page== 1 && res.data.Message=='超过最大页数！'){
                // wx.showModal({
                //   title: '提示',
                //   content: '暂无退班申请',
                //   showCancel: false,
                //   success:function(){}
                // })
                that.setData({studentsList: []})
              }else if(that.page!= 1 && res.data.Message=='超过最大页数！'){
                // publicJs.resultTip('超过最大页数')
                // wx.showModal({
                //   title: '提示',
                //   content: '超过最大页数',
                //   showCancel: false,
                //   success:function(){}
                // })
              }
              
              // console.log(that.data.studentsList.length)
            }else{
              for(var i = 0; i < resData.length; i++){
                (function(i){
                  newArr.push({
                  studentCode: resData[i].StudentCode,
                  studentGrade:resData[i].Grade,
                  studentSgrade:resData[i].sGrade,
                  sStudentName: resData[i].StudentName,
                  sPhone: resData[i].Phone,
                  classCode: resData[i].ClassCode,
                  sClassName: resData[i].ClassName,
                  time1: resData[i].ClassQiShu,
                  time2: resData[i].Time.substr(0,5),
                  reason: resData[i].OutReason,
                  // reason: '退班原因退班原因退班原因退班原因退班原因退班原因退班原因退班原因退班原因退班原因退班原因退班原因',
                  createOn: that.daojishi(resData[i].CreateOn,stamp),
                  id: resData[i].Id,
                  memo: resData[i].Memo,
                  show1: false,
                  show2: false,
                  grade: resData[i].ClassQiShu + resData[i].Time.substr(0,5)+' ',
                  status: resData[i].Status,
                  sGrade: resData[i].sGrade,
                  nGrade: resData[i].Grade
                })
                })(i);
              }
              that.setData({studentsList: newArr, isAjaxOver: true});
              that.isAjaxOver = true;
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

  // 保存
  saveData: function(e){
   
    var formId = e.detail.formId;
    // console.log(formId)
    var that = this;
    // var status = this.data.status;
    var status = e.detail.target.dataset.status;
    var ids = e.detail.target.dataset.ids;
    var id = this.data.studentsList[ids].id;
    console.log(ids)
    if(status == 3){
      //取消弹层
      this.data.studentsList[ids].show1 = false;
    }else if(status == 6) {
      this.data.studentsList[ids].show2 = false;
    }
    this.setData({studentsList: this.data.studentsList})
    console.log(this.data.studentsList);
   
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var data = {"id": id, "status":status};

    var query = {
      appid: appId,
      timestamp:stamp,
      token:token
    }
    var option = {
      api:'api/OutClassApply/SaveOutClassApply',
      query: query,
      type: 'post',
      data: data,
    }
    // console.log(data)
    // return;
    wx.showLoading({
      title:'保存中...',
      success: function(){
        requests.request(option, function(res){
          saveRes(res)
        })
        function saveRes(res){

          var resData = res.data;
          if(resData.ResultType == 0){
            publicJs.resultTip('保存成功')
            that.setData({status:0})
            that.getOutClassApplyList()
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
  //弹窗显示
  sure: function(e){
    var id = e.target.dataset.ids
    this.data.studentsList[id].show1 = true;
    this.setData({
      studentsList:this.data.studentsList,
      status: e.target.dataset.status
    })
  },
  // 挽回弹窗
  already: function(e){
    var id = e.target.dataset.ids
    console.log(id)
    this.data.studentsList[id].show2 = true;
    this.setData({
      studentsList:this.data.studentsList,
      status: e.target.dataset.status
    })
  },
  // 弹窗消失
  off: function(e){
    var id = e.target.dataset.ids
    this.data.studentsList[id].show1 = false;
    this.data.studentsList[id].show2 = false;
    this.setData({
      studentsList:this.data.studentsList
    })
  },
  // 倒计时
  daojishi: function(oldtime,nowTime){
    var time = oldtime.replace('T',' ').replace(/-/g,'/').substr(0,oldtime.indexOf('.'));
    // console.log(nowTime)
    //48小时的毫秒时间
    var mis = 48*60*60*1000;
    var timeCha = nowTime - new Date(time).getTime();
    // console.log(timeCha)
    var res = null;
    var diff = (mis - timeCha)/1000;
    if(diff < 0){
      res = false;
    }else{
      //获取显示距离48小时还剩余多久
      //获取时间差的时
      var hour = getTwo(parseInt(diff /(60*60)));
      //获取时间差的分
      var min = getTwo(parseInt(diff/60%60));
      //获取时间差的秒
      var sec = getTwo(parseInt(diff % 60));

      //处理个位数
      function getTwo(num){
        return num < 10? '0' + num : num
      }
      res = hour +'h'+min +'m'+sec+'s';
    }
      return res;
  },
  
  // 退出登录
  unlogin: function(){
    publicJs.unlogin()
  },
   // 关闭弹窗
  closeFloat: function(e){
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
  // 点击改变tabBar颜色
  changeColor: function(e){
    publicJs.changeColor(e,this);
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
