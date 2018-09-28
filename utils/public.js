var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;
var saveFormId = require('./saveFormId.js'); 
// 改变学年相关值
// function getYear(e,obj) {
//   console.log(e)
//   console.log(obj.data.isAjaxOver )
//   if(obj.data.isAjaxOver == true){
//     obj.setData({
//       show: true,
//       arr: obj.data.yearArr,
//       inpStr:e.target.dataset.id
//     })
//   }else{
//     return;
//   }
// }
// // 改变学期相关值
// function getSemester(e,obj) {
//   if(obj.data.isAjaxOver == true){
//     obj.setData({
//       show: true,
//       arr: obj.data.semesterArr,
//       inpStr:e.currentTarget.dataset.id
//     })
//   }else{
//     return;
//   }
// }
// // 改变班级相关值
// function getClass(e,obj) {
//   if(obj.data.isAjaxOver == true && obj.data.classes[0].value != '您此学期没有课程'){
//     obj.setData({
//       show: true,
//       arr: obj.data.classes,
//       inpStr:e.currentTarget.dataset.id
//     })
//   }else{
//     return;
//   }
// }

// function getKejie(e,obj){
//   if(obj.data.isAjaxOver == true && obj.data.classes[0].value != '您此学期没有课程'){
//     obj.setData({
//       show: true,
//       arr: obj.data.kejieArr,
//       inpStr:e.currentTarget.dataset.id
//     });
//   }else{
//     return;
//   }
// }
// function getType(e,obj){
//   if(obj.data.isAjaxOver == true){
//     obj.setData({
//       show: true,
//       arr: obj.data.typeArr,
//       inpStr:e.currentTarget.dataset.id
//     });
//   }else{
//     return;
//   }
// }
// function getGradeTerm(e,obj){
//   if(obj.data.isAjaxOver == true){
//     obj.setData({
//       show: true,
//       // arr: obj.data.gradeArr,
//       arr: obj.data.gradeTermArr,
//       inpStr:e.currentTarget.dataset.id,
//     });
//   }else{
//     return;
//   }
// }
// 改变年级相关值
/*function getGrade(e,obj) {
  if(obj.data.isAjaxOver == true){
    obj.setData({
      show: true,
      arr: obj.data.gradeArr,
      inpStr:e.currentTarget.dataset.id,
      grade:e.currentTarget.dataset.grade,
    })
  }else{
    return;
   }
}*/
function sExperimental(e,obj){
  if(obj.data.isAjaxOver == true){
    obj.setData({
      numb: e.target.dataset.numb,
      show: true,
      arr: obj.data.ExperimentalArr,
      inpStr:e.currentTarget.dataset.id
    });
  }else{
    return;
  }
}


// 四个tab项项目的跳转
function goPage(e,obj,pageUrl) {
  obj.setData({formId: e.detail.detail.formId})
  saveFormId.saveFormId(obj,appId,appKey);
  wx.navigateTo({url: pageUrl})
}
// 提示框
function resultTip(content,callback){
  wx.showModal({
    title: '提示',
    content: content,
    showCancel: false,
    success: function(){
      if(callback){
        callback(); 
      }
    }
  })
}
// 获取设备信息
function getSystem(obj,callback){
  wx.getSystemInfo({
    success: function(res) {
      obj.setData({
        windowHeight: res.windowHeight,
        windowWidth: res.windowWidth,
        SDKVersion: res.SDKVersion
      })
      if(callback) callback();
    }
  });
}
// 判断当前时间 上下学期 期中期末
function flagTime(obj){
  // 现在时间
  var nowTime = new Date().getTime();
  var nowYear = new Date().getFullYear();
   // 上学期期中 1
  var upQizhong = new Date(nowYear-1 + '/9/1 00:00:00').getTime();
  // 上学期期末 2
  var upQimo = new Date(nowYear + '/1/1 00:00:00').getTime();
  // 下学期期中 3
  var downQizhong = new Date(nowYear + '/4/1 00:00:00').getTime();
  // 下学期期末 4
  var downQimo = new Date(nowYear + '/6/15 00:00:00').getTime();
  var downQimo1 = new Date(nowYear + '/10/1 00:00:00').getTime();

  if(nowTime > upQizhong &&  nowTime < upQimo){
    obj.setData({
      GradeType: 1,
      gradeTermInn: obj.data.gradeTermArr[0].value,
      showScore: true
    })
  }else if(nowTime > upQimo &&  nowTime < downQizhong){
    obj.setData({
      GradeType: 2,
      gradeTermInn: obj.data.gradeTermArr[0].value,
      showScore: false
    })
  }else if(nowTime > downQizhong &&  nowTime < downQimo){
    obj.setData({
      GradeType: 3,
      gradeTermInn: obj.data.gradeTermArr[1].value,
      showScore: true
    })
  }else if(nowTime > downQimo &&  nowTime < downQimo1){
    obj.setData({
      GradeType: 4,
      gradeTermInn: obj.data.gradeTermArr[1].value,
      showScore: false
    })
  }
}


