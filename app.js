var mta= require('utils/mta_analysis.js');
App({
  globalData:{
    isOver: false, //控制加载动画
    isOver1: false, //控制登录表单
    timeStart:0,
    timeEnd:0,
    appKey:'test',
    appId:'web',
    openId:'',
    yearArr:[
      {id: new Date().getFullYear() - 1 , value: new Date().getFullYear() - 1 },
      {id: new Date().getFullYear(), value: new Date().getFullYear()}
    ],
    semesterArr:[
      {id: 1, semester:4,value: '暑假'},
      {id: 2, semester:1,value: '秋季'},
      {id: 3, semester:2,value: '寒假'},
      {id: 4, semester:3,value: '春季'},
    ],
    
  },

  onLaunch(option){
    mta.App.init({
       "appID":"500610205",
       "eventID":"500610210",
    });


    var isCan = wx.canIUse('getUpdateManager')
    //更新
    if(isCan){
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        console.log(res.hasUpdate)
        if(res.hasUpdate){
          wx.showModal({
            title: '提示',
            content: '该应用有新版本, 即将下载,请稍等',
            success: function (res) {
            }
          })
        }
      })
      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经可以应用了',
          success: function (res) {
            if (res.confirm) {
              updateManager.applyUpdate()
            }
          }
        })
      })
      updateManager.onUpdateFailed(function () {
        wx.showModal({
          title: '提示',
          content: '下载失败, 请检查网络。',
          success: function (res) {}
        })
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试',
        success:function(){
          // console.log(123)
          return;
        }
      })
    }
  },
  onShow(){
    
    // wx.setEnableDebug({
    //   enableDebug: true
    // })
    // const logger = wx.getLogManager();
    // console.log(logger)
    // logger.log({str: 'hello world'}, 'basic log', 100, [1, 2, 3])


    mta.Event.stat("lanuch",{})
    var timeStart = new Date().valueOf();
    this.globalData.timeStart = timeStart;
  },

  onHide(){
    var timeEnd = new Date().valueOf();
    this.globalData.timeEnd = timeEnd;
    this.isOver1 = false;
  },
  
})