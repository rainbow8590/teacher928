// var  animation = require('../../utils/animation.js');
Component({
  properties: {
    zoomShow:{
      type: Boolean,
      value: false
    },
    teacherName:{
      type: String,
      value: ''
    },
  
    showModalStatus:{
      type: Boolean,
      value: false
    },
    identity:{
      type: Number,
      value: 2
    },
    isopen:{
      type:String,
      value:''
    }
  },

  data: {

  },

  methods: {
    // 关闭菜单栏
    _closeMenuEvent(e){
      var detail = e.target
      this.triggerEvent('closeMenuEvent',{detail})
    },
    //退出登录
    unlogin(){
      wx.clearStorageSync();
      wx.reLaunch({ url: '/pages/index/index'})
    },
  }
})