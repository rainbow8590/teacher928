
Component({
  options : {
    multipleSlots: true 
  },
  properties: {
    titleOne:{
      type:String,
      value:''
    },
    titleTwo:{
      type:String,
      value:''
    },
  },
  data: {
    activeIndex: 0,
    isFirst: 0, //是否是页面刚加载的请求
    showArrow: true
  },
  attached(){
    this.computedHeight();
  },
  methods: {
    // 点击
    tabClick(e){
      var that = this;
      var idIndex = e.currentTarget.id;

      if(idIndex==0){
        this.setData({
          showArrow:true,
        });
      }else{
        this.setData({
          showArrow:false,
        });
      }
      this.setData({
        activeIndex:idIndex,
      });
    },
    // 改变
    swiperChange:function(e){
      var current = e.detail.current; 
      if(current == 0){
        this.setData({
          showArrow:true,
        });
      }else{
        this.setData({
          showArrow:false,
        });
      }
      this.setData({
        activeIndex:current,
      });
      this.triggerEvent('swiperChange',{current})
    },
    //计算高度
    computedHeight(){
      let that = this;
      wx.getSystemInfo({
        success: function(res) {
          that.setData({
            windowHeight: res.windowHeight,
            windowWidth: res.windowWidth,
            heigh: res.windowHeight - 55
          })
        }
      })
    }


  },
})