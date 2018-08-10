Component({

  properties: {
    // 这里定义了tabBarArr属性，属性值可以在组件使用时指定
    type:{
      type: String,
      value: ''
    },
    typeInn:{
      type: String,
      value:''
    }
    
  },
  data: {
    
  },
  methods: {
    _getEvent(e){
      var detail = e.target;
      this.triggerEvent('getEvent',{detail})
    }
  }
})