// 退出登录
function unlogin(){
  wx.clearStorageSync();
  wx.reLaunch({ url: '/pages/index/index'})
}
// 关闭弹窗
function closeFloat(e,obj){
  var tId = e.target.dataset.id
  if(tId == 'float'){
    obj.setData({
      show: false,
      show1: false,
      show2:false,
      show3: false,
      showUp: false,
      arr:[],
    })
  }
}

// 菜单按钮
function powerDrawer(e,obj) {
  if(e.detail.detail){
    var currentStatu = e.detail.detail.dataset.statu;
  }else{
    var currentStatu = e.target.dataset.statu;
  }
  // animation.animation(currentStatu,obj);
  if(currentStatu == 'close'){
    obj.setData({isopen:'open',zoomShow: false,showModalStatus: false})
  }else{
    obj.setData({isopen:'close',zoomShow: true,showModalStatus: true})
  }
}
// 关闭导航
function closeNav(e,obj){
  if(e.detail.detail.dataset.id == "closeNav"){
    // animation.animation1('close',obj);
    obj.setData({
      isopen: 'open'
    })
    obj.setData({
      zoomShow: false,
    })
    setTimeout(function(){
      obj.setData({showModalStatus: false})
    },500)
  }
}
// 点击改变tabBar颜色
function changeColor(e,obj){
  obj.setData({formId: e.detail.formId})
  var tabBarArr = obj.data.tabBarArr;
  var datasetId = Number(e.detail.target.dataset.id);
  changeTabBar(datasetId,tabBarArr,obj);
}
// 参数排序 
function sortQuery(obj){
  // 先获取所有属性名
  var keys = [];
  for (var key in obj){
    keys.push(key);
  }
  // 排序
  keys.sort();

  // 导出新的对象
  var r = {};
  for (var i = 0; i < keys.length; i++){
    key = keys[i];
    r[key] = obj[key];
  }
  // 将排序好的对象转为请求参数
  var str = '';
  var str1 = '';
  for(var k in r){
    str += k+'='+r[k]+'&'
  }
  str1=str.substring(0,str.length-1)
  return str1;
}

function touchstart(e, obj, nameW, allHeight,allContentW,tabHeight){
  var nameW = nameW;
  var allContentW = allContentW;
  var allContentH = 60*obj.data.number + 10 ; 
  var allHeight = allHeight;

  obj.setData({
     contentH: allContentH,
     contentW: allContentW,
     heigh:obj.data.windowHeight - allHeight -tabHeight
  })

  if(obj.data.heigh >= obj.data.contentH){
    obj.setData({
      heigh:obj.data.heigh
    })
  }else if(obj.data.contentW <= obj.data.windowWidth - nameW ){
    obj.setData({
      contentW: obj.data.windowWidth - nameW,
      scrollL: 0,
      contentH: allContentH
    })
  }
  var sX = 0,sY = 0;
  sX = e.touches[0].clientX;
  sY = e.touches[0].clientY;
  obj.setData({ startX: sX ,startY: sY});
}


