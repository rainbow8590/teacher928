
Page({
  data: {
    pageTitle:''
  },

  onLoad: function(option){
    let pageTitle = option.from;
    this.setData({pageTitle:pageTitle})
    if(pageTitle == 'periodpaylist'){
      wx.setNavigationBarTitle({title: '扣款规则'})
    }else{
      wx.setNavigationBarTitle({title: '考勤制度'})
    }
  },
})
