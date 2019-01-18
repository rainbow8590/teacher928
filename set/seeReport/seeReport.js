
Page({
  data: {
  url: ''
  },

  onLoad: function(option){
    // var that = this;
    // if(option){ //老师的token 预览
      console.log(option)
      this.setData({
        token: option.token,
        //token: wx.getStorageSync('teacherToken'),
        studentCode: option.studentCode,
        classCode: option.classCode,
      })
      console.log(this.data.token, this.data.studentCode)
      this.setData({url:'https://weixin.gaosiedu.com/app/report/#/detail?classCode='+this.data.classCode+'&studentCode='+this.data.studentCode+'&token='+this.data.token })
      console.log(this.data.url)
    
    // this.setData({url:'https:www.baidu.com'})
    // // 获取手机宽高
    // publicJs.getSystem(that,function(){
    //   that.setData({heigh: that.data.windowHeight - 55 - 55})
    // });

    
  },
})
