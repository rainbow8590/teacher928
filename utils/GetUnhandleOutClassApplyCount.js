// let publicJs = require('./public.js');
// let md51 = require('./md51.js');
let requests = require('./requests.js');

function GetUnhandleOutClassApplyCount(obj){
  let stamp = new Date().getTime();
  let token = obj.data.teacherToken;
  // var query1 = 'appid=web&timestamp='+stamp+'&token='+token;
  // var query2 = {
  //   appid: 'web',
  //   timestamp:stamp,
  //   token:token
  // }
  // var signS = publicJs.sortQuery(query2)
  // var sign = md51.md5(signS+'test'); 
  // var query = query1 + '&sign=' + sign;

  var query = {
    appid: 'web',
    timestamp:stamp,
    token:token
  }
  var option = {
    api:'api/OutClassApply/GetUnhandleOutClassApplyCount',
    query: query,
    type:'get'
  }

  requests.request(option,function(res){
     obj.setData({noAuditing: res.data.AppendData})
    wx.setStorageSync('noAuditing',res.data.AppendData)
  })


   
  // requests.requestGet('api/OutClassApply/GetUnhandleOutClassApplyCount?'+query, function(res){
  //   // console.log(res.data)
  //   // obj.setData({noAuditing: res.data.AppendData})
  //   // wx.setStorageSync('noAuditing',res.data.AppendData)
  // })
}

module.exports = {
  GetUnhandleOutClassApplyCount: GetUnhandleOutClassApplyCount,
}