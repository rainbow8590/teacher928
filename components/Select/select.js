Component({

  properties: {
    // 这里定义了tabBarArr属性，属性值可以在组件使用时指定
    type:{
      type: String,
      value: '111'
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
      console.log(11111111)
      console.log(e)
      var detail = e.currentTarget.id;
      this.triggerEvent('getEvent',{detail})
    }
  }
})