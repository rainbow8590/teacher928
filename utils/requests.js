var md51 = require('./md51.js');

// var htp = 'https://tapitest.gaosiedu.com';   // 升班优惠券   測試環境
var htp = 'http://47.94.40.214:8083/';   // 直播用8083   測試環境  15201614911
// var htp = 'http://47.94.40.214:8023/'; // 课酬用8023  预发布环境  
// var htp = 'https://teacherapi.gaosiedu.com/';

function requestGet( url,callback){
  wx.request({  
      url: htp + url,  //query：api+参数
      method:'get',
      data:{ 
      },
      // header: {
      //   "Content-Type": "application/x-www-form-urlencoded"
      // },
      success:function(res){
        callback(res)
      },
      fail: function(err){
        console.log(err)
        wx.showToast({
          title: '数据加载失败,请检查网络配置',
          icon: 'loading',
          duration: 2000
        })
      }
    })
}
function requestPost(url,data,callback){
     // console.log(md51.md5('appid=web&{"encryptedData":"CZvXLijH7yVekc25kfCAgKxtTfDegntoBfB1J93OA5Q","iv":"P6LMSKqCItiYMAp72C15Tg","code":"021zc12n0lz8ss1lcN1n0HRf2n0zc12H"}test'))

  wx.request({  
      url: htp + url,  //query：api+参数
      method:'post',
      data:data,
      dataType: JSON,
      success: function(res) {
        callback(res)
      },
      fail: function(err){
        console.log(err)
        wx.showToast({
          title: '数据储存失败,请稍后重试',
          icon: 'loading',
          duration: 2000
        })
      }
    })
}
//请求数据综合
//api,query, type, data
function request(option,success,fail){
    var sign;
    if(option.query){
       option.query = sortQuery(option.query);
    }
    if(option.type=="get"){
      sign = md51.md5(option.query + 'test');
    }else if(option.type=="post"){
      // console.log(option.query+'&'+ JSON.stringify(option.data) +'test')
      sign = md51.md5(option.query+'&'+ JSON.stringify(option.data) +'test');
      // 
    }
    option.query = option.query +'&sign='+sign;
    wx.request({  
      url: htp + option.api + '?' + option.query, //url+api+参数
      method: option.type,
      data: option.data,
      success:function(res){
        success(res)
      },
      fail: function(err){
        // console.log(err)
        wx.showModal({
          title: '提示',
          content:'网络或服务器出错,请稍后重试',
          showCancel: false
        })
      },
      complete: function(msg){
        if(msg.statusCode == 500){
          wx.showModal({
            title: '提示',
            content:msg.data.Message,
            showCancel: false,
            success: function(){
              wx.navigateBack({
                delta:1
              })
            }
          })
        }
      }
    })
};

//参数排序组装
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
  return str.substr(0,str.length-1);
};
function check(obj){
    // 时间戳
    var stamp = new Date().getTime();
    // 教师token
    
    var token = obj.data.teacherToken;

    var query1 = 'appid=web&timestamp='+stamp+'&token='+token;
    var query2 = 'appid=web&timestamp='+stamp+'&token='+token+'test';
    var sign = md51.md5(query2); 
    var query = query1 + '&sign=' + sign;
    // console.log(query)
    wx.request({
      url: htp+'api/Login?'+ query, 
      method:'GET',
      header: {
        // "Content-Type": "application/x-www-form-urlencoded"
        "content-type": "application/x-www-form-urlencoded"
      },
      // dataType: JSON,
      success: function(res) {
        // console.log(res)
        if(res.data.ResultType == 7){
          wx.showModal({
            title: '提示',
            content: '请重新登陆',
            showCancel: false,
            success:function(){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
          })
        }
      },
      fail: function(err){
        console.log(err)
      }
    })
}
function chooseAndSave(obj,e,appId,page){
    var formId = e.detail.formId;
    var stamp = new Date().getTime();
    var token = obj.data.teacherToken;
    var query = 'appid='+appId+'&formId='+ formId+'&adminPage='+ page+'&timestamp='+stamp+'&token='+token;
    var id = e.detail.target.dataset.id;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // console.log(res)
        var tempFilePaths = res.tempFilePaths;
        var url = htp + 'api/LessonLeave/SaveTeacherLessonLeavePic/'+id+'?'+query;
        var formData = {"id": id};
        saveImage(url,tempFilePaths[0],formData,function(res){
          console.log(res)
          var resData = JSON.parse(res.data);
          // var resData = res.data;
          // console.log(resData)
          if(res.statusCode == 200){
            if(resData.ResultType == 0){
              wx.showToast({
                icon: "success",
                title: "上传成功"
              })
            }else if(resData.ResultType == 7){
              // console.log(res.data.Message)
              wx.showModal({
                title: '提示',
                content: '病假已同意,不能再上传病假条',
                showCancel: false,
                success:function(){}
              })
            }
          }
        },function(res){
            wx.showModal({
                title: '提示',
                content: '上传失败',
                showCancel: false,
                success:function(){}
              })
        })
      }
    })
}

function saveImage( url, filePath, formData,success, fail){
  wx.showToast({
    icon: "loading",
    title: "正在上传"
  })
  wx.uploadFile({
    url: url,
    filePath: filePath,
    header:{'content-type' : 'multipart/form-data'},
    name: 'file',
    formData:formData,
    success: function(res){
        success(res)
    },
    fail: function(res){
      fail(res)
    }
  })
}

module.exports = {  
  requestGet: requestGet,
  requestPost: requestPost,
  request:request,
  check:check,
  chooseAndSave: chooseAndSave,
  saveImage: saveImage,
  htp: htp
}