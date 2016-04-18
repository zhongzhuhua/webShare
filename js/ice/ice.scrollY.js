(function(ice) {
  if (ice != null) {
    // 绑定滚动事件，conf 配置 {  }
    ice.scrollY = function(dom, options) {
      if (dom == null || dom.getAttribute('scrollY') == '') {
        return;
      }

      // 配置
      var g = {
        // 顶部 dom 元素
        arrow: options ? options.arrow : null,
        // 刷新函数
        refreshFun: options ? options.refreshFun : null,
        // 加载函数
        loadFun: options ? options.loadFun : null,

        // 是否可以执行刷新
        isRefresh: false,
        // 是否加载更多
        isLoad: false,
        // 是否按住
        isBegin: false,
        // 是否执行了移动事件
        isMove: false,
        // 控件高度
        height: dom.clientHeight,
        // 控件全部高度
        scrollHeight: dom.scrollHeight,
        // 移动高度占比
        moveHeight: dom.clientHeight / 2,
        start: 0,
        end: 0,
        // 当前滚动条高度
        st: 0
      };

      g.arrowHeight = g.arrow instanceof HTMLElement ? g.arrow.clientHeight : 0;
      if (g.arrowHeight > 0) {
        ice.css(g.arrow, {
          'transition': 'all .2s'
        });
      };

      dom.addEventListener(ice.tapStart, function(e) {
        g.st = dom.scrollTop;
        var myEvent = e.touches ? e.touches[0] : (e || window.event);
        g.start = myEvent.pageY;
        g.isBegin = true;
      });

      dom.addEventListener(ice.tapMove, function(e) {
        var myEvent = e.touches ? e.touches[0] : (e || window.event);
        // 计算移动的比例，如果大于0，则是下拉，如果小于0则是上拉
        var diff = myEvent.pageY - g.start;
        if (g.isBegin) {
          // 如果是下拉，则 scrollTop 小于 0 的时候才阻止滚动事件
          if (diff > 0 && g.st <= 0) {
            g.isLoad = false;
            stopDefault(e);
            stepRun(diff);
            // 箭头是否变化
            if (g.arrowHeight > 0) {
              var deg = diff > g.arrowHeight ? '180deg' : '0';
              g.isRefresh = deg !== '0';
              ice.css(g.arrow, {
                'transform': 'rotate(' + deg + ')'
              });
            }
          } else if (diff < 0 && dom.scrollTop + dom.clientHeight >= dom.scrollHeight) {
            g.isRefresh = false;
            g.isLoad = true;
            stopDefault(e);
            stepRun(diff);
          }
        } else {
          g.isMove = false;
        }
      });

      dom.addEventListener(ice.tapEnd, function(e) {
        if (g.isMove) {
          ice.removeClass(dom, 'user-select');
          dom.onselectstart = dom.ondrag = null;
          ice.css(dom, {
            'transition': 'all .6s',
            'transform': 'translateY(0)'
          });
        }

        ice.css(g.arrow, {
          'transform': 'rotate(0)'
        });

        if (g.isMove) {
          try {
            if (g.isRefresh && g.refreshFun) {
              g.refreshFun();
            } else if (g.isLoad && g.loadFun) {
              g.loadFun();
            }
          } catch (e) {
            console.log(e.message);
          }
        }

        g.isBegin = false;
        g.isMove = false;
      });

      // 计算滚动高度
      function stepRun(diff) {
        var percentage = (diff / g.height).toFixed(2) * g.moveHeight;
        ice.css(dom, {
          'transition': '',
          'transform': 'translateY(' + percentage + 'px)'
        });
      };

      // 阻止默认事件
      function stopDefault(e) {
        e.preventDefault();
        if (!g.isMove) {
          ice.addClass(dom, 'user-select user-select');
          dom.onselectstart = dom.ondrag = function() {
            return false;
          };
          g.isMove = true;
        }
      };
    }
  }
})(ice);
