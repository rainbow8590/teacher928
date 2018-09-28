Component({
  // externalClasses: ['my-class'],
  properties: {
    showdot:{
      type: Boolean,
      value: false
    },
    // showitem:{
    //   type: Boolean,
    //   value: true
    // },
    num:{
      type: Number,
      value: 0
    },
    txt:{
      type: String,
      value: ''
    },
    classname:{
      type: String,
      value: ''
    },
    isShowTask:{
      type: Boolean,
      value: false
    }
  },
  data: {

  },
  methods: {
    goPage(e){
      // console.log(e)
      let detail = e.detail;
      this.triggerEvent('goPage',{detail})
    }
  }
})