var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
var enjoy = require('../../utils/enjoy.js');

//获取应用实例
var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;

Page({
  data: {
     tabBarArr:[
      {id:0,txt:'录入',classname:'icon-writeactive',changeTextColor:'#1FBB1C'},
      {id:1,txt:'查询',classname:'icon-search',changeTextColor:'#888'},
      {id:2,txt:'任务',classname:'icon-tasking',changeTextColor:'#888'},
      {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888'},
    ],
    isopen:'open',
    zoomShow: false,
    isAjaxOver: false,
    teacherName:'',
    isShowPopup: false,
    showModalStatus: false,
    sumScore:0,
    titles:[],
    values:[],
    isIn: true,
    isSubmit: false,
    isAjaxOver: false
  },
  onLoad: function(option){
    
    var option = JSON.parse(option.data)
    console.log(option)
    this.setData({
      target: option.target,
      targets: wx.getStorageSync('targets'),
      DeptCode: wx.getStorageSync('DeptCode'),
    })
    
    console.log(this.data.DeptCode)
    if(this.data.target == 'btn'){
      wx.setNavigationBarTitle({
        title: '教学功底评分'
      })
    }else if(this.data.target == 'item'){
      if(this.data.targets == '教学表现'){
        wx.setNavigationBarTitle({
          title: '查看教学表现评分'
        })
      }else{
        wx.setNavigationBarTitle({
          title: '查看教案评分'
        })
      }
    }

    this.setData({
      teacher: option.teacher,
      selectId: option.id,
      year: option.year,
      semester: option.semester,
      kejie: option.kejie,
      semesterNum: option.semesterNum,
      kejieNum: option.kejieNum,
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      noAuditing: wx.getStorageSync('noAuditing'),
      identity: wx.getStorageSync('identity'),
      
      prepareSemester: wx.getStorageSync('prepareSemester'),
      prepareKejie: wx.getStorageSync('prepareKejie'),
      
    })
    this.getTitles();

  },
  // 菜单按钮
  powerDrawer: function (e) {
    publicJs.powerDrawer(e,this)
  },
  // 关闭导航
  closeNav: function(e){
    publicJs.closeNav(e,this)
  },
  radioChange: function(e){
    console.log(e)
    var sum = 0;
    var parentId = e.target.dataset.parentid;
    var selfId = e.target.dataset.selfid;
    var valueId = e.target.dataset.valueid;
    var score =  e.detail.value.split(' ');
    console.log(score)  //A  5

    this.data.values[valueId-1] = Number(score[1]);

    this.data.titles[parentId].PrepareLessonScoreItem[selfId].selectScore = Number(score[1]);
    this.data.titles[parentId].PrepareLessonScoreItem[selfId].selectOption = score[0];
    this.setData({titles: this.data.titles});
    // console.log()
    //将value值相加
    for(var i = 0 ; i < this.data.titles.length; i++){
      var title = this.data.titles[i];
      for(var k = 0; k < title.PrepareLessonScoreItem.length; k++){
        var t = title.PrepareLessonScoreItem[k];
        if(t.Kind == 1){
          sum += t.selectScore;
        }
      }
    }
    this.setData({sumScore: sum, values: this.data.values})
    var isIn = this.inArray(null,this.data.values)
    this.setData({isIn: isIn})
  },
  getarea: function(e){
    var parentId = e.target.dataset.parentid;
    var selfId = e.target.dataset.selfid;
    var valueId = e.target.dataset.valueid;
    var textareaValue = e.detail.value
    var reg = /^\s+$/;
    if(!reg.test(textareaValue) && textareaValue.length > 0){
      textareaValue = enjoy.utf16toEntities(textareaValue);
      this.data.values[valueId-1] = textareaValue;
    }else{
      this.data.values[valueId-1] = null
    }
    this.data.titles[parentId].PrepareLessonScoreItem[selfId].selectOption = textareaValue;
    this.setData({titles: this.data.titles,values: this.data.values})
    var isIn = this.inArray(null,this.data.values)
    this.setData({isIn: isIn})
  },
  showTip: function(){
    this.setData({showTip: true})
  },
  giveup: function(){
    this.setData({showTip: false})
  },
  // 获取题目
  getTitles: function(){
    this.setData({isAjaxOver: false})
    var that = this;
    var token = this.data.teacherToken;
    var stamp = new Date().getTime(); 
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      classyear: this.data.year,
      semester :this.data.semesterNum,
      lesson: this.data.kejieNum,
      kindfirst :this.data.targets,
      teachercode : this.data.teacher.TeacherCode,
      deptcode: this.data.DeptCode,
      grade:this.data.teacher.GradeXuke[this.data.selectId].Grade
    }
    var option = {
      api:'api/PrepareLesson/GetTeacherScore',
      query: query,
      type: 'get',
    }
    wx.showLoading({
      title:'努力加载中...',
      success: function(){
        requests.request(option, function(res){
          getRes(res);
        })
        function getRes(res){
          that.setData({titles:[],isAjaxOver: true})
          var resData = res.data;
          var data = resData.AppendData;
          var endScore = 0;
          if(resData.ResultType == 0){
            for(var i = 0 ; i < data.length; i++){
              data[i].KindSecondScore = 0;
              for(var k = 1; k <= data[i].PrepareLessonScoreItem.length; k++){
                // 计算每个类目的分数总和
                data[i].KindSecondScore += data[i].PrepareLessonScoreItem[k-1].TotalScore;
                data[i].PrepareLessonScoreItem[k-1].selectScore = 0;
                data[i].PrepareLessonScoreItem[k-1].Answer = data[i].PrepareLessonScoreItem[k-1].Answer?enjoy.uncodeUtf16(data[i].PrepareLessonScoreItem[k-1].Answer):null;
                //给题目加序号
                if( i == 0){
                  data[i].PrepareLessonScoreItem[k-1].id = k
                }else{
                   data[i].PrepareLessonScoreItem[k-1].id = k+data[i-1].PrepareLessonScoreItem[data[i-1].PrepareLessonScoreItem.length-1].id
                }
                // 获取选择的项对应的分数
                for(var key in data[i].PrepareLessonScoreItem[k-1]){
                  var answer = data[i].PrepareLessonScoreItem[k-1].Answer?enjoy.uncodeUtf16(data[i].PrepareLessonScoreItem[k-1].Answer):null;
                  if(key.endsWith(answer)){
                    data[i].PrepareLessonScoreItem[k-1].selectOptionScore = data[i].PrepareLessonScoreItem[k-1][key]

                    endScore += data[i].PrepareLessonScoreItem[k-1][key]
                  }
                }
                that.data.values.push(null)
              }
            }
            that.setData({titles: data,values:that.data.values, endScore:endScore })
            console.log(data)
       
          }else if(res.data.ResultType == 7){
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          }
          setTimeout(()=>{
            wx.hideLoading()
          },500)
        }
      }
    })
  },
  save: function(e){
    var that = this;
    wx.showModal({
      title: '',
      content: '确认提交评分, 提交后不可修改!',
      confirmText:'提交',
      showCancel: true,
      success: function(res) {
        if(res.confirm) {
           that.saveFun();
        }else if(res.cancel) {
          return;
        }
       
      }
    })
  },
  saveFun:function(){
    var that = this;
    if(that.inArray(null,that.data.values)) return;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳

    var data = [];
    // 组装要提交的数据
    var titles = this.data.titles;
    for(var i = 0 ; i < titles.length; i++){
      for(var k = 0 ; k < titles[i].PrepareLessonScoreItem.length; k++){
        data.push({
          Code: titles[i].PrepareLessonScoreItem[k].Code,
          Answer: titles[i].PrepareLessonScoreItem[k].selectOption,
        })
      }
    }
    var jsonData = {
      "ClassYear": this.data.year,
      "Semester": this.data.semesterNum,
      "DeptCode": this.data.DeptCode,
      "Lesson": this.data.kejieNum,
      "Grade": this.data.teacher.GradeXuke[this.data.selectId].Grade,
      "TeacherCode": this.data.teacher.TeacherCode,
      "AnswerKind": 2,
      "FromPrepareLessonScoreItem": data
    }


    var query = {
      appid: appId,
      timestamp: stamp,
      token: token
    }
    var option = {
      api: 'api/PrepareLesson/SaveTeacherScore',
      query: query,
      type: 'post',
      data: jsonData
    }
    wx.showLoading({
      title:'保存中',
      success: function(){
        requests.request(option, function(res){
          saveRes(res);
        })
        function saveRes(res){
          var resData = res.data;
          if(resData.ResultType == 0){
            wx.showToast({
              title: '提交成功',
              icon: 'success',
              duration: 2000
            })
            setTimeout(()=>{
              // if(that.data.targets =='教学表现'){
              //   that.data.teacher.GradeXuke[that.data.selectId].LessonTeacher = 2;
              //   that.data.teacher.GradeXuke[that.data.selectId].LessonTeacherScore = that.data.sumScore;
              // }else if(that.data.targets == '教案'){
              //   that.data.teacher.GradeXuke[that.data.selectId].LessonPlan = 2;
              //   that.data.teacher.GradeXuke[that.data.selectId].LessonPlanScore = that.data.sumScore;
              // }
              wx.setStorageSync('isSubmit',true)
              wx.navigateBack({
                delta: 1
              })
            },1000)
          }else if(resData.ResultType == 7){
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          }
          setTimeout(()=>{
            wx.hideLoading()
          },500)
        }
      }
    })
  },
  
  inArray: function(ele,arr){
    for (var i = 0; i < arr.length; i++) { 
　　  if (arr[i] == ele) return true;
    } 
    return false;
  },
  // // 过滤表情
  // utf16toEntities: function(str) { 
  //   var patt=/[\ud800-\udbff][\udc00-\udfff]/g; // 检测utf16字符正则 
  //   str = str.replace(patt, function(char){ 
  //           var H, L, code; 
  //           if (char.length===2) { 
  //               H = char.charCodeAt(0); // 取出高位 
  //               L = char.charCodeAt(1); // 取出低位 
  //               code = (H - 0xD800) * 0x400 + 0x10000 + L - 0xDC00; // 转换算法 
  //               return "&#" + code + ";"; 
  //           } else { 
  //               return char; 
  //           } 
  //       }); 
  //   return str; 
  // },
  // //反编译表情
  // uncodeUtf16: function(str){
  //   var reg = /\&#.*?;/g;
  //   var result = str.replace(reg,function(char){
  //       var H,L,code;
  //       if(char.length == 9 ){
  //           code = parseInt(char.match(/[0-9]+/g));
  //           H = Math.floor((code-0x10000) / 0x400)+0xD800;
  //           L = (code - 0x10000) % 0x400 + 0xDC00;
  //           return unescape("%u"+H.toString(16)+"%u"+L.toString(16));
  //       }else{
  //           return char;
  //       }
  //   });
  //   return result;
  // },
 


})