require('../../../scss/components/slider.scss');

// 公用 slider 插件
// 具体布局参照 demo
// 关于 auto run timer 定时器，由于所有的切换都会指向 _chooseSign 方法，所以统一在该方法中清楚定时器
(function($) {

    // 公用计时器
    var gTimer = [];

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
            // 特效类型， fade 渐变， slider 滑动
            type: 'fade',
            // 方向  'ud' = 判断上下， 'lr' = 判断左右
            direction: 'ud',
            // 是否开启滑轮事件
            iswheel: true,
            // 是否开启滑动事件
            istouch: true,
            // 滑轮回调
            wheel: null,
            // 切换后执行的方法 success: function (dom, idx) {}
            success: null,
            // 动画执行时间，只能是整数
            times: 1200,
            // slider 动画时间，移动端横滑动 300ms ，竖屏滑动 400ms，其他的自己设置
            sliderTimes: 300,
            // 移动距离操作多少 px 的时候，执行翻页
            sliderStep: 30,
            // 这个配置很特别， 当该配置存在的时候， touchStart 需要父节点左右，上下 step px 的时候，才触发 touchstart touchmove
            // 这个是用来配置，当 slider 做为 tab 选项卡的时候，页面内有滚动条
            // 防止滚动条和 touchMove 事件相互冲突，如果有，建议配置 30-50 左右
            runStartStep: null
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
            // 查询所有子节点
            for (var i = 0; i < len; i++) {
                var dom = doms[i];
                _bindSignClick(dom, o);
                _bindSliderRun(dom, o);

                if (o.type == null || o.type == 'fade') {
                    _addClass(dom, 'ui-slider-fade');
                    if (o.iswheel === true) {
                        _bindScrollFade(doms[i], o);
                    }
                    if (o.istouch === true) {
                        _bindTouchFade(doms[i], o);
                    }
                } else if (o.type == 'slider') {
                    _addClass(dom, 'ui-slider-' + (o.direction == 'lr' ? 'lr' : 'ud'));

                    if (o.iswheel === true) {
                        _bindScrollSlider(doms[i], o);
                    }
                    if (o.istouch === true) {
                        _bindTouchSlider(doms[i], o);
                    }
                }
            }
        }

        return {};
    };

    /**
     * 绑定 sign 点击事件
     * @param dom selector[index]
     * @param op options
     */
    function _bindSignClick(dom, op) {
        // 配置
        var type = op.type;

        var signSelector = dom.getAttribute('slider-sign');
        if (signSelector != null && signSelector != '') {
            var domSign = document.getElementById(signSelector);
            if (domSign == null) {
                return;
            }

            // 绑定点击事件
            domSign.addEventListener('click', function(e) {
                _stopPropagation(e);
                _stopDefault(e);
                e = window.event || e;
                var _this = e.srcElement;

                // 判断原选中和即将切换
                var idx = parseInt(_this.getAttribute('slider-index'), 10);
                var oldIdx = parseInt(dom.getAttribute('slider-index'), 10);

                // 相同不执行事件
                if (idx == oldIdx) {
                    return;
                }

                // 切换
                if (!(idx != null && !isNaN(idx))) {
                    return;
                }

                // 执行切换
                _clickOrAutorun(dom, oldIdx, idx, op);
            });
        }
    };

    /**
     * 绑定自动切换事件
     */
    function _bindSliderRun(dom, op) {
        var times = dom.getAttribute('slider-time');
        if (times != null && times != '') {
            times = parseInt(times, 10);
            // 定时器名称，避免切屏异常
            var timer = dom.getAttribute('slider-timer');
            if (timer == null || timer == '') {
                timer = 'slider-' + Math.random().toString().replace('0.', '');
                dom.setAttribute('slider-timer', timer);

                // 初始化绑定清除定时器事件
                dom.addEventListener('mousemove', function() {
                    _bindSliderRun(dom, op);
                });
                dom.addEventListener('click', function() {
                    _bindSliderRun(dom, op);
                });
                dom.addEventListener('keydown', function() {
                    _bindSliderRun(dom, op);
                });
                dom.addEventListener('touchmove', function() {
                    _bindSliderRun(dom, op);
                });
            }
            clearInterval(gTimer[timer]);
            // 设置定时器
            gTimer[timer] = setInterval(function() {
                var oldIdx = parseInt(dom.getAttribute('slider-index'), 10);
                var idx = (oldIdx + 1) % (dom.querySelectorAll('.ui-slider-content').length);

                // 执行切换
                _clickOrAutorun(dom, oldIdx, idx, op);
            }, times);
        }
    };

    /* 清除 dom 对应的定时器 */
    function _clearTimer(dom) {
        var timer = dom.getAttribute('slider-timer');
        if (timer != null && timer != '') {
            clearInterval(gTimer[timer]);
        }
    };

    // 点击切换，
    function _clickOrAutorun(dom, oldIdx, idx, op) {
        var type = op.type;
        var childs = dom.querySelectorAll('.ui-slider-content');
        var domOld = childs[oldIdx];
        var down = idx > oldIdx;

        _chooseSign(dom, idx, op);
        if (type == null || type == 'fade') {
            _fadeChangeIdx(dom, childs, domOld, idx, op);
        } else if (type == 'slider') {
            _sliderChangeIdx(dom, childs, domOld, idx, down, op);
        }
    };

    /**
     * 绑定滚动事件 - fade 效果
     * @param dom selector[index]
     * @param op options
     */
    function _bindScrollFade(dom, op) {

        var times = op.times;

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

            _fadeChange(dom, down, op);
        };
    };

    /** 
     * 绑定滑动事件 - fade 效果
     * @param dom selector[index]
     */
    function _bindTouchFade(dom, op) {
        if (!('ontouchend' in dom)) {
            return;
        }

        var times = op.times;
        var direction = op.direction;

        var o = {
            ismove: false,
            isbegin: false,
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0
        };

        dom.ontouchstart = function(e) {
            _clearTimer(dom);
            if (o.isbegin == false) {
                o.ismove = false;
                var touch = e.targetTouches[0];
                o.startX = touch.pageX;
                o.startY = touch.pageY;

                // 判断 startStep
                var domWidth = dom.clientWidth;
                var domHeight = dom.clientHeight;

                // 判断 startStep
                o.isbegin = _runStart({
                    startX: o.startX,
                    startY: o.startY,
                    width: domWidth,
                    height: domHeight,
                    runStartStep: op.runStartStep,
                    eve: e
                });
            }
        };

        dom.ontouchmove = function(e) {
            o.ismove = false;
            if (o.isbegin) {
                _stopDefault(e);
                _stopPropagation(e);
                if (e.targetTouches.length > 1 || e.scale && e.scale !== 1) return;
                var touch = e.targetTouches[0];
                o.endX = touch.pageX;
                o.endY = touch.pageY;
                o.ismove = true;
            }
        };

        dom.ontouchend = function(e) {
            if (o.isbegin && o.ismove) {
                var down = true;
                if (direction == 'lr') {
                    down = (o.endX - o.startX) < 0;
                } else {
                    down = (o.endY - o.startY) < 0;
                }

                if (o.isbegin && o.ismove) {
                    _fadeChange(dom, down, op);
                }

                o.isbegin = false;
                o.ismove = false;
            }
        };

    };

    /**
     * 绑定滚动事件 - slider 效果
     * @param dom selector[index]
     * @param op options
     */
    function _bindScrollSlider(dom, op) {

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

            isrun = true;
            setTimeout(function() {
                isrun = false;
            }, op.times);

            // 执行方法体
            e = e || window.event;
            _stopDefault(e);
            _stopPropagation(e);

            // 是否向下滚动
            var down = e.wheelDelta == undefined ? e.detail > 0 : e.wheelDelta < 0;

            _sliderChange(dom, down, op);
        };
    };

    /**
     * 绑定滑动事件 - slider 效果
     * @param dom selector[index]
     * @param options
     */
    function _bindTouchSlider(dom, op) {

        var times = op.sliderTimes;
        var direction = op.direction;
        var sliderStep = op.sliderStep;

        if (!('ontouchend' in dom)) {
            return;
        }

        var idx = 0;
        var o = {
            ismove: false,
            isbegin: false,
            // 是否 touch end 执行结束
            isend: true,
            // 滑动的距离
            moveStep: 0,
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0
        };


        // 数组属性，需要在 touchstart 中获取，避免动态加载的数据
        var childs = null;
        var max = 0;
        var domNow = null;
        var domNext = null;
        var domPre = null;
        var domWidth = 0;
        var domHeight = 0;
        var directionString = direction == 'lr' ? 'left' : 'top';

        dom.ontouchstart = function(e) {
            _clearTimer(dom);
            if (o.isbegin == false && o.isend == true) {
                o.ismove = false;
                idx = parseInt(dom.getAttribute('slider-index'), 10);
                // 读取原属性
                childs = dom.querySelectorAll('.ui-slider-content');
                max = childs.length;
                domNow = childs[idx];
                domWidth = dom.clientWidth;
                domHeight = dom.clientHeight;

                var touch = e.targetTouches[0];
                o.startX = touch.pageX;
                o.startY = touch.pageY;

                // 判断 startStep
                o.isbegin = _runStart({
                    startX: o.startX,
                    startY: o.startY,
                    width: domWidth,
                    height: domHeight,
                    runStartStep: op.runStartStep,
                    eve: e
                });

                if (!o.isbegin) {
                    return;
                }

                // 判断图片
                domNext = null;
                domPre = null;
                if (idx < max - 1) {
                    domNext = childs[idx + 1];
                }

                if (idx > 0) {
                    domPre = childs[idx - 1];
                }

                if (domNext) {
                    domNext.style[directionString] = '100%';
                }
                if (domPre) {
                    domPre.style[directionString] = '-100%';
                }
            }
        };

        dom.ontouchmove = function(e) {
            if (o.isbegin && o.isend) {
                _stopDefault(e);
                if (e.targetTouches.length > 1 || e.scale && e.scale !== 1) return;
                var touch = e.targetTouches[0];
                o.endX = touch.pageX;
                o.endY = touch.pageY;

                // 滑动距离计算
                var mid = direction == 'lr' ? (o.startX - o.endX) : (o.startY - o.endY);
                o.moveStep = mid;
                mid = -1 * mid;
                domNow.style[directionString] = mid + 'px';

                // 滑动 
                if (domNext) {
                    domNext.style[directionString] = ((direction == 'lr') ? (domWidth + mid) : (domHeight + mid)) + 'px';
                }
                if (domPre) {
                    domPre.style[directionString] = ((direction == 'lr') ? (mid - domWidth) : (mid - domHeight)) + 'px';
                }
                o.ismove = true;
            }
        };

        dom.ontouchend = function(e) {
            if (o.isbegin && o.ismove) {
                // 如果移动距离大于 20px 则翻页，否则还原图片
                var isreset = true;
                if (o.moveStep > sliderStep || o.moveStep < -sliderStep) {
                    if (o.moveStep > sliderStep) {
                        if (domNext) {
                            domNext.style[directionString] = '0';
                            domNow.style[directionString] = '-100%';
                            idx = idx + 1;
                            _addClass(domNext, 'ui-slider-active');
                            _removeClass(domNow, 'ui-slider-active');
                            isreset = false;
                        }
                    }
                    if (o.moveStep < -sliderStep) {
                        if (domPre) {
                            domPre.style[directionString] = '0';
                            domNow.style[directionString] = '100%';
                            idx = idx - 1;
                            _addClass(domPre, 'ui-slider-active');
                            _removeClass(domNow, 'ui-slider-active');
                            isreset = false;
                        }
                    }
                }

                if (isreset) {
                    if (domPre) {
                        domPre.style[directionString] = '-100%';
                    }
                    if (domNext) {
                        domNext.style[directionString] = '100%';
                    }
                    domNow.style[directionString] = '0';
                }
                _chooseSign(dom, idx, op);
                _bindSlider(domPre, times);
                _bindSlider(domNext, times);
                _bindSlider(domNow, times);

                // 不放到 setTimeout 避免用户一直滑动
                o.isend = false;
                o.isbegin = false;
                o.ismove = false;

                setTimeout(function() {
                    o.moveStep = 0;
                    o.isend = true;
                }, times);
            }
        };
    };

    /**
     * fade 效果切换图片
     * @param dom 
     * @param down 是否下一张， true = 下一张， false = 上一张
     */
    function _fadeChange(dom, down, op) {
        var childs = dom.querySelectorAll('.ui-slider-content');
        var max = childs.length;

        // 原展示图片
        var idx = parseInt(dom.getAttribute('slider-index'), 10);
        var domOld = childs[idx];

        // 展示判断
        idx = _calIds(idx, max, down);
        _fadeChangeIdx(dom, childs, domOld, idx, op);
    };

    // 切换
    function _fadeChangeIdx(dom, childs, domOld, idx, op) {
        // 展示现有图片
        _addClass(childs[idx], 'ui-slider-active');

        // 隐藏原图片
        _removeClass(domOld, 'ui-slider-active');

        _chooseSign(dom, idx, op);
    };

    /**
     * slider 效果切换
     * @param dom 
     * @param down 是否下一张， true = 下一张， false = 上一张
     * @param op options
     */
    function _sliderChange(dom, down, op) {
        var childs = dom.querySelectorAll('.ui-slider-content');
        var max = childs.length;

        // 原展示图片
        var idx = parseInt(dom.getAttribute('slider-index'), 10);
        var domOld = childs[idx];

        // 展示判断
        idx = _calIds(idx, max, down);
        _sliderChangeIdx(dom, childs, domOld, idx, down, op);
    };

    // 切换
    function _sliderChangeIdx(dom, childs, domOld, idx, down, op) {

        var times = op.sliderTimes;
        var directionString = op.direction == 'lr' ? 'left' : 'top';

        // 判断下一张位置
        childs[idx].style[directionString] = down ? '100%' : '-100%';


        setTimeout(function() {
            domOld.style[directionString] = down ? '-100%' : '100%';
            childs[idx].style[directionString] = '0';
            _bindSlider(domOld, times);
            _bindSlider(childs[idx], times);

            setTimeout(function() {
                _addClass(childs[idx], 'ui-slider-active');
                _removeClass(domOld, 'ui-slider-active');
            }, times);
        }, 100);

        _chooseSign(dom, idx, op);
    };

    // 根据 max down idx 计算新的 idx 
    function _calIds(idx, max, down) {
        if (down) {
            idx = idx + 1;
            idx = idx >= max ? 0 : idx;
        } else {
            idx = idx - 1;
            idx = idx < 0 ? max - 1 : idx;
        }
        return idx;
    };

    /**
     * 切换 sign 选中
     * @param op options
     */
    function _chooseSign(dom, idx, op) {

        if (op.success != null) {
            op.success(dom, idx);
        }

        // 重新绑定定时器
        _bindSliderRun(dom, op);

        dom.setAttribute('slider-index', idx);
        var signSelector = dom.getAttribute('slider-sign');
        if (signSelector != null && signSelector != '') {
            var domSign = document.getElementById(signSelector);
            if (domSign) {
                var signs = domSign.querySelectorAll('.ui-slider-sign');
                _removeClass(domSign.querySelector('.ui-slider-choose'), 'ui-slider-choose');
                _addClass(signs[idx], 'ui-slider-choose');
            }
        }
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

    // 绑定 slider 
    function _bindSlider(dom, times) {
        if (!dom) return;
        dom.style['transition'] = 'all ' + times + 'ms';
        dom.style['-webkit-transition'] = 'all ' + times + 'ms';
        setTimeout(function() {
            dom.style['transition'] = 'none';
            dom.style['-webkit-transition'] = 'none';
        }, times);
    };

    // 判断 runStartStep
    function _runStart(o) {
        var result = true;
        if (o.runStartStep != null) {
            result = false;
            if (o.startX < o.runStartStep || o.startX > o.width - o.runStartStep) {
                result = true;
            } else if (o.startY < o.runStartStep || o.startY > o.height - o.runStartStep) {
                result = true;
            }

        }

        if (result) {
            _stopDefault(o.eve);
            _stopPropagation(o.eve);
        }

        return result;
    };

    $.paSlider = paSlider;

})(window);
