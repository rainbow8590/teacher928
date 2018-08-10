
var publicJs = require('../../utils/public.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
//获取应用实例
const app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;
Page({
  data: {
    tabBarArr:[
      {id:0,txt:'录入',classname:'icon-write',changeTextColor:'#888',isChange: true},
      {id:1,txt:'查询',classname:'icon-search',changeTextColor:'#888',isChange: false},
      {id:2,txt:'任务',classname:'icon-taskingactive',changeTextColor:'#1FBB1C',isChange: false},
      {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888',isChange: false},
    ],
    zoomShow: false,
    showModalStatus: false,//控制导航显示
    isopen: 'open',//控制菜单按钮显示
    showDialog: false,
    pics:[],
    msg:'',
    isShowGiveUpBtn: true

  },
  onReady: function(){
    this.selectPopup = this.selectComponent("#selectPopup");
  },
  onLoad:function(option){
    wx.setStorageSync('PerpareLesson', false)
    // console.log(option.classinfo)
    var that = this;
    this.setData({
      teacherToken:wx.getStorageSync('teacherToken'),
      teacherName: wx.getStorageSync('teacherName'),
      identity: wx.getStorageSync('identity'),
      classInfo: JSON.parse(option.classinfo),
      pics: JSON.parse(option.classinfo).ListenPic == null? []:JSON.parse(option.classinfo).ListenPic
    })
    console.log(this.data.classInfo)
    var ent = this.data.classInfo.dtDate +' '+ this.data.classInfo.sTime.substr(0,this.data.classInfo.sTime.indexOf('-'))+':00';
    ent = ent.replace(/\-/g,'/')
    var nowTime = new Date().getTime();
    var endTime = new Date(ent).getTime();
    if(nowTime > endTime){ // 当前时间大于上课时间 ,不显示取消按钮
      this.setData({isShowGiveUpBtn: false})
    }

    // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({contentH: that.data.windowHeight})
    });
  },
  onUnload: function(){
    console.log(this.data.classInfo.TaskAudit)
    wx.setStorageSync('lessonTaskAudit',this.data.classInfo.TaskAudit) 
  },

  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
  },
  // 退出登录
  unlogin: function(){
    publicJs.unlogin()
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
  // 取消预约
  showPrepareModal: function(){
    var that = this;

    var ent = this.data.classInfo.dtDate +' '+ this.data.classInfo.sTime.substr(0,this.data.classInfo.sTime.indexOf('-'))+':00';
    ent = ent.replace(/\-/g,'/')
    var nowTime = new Date().getTime();
    var endTime = new Date(ent).getTime();
    var cha = 2*60*60*1000;
    if(endTime - nowTime > cha ){
      this.setData({showDialog:true,msg:'确认取消约课？',btnTxt:'取消预约'})
    }else{
      publicJs.resultTip('距离开课2小时以内不能取消')
    }
  },
  // 取消预约
  giveupPrepare: function(){

   this.setData({showDialog:false})
    var that = this;
    var token = this.data.teacherToken;
    var stamp = new Date().getTime();
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      classcode: this.data.classInfo.ClassCode,
      lessonno: this.data.classInfo.LessonNo
    }
    var option = {
      api:'api/TeacherTrain/CancelReserve',
      query: query,
      type: 'post',
      data:{}
    }
    wx.showLoading({
      title:'取消中...',
      success: function(){
        requests.request(option, function(res){
          getRes(res)
        })
        function getRes(res){
          if(res.data.ResultType == 0){
            wx.hideLoading();
            publicJs.resultTip(res.data.Message)
            // that.data.classInfo.TaskAudit = null
            // that.setData({classInfo: that.data.classInfo})
            wx.setStorageSync('PerpareLesson', true)
            wx.navigateBack({delta:1})
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
  
  delete(e){
    var index = e.target.dataset.index;
    this.data.pics.splice(index, 1)
    this.setData({pics: this.data.pics})
  },
  previewImage(e){
    var index = e.target.dataset.index;
    wx.previewImage({
      current: this.data.pics[index], 
      urls: this.data.pics 
    })
  },
  showModal(){
    var that = this;
    this.setData({showDialog:true,msg:'确认上传图片？\t上传后将不可修改！',btnTxt:'上传'})
    /*wx.showModal({
      title: '提示',
      content: '确认上传图片？上传后将不可修改！',
      success: function(res) {
        if (res.confirm) {
          that.uploadPIc()
        } else if (res.cancel) {
         
        }
      }
    })*/
  },
  giveup(){
    this.setData({showDialog:false})
  },
  // 选择图片
  choosePic: function(){
    var that = this;
    console.log(that.data.pics)
    wx.chooseImage({
      count: 10- that.data.pics.length, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var pics = that.data.pics;
        // console.log(res)
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
       pics = pics.concat(res.tempFilePaths)
       that.setData({pics: pics})
      }
    })
  },
  uploadPIcs(){
    wx.showToast({
      icon: "loading",
      title: "正在上传",
      mask: true,
      duration: 10000
    })
    console.log(this.data.pics)
    var query = 'appid='+appId+'&TrainCode='+ this.data.classInfo.TrainCode+'&LessonNo='+ this.data.classInfo.LessonNo+'&ClassCode='+ this.data.classInfo.ClassCode+'&timestamp='+ new Date().getTime() +'&token='+this.data.teacherToken;
    this.uploadPIc({
      //url:'https://teacherapi.gaosiedu.com/api/TeacherTrain/TestSavePic?'+query,
      url:requests.htp + 'api/TeacherTrain/SaveTeacherLessonPic?'+query,
      path:this.data.pics
    })
  },
  // 上传
  uploadPIc(data){
    this.setData({showDialog: false});
    var that=this,
        i=data.i?data.i:0,//当前上传的哪张图片
        success=data.success?data.success:0,//上传成功的个数
        fail=data.fail?data.fail:0;//上传失败的个数

      wx.uploadFile({
            url: data.url, 
            filePath: data.path[i],
            name: 'file',
            formData:null,
            success: (resp) => {
              console.log(resp)
              if(resp.statusCode == 200){
                success++;//图片上传成功，图片上传成功的变量+1
                that.setData({isDisabled:true})
              }
            },
            fail: (res) => {
                fail++;//图片上传失败，图片上传失败的变量+1
                console.log('fail:'+i+"fail:"+fail);
            },
            complete: () => {
              console.log(i);
              i++;//这个图片执行完上传后，开始上传下一张
              if(i==data.path.length){   //当图片传完时，停止调用          
                  //console.log('成功：'+success+" 失败："+fail);
                  wx.hideToast();
                  var str = '成功：'+success+', 失败：'+fail;
                  publicJs.resultTip(str)
                  that.data.classInfo.TaskAudit = false
                  that.setData({classInfo: that.data.classInfo})
                  wx.navigateBack({delta:1})
              }else{//若图片还没有传完，则继续调用函数
                data.i=i;
                data.success=success;
                data.fail=fail;
                that.uploadPIc(data);
              }
                
            }
        });
  },

  
 
})
