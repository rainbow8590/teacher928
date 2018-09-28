
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');

//获取应用实例
var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;

Page({
  data: {
    tabBarArr:[
      {id:0,txt:'录入',classname:'icon-writeactive',changeTextColor:'#1FBB1C',isChange: true},
      {id:1,txt:'查询',classname:'icon-search',changeTextColor:'#888',isChange: false},
      {id:2,txt:'任务',classname:'icon-tasking',changeTextColor:'#888',isChange: false},
      {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888',isChange: false},
    ],
    kejieArr:[
      {id: 2, value: '第2讲'}
    ],
    classInfo:[],
    classes: [],
    teacherName:'',
    // schoolYear: new Date().getFullYear(),
    semester:'秋季',
    showModalStatus: false,
    isopen:'open',
    show:false, //控制弹窗的显示
    show1:false, //控制转发弹窗的显示

    tipKejieIndex: 0, //第几讲
    arr: [],//公共数组
    inpStr:'',//公共字符串
    classInn:'',
    kejieInn:'第2讲',
    studentsList: [],//学生信息集合
    resultH: 400, //表体的高度,
    classStr: '',//选择的班级信息
    zoomShow: false,
    isAjaxOver: true,
    sBookVersionInn:'',
    sBookNameInn: '',
    sBookChapterInn: '',
    sBookSectionInn: '',
    nSchoolBookInfoId: -1,
    showFloat: false
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.selectPopup = this.selectComponent("#selectPopup");
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(){
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      tipClassIndex: wx.getStorageSync('tipClassIndex'),
      tipKejieIndex: wx.getStorageSync('tipKejieIndex'),
      semesterIndex: wx.getStorageSync('semesterIndex'),
      year: wx.getStorageSync('year'),
      classInfo: wx.getStorageSync('classInfo'),
      noAuditing: wx.getStorageSync('noAuditing'),
      // openId:wx.getStorageSync('openId'),
      identity: wx.getStorageSync('identity')
    })
    // 设置班级
    var choiceClass = this.data.classInfo[this.data.tipClassIndex]
    // console.log(choiceClass)
    this.setData({
      classStr:choiceClass.classCode + choiceClass.sClassName,
      sClassCode: choiceClass.classCode
    })
    // console.log(this.data.sClassCode)
    // 获取手机宽高
    var that = this;
    publicJs.getSystem(that,function(){
      that.setData({resultH: that.data.windowHeight -42-55-41-56})
    });


    var classInfo = this.data.classInfo
    for(var i = 0 ; i < classInfo.length; i++){ 
      this.data.classes.push({id:i,value:classInfo[i].grade})
    }
    this.setData({classes: this.data.classes,classInn:this.data.classes[this.data.tipClassIndex].value})
    wx.setStorageSync('classes', this.data.classes)

    
    for(var j = 2; j <= classInfo[this.data.tipClassIndex].lessonNumber;j++){
      if( j % 2 == 0){
        this.data.kejieArr.push({id: j, value: '第'+ j +'讲'})
      }
    }
    // 删除‘请选择’项
    this.data.kejieArr.shift();
    this.setData({kejieArr: this.data.kejieArr})
    this.setData({kejieInn: this.data.kejieArr[this.data.tipKejieIndex-1].value})

    this.getBookInfo();
    this.getStudentsInfo();

  },
  getClass: function (e) {
    if(this.data.isAjaxOver){
      this.setData({arr: this.data.classes,inpStr: e.detail.detail})
      this.selectPopup.showPopup()
    }
  },
  getKejie: function (e) {
    if(this.data.isAjaxOver){
      this.setData({arr: this.data.kejieArr,inpStr: e.detail.detail})
      this.selectPopup.showPopup()
    }
  },
  getBook1: function (e) {
    
    this.setData({arr: this.data.kejieArr,inpStr: e.target.dataset.id})
    this.selectPopup.showPopup()
  },
  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
  },

  // 版本
  getBookVersion: function (e) {
    // console.log(this.data.versionArr)
    this.setData({arr: this.data.versionArr,inpStr: e.target.dataset.id})
    // console.log(this.data.arr)
    this.selectPopup.showPopup()
  },
  // 书名
  getBookName: function (e) {
    if(this.data.sBookVersionInn == ''){
      publicJs.resultTip('请先选择版本')
      // wx.showModal({
      //   title: '提示',
      //   content:'请先选择版本',
      //   showCancel: false
      // })
      return;
    }
    // 要修改的情况
    if(this.data.choiseVersionIndex == undefined){
      for(var i = 0 ; i < this.data.versionArr.length; i++){
        if(this.data.sBookVersionInn == this.data.versionArr[i].value){
          this.setData({choiseVersionIndex: i})
        }
      }
      // console.log( this.data.choiseVersionIndex)
   
      var choiseBooks = this.data.versions[this.data.choiseVersionIndex].Books;
      // 组装教材名
      var BooksArr = [];
      for(var i = 0 ; i < choiseBooks.length; i++){
        BooksArr.push({
          id: i,
          value:choiseBooks[i].sBookName,
        })
      }
      this.setData({
        BooksArr: BooksArr,
      })
    }
    this.setData({arr: this.data.BooksArr,inpStr: e.target.dataset.id})
    this.selectPopup.showPopup()
  },
  // 章
  getBookChapter: function (e) {
    if(this.data.sBookVersionInn == '' || this.data.sBookNameInn == ''){
      publicJs.resultTip('请先选择版本及教材')
      return;
    }

    // 修改情况下
    if(this.data.choiseVersionIndex == undefined || this.data.choiseBookIndex == undefined){
      for(var i = 0 ; i < this.data.versionArr.length; i++){
        if(this.data.sBookVersionInn == this.data.versionArr[i].value){
          this.setData({choiseVersionIndex: i}) //获取版本的ID
        }
      }
      var Books = this.data.versions[this.data.choiseVersionIndex].Books;
      var BooksArr = [];
      // 组装Book数组
      for(var i = 0 ; i < Books.length; i++){
        BooksArr.push({
          id: i,
          value:Books[i].sBookName,
        })
      }
      this.setData({BooksArr:BooksArr})
      // 获取教材ID
      for(var i = 0 ; i < BooksArr.length; i++){
        if(this.data.sBookNameInn == BooksArr[i].value){
          this.setData({choiseBookIndex: i}) //获取版本的ID
        }
      }
      // 组装章
      var choiseChapters = this.data.versions[this.data.choiseVersionIndex].Books[this.data.choiseBookIndex].Chapters;
      var chapterArr = [];
      for(var i = 0 ; i < choiseChapters.length; i++){
        chapterArr.push({
          id: i,
          value:choiseChapters[i].sBookChapter,
        })
      }
      this.setData({
        chapterArr: chapterArr,
      })
    }

    this.setData({arr: this.data.chapterArr,inpStr: e.target.dataset.id})
    this.selectPopup.showPopup()
  },
  //节
  getBookSection: function (e) {
    if(this.data.sBookVersionInn == '' || this.data.sBookNameInn == '' ||this.data.sBookChapterInn == '' ){
      publicJs.resultTip('请先选择版本、教材及章')
      return;
    }
    // 修改情况下
    if(this.data.choiseVersionIndex == undefined || this.data.choiseBookIndex == undefined || this.data.choiseChapterIndex == undefined){
      for(var i = 0 ; i < this.data.versionArr.length; i++){
        if(this.data.sBookVersionInn == this.data.versionArr[i].value){
          this.setData({choiseVersionIndex: i}) //获取版本的ID
        }
      }
      var Books = this.data.versions[this.data.choiseVersionIndex].Books;
      var BooksArr = [];
      // 组装Book数组
      for(var i = 0 ; i < Books.length; i++){
        BooksArr.push({
          id: i,
          value:Books[i].sBookName,
        })
      }
      this.setData({
        BooksArr: BooksArr,
      })
      // 获取教材ID
      for(var i = 0 ; i < BooksArr.length; i++){
        if(this.data.sBookNameInn == BooksArr[i].value){
          this.setData({choiseBookIndex: i}) //获取版本的ID
        }
      }

      // 组装章
      var choiseChapters = this.data.versions[this.data.choiseVersionIndex].Books[this.data.choiseBookIndex].Chapters;
      var chapterArr = [];
      for(var i = 0 ; i < choiseChapters.length; i++){
        chapterArr.push({
          id: i,
          value:choiseChapters[i].sBookChapter,
        })
      }
      this.setData({
        chapterArr: chapterArr,
      })
      // 获取章ID
      for(var i = 0 ; i < chapterArr.length; i++){
        if(this.data.sBookChapterInn == chapterArr[i].value){
          this.setData({choiseChapterIndex: i}) //获取版本的ID
        }
      }
      // 组装节数组
      var choiseSections = this.data.versions[this.data.choiseVersionIndex].Books[this.data.choiseBookIndex].Chapters[this.data.choiseChapterIndex].Sections;
      // 组装节
      var sectionArr = [];
      for(var i = 0 ; i < choiseSections.length; i++){
        sectionArr.push({
          id: i,
          value:choiseSections[i].sBookSection,
          nSchoolBookInfoId:choiseSections[i].nSchoolBookInfoId
        })
      }
      this.setData({
        sectionArr: sectionArr,
      })
    }
    this.setData({arr: this.data.sectionArr,inpStr: e.target.dataset.id})
    this.selectPopup.showPopup()
  },

  // 获取点击的弹窗的id和value值
  getIndex:function(e){
    var inpStr = this.data.inpStr;
    this.setData({show: false})
    if(inpStr == 'class'){  //班级
      if(this.data.classInn == this.data.arr[e.detail.detail.dataset.id].value) return;
      this.setData({
        classInn:this.data.arr[e.detail.detail.dataset.id].value, 
        tipClassIndex:e.detail.detail.dataset.id, 
      })
      // 设置班级
      var choiceClass = this.data.classInfo[this.data.tipClassIndex]
      this.setData({classStr:choiceClass.classCode + choiceClass.sClassName})

      this.getStudentsInfo();

      // 重新渲染课节
      this.data.kejieArr = [];
      var lesson = this.data.classInfo[this.data.tipClassIndex].lessonNumber;
      for(var i = 2 ; i <= lesson; i++){
        if( i % 2 == 0){
          this.data.kejieArr.push({id: i, value: '第'+i+'讲'});
        }
      }

      this.setData({kejieArr: this.data.kejieArr});

      var flagArr = [];
      for(var i = 0; i < this.data.kejieArr.length; i++){
        if(this.data.kejieInn == this.data.kejieArr[i].value){
          flagArr.push(0)
        }else{
          flagArr.push(1)
        }
      }

      if(flagArr.indexOf(0)!= -1){
        this.setData({kejieInn: this.data.kejieArr[flagArr.indexOf(0)].value});
      }else{
        this.setData({kejieInn: this.data.kejieArr[0].value});
      }


      // 缓存选择的班级信息的编号
      wx.setStorageSync('tipClassIndex',this.data.tipClassIndex);
    }else if(inpStr == 'kejie'){  //课节
      if(this.data.kejieInn == this.data.arr[e.detail.detail.dataset.index].value) return;
      this.setData({
        kejieInn:this.data.arr[e.detail.detail.dataset.index].value, 
        tipKejieIndex:e.detail.detail.dataset.index+1, 
      })
      this.getStudentsInfo();
      // console.log(this.data.tipKejieIndex)
      // 缓存选择的课节
      wx.setStorageSync('tipKejieIndex',this.data.tipKejieIndex);
    }else if(inpStr == 'version'){  //版本
      this.setData({
        sBookVersionInn:this.data.arr[e.detail.detail.dataset.index].value,  //改变显示值
        choiseVersionIndex: e.detail.detail.dataset.index,
        show: false , // 弹窗消失
      })
      var choiseBooks = this.data.versions[this.data.choiseVersionIndex].Books;
      // 组装教材名
      var BooksArr = [];
      for(var i = 0 ; i < choiseBooks.length; i++){
        BooksArr.push({
          id: i,
          value:choiseBooks[i].sBookName,
        })
      }
      this.setData({
        BooksArr: BooksArr,
        sBookNameInn:'',
        sBookChapterInn:'',
        sBookSectionInn:'',
        nSchoolBookInfoId: -1,
      })
    }else if(inpStr == 'name'){  //书名
      this.setData({
        sBookNameInn:this.data.arr[e.detail.detail.dataset.index].value,  //改变显示值
        choiseBookIndex: e.detail.detail.dataset.index,
        show: false , // 弹窗消失
      })
      var choiseChapters = this.data.versions[this.data.choiseVersionIndex].Books[this.data.choiseBookIndex].Chapters;
      // 组装章
      var chapterArr = [];
      for(var i = 0 ; i < choiseChapters.length; i++){
        chapterArr.push({
          id: i,
          value:choiseChapters[i].sBookChapter,
        })
      }
      this.setData({
        chapterArr: chapterArr,
        sBookChapterInn:'',
        sBookSectionInn:'',
        nSchoolBookInfoId: -1,
      })
    }else if(inpStr == 'chapter'){  //章
      this.setData({
        sBookChapterInn:this.data.arr[e.detail.detail.dataset.index].value,  //改变显示值
        choiseChapterIndex: e.detail.detail.dataset.index,
        show: false , // 弹窗消失
      })
      var choiseSections = this.data.versions[this.data.choiseVersionIndex].Books[this.data.choiseBookIndex].Chapters[this.data.choiseChapterIndex].Sections;
      // 组装节
      var sectionArr = [];
      for(var i = 0 ; i < choiseSections.length; i++){
        sectionArr.push({
          id: i,
          value:choiseSections[i].sBookSection,
          nSchoolBookInfoId:choiseSections[i].nSchoolBookInfoId
        })
      }
      this.setData({
        sectionArr: sectionArr,
        sBookSectionInn:'',
        nSchoolBookInfoId: -1,
      })
    }else if(inpStr == 'section'){  //节
      // console.log(this.data.arr)
      this.setData({
        sBookSectionInn:this.data.arr[e.detail.detail.dataset.index].value,  //改变显示值
        choiseSectionIndex: e.detail.detail.dataset.index,
        nSchoolBookInfoId:this.data.arr[e.detail.detail.dataset.index].nSchoolBookInfoId,
        show: false , // 弹窗消失
      })
    }
  },

  // 菜单按钮
  powerDrawer: function (e) {
    // console.log(121212)
    publicJs.powerDrawer(e,this)
  },
  // 关闭导航
  closeNav: function(e){
    publicJs.closeNav(e,this)
  },
  // 查看或修改四级联动
  showFloat: function(e){
    var index = e.currentTarget.dataset.index;
    this.setData({tipIndex: index})
    var info = this.data.studentsList[index];
    if(info.txt == '录入'){
      this.setData({
        sBookVersionInn: info.sBookVersion,
        sBookNameInn: info.sBookName,
        sBookChapterInn: info.sBookChapter,
        sBookSectionInn: info.sBookSection,
        nSchoolBookInfoId: info.nSchoolBookId,
        sDeptCode: info.sDeptCode,
        nLessonNo: info.nLessonNo,
        sStudentCode: info.sStudentCode,
        showFloat: true,
      })
    }else{
      this.getStudentInfo();
    }
  },
  // 获取一个班级的学生
  getStudentsInfo: function(){
    if(this.data.isAjaxOver==false) return;
    this.data.isAjaxOver = false;
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var classCode = this.data.classInfo[this.data.tipClassIndex].classCode;
    var lessonNum = this.data.kejieArr[this.data.tipKejieIndex-1].id

    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nlessonno:lessonNum,
      sclasscode:classCode,
    }
    // console.log(query)
    var option = {
      api:'api/SchoolSchedule/GetClassLessonSchoolSchedule',
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
          // console.log(res)
          var resData = res.data;
          if(resData.ResultType == 0){
            that.data.studentsList = [];
            var studentInfos = resData.AppendData;
            for(var i = 0 ; i < studentInfos.length; i++){
              var student = studentInfos[i]
              that.data.studentsList.push({
                nSchoolBookId: student.nSchoolBookId,
                sDeptCode: student.sDeptCode,
                nLessonNo: student.nLessonNo,
                sStudentCode: student.sStudentCode,
                sClassCode: student.sClassCode,
                sName: student.sStudentName,
                sSchoolName: student.sSchoolName == null? '':student.sSchoolName,
                sBookChapter: student.sBookChapter == null? '':student.sBookChapter,
                sBookName: student.sBookName == null? '':student.sBookName,
                sBookSection: student.sBookSection == null? '':student.sBookSection,
                sBookVersion: student.sBookVersion == null? '':student.sBookVersion,
                isWrite: student.sBookSection? true : false,
                txt:student.sBookSection?'查询':'录入'
              })
            }
            that.setData({studentsList:that.data.studentsList})
          }else if(res.data.ResultType == 7){
            // publicJs.resultTip('小学班级暂无公立校进度信息',function(){
            //   wx.redirectTo({ url: '/pages/index/index'})
            // })
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          }
          setTimeout(()=>{
            wx.hideLoading();
            that.setData({isAjaxOver: true})
          },500)
        }
        
      }
    })
  },
  // 获取一个学生
  getStudentInfo: function(){
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var student = this.data.studentsList[this.data.tipIndex];
    var classCode =  student.sClassCode;
    var studentCode =  student.sStudentCode;
    var lessonNum =  student.nLessonNo;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nlessonno:lessonNum,
      sclasscode:classCode,
      sstudentcode:studentCode,
    }
    var option = {
      api:'api/SchoolSchedule/GetClassLessonStudentSchoolSchedule',
      query: query,
      type: 'get',
    }
    this.setData({isAjaxOver: false})
    wx.showLoading({
      title:'努力加载中...',
      success: function(){
        requests.request(option, function(res){
          getRes(res);
        })
        function getRes(res){
          // console.log(res)
          var resData = res.data;
          if(resData.ResultType == 0){
            var student = {};
            var studentInfos = resData.AppendData;
            // console.log(studentInfos)
            student.nSchoolBookId = studentInfos.nSchoolBookId,
            student.sDeptCode = studentInfos.sDeptCode,
            student.nLessonNo = studentInfos.nLessonNo,
            student.sStudentCode = studentInfos.sStudentCode,
            student.sClassCode = studentInfos.sClassCode,
            student.sName = studentInfos.sStudentName,
            student.sSchoolName = studentInfos.sSchoolName == null? '--':studentInfos.sSchoolName,
            student.sBookChapter = studentInfos.sBookChapter == null? '':studentInfos.sBookChapter,
            student.sBookName = studentInfos.sBookName == null? '':studentInfos.sBookName,
            student.sBookSection = studentInfos.sBookSection == null? '':studentInfos.sBookSection,
            student.sBookVersion = studentInfos.sBookVersion == null? '':studentInfos.sBookVersion,
            student.isWrite = studentInfos.sBookSection? true : false,
            student.txt = student.sBookSection?'查询':'录入'
            that.setData({student:student,isAjaxOver: true})
            that.setData({
              sBookVersionInn: student.sBookVersion,
              sBookNameInn: student.sBookName,
              sBookChapterInn: student.sBookChapter,
              sBookSectionInn: student.sBookSection,
              nSchoolBookInfoId: student.nSchoolBookId,
              sDeptCode: student.sDeptCode,
              nLessonNo: student.nLessonNo,
              sStudentCode: student.sStudentCode,
              showFloat: true,
            })
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
  //获取教材信息
  getBookInfo: function(){
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var sClassCode = this.data.sClassCode;

    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      sclasscode:sClassCode,
    }
    var option = {
      api:'api/SchoolSchedule/GetSchoolBookInfo',
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
          var resData = res.data;
          var versions = res.data.AppendData.Versions;
          // console.log(res.data.AppendData.Versions)

          var versionArr = [];
          if(resData.ResultType == 0){
            for(var i = 0 ; i < versions.length; i++){
              // 组装版本
              versionArr.push({
                id: i,
                value: versions[i].sBookVersion
              })
            }
            that.setData({
              versions:versions, 
              versionArr:versionArr,
              isAjaxOver: true
            })
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
  giveup: function(){
    this.setData({
      sBookVersionInn:'',
      sBookNameInn: '',
      sBookChapterInn: '',
      sBookSectionInn: '',
      nSchoolBookInfoId: -1,
      showFloat: false
    })
  },
  // 储存学生分数
  saveInfo: function(e){
    var that = this;
    var token = this.data.teacherToken; // token值
    var stamp = new Date().getTime();  //时间戳
    var nSchoolBookInfoId = this.data.nSchoolBookInfoId;
    var sDeptCode = this.data.sDeptCode;
    var nLessonNo = this.data.nLessonNo;
    var sStudentCode = this.data.sStudentCode;
    
    var data = {
      nSchoolBookInfoId:nSchoolBookInfoId,
      sDeptCode:sDeptCode,
      nLessonNo:nLessonNo,
      sStudentCode:sStudentCode
    }
    var query = {
      appid: appId,
      timestamp: stamp,
      token: token
    }
    var option = {
      api: 'api/SchoolSchedule/SaveStudentSchoolSchedule',
      query: query,
      type: 'post',
      data: data
    }
    if(!that.data.sBookVersionInn||!that.data.sBookNameInn||!that.data.sBookChapterInn||!that.data.sBookSectionInn){
      publicJs.resultTip('请将版本号、教材、章、节填写完整!')

      return;
    }
    wx.showLoading({
      title:'保存中',
      success: function(){
        requests.request(option, function(res){
          saveRes(res);
        })
        function saveRes(res){
          var resData = res.data;
          // console.log(resData)
          // var resD = JSON.parse(res.data)
          if(resData.ResultType == 0){
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 1000,
              success: function(){}

            })
            setTimeout(()=>{
              var tipIndex = that.data.tipIndex;
              that.data.studentsList[tipIndex].txt = '查询';
              that.data.studentsList[tipIndex].isWrite = true;
              that.setData({studentsList: that.data.studentsList,showFloat: false});
              // wx.navigateBack({ delta: 1 })
              // wx.redirectTo({url:'/pages/schoolProgressList/schoolProgressList'})
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
  
})
