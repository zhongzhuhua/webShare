// 公用 slider 插件
(function($) {

    // 主函数
    function paSlider(options) {
        return _init(options);
    };

    // 属性设置
    paSlider.init = _init;

    /**
     * 初始化
     * @param o [json] 配置
     */
    function _init(o) {

        // 默认配置
        var options = {
            // 选择器
            selector: '#slider',
            // 特效类型
            type: 'fade',
            // 方向  'ud' = 判断上下， 'lr' = 判断左右
            direction: 'ud',
            // 是否开启滑轮事件
            iswheel: true,
            // 是否开启滑动事件
            istouch: true,
            // 滑轮回调
            wheel: null,
            // 动画执行时间
            times: 1200
        };

        if (o != null) {
            for (var key in o) {
                options[key] = o[key];
            }
        }

        o = options;

        // 获取 selector 节点，遍历绑定事件
        var doms = document.querySelectorAll(o.selector);
        if (doms != null) {
            var len = doms.length;
            for (var i = 0; i < len; i++) {
                // 查询所有子节点
                var dom = doms[i];

                if (o.type == null || o.type == 'fade') {
                    _addClass(dom, 'ui-slider-fade');
                }

                if (o.iswheel === true) {
                    _bindScrollFade(doms[i], o.times);
                }

                if (o.istouch === true) {
                    _bindTouchFade(doms[i], o.times, o.direction);
                }
            }
        }

        return {};
    };

    /**
     * 绑定滚动事件 - fade 效果
     * @param dom selector[index]
     * @param times 动画执行时间
     */
    function _bindScrollFade(dom, times) {

        if (dom.addEventListener) {
            dom.addEventListener('DOMMouseScroll', _scroll);
        } else {
            dom.attachEvent('onmousewheel', _scroll);
        };
        dom.onmousewheel = _scroll;

        // 是否正在执行事件
        var timer = null;
        var isrun = false;

        // 滚动事件
        function _scroll(e) {
            timer = setTimeout(function() {
                clearTimeout(timer);
                _scrollMain(e);
            }, 200);
        };

        function _scrollMain(e) {
            // 判断是否正在执行
            if (isrun) {
                return;
            }
            var childs = dom.querySelectorAll('.ui-slider-content');
            var max = childs.length;

            isrun = true;
            setTimeout(function() {
                isrun = false;
            }, times);

            // 执行方法体
            e = e || window.event;
            _stopDefault(e);
            _stopPropagation(e);

            // 是否向下滚动
            var down = e.wheelDelta == undefined ? e.detail > 0 : e.wheelDelta < 0;

            // 原展示图片
            var idx = parseInt(dom.getAttribute('slider-index'), 10);
            var domOld = childs[idx];

            // 展示判断
            if (down) {
                idx = idx + 1;
                idx = idx >= max ? 0 : idx;
            } else {
                idx = idx - 1;
                idx = idx < 0 ? max - 1 : idx;
            }
            dom.setAttribute('slider-index', idx);

            // 展示现有图片
            _addClass(childs[idx], 'ui-slider-active');

            // 隐藏原图片
            _removeClass(domOld, 'ui-slider-active');
        };
    };

    /** 
     * 绑定滑动事件 - fade 效果
     * @param dom selector[index]
     * @param times 动画执行时间
     * @param direction 判断的方向
     */
    function _bindTouchFade(dom, times, direction) {
        if (!('ontouchend' in dom)) {
            return;
        }

        var o = {
            isbegin: false,
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0
        };

        dom.ontouchstart = function(e) {
            if (o.isbegin == false) {
                o.isbegin = true;
                var touch = e.targetTouches[0];
                o.startX = touch.pageX;
                o.startY = touch.pageY;
            }
        };

        dom.ontouchmove = function(e) {
            if (o.isbegin) {
                _stopPropagation(e);
                if (e.targetTouches.length > 1 || e.scale && e.scale !== 1) return;
                var touch = e.targetTouches[0];
                o.endX = touch.pageX;
                o.endY = touch.pageY;
            }
        };

        dom.ontouchend = function(e) {
            var down = true;
            if (direction == 'lr') {
                down = o.endX - o.startX;
            } else {
                down = o.endY - o.endY;
            }
            console.log(down);
        };

    };

    // 阻止浏览器默认事件
    function _stopDefault(e) {
        e.preventDefault();
        if (window.event) {
            window.event.cancelBubble = true;
        }
    };

    // 阻止事件冒泡
    function _stopPropagation(e) {
        e.stopPropagation();
    };

    // 添加样式
    function _addClass(dom, clazz) {
        if (dom != null && clazz != null && clazz != '') {
            dom.className = dom.className + ' ' + clazz;
        }
    };

    // 删除样式
    function _removeClass(dom, clazz) {
        if (dom != null && clazz != null && clazz != '') {
            dom.className = _trim(dom.className.replace(new RegExp(clazz, 'g'), ''));
        }
    };

    // 去掉空格
    function _trim(s) {
        return s != null ? s.replace(/(^\s*)|(\s*$)/g, '') : null;
    };

    $.paSlider = paSlider;

})(window);
