
var classList = require('../../utils/classList.js');
var md51 = require('../../utils/md51.js');
var requests = require('../../utils/requests.js');
var publicJs = require('../../utils/public.js');
var app = getApp();
var appKey = app.globalData.appKey;
var appId = app.globalData.appId;
Page({
  data: {
    tabBarArr:[
      {id:0,txt:'录入',classname:'icon-write',changeTextColor:'#888',isChange: false},
      {id:1,txt:'查询',classname:'icon-searchactive',changeTextColor:'#1FBB1C',isChange: true},
      {id:2,txt:'任务',classname:'icon-tasking',changeTextColor:'#888',isChange: false},
      {id:3,txt:'工具',classname:'icon-setting',changeTextColor:'#888',isChange: false},
    ],
    showModalStatus: false, //控制导航显示
    isopen:'open',  //控制菜单显示
    teacherName: '', //教师名称
    teacherToken:'', //教师token

    selfRank:6,
    rank:[],
    isTipButton1: true,
    isTipButton2: false
  
  },
  onReady: function(){
    this.menu = this.selectComponent("#menu");
    this.tab = this.selectComponent("#tab");
  },
  onLoad: function(option){
    console.log(option)
    var that = this;
    this.setData({
      teacherName: wx.getStorageSync('teacherName'),
      teacherToken: wx.getStorageSync('teacherToken'),
      noAuditing: wx.getStorageSync('noAuditing'),
      identity: wx.getStorageSync('identity'),
      area:option.area
    })
    // 获取手机宽高
    publicJs.getSystem(that,function(){
      that.setData({heigh: that.data.windowHeight - 55})
    });

    

    this.isyiban = true ; // 默认0元版
    
    // 获取教师是新校区还是老校区
    if(this.data.area == '老校区'){
      this.nrankingtype =1; // 默认学科
      this.getRanklist(1);
    }else{
      this.nrankingtype = 1; // 默认学科
      this.getRanklist(1);
    }
    
  },
  swiperChange:function(e){
    if(e.detail.current == 0){
      this.nrankingtype = 1;
      this.isyiban = true;
    }else{
      this.nrankingtype = 2;
      this.isyiban = true;
    }
    console.log()
    this.setData({isTipButton1:true,isTipButton2: false,isyiban: true})
    this.getRanklist(this.nrankingtype);
  },
  // 退出登录
  unlogin: function(){
    publicJs.unlogin()
  },
  // 菜单按钮
  powerDrawer: function (e) {
    publicJs.powerDrawer(e,this)
  },
  // 关闭导航
  closeNav: function(e){
    console.log(e)
    publicJs.closeNav(e,this)
  },

  // 跳转详情页面
  goDetail: function(e){
    console.log(e)
    wx.navigateTo({url:'/search/pay_detail/pay_detail?target=rank'})
  },
  //改变按钮的状态
  changeTipButton:function(e){
    this.isyiban = e.target.dataset.isyiban;
    if(this.data.isTipButton1) {
      this.setData({
        isTipButton1: false,
        isTipButton2: true,
        isyiban: false
      })
    }else{
      this.setData({
        isTipButton1: true,
        isTipButton2: false,
        isyiban: true
      })
    }
    this.getRanklist(this.nrankingtype)
  },
  //改变按钮的状态
  // changeTipButton1:function(e){
  //   this.isyiban = e.target.dataset.isyiban;
  //   if(this.data.isTipButton3) {
  //     this.setData({
  //       isTipButton3: false,
  //       isTipButton4: true,
  //       isyiban: false
  //     })
  //   }else{
  //     this.setData({
  //       isTipButton3: true,
  //       isTipButton4: false,
  //       isyiban: true
  //     })
  //   }
  //   this.getRanklist(this.nrankingtype)
  // },
  // 获取排行列表
  getRanklist: function(Rankingtype){
    this.setData({rank:[]})
    var that = this;
    var stamp = new Date().getTime();
    var nSemester = publicJs.flagSemester();
    var token = this.data.teacherToken;
    var noticeType = noticeType;
    var query = {
      appid: appId,
      timestamp:stamp,
      token:token,
      nclassyear: new Date().getFullYear(),
      nsemester: nSemester,
      b1yuan: this.isyiban,
      nrankingtype: Rankingtype
    }
    var option = {
      api:'api/Teacher/GetTeacherRanking',
      query: query,
      type: 'get',
    }
    wx.showLoading({
      title:'努力加载中...',
      success: function(){
        requests.request(option, function(res){
          getRes(res)
        })
        function getRes(res){
          console.log(res)
          if(res.data.ResultType == 0){
            var result = res.data.AppendData;
            if(!result.length){
              that.setData({rank: null})
            }else{
              var isIn,selfRank;
              for(var i = 0 ; i < result.length; i++){
                if(result[i].sTeacherName == that.data.teacherName){
                  selfRank = result[i].nSblRank;
                  that.setData({selfRank: selfRank})
                  isIn = true;
                  break;
                }
                isIn = false;
              }
              console.log(that.data.selfRank)
              if(that.data.selfRank>1){
                var cha  = result[that.data.selfRank-1].dTotalCount*result[that.data.selfRank-2].dSbl/100 - result[that.data.selfRank-1].dSbCount;
                cha =cha ==0? 1: cha
              }
              that.setData({chaNum: Math.ceil(cha)})
              

              if(result.length>0 && isIn){
                that.setData({totalCount:result.length})
                var newRankAfter = [];
                // 获取本人及排名之后的
                for(var i = (selfRank-1); i < (selfRank+3);i++){
                  newRankAfter.push(result[i])
                }
                // 获取本人排名之前的
                for(var i = (selfRank-2); i >= selfRank-4;i--){
                  if( i < 0) break;
                  newRankAfter.unshift(result[i])
                }
                // 自己排第五之后添加第一名
                if(selfRank >=5){
                  newRankAfter.unshift(result[0])
                }
                that.setData({rank: newRankAfter})

              }else{
                that.setData({rank: null})
              }
            }
            
          }else if(res.data.ResultType == 7){
            publicJs.resultTip(res.data.Message)
            if(res.data.Message == '身份验证失败'){
              wx.clearStorageSync();
              wx.reLaunch({ url: '/pages/index/index'})
            }
            
          }
          setTimeout(()=>{
            wx.hideLoading()
          },500)
        }
        
      }
    })
  },
  
})


