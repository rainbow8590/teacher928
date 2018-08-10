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
  sortQuery:sortQuery
}
