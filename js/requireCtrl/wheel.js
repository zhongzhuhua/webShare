// 绑定 dom 滚动事件
define(function(require, exports, module) {

  exports.build = function(_conf) {
    var conf = _conf;
    var _dom = document.getElementById(conf.id);
    conf.dom = _dom;
    if (_dom != undefined) {
      if (document.addEventListener) {
        _dom.addEventListener('DOMMouseScroll', MyFun);
      } else {
        _dom.attachEvent('onmousewheel', MyFun);
      };
      _dom.onmousewheel = MyFun;
    }

    // 绑定的方法
    function MyFun(e) {
      clearTimeout(conf.timer);
      var myEvent = e || window.event;
      var isDown = myEvent.wheelDelta == undefined ? myEvent.detail > 0 : myEvent.wheelDelta < 0;
      conf.timer = setTimeout(function() {
        try {
          if (conf.success) {
            conf.success(conf.dom, isDown);
          }
        } catch (e) {
          console.log(e.message);
        }
      }, 500);
    };
  };
});
