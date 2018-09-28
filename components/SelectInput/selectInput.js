Component({
  properties: {
    // 这里定义了tabBarArr属性，属性值可以在组件使用时指定
    title:{
      type:String,
      value: ''
    },
    type:{
      type:String,
      value: ''
    },
    typeInn:{
      type:String,
      value: ''
    }
  },
  data: {

  },
  methods: {
    _getEvent(e){
      console.log(e)
      let detail = e.currentTarget;
      this.triggerEvent('getEvent',{detail})
    }
  }
})