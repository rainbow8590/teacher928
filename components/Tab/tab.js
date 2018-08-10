var saveFormId = require('../../utils/saveFormId.js');
var appId = 'web';
var appKey = 'test';
Component({
  // options: {
  //   multipleSlots: true // 在组件定义时的选项中启用多slot支持
  // },
  properties: {
    // 这里定义了tabBarArr属性，属性值可以在组件使用时指定
    tabbarArr: {   // 属性名
      type: Array, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: [],   // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
    noAuditing:{
      type:Number,
      value: 0
    }
  },
  data: {
    // 这里是一些组件内部数据, 私有数据,组件的初始数据  可用于模版渲染
    teacherToken: wx.getStorageSync('teacherToken'),
    identity: wx.getStorageSync('identity'),
    openId: wx.getStorageSync('openId'),
  },
  attached(){
    this.setData({
      teacherToken: wx.getStorageSync('teacherToken'),
      identity: wx.getStorageSync('identity'),
      openId: wx.getStorageSync('openId'),
    })
    // console.log("identity="+this.data.identity)
    // this.setData({showDot: this.flag()})
  },
  methods: {
    // 这里是一个自定义方法 内部私有方法建议以下划线开头
    changeColor(e){
      console.log(e)
        if(!this.data.teacherToken){
          this.setData({
              teacherToken: wx.getStorageSync('teacherToken'),
              identity: wx.getStorageSync('identity'),
              openId: wx.getStorageSync('openId'),
          })
        }
        this.setData({formId: e.detail.formId})
        var tabbarArr = this.data.tabbarArr;
        var datasetId = Number(e.detail.target.dataset.index);
        this._changeTabBar(datasetId,tabbarArr,this);
    },
    _changeTabBar (datasetId,tabBarArr,obj){
      switch (datasetId){
        case 0:
          tabBarArr = [
            {id:0,txt:'录入',classname:'icon-writeactive',changeTextColor:'#1FBB1C',isChange: true},
            {id:1,txt:'查询',classname:'icon-search', changeTextColor:'#888',isChange: false},
            {id:2,txt:'任务',classname:'icon-tasking',changeTextColor:'#888',isChange: false},
            {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888',isChange: false},
          ]
          // console.log(obj.data.identity)
          if(obj.data.identity == 101){
            wx.showModal({
              title: '提示',
              content: '暂无权限',
              showCancel: false
            })
          }else{
            obj.setData({tabbarArr:tabBarArr});
            wx.redirectTo({url: '/pages/main/main?activeIndex=0&tip=1'});
          }
       
          saveFormId.saveFormId(obj,appId,appKey)
          break;
        case 1:
          tabBarArr = [
            {id:0,txt:'录入',classname:'icon-write',iconSrc:'/pages/images/write.gif',changeTextColor:'#888',isChange: false},
            {id:1,txt:'查询',classname:'icon-searchactive', iconSrc:'/pages/images/search1.gif',changeTextColor:'#1FBB1C',isChange: false},
            {id:2,txt:'任务',classname:'icon-tasking',iconSrc:'/pages/images/tasking.png',changeTextColor:'#888',isChange: false},
            {id:3,txt:'工具',classname:'icon-setting',iconSrc:'/pages/images/setting.gif',changeTextColor:'#888',isChange: true},
          ]
          // console.log(obj.data.identity)
          if(obj.data.identity == 100 || obj.data.identity == 101 || obj.data.identity == 102 ){
            wx.showModal({
              title: '提示',
              content: '暂无权限',
              showCancel: false
            })
          }else{
            obj.setData({tabbarArr:tabBarArr});
            wx.reLaunch({url: '/pages/main/main?activeIndex=1&tip=1'});
          }
          saveFormId.saveFormId(obj,appId,appKey)
          break;
        case 2:
          tabBarArr = [
            {id:0,txt:'录入',classname:'icon-write', iconSrc:'/pages/images/write.gif',changeTextColor:'#888',isChange: false},
            {id:1,txt:'查询',classname:'icon-search',  iconSrc:'/pages/images/search.gif',changeTextColor:'#888',isChange: false},
            {id:2,txt:'任务',classname:'icon-taskingactive', iconSrc:'/pages/images/tasking1.png',changeTextColor:'#1FBB1C',isChange: true},
            {id:3,txt:'工具',classname:'icon-setting', iconSrc:'/pages/images/setting.gif',changeTextColor:'#888',isChange: true},
          ]
          if(obj.data.identity == 102){
            wx.showModal({
              title: '提示',
              content: '暂无权限',
              showCancel: false
            })
          }else{
            obj.setData({tabbarArr:tabBarArr});
            wx.reLaunch({url: '/pages/main/main?activeIndex=2&tip=1'});
          }
            

          saveFormId.saveFormId(obj,appId,appKey)
          break;
        case 3:
        tabBarArr=[
          {id:0,txt:'录入',classname:'icon-write', iconSrc:'/pages/images/write.gif',changeTextColor:'#888',isChange: false},
          {id:1,txt:'查询',classname:'icon-search',  iconSrc:'/pages/images/search.gif',changeTextColor:'#888',isChange: false},
          {id:2,txt:'任务',classname:'icon-tasking', iconSrc:'/pages/images/tasking.png',changeTextColor:'#888',isChange: false},
          {id:3,txt:'工具',classname:'icon-settingactive', iconSrc:'/pages/images/setting1.gif',changeTextColor:'#1FBB1C',isChange: true},
        ]
          
          // console.log(obj.data.identity)
          if(obj.data.identity == 100 || obj.data.identity == 101 || obj.data.identity == 102 ){
            wx.showModal({
              title: '提示',
              content: '暂无权限',
              showCancel: false
            })
          }else{
            obj.setData({tabbarArr:tabBarArr});
            wx.reLaunch({url: '/pages/main/main?activeIndex=3&tip=1'});
          }
          saveFormId.saveFormId(obj,appId,appKey)
          break;
      }
    },
    // 判断当前日期是否是偶数周并且是周四
    flag(){
      // 获取一年中的总周数;
      var getWeekNum = function(year){
        var d = new Date(year,0,1);
        var to = new Date(year+1,0,1);
        var i = 1;
        for(var from = d; from.getFullYear() < to.getFullYear(); ){
            from.setDate(from.getDate()+6);
            if(from < to)
            from.setDate(from.getDate()+1);
            i++;
        }
        return i-=1; 
      }
      // 获取当前日期是本年中的第几周
      var getYearWeek = function (y, m, d) {
        //date1是当前日期
        //date2是当年第一天
        //d是当前日期是今年第多少天
        //用d + 当前年的第一天的周差距的和在除以7就是本年第几周
          var date1 = new Date(y, parseInt(m) - 1, d)
          var date2 = new Date(y, 0, 1),
              d = Math.round((date1.valueOf() - date2.valueOf()) / 86400000);
          return Math.ceil((d + ((date2.getDay() + 1) - 1)) / 7);
      };
      var nowWeek = new Date().getDay();
      var fullYear = new Date().getFullYear();
      var month = new Date().getMonth()+1;
      var day = new Date().getDate();
      var yearWeek = getYearWeek(fullYear,month,day)
      // var weekNum = getWeekNum(fullYear);
      // console.log(yearWeek)
      if(yearWeek % 2 != 0 && nowWeek == 2){
        return true
      }else{
        return false
      }
    },
  }
})