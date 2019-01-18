/*
  * 实习任务上传失败的请求
  * TaskType  1.作业,2.听课
*/
let requests = require('./requests.js');

function deleteUpload(obj,flag){
  var query = 'appid='+obj.appid+'&TaskType='+obj.TaskType+'&TrainCode='+ obj.TrainCode+'&LessonNo='+ obj.LessonNo+'&ClassCode='+ obj.ClassCode+'&timestamp='+obj.timestamp +'&token='+obj.token;
  
  var option = {
    api:'api/TeacherTrain/DeleteTeacherLessonPic?'+query,
    type:'get'
  }

  wx.request({  
      url: requests.htp + 'api/TeacherTrain/DeleteTeacherLessonPic?'+query,  //query：api+参数
      method:'post',
      success:function(res){
        console.log(res)
        if(flag == true){
          wx.showModal({
            title: '提示',
            content: '听课笔记上传失败,请重新上传',
            showCancel: false
          })
        }
        
      },
      fail: function(err){
        wx.showToast({
          title: err,
          icon: 'loading',
          duration: 2000
        })
      }
    })
}

module.exports ={deleteUpload};
