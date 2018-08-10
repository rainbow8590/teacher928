
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
var enjoy = require('../../utils/enjoy.js');
var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;
Page({
  data: {
    tabBarArr:[
      {id:0,txt:'录入',classname:'icon-write',changeTextColor:'#1FBB1C',isChange: true},
      {id:1,txt:'查询',classname:'icon-searchactive',changeTextColor:'#888',isChange: false},
      {id:2,txt:'任务',classname:'icon-tasking',changeTextColor:'#888',isChange: false},
      {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888',isChange: false},
    ],
   
    teacherName:'',
    showModalStatus: false,
    isopen:'open',
    hasSubmit: false,
    jinmenkaoScore:[],
    kejieScore:[],
    prevDisabled:false,
    nextDisabled:false,
    showArea: false,
    gameOver: false,
    focus: false,
    count: 0,
    
  },

  onReady: function(){
    this.menu = this.selectComponent("#menu");
  },
  onLoad: function(option){
    this.isPageOver = true; // 判断翻页是否完成
    var that = this;
    this.setData({
      identity: wx.getStorageSync('identity'),
      RemarkStudentsList: wx.getStorageSync('RemarkStudentsList'),
      nowIndex : Number(option.index),
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
    })
    this.setData({
      student: this.data.RemarkStudentsList[this.data.nowIndex],
    })
    if(this.data.nowIndex == 0){
      this.setData({prevDisabled: true})
    }else if(this.data.nowIndex == this.data.RemarkStudentsList.length-1){
      this.setData({nextDisabled: true})
    }else{
      this.setData({prevDisabled: false, nextDisabled: false})
    }

    // 获取手机宽高
    publicJs.getSystem(that,function(){
      that.setData({tableH: that.data.windowHeight-55})
    });
    this.getScore();

     
    
  },
  // PageTouch(e){
  //   if(this.data.textareaValue.length == 0){
  //     this.setData({textareaValue:'请填写70-150个字的教师寄语'})
  //   }
  //   this.setData({showArea: false,showAreawrap:true,focus: false})
  // },
  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
  },
  // 菜单按钮
  powerDrawer: function (e) {
    publicJs.powerDrawer(e,this)
  },
  // 关闭导航
  closeNav: function(e){
    publicJs.closeNav(e,this)
  },
  // 关闭弹窗
  closeFloat: function(e){
    publicJs.closeFloat(e,this)
  },
   // 退出登录
  unlogin: function(){
    publicJs.unlogin()
  },
  showArea: function(){
    this.setData({showArea: true})
  },
  showTip: function(){
    this.setData({show: true, showArea: false})
  },
  giveup: function(){
    this.setData({show: false,showArea: true})
  },
  closeArea: function(){
    this.setData({showArea: false,showClose: true})
  },
  close: function(){
    this.setData({showArea: false,showClose: false,textareaValue:this.data.Remark?this.data.Remark:this.data.showText,count:this.data.showText.length})
  },
  giveupClose: function(){
    this.setData({showArea: true,showClose: false})
  },
  // 获取文本框内容
  getTextareaValue(e){
    var val = '';

    val = e.detail.value.replace(/(^\s+)|(\s+$)/g,'');
    val = val.replace(/[\r\n]/g,' ');
    this.setData({textareaValue: e.detail.value, count: val.length})
  },
  // 文本框失去焦点, 就显示替代的文本框
  changeTextarea(){
    if(!this.data.textareaValue.length){
      this.setData({textareaValue:'请填写70-150个字的教师寄语'})
    }
    this.setData({focus: false,show: false,showAreawrap: true, showArea: false})
  },
  clearTextareaValue: function(){
    this.setData({focus: true})
    if(this.data.textareaValue == '请填写70-150个字的教师寄语'){
      this.setData({textareaValue:''})
    }
  },

  submit: function(){
    this.setData({show: false,showArea: false})
    this.setData({textareaValue:this.data.textareaValue.replace(/(^\s+)|(\s+$)/g,'')})
    this.setData({textareaValue:this.data.textareaValue.replace(/[\r\n]/g,' ')})

    var len = this.data.textareaValue.length;
    if(len < 70 || len > 150){
      publicJs.resultTip('老师寄语须在70-150字之间');
      this.setData({showArea: true})
      return;
    }

    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var sClassCode = this.data.RemarkStudentsList[this.data.nowIndex].sClassCode;
    var sStudentCode = this.data.RemarkStudentsList[this.data.nowIndex].sStudentCode;

    var query = {
      appid: appId,
      timestamp: stamp,
      token: token,
    }
    var data = {
      Remark: enjoy.utf16toEntities(that.data.textareaValue),
      sStudentCode: sStudentCode,
      sClassCode: sClassCode,
    }
    console.log(query.remark)
    var option = {
      api: 'api/SummerTask/SaveClassTaskRemark',
      query: query,
      type: 'post',
      data: data
    }
    wx.showLoading({
      title:'保存中',
      success: function(){
        requests.request(option, function(res){
          console.log(res)
          saveRes(res);
        })
        function saveRes(res){
          var resData = res.data;
          if(resData.ResultType == 0){
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
            that.setData({showText:  enjoy.uncodeUtf16(that.data.textareaValue)})
            wx.setStorageSync('student',that.data.RemarkStudentsList[that.data.nowIndex])
         
          }else if(resData.ResultType == 7){
            publicJs.resultTip(res.data.Message)
          }
          setTimeout(()=>{
            wx.hideLoading()
          },500)
        }
      }
    })
  },
  prev: function(){
    var that = this;

    // console.log(this.isPageOver )
    // console.log(this.data.Remark )
   

    if(!this.isPageOver) return;
    this.isPageOver = false;
    
    // 当前学生在编辑时, 点击上一个要给提示信息
    
    // if(!this.data.Remark && this.data.textareaValue != '请填写70-150个字的教师寄语'){
    //    // console.log(this.data.textareaValue)
    //   // console.log(this.data.textareaValue  == '请填写70-150个字的教师寄语')
    //   publicJs.resultTip('请先提交老师寄语!')
    //   this.isPageOver = true;
    //   return;
    // }
      that.data.nowIndex--;
      that.setData({nowIndex: that.data.nowIndex})
      if(that.data.nowIndex == 0){
        that.setData({prevDisabled: true})
      }else{
        that.setData({nextDisabled: false})
      }
      that.setData({
        student:that.data.RemarkStudentsList[that.data.nowIndex]
      })
      that.getScore();
    
  },
  next: function(){
    var that = this;
    if(!this.isPageOver) return;
    this.isPageOver = false;
    // 当前学生在编辑时, 点击下一个要给提示信息
    // if(!this.data.Remark && this.data.textareaValue != '请填写70-150个字的教师寄语'){
    //   publicJs.resultTip('请先提交老师寄语!')
    //   this.isPageOver = true;
    //   return;
    // }
    that.data.nowIndex++;
    that.setData({nowIndex: that.data.nowIndex})
    if(that.data.nowIndex == that.data.RemarkStudentsList.length-1){
      that.setData({nextDisabled: true})
    }else{
      that.setData({prevDisabled: false})
    }
    that.setData({
      student:that.data.RemarkStudentsList[that.data.nowIndex]
    })
    that.getScore();
  },
  showTextarea: function(){
     this.setData({focus: true})
    if(!this.data.textareaValue.length){
      this.setData({textareaValue:'请填写70-150个字的教师寄语'})
    }
    if(this.data.gameOver == true){
      this.setData({show: false,showAreawrap: true, showArea: false})
      this.setData({focus: false})
      return;
    }
    this.setData({show: false,showAreawrap: false, showArea: true})
    setTimeout(()=>{
      this.setData({focus: true})
    },300)
    
  },

  // 获取学生分数
  getScore: function(){
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳

    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      sclasscode:this.data.student.sClassCode,
      sstudentcode:this.data.student.sStudentCode,
    }
  
    var option = {
      api:'api/SummerTask/GetJinmenkaoTask',
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
          //console.log(res)
          var resData = res.data;

          if(resData.ResultType == 0){
            var datas = resData.AppendData;

            function sortAsLessonNo(a,b){  
              return a.nLessonNo-b.nLessonNo 
            }
            if(datas.Task.length){
              datas.Task.sort(sortAsLessonNo)
            }

            if(datas.Jinmenkao.length){
              datas.Jinmenkao.sort(sortAsLessonNo)
            }

            that.setData({
              jinmenkaoScore:datas.Jinmenkao,
              kejieScore:datas.Task,
              textareaValue: enjoy.uncodeUtf16(datas.Remark),
              Remark:enjoy.uncodeUtf16(datas.Remark),
              showText:enjoy.uncodeUtf16(datas.Remark),
              count:enjoy.uncodeUtf16(datas.Remark).length,
              endTime: datas.CourseEndDate.replace('T', ' ').replace(/\-/g, '/'),
              // endTime: '2018/07/01 00:00:00',
              classStr: datas.sStudentName +' '+ datas.sClassName
            })

            // 是否可编辑提交
            if(new Date().getTime() > new Date(that.data.endTime).getTime()){
              that.setData({gameOver: true})
              that.setData({show: false,showAreawrap: false, showArea: false})
            }else{
              that.setData({gameOver: false})
            }

            that.setData({show: false,showAreawrap: true, showArea: false})


          }else if(res.data.ResultType == 7){
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
          }
          setTimeout(()=>{
            wx.hideLoading()
            that.isPageOver = true;
          },500)
        }
        
      }
    })
  },
  
})
