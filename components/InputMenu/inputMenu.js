
Component({
  options : {
    multipleSlots: true 
  },
  properties: {
    isopen:{
      type:String,
      value:''
    }
  },

  data: {

  },

  methods: {
    powerDrawer(e){
      // console.log(e)
      let detail = e.target;
      this.triggerEvent('powerDrawer',{detail})
    }
  }
})