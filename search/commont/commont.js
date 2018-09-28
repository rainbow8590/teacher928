
Page({
  data: {
 
  },

  onLoad: function(){
    // var that = this;
    // console.log(option)
    this.setData({
      teacherToken: wx.getStorageSync('teacherToken'),
    })
    // this.setData({url:'https:www.baidu.com'})
    // // 获取手机宽高
    // publicJs.getSystem(that,function(){
    //   that.setData({heigh: that.data.windowHeight - 55 - 55})
    // });

    
  },
  
 
  
})