function touchmove(e, obj, nameW){
  var nameW = nameW;
  var mX = 0,mY = 0;
  mX = e.touches[0].clientX;
  mY = e.touches[0].clientY;
  var lineX = Math.abs(mX - obj.data.startX);
  var lineY = Math.abs(mY - obj.data.startY);

  var mXpx = mX - obj.data.startX + obj.data.saveOldLeft;
  var mYpx = mY - obj.data.startY + obj.data.saveOldTop;

  // 如果lineX >lineY  那么就是水平方向滑动
  if(lineX > lineY){
    if (mXpx >= 0) { //已经滑动到第一项
      mXpx = 0
    }else if(mXpx <= obj.data.windowWidth- obj.data.contentW - nameW) { //已经滑动到最后一项
      mXpx = obj.data.windowWidth - obj.data.contentW - nameW
    }else{
      var mXpx = mX - obj.data.startX + obj.data.saveOldLeft;
    }
    obj.setData({ scrollL: mXpx, scrollT: obj.data.saveOldTop});
  }

  // 如果lineX <lineY  那么就是垂直方向滑动
  if(lineX < lineY){
    if(mYpx >= 0){
      mYpx = 0 
    }else if(mYpx <= obj.data.heigh - obj.data.contentH){
      mYpx = obj.data.heigh - obj.data.contentH
    }else{
      var mYpx = mY - obj.data.startY + obj.data.saveOldTop;
    }
    obj.setData({ scrollL: obj.data.saveOldLeft, scrollT:mYpx });
  }
}

function touchend(e, obj){
  var scrollL = obj.data.scrollL;
  var scrollT = obj.data.scrollT;
  obj.setData({ saveOldLeft: scrollL, saveOldTop: scrollT})
}

//判断学期区间值
function flagSemester(){
  var nowYear = new Date().getFullYear();
  var nowTime = new Date().getTime();
  var time0 = new Date(nowYear - 1 + "/9/1 00:00:00");//上一年秋开始   1
  var time1 = new Date(nowYear + "/1/10 00:00:00"); // 寒开始  2
  var time2 = new Date(nowYear + "/3/1 00:00:00"); // 春开始  3
  var time3 = new Date(nowYear + "/7/10 00:00:00"); // 暑开始    4
  var time4 = new Date(nowYear + "/9/1 00:00:00"); // 秋开始   1

  if(nowTime >= time1 && nowTime < time2){
    return 2;
  }else if(nowTime >= time2 && nowTime < time3){
    return 3;
  }else if(nowTime >= time3 && nowTime < time4){
    return 4;
  }else if((nowTime >= time0 && nowTime < time1) || (nowTime >= time4)){
    return 1;
  }
}
// 判断当前显示的年份
function flagYear(){
  var nowTime = new Date().getTime();
  var criticalTime = new Date(new Date().getFullYear()+"/1/10 00:00:00").getTime()
  if(nowTime < criticalTime){
    return (new Date().getFullYear()-1);
  }else{
    return new Date().getFullYear();
  }
}

// 代课倒计时
function daojishi(startTime){
  //获取现在距离开课的时间差
  var timeCha = new Date(startTime).getTime() - new Date().getTime() ;
  // console.log(timeCha)
  var res = null;
  var diff =  timeCha/1000;
  if(diff < 0){
    res = '0:0';
  }else{
    //获取时间差的天
    var day = getTwo(parseInt(diff/(24*60*60)));
    //获取时间差的时
    var hour = getTwo(parseInt(diff/(60*60)%24));
    //获取时间差的分
    var min = getTwo(parseInt(diff/60%60));
    //获取时间差的秒
    var sec = getTwo(parseInt(diff % 60));
    //处理个位数
    function getTwo(num){
      return num < 10? '0' + num : num
    }
    res = day +'天'+hour +'时'+ min+'分';
  }
  return res;
}
module.exports = {
  /*getYear:getYear,
  getSemester:getSemester,
  getClass:getClass,
  getGrade:getGrade,
  getKejie:getKejie,
  getType:getType,
  getGradeTerm:getGradeTerm,*/
  sExperimental:sExperimental,
  goPage:goPage,
  resultTip:resultTip,
  getSystem:getSystem,
  unlogin:unlogin,
  closeFloat:closeFloat,
  powerDrawer:powerDrawer,
  closeNav:closeNav,
  // changeColor:changeColor,
  sortQuery:sortQuery,
  flagTime:flagTime,
  touchstart:touchstart,
  touchmove:touchmove,
  touchend:touchend,
  flagSemester:flagSemester,
  flagYear:flagYear,
  daojishi:daojishi
}


