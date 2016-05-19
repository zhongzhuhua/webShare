(function(ice) {
  ice.sliderTemp = '<a href="{{link}}" class="is-link"><img src="{{img}}" alt="{{alt}}"></a>';
  ice.sliderContent = '<div class="is-main"><div class="hidden is-arrow left">{{left}}</div><div class="hidden is-arrow right">{{right}}</div></div><div class="is-footer hidden"></div>';
  ice.sliderPoint = '<span></span>';

  ice.slider = function(options) {
    var g = {
      // 10000 毫秒自动切换，必须大于 1000
      autoTime: 10000,
      // 10 毫秒执行一次 left 变化
      runTime: 10,
      // 左右箭头
      leftArrow: '<',
      rightArrow: '>',
      // 每步移动 n% 
      runStep: 4,
      selector: '.ice-slider',
      data: []
    };

    g = ice.extend(g, options);

    // 控件初始化
    var html = '';
    var phtml = '';
    var $dom = ice.query(g.selector);
    if (!$dom) return;
    $dom.innerHTML = ice.sliderContent.replace('{{left}}', g.leftArrow).replace('{{right}}', g.rightArrow);

    // 自动切换
    var autoTimer = null;
    // 当前选中的下标
    var choose = 0;
    // 下一个展示的下标
    var next = 0;
    // 是否可以移动
    var ismove = true;
    // 查询控件
    var $links;
    var $points;
    var $main = ice.query('.is-main', $dom);
    var $left = ice.query('.left', $dom);
    var $right = ice.query('.right', $dom);
    var $footer = ice.query('.is-footer', $dom);
    var list = g.data;
    var len = list == null ? 0 : list.length;
    var rlen = 0;
    if ($main && len > 0) {
      // 生成图片
      for (var i = 0; i < len; i++) {
        var model = list[i];
        var link = model.link == null || model.link == '' ? 'javascript:;' : link;
        var img = ice.toEmpty(model.img);
        var text = ice.toEmpty(model.text);
        if (img != '') {
          html += ice.sliderTemp.replace('{{link}}', link).replace('{{img}}', img).replace('{{alt}}', text);
          phtml += ice.sliderPoint;
          rlen++;
        }
      }

      var dom = document.createElement('div');
      dom.innerHTML = html
      $main.appendChild(dom);
      $footer.innerHTML = phtml;
      
      // 设置 left
      $links = ice.queryAll('.is-link', $main);
      $points = ice.queryAll('span', $footer);
      ice.css($links[choose], {
        'left': '0%'
      });
      ice.addClass($points[choose], 'choose');

      // 绑定 slider 事件
      if (rlen > 1) {
        ice.removeClass($footer, 'hidden');

        // 自动切换
        _autoRun();

        // 如果有 touch 事件，则绑定 touch 事件
        if (ice.isMobile) {
          _bindTouch();
        } else {
          ice.removeClass($left, 'hidden');
          ice.removeClass($right, 'hidden');
          _bindClick();
        };
      }
    };

    // 绑定点击事件
    function _bindClick() {
      // 前一张
      $left.addEventListener(ice.tapClick, function(e) {
        if (ismove) {
          _runPre(e);
        }
      });

      // 后一张
      $right.addEventListener(ice.tapClick, function(e) {
        if (ismove) {
          _runNext(e);
        }
      });
    };

    // 绑定滑动事件
    function _bindTouch() {
      var _pro_ = {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        isbegin: false,
        run: false
      };
      $main.ontouchstart = function(e) {
        clearInterval(autoTimer);
        autoTimer = null;
        if (ismove && _pro_.isbegin == false) {
          _pro_.isbegin = true;
          var touch = e.targetTouches[0];
          _pro_.startX = touch.pageX;
          _pro_.startY = touch.pageY;
        }
      };
      $main.ontouchmove = function(e) {
        if (ismove && _pro_.isbegin) {
          ice.stopPropagation(e);
          if (e.targetTouches.length > 1 || e.scale && e.scale !== 1) return;
          var touch = e.targetTouches[0];
          var moveX = _pro_.startX - touch.pageX;
          var moveY = _pro_.startY - touch.pageY;
          _pro_.run = false;
          if (Math.abs(moveX) > Math.abs(moveY)) {
            ice.stopDefault(e);
            _pro_.run = true;
          }
          _pro_.endX = touch.pageX;
        }
      };
      $main.ontouchend = function(e) {
        if (ismove && _pro_.isbegin && _pro_.run) {
          var move = _pro_.endX - _pro_.startX;
          // 如果位移大于0，则是下一张
          if (move > 0) {
            _runPre(e);
          } else if (move < 0) {
            _runNext(e);
          }
        }
        _pro_.isbegin = false;
        _autoRun();
      };
    };

    // 上一张
    function _runPre(e) {
      ismove = false;
      ice.stopDefault(e);
      ice.stopPropagation(e);
      next = choose - 1;
      next = next < 0 ? rlen - 1 : next;
      _autoRun();
      _run('l');
    };

    // 下一张
    function _runNext(e) {
      ismove = false;
      ice.stopDefault(e);
      ice.stopPropagation(e);
      next = choose + 1;
      next = next == rlen ? 0 : next;
      _autoRun();
      _run('r');
    };

    // 自动切换
    function _autoRun() {
      var t = ice.parseInt(g.autoTime);
      if (t < 1000) return;
      clearInterval(autoTimer);
      autoTimer = null;
      autoTimer = setInterval(function() {
        if (ismove) {
          ismove = false;
          next = choose + 1;
          next = next == rlen ? 0 : next;
          _run('r');
        }
      }, t);
    };

    // 执行滑动 p[方向]=l/r 默认右边
    function _run(p) {
      var mytimer = null;
      var $next = $links[next];
      var $choose = $links[choose];
      var left = '0';
      if (p == 'l') {
        left = '-100%';
      } else {
        left = '100%';
      }
      $next.style['left'] = left;

      // 定时器执行
      var step = 0;
      ice.removeClass($points[choose], 'choose');
      ice.addClass($points[next], 'choose');
      mytimer = setInterval(function() {
        if (step == null || step >= 100) {
          clearInterval(mytimer);
          ismove = true;
          choose = next;
        }
        if (p == 'l') {
          $next.style['left'] = (step - 100) + '%';
          $choose.style['left'] = step + '%';
        } else {
          $next.style['left'] = (100 - step) + '%';
          $choose.style['left'] = (-1 * step) + '%';
        }

        step = step + g.runStep;
      }, g.runTime);
    };
  };
})(ice);
