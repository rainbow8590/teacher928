function setTime(futureTime){
  //设置未来时间
  var Ftime = new Date(futureTime);
  var FtimeMs = Ftime.getTime();
  //获取本地时间
  var Ltime = new Date();
  var LtimeMs = Ltime.getTime();

  //获取时间差的秒数
  var diff = (FtimeMs - LtimeMs)/1000;
  if(diff < 0){
    return {
      day:'0'+0,
      hour:'0'+0,
      min:'0'+0,
      sec:'0'+0
    };
  }
  //获取时间差的天
  var day = getTwo(Math.floor(diff / (24*60*60)));
  //获取时间差的时
  var hour = getTwo(parseInt(diff /(60*60) %24));
  //获取时间差的分
  var min = getTwo(parseInt(diff/60%60));
  //获取时间差的秒
  var sec = getTwo(parseInt(diff % 60));

  //处理个位数
  function getTwo(num){
    return num < 10? '0' + num : num
  }
  // var hours = getTwo(day*24 + hour)
  return {
    day:day,
    hour:hour,
    min:min,
    sec:sec
  }
}

module.exports = {
  setTime:setTime
}
