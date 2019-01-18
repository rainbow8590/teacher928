Component({
  properties: {
    // 这里定义了tabBarArr属性，属性值可以在组件使用时指定
    show:{
      type:Boolean,
      value: false
    },
    isAjaxOver:{
      type:Boolean,
      value: false
    },
    arr:{
      type: Array,
      value: []
    }
  },
  data: {
    // 这里是一些组件内部数据, 私有数据,组件的初始数据  可用于模版渲染
    show:false, // 控制组件显示隐藏
     // 控制组件显示隐藏
  },
  methods: {
    // 这里是一个自定义方法 内部私有方法建议以下划线开头
    // 关闭弹窗
    closePopup(e){
      this.setData({
        show: false,
 
        arr:[],
      })
    },
    // 开启弹窗
    showPopup(e){
      // console.log(this.data.isAjaxOver)
     
      this.setData({show: true})
     
      
    },
    //取消回调
    _cancelEvent(e){
      var detail = e.target;
      this.triggerEvent('cancelEvent',{detail})
    },
    //触发回调
    _confirmEvent(e){
      var detail = e.target;
      console.log(detail)
      this.triggerEvent('confirmEvent',{detail})
    }
  }
})