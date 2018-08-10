var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;
Page({
  data: {
    show1: false, //控制学校列表的显示隐藏
    show2: false, //控制其他学校的显示隐藏
    schoolName: '选择接收学校', //学校名称
    isAjaxOver1: false, 
    setSchoolList:[], // 学校列表
    show: false,
    isAjaxOver:true,
    arr:[],
    isHidden: false,
    submitText:'提 交',
    question4:[
      {value:"巨人", checked: false},
      {value:"学而思", checked: false},
    ],
    question5:[
      {value:"别人都在学", checked: false},
      {value:"提高课内成绩", checked: false},
      {value:"锻炼孩子的思维", checked: false},
      {value:"小升初升学", checked: false}
    ],
    question6:[
      {value:"课堂有趣，吸引人", checked: false},
      {value:"老师关注自己，得到更多的肯定", checked: false},
      {value:"课外教材的内容能够帮助自己", checked: false},
      {value:"课外学习让自己学习成绩提升", checked: false},
      {value:"自己的变化", checked: false},
      {value:"结交到更多的朋友", checked: false},
      {value:"其它", checked: false},
    ],
    question7:[
      {value:"孩子的学习是否愉悦", checked: false},
      {value:"吸收了多少知识", checked: false},
      {value:"课外学习让孩子提高了多少分数", checked: false},
      {value:"课外学习对孩子学习能力是否有提升", checked: false},
      {value:"孩子在性格、学习积极性等方面发生了变化", checked: false},
      {value:"老师对孩子在学习方面的评价，提出针对性的学习建议", checked: false},
      {value:"其它", checked: false},
    ]
  },
  onReady: function(){
    this.selectPopup = this.selectComponent("#selectPopup");
  },
  onLoad: function(option){
    console.log(!option)
    if(option.id){
      this.setData({
        info: JSON.parse(option.id),
        sXueKe:JSON.parse(option.id).sXueKe
      })
      this.getAllSchool();
    }else{
      this.teacherToken = wx.getStorageSync('teacherToken')
      this.sStudentCode = option.sStudentCode;
      this.nXueKe = option.nXueKe;
      this.sGradeName = option.sGradeName;
      this.getSubmit();
      this.setData({submitDisabled: true})
    }

  },
  postResult: function(e){
    var that = this;
    var baseData = {
      "OrderCode": this.data.info.OrderCode,
      "sTeacherCode": this.data.info.sTeacherCode,
      "sStudentCode": this.data.info.sStudentCode,
      "nXueKe": this.data.info.nXueKe,
    }
    
    var data = Object.assign(baseData,e.detail.value);

    console.log(data);
  
    // return;
    if(!data.sExtraClass||!data.sExtraClassGoal ||!data.sExtraClassParentsWish||!data.sExtraClassStudentWish||!data.sPreschool||!data.sReceiveSchool){
      publicJs.resultTip('请将问卷填写完整');
      return;
    }
    if(data.sReceiveSchool == '是'){
      if(data.sReceiveSchoolName == '选择接收学校'){
        publicJs.resultTip('请选择接收学校');
        return;
      }
    }
    if(data.sExtraClass == '是'){
      if(data.sExtraClassName == ''){
        publicJs.resultTip('请选择培训机构');
        return;
      }
    }
    var query = {
      timestamp: new Date().getTime(),
      appid:appId
    }
    var option = {
      api: 'api/JDCard/SaveQuestionnaireForJDCard',
      query: query,
      type: 'post',
      data: data
    }
    wx.showLoading({
      title:'提交中',
      success: function(){
        requests.request(option, function(res){
          saveRes(res);
        })
        function saveRes(res){
          console.log(11111)
          console.log(res)
          var resData = res.data;
          if(resData.ResultType == 0){
            wx.showToast({
              title: '提交成功',
              icon: 'success',
              duration: 2000
            })
            that.setData({submitText:'已提交, 请自行退出',disabled: true})
            // setTimeout(function(){
            //   wx.navigateBack({ delta: 1 })
            // },1000)
          }else if(resData.ResultType == 1){
            publicJs.resultTip('您已做过此问卷调查');
            that.setData({submitText:'提 交',disabled: true})
          }else if(resData.ResultType == 7){
            publicJs.resultTip(resData.Message);
          }
          setTimeout(()=>{
            wx.hideLoading()
          },500)
        }
      }
    })
  },
  // 关闭弹窗
  closePopup: function(e){
    this.selectPopup.closePopup()
  },
  // 显示答案选项弹窗
  getIndex: function(e){
    console.log(e)
    this.tipId = Number(e.target.dataset.id);
    this.setData({arr: this.data.selections[this.tipId-1]})
    this.selectPopup.showPopup();
  },
  // 取值
  Change1: function(e){
    this.setData({quesValue1:e.detail.value})
  },
  Change2: function(e){
    this.setData({quesValue2:e.detail.value})
  },
  Change3: function(e){
    this.setData({quesValue3:e.detail.value})
  },
  Change4: function(e){
    this.setData({quesValue4:e.detail.value.length?JSON.stringify(e.detail.value):''})
  },
  Change5: function(e){
    this.setData({quesValue5:e.detail.value.length?JSON.stringify(e.detail.value):''})
  },
  Change6: function(e){
    this.setData({quesValue6:e.detail.value.length?JSON.stringify(e.detail.value):''})
  },
  Change7: function(e){
    this.setData({quesValue7:e.detail.value.length?JSON.stringify(e.detail.value):''})
  },
  // 关闭弹窗
  closeFloat: function(e){
    publicJs.closeFloat(e,this)
  },
   // 关闭弹窗
  closeFloat1: function(e){
    publicJs.closeFloat(e,this)
  },
  // 显示学校列表的弹窗
  showFloatSchoolList: function(e){
    this.setData({show1: true})
  },
  // 显示其他弹窗
  showOther:function(e){
    this.setData({
      show2: true,
      show1: false,
    })
  },
  // 点击学校列表获取学校
  getIndex1: function(e){
    this.data.schoolName = '['+ e.target.dataset.district + ']'+ e.target.dataset.schoolname;
    this.setData({
      schoolName: this.data.schoolName,
      show1: false,
      setSchoolList:this.data.AllSchool,
      inpValue:'',

    })
  },
  // 填写其他学校名
  writeVlaue:function(e){
    this.setData({
      otherSchoolName: e.detail.value
    })
  },
  //获取其他学校的值
  otherSchool: function(){
    if(this.data.otherSchoolName){
      this.setData({
        schoolName: this.data.otherSchoolName,
      })
    }else{
      this.setData({
        schoolName: '选择接收学校',
      })
    }
    this.setData({
      show2: false
    })
  },
  // 检索学校名
  selectName: function(e){
    var allSchool = this.data.AllSchool;
    var len = allSchool.length;
    var values = e.detail.value;
    this.setData({
      inpValue: e.detail.value
    })
    this.data.selectSchoolList = [];
    if(this.data.inpValue.length != 0){
      for(var i = 0 ; i <len; i++){
        var school = allSchool[i];
        if(school.schoolName.indexOf(values) != -1){
          this.data.selectSchoolList.push(school)
        }
      }
      this.setData({setSchoolList:this.data.selectSchoolList})
    }else{
      this.setData({setSchoolList:this.data.AllSchool})
    }
  },
  // 获取全部学校列表
  getAllSchool: function(){
    var that = this;
    var nxuebu = this.data.info.nXueBu;   //学部信息
    var stamp = new Date().getTime();  //时间戳
    var query = {
      appid: appId,
      timestamp:stamp,
      nxuebu:nxuebu,
    }
    var option = {
      api:'api/School',
      query: query,
      type: 'get',
    }
    requests.request(option, function(res){
      getRes(res)
    })
    function getRes(res){
      var resData = res.data;
      that.data.AllSchool = [];
      if(resData.ResultType == 0){
        var schoolInfos = resData.AppendData;
        for(var i = 0 ; i < schoolInfos.length; i++){
          var school = schoolInfos[i]
          that.data.setSchoolList.push({
            schoolDistrict:school.sDistrict,
            schoolName:school.sName,
            schoolId:school.ID
          })
        }
        that.setData({
          setSchoolList: that.data.setSchoolList,
          AllSchool: that.data.setSchoolList,
          isAjaxOver1: true
        })
      }
    }
  },
  // 
  // /
  // 获取提交的表单
  getSubmit:function(){
    var that = this;
    var stamp = new Date().getTime();  //时间戳
    var query = {
      appid: appId,
      timestamp:stamp,
      token:this.teacherToken,
      sstudentcode:this.sStudentCode,
      nxueke:this.nXueKe,
      sgradename:this.sGradeName,
    }
    var option = {
      api:'api/JDCard/GetQuestionnaireForJDCard',
      query: query,
      type: 'get',
    }
    wx.showLoading({
      title:'努力加载中...',
      success: function(){
        requests.request(option, function(res){
          getRes(res)
        })
      }
    })
    
    function getRes(res){
      console.log(res)
      var resData = res.data;
      if(resData.ResultType == 0){
          var student ={};
          var datas = resData.AppendData;
          student.sStudentName = datas.sStudentName;
          student.sGradeName = datas.sGradeName;
          student.sParents1Phone = datas.sParents1Phone
          student.sReceiveSchool = datas.sReceiveSchool
          student.sReceiveSchoolName = datas.sReceiveSchoolName
          student.sPreschool = datas.sPreschool
          student.sExtraClass = datas.sExtraClass
          student.sExtraClassName = datas.sExtraClassName==null?null:(datas.sExtraClassName.indexOf('[')!=-1?JSON.parse(datas.sExtraClassName):(datas.sExtraClassName.indexOf(',')==-1?JSON.parse(('["'+datas.sExtraClassName+'"]')):datas.sExtraClassName.split(',')));
          student.sExtraClassGoal = JSON.parse(datas.sExtraClassGoal)
          student.sExtraClassStudentWish = JSON.parse(datas.sExtraClassStudentWish)
          student.sExtraClassParentsWish = JSON.parse(datas.sExtraClassParentsWish)
          // 处理question4
          if(student.sExtraClassName){
            for(var i = 0 ; i < student.sExtraClassName.length; i++){
                for(var k = 0 ; k <that.data.question4.length; k++ ){
                  if(student.sExtraClassName[i] == that.data.question4[k].value){
                    that.data.question4[k].checked = true;
                  }
                }
            }
          }
          // 处理question5
          for(var i = 0 ; i < student.sExtraClassGoal.length; i++){
              for(var k = 0 ; k <that.data.question5.length; k++ ){
                if(student.sExtraClassGoal[i] == that.data.question5[k].value){
                  that.data.question5[k].checked = true;
                }
              }
          }
          // 处理question6
          for(var i = 0 ; i < student.sExtraClassStudentWish.length; i++){
              for(var k = 0 ; k <that.data.question6.length; k++ ){
                if(student.sExtraClassStudentWish[i] == that.data.question6[k].value){
                  that.data.question6[k].checked = true;
                }
              }
          }
          // 处理question7
          for(var i = 0 ; i < student.sExtraClassParentsWish.length; i++){
              for(var k = 0 ; k <that.data.question7.length; k++ ){
                if(student.sExtraClassParentsWish[i] == that.data.question7[k].value){
                  that.data.question7[k].checked = true;
                }
              }
          }

          that.setData({
            question4:that.data.question4,
            question5:that.data.question5,
            question6:that.data.question6,
            question7:that.data.question7,
            schoolName: student.sReceiveSchoolName,
            student: student,
            info:{sStudentName:student.sStudentName,sGradeName:student.sGradeName,sParents1Phone:student.sParents1Phone}
          }) 
      }
      setTimeout(()=>{wx.hideLoading();},500)
    }
  },
})