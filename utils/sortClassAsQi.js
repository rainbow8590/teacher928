
function sortClassAsQi(qiArr){

  for(var i = 0 ; i < qiArr.length; i++){
    var timeStr = qiArr[i].times;
    // var timeStr = qiArr[i].sTime;
    var timeNum = Number(timeStr.split(':').join('').substr(-4));
    // var dateAll = qiArr[i].SectBegin;
    var tIndex = qiArr[i].SectBegin.indexOf('T');
    var dateD = qiArr[i].SectBegin.substr(0,tIndex).split('-').join('');  // 20180412
    var dateT = Number(qiArr[i].SectBegin.slice(tIndex+1).split(':').join(''));
    qiArr[i].dateD = dateD;
    qiArr[i].dateT = dateT;
  }
  // 先排日期 
  var newQiArr = quickSort(qiArr,'dateD',false);

  // 排时间
  for(var j = 0 ; j < newQiArr.length-1; j++){
    for(var k = 0; k <newQiArr.length- j -1; k++){
      if(newQiArr[k].dateD == newQiArr[k + 1].dateD){
        if(newQiArr[k].dateT > newQiArr[k+1].dateT){
          var now = newQiArr[k];
          newQiArr[k]= newQiArr[k+1];
          newQiArr[k+1] = now;
        }
      }
    }
  }
  return newQiArr ;
}



function quickSort(arr,name,snum){
  //如果数组<=1,则直接返回
  if(arr.length<=1){return arr;}
    var pivotIndex=Math.floor(arr.length/2);
    //找基准，并把基准从原数组删除
    var pivot=arr.splice(pivotIndex,1)[0];
    var middleNum=pivot[name];
    // 定义左右数组
    var left=[];
    var right=[];
    //比基准小的放在left，比基准大的放在right
    if(snum){
      for(var i=0;i<arr.length;i++){
        if(Number(arr[i][name])<=Number(middleNum) ){
          left.push(arr[i]);
        }else{
          right.push(arr[i]);
      }
    }
  }else{
    for(var i=0;i<arr.length;i++){
      if(arr[i][name]<=middleNum){
        left.push(arr[i]);
      }else{
        right.push(arr[i]);
      }
    }
  }
  //递归,返回所需数组
  return quickSort(left,name,snum).concat([pivot],quickSort(right,name,snum));
}


module.exports = {  
  sortClassAsQi: sortClassAsQi
}