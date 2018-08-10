Component({
  properties: {
    teacherName:{
      type:String,
      value:''
    },
    isopen:{
      type: String,
      value:''
    },
    classInfo:{
      type: String,
      value:''
    },
  },
  data: {

  },
  methods: {
    _powerDrawer(e){
      let detail = e.target;
      this.triggerEvent('powerDrawer',{detail})
    }
  }
})