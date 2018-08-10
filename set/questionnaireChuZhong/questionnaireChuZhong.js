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
    question5:[
      {value:'高思',checked:false},
      {value:'学而思',checked:false},
      {value:'新东方',checked:false},
      {value:'巨人',checked:false},
      {value:'优才',checked:false},
      {value:'诸葛学堂',checked:false},
      {value:'朴新',checked:false},
      {value:'杰睿',checked:false}
    ]
  },
  onReady: function(){
    this.selectPopup = this.selectComponent("#selectPopup");
  },
  onLoad: function(option){

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

    if(!data.sSchoolScore || !data.sReceiveSchool|| !data.sExperimentClass || !data.sExtraClass){
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
      if(data.sExtraClassName == '' || data.sExtraClassYear == ''){
        publicJs.resultTip('请选择培训机构和培训年限');
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
          var resData = res.data;
          // var resD = JSON.parse(res.data)
          if(resData.ResultType == 0){
            wx.showToast({
              title: '提交成功',
              icon: 'success',
              duration: 2000
            })
            that.setData({submitText:'已提交, 请自行退出',disabled: true})
            // setTimeout(()=>{
            //   wx.navigateBack({ delta: 1 })
            // },1000)
          }else if(resData.ResultType == 1){
            publicJs.resultTip('您已做过此问卷调查');
            that.setData({submitText:'提 交',disabled: true})
          }else if(resData.ResultType == 7){
            // console.log(resData.message)
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
    this.setData({arr: this.data.selections[this.tipId-1],isHidden:true})
    this.selectPopup.showPopup();
  },
  Change1:function(e){
    this.setData({quesValue1:e.detail.value})
  },
  Change2:function(e){
    this.setData({quesValue2:e.detail.value})
  },
  Change3:function(e){
    this.setData({quesValue3:e.detail.value})
  },
  Change4:function(e){
    this.setData({quesValue4:e.detail.value})
  },
  Change5:function(e){
    this.setData({quesValue5:e.detail.value.length?JSON.stringify(e.detail.value):''})
  },
  Change6:function(e){
    this.setData({quesValue6:e.detail.value})
  },

  // 关闭弹窗
  closeFloat: function(e){
    publicJs.closeFloat(e,this)
    this.setData({
      isHidden: false
    })
  },
   // 关闭弹窗
  closeFloat1: function(e){
    publicJs.closeFloat(e,this)
    this.setData({
      isHidden: false
    })
  },
  // 显示学校列表的弹窗
  showFloatSchoolList: function(e){
    this.setData({show1: true,})
    // isHidden:true
  },
  // 显示其他弹窗
  showOther:function(e){
    this.setData({
      show2: true,
      show1: false,
      isHidden:true
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
      isHidden:false
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
      show2: false,
      isHidden: false
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
    // 设置setSchoolList的值
    console.log(this.data.info)
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
          var datas = resData.AppendData
          student.sStudentName = datas.sStudentName;
          student.sGradeName = datas.sGradeName;
          student.sParents1Phone = datas.sParents1Phone
          student.sSchoolScore = datas.sSchoolScore
          student.sReceiveSchool = datas.sReceiveSchool
          student.sReceiveSchoolName = datas.sReceiveSchoolName
          student.sExperimentClass = datas.sExperimentClass
          student.sExtraClass = datas.sExtraClass
          student.sExtraClassName = datas.sExtraClassName==null?null:(datas.sExtraClassName.indexOf('[')!=-1?JSON.parse(datas.sExtraClassName):(datas.sExtraClassName.indexOf(',')==-1?JSON.parse(('["'+datas.sExtraClassName+'"]')):datas.sExtraClassName.split(',')))
          student.sExtraClassYear = datas.sExtraClassYear
          student.sWeakness = datas.sWeakness?datas.sWeakness:'未填写'
          if(student.sExtraClassName){
            // 处理question4
            for(var i = 0 ; i < student.sExtraClassName.length; i++){
                for(var k = 0 ; k <that.data.question5.length; k++ ){
                  if(student.sExtraClassName[i] == that.data.question5[k].value){
                    that.data.question5[k].checked = true;
                  }
                }
            }
          }
          that.setData({
            question5:that.data.question5,
            schoolName: student.sReceiveSchoolName,
            student: student,
            info:{sStudentName:student.sStudentName,sGradeName:student.sGradeName,sParents1Phone:student.sParents1Phone}
          })
      }
      setTimeout(()=>{wx.hideLoading();},500)
    }
  },

})