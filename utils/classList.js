var sortClassAsWeek = require('./sortClassAsWeek.js');
var sortClassAsQi = require('./sortClassAsQi.js');

// 获取班级列表并排序
function classList(classes, resData, obj){
  if(!resData.length){
    obj.setData({classes:[{id:0,value:'您此学期没有课程'}]});
    obj.setData({classInn: '您此学期没有课程',kejieInn:"请选择"})
  }else{
    classes = [];
    var classArr = [];
    
    // console.log(resData);
    for(var i = 0 ; i < resData.length; i++){
      var cur = resData[i];
      var dotIndex = cur.sTime.indexOf(',');
      var lineIndex = cur.sTime.indexOf('-');

      if(dotIndex == -1){
        // var times = cur.sPrintTime.slice(0,lineIndex); //上课时间
        var times = cur.sTimeQuanTumName+' '+cur.sTime.slice(0,lineIndex); //上课时间
      }else{
        // var times = cur.sPrintTime.slice(dotIndex+1,lineIndex);
        var times = cur.sTimeQuanTumName+' '+cur.sTime.slice(dotIndex+1,lineIndex)
      }
      var kemu = cur.sDeptName.substr(2,3);  //学科
      var sClassName = cur.sClassName;  //班级名称
      var studentNumber = cur.studentNum; //学生数量
      var lessonNumber = cur.nLesson; //课节数量
      var SectBegin = cur.SectBegin; //排序时间

      if(!SectBegin){
        if(cur.sTime){
          SectBegin = cur.dtBeginDate+'T'+cur.sTime.slice(0,lineIndex)+':00'
        }else{
          SectBegin = cur.dtBeginDate+'T00:00:00';
        }
      }
      // console.log(resData)
      // if(resData[i].sTimeQuanTumCode && resData[i].sTimeQuanTumCode.indexOf('P') == 0){

      //   if(resData[i].sTimeQuanTumCode.charAt(1) == '0'){
      //     times = '零期' + times;
      //     var grade = times +' '+ cur.sGrade + kemu;
      //   }else if(resData[i].sTimeQuanTumCode.charAt(1) == '1'){
      //     times = '一期' + times;
      //     var grade =  times +' '+ cur.sGrade + kemu;
      //   }else if(resData[i].sTimeQuanTumCode.charAt(1) == '2'){
      //     times = '二期' + times;
      //     var grade =  times +' '+ cur.sGrade + kemu;
      //   }else if(resData[i].sTimeQuanTumCode.charAt(1) == '3'){
      //     times = '三期' + times;
      //     var grade =  times +' '+ cur.sGrade + kemu;
      //   }else if(resData[i].sTimeQuanTumCode.charAt(1) == '4'){
      //     times = '四期' + times;
      //     var grade =  times +' '+ cur.sGrade + kemu;
      //   }
      // }else{
      //   var grade = times +' '+ cur.sGrade + kemu;
      // }
      var grade = times +' '+ cur.sGrade + kemu;
      classArr.push({
        SectBegin: SectBegin,
        grade: grade,
        classCode: cur.sClassCode,
        times: times,
        kemu: kemu,
        sClassName: sClassName,
        studentNumber: studentNumber,
        lessonNumber: lessonNumber,
        nGrade: cur.nGrade, //年级 阿拉伯数字
        sGrade: cur.sGrade, //年级 汉字
        nTBCount:cur.nTBCount,//退班人数
        sAddress:cur.sAddress, //小区
        sRoomName:cur.sRoomName, //教室
        dtBeginDate:cur.dtBeginDate, //开始时间
      })
    }
    console.log(classArr)
    // 给班级排序
    if(classArr[0].times.indexOf('期') != -1){
      // 按‘期’排序
      var newClassArr = sortClassAsQi.sortClassAsQi(classArr);
      console.log(newClassArr)
    }else{
      // 按‘星期’排序
      var newClassArr = sortClassAsWeek.sortClassAsWeek(classArr);
    }
    var j = 0;
    for(var k in newClassArr){
      j++;
      classes.push({id: j-1, value:newClassArr[k].grade})
    }
    obj.setData({classes:classes, classInfo:newClassArr ,isAjaxOver:true})
    wx.setStorageSync('studentSize',newClassArr.studentNumber)
    wx.setStorageSync('classInfo',newClassArr);
  }
}

module.exports = {
  classList:classList
}