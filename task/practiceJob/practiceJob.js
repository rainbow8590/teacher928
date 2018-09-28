
var publicJs = require('../../utils/public.js');
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
    pics:[],
    showDialog: false,
    isDisabled: true,
  },
  onReady: function(){
    this.selectPopup = this.selectComponent("#selectPopup");
  },
  onLoad:function(option){
    var that = this;
    this.setData({
      teacherToken:wx.getStorageSync('teacherToken'),
      teacherName: wx.getStorageSync('teacherName'),
      identity: wx.getStorageSync('identity'),
      baseInfo: JSON.parse(option.baseInfo),
      pics:JSON.parse(option.baseInfo).TaskPic?JSON.parse(option.baseInfo).TaskPic:[]
    })
    // console.log(this.data.baseInfo)
    // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({contentH: that.data.windowHeight - 50})
    });
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
    this.setData({showDialog: true});
    // wx.showModal({
    //   title: '提示',
    //   content: '确认上传图片？上传后将不可修改！',
    //   success: function(res) {
    //     if (res.confirm) {
    //       that.uploadPIc()
    //     } else if (res.cancel) {
         
    //     }
    //   }
    // })
  },
  // 取消
  giveup: function(){
    this.setData({showDialog: false});
  },
  // 选择图片
  choosePic: function(){
    var that = this;
    var len = that.data.pics.length
    wx.chooseImage({
      count: 10 - len, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var pics = that.data.pics;
        // console.log(res)
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
       pics = pics.concat(res.tempFilePaths)
       if(pics.length > 10){
          for(var i = 0; i < pics.length; i++){
            if(i > 9){
              pics.splice(i,1)
            }
          }
       }
       that.setData({pics: pics})
      }
    })
  },
  uploadPIcs(){
    this.setData({showDialog: false});
    wx.showToast({
      icon: "loading",
      title: "正在上传",
      mask: true,
      duration: 10000
    })
    console.log(this.data.pics)
    var query = 'appid='+appId+'&TrainCode='+ this.data.baseInfo.TrainCode+'&timestamp='+ new Date().getTime() +'&token='+this.data.teacherToken;
    this.uploadPIc({
      //url:'https://teacherapi.gaosiedu.com/api/TeacherTrain/TestSavePic?'+query,
      url:requests.htp + 'api/TeacherTrain/SaveTeacherTaskPic?'+query,
      path:this.data.pics
    })
  },
  // 上传
  uploadPIc(data){
    
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
                  // console.log('成功：'+success+" 失败："+fail);
                  wx.hideToast();
                  wx.setStorageSync('completeTask',true)
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
