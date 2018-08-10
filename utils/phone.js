// 获取电话号码
function getPhone(obj,e){
  console.log(e)
  obj.phone = e.currentTarget.dataset.phone;
  obj.setData({show3: true})
}
  // 打电话:
function callPhone(obj,e){
  wx.makePhoneCall({
    phoneNumber: obj.phone
  })
  obj.setData({show3: false})
}
  // 复制
function copy(obj,e){;
  wx.setClipboardData({
    data: obj.phone,
    success: function(res) {
      wx.getClipboardData({
        success: function(res) {
          that.setData({show3: false})
        }
      })
    }
  })
}
module.exports = {
  getPhone: getPhone,
  callPhone: callPhone,
  copy: copy
}