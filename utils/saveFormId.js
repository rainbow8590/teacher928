var md51 = require('./md51.js');
var requests = require('./requests.js');
function saveFormId(obj,appId,appKey){
    var token = obj.data.teacherToken; // token值
    var date = new Date();
    var stamp = new Date().getTime();  //时间戳
    // var query1 = 'appid='+appId+'&timestamp='+ stamp +'&token='+token;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
    }
    var data = {
      "openId": obj.data.openId,
      "formId": obj.data.formId,
      "dtCreateDate": formatDate(new Date())
    }
    var option = {
      api:'api/System/SaveOpenIdAndFormId',
      query: query,
      data: data,
      type: 'post'
    }

    requests.request(option, function(res){
      var resData =res.data;
    })
    // var strDatas = JSON.stringify(data);
    // var signS = sortQuery(query2)
    // var query2 = signS+strDatas+appKey;
    // var sign = md51.md5(query2);
    // var query = query1 + '&sign=' + sign;
  
    // requests.requestPost('api/System/SaveOpenIdAndFormId?'+query,data,function(res){
    //   var resData = JSON.parse(res.data);
    //   console.log(resData)
    // })
  }
function formatDate(date){
  var year = date.getFullYear();
  var month = getTwo(date.getMonth()+1);
  var day = getTwo(date.getDate());
  var hour = getTwo(date.getHours());
  var min = getTwo(date.getMinutes());
  var sec = getTwo(date.getSeconds());
  function getTwo(num){
    return num < 10? '0'+num: num;
  }
  return year+'-'+month+'-'+day+'T'+hour+':'+min+':'+sec
}
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
    for(var k in r){
      str += k+'='+r[k]+'&'
    }

    return str;
}


module.exports = {
  saveFormId:saveFormId
}