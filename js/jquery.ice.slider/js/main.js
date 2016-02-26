/*
 * JQuery 焦点图插件
 * 总布局一个 div ，内容为 class="j-main"
 * 内容内，每一项用 class="j-content" 包起来
 */
function IceSlider($, conf) {
  // 默认配置
  var defconf = {
    selector: '.ice-slider',
    gotime: 500,
    slitime: 3000,
    autoHeight: false, // 窗口改变是否要改变焦点图大小，默认 false， 移动端上尽量 false
    height: 0.6,
    success: null
  };

  // 绑定配置
  conf = $.extend(defconf, conf);

  // html 代码
  var html_footer_main = '<div class="j-footer">{content}</div><div class="j-shadow"></div>';
  var html_footer = '<span></span>';

  // 插件初始化
  $(conf.selector).each(function() {
    var $_this = $(this);
    var _domThis = $_this.get(0);
    var $main = $_this.find('.j-main:eq(0)');
    var $footer = $_this.find('.j-footer:eq(0)');
    var $content = $main.find('.j-content');
    var contentLen = $content.length;
    var $imgs = $main.find('.j-img');
    var chooseValue = 0;
    var timer = null;
    if ($main.length == 0 || contentLen == 0) {
      $_this.remove();
      return;
    };

    // 初始化
    setValue($main);
    $content.eq(0).css('left', '0%');

    // 设置高度，Interval 是为了解决 google 兼容，google 等图片加载和 js 为异步
    autoHeight($_this, $imgs);
    var htimer = setInterval(function() {
      autoHeight($_this, $imgs);
      if ($_this.css('height') > 0) {
        clearInterval(htimer);
      };
    }, 200);

    if(contentLen == 1) {
      return;
    };

    // 窗口变化的时候改变高度
    if (conf.autoHeight) {
      $(window).resize(function() {
        autoHeight($_this, $imgs);
      });
    };

    // 添加底部
    var $footer = buildFooter($_this, $content.length);
    var $footspans = $footer.find('span');
    // 底部点击切换
    $footspans.each(function(index) {
      $(this).on('click', function() {
        if (index == chooseValue) return;
        // 切换图片
        clearInterval(timer);
        var isNext = index > chooseValue;
        var $_now = $content.eq(index);
        var $_old = $content.eq(chooseValue);
        $_now.css('left', isNext ? '100%' : '-100%');
        $_old.animate({
          'left': isNext ? '-100%' : '100%'
        }, conf.gotime);
        $_now.animate({
          'left': '-0%'
        }, conf.gotime);
        chooseValue = index;
        // 选中小圈
        $footer.find('span.j-choose').removeClass('j-choose');
        $(this).addClass('j-choose');
        autoGo();
      });
    });

    // 绑定 touch 事件
    if ('ontouchend' in document) {
      var isFin = true;
      var isMove = false;
      var startPageX = 0;
      var endPageX = 0;
      var startPageY = 0;
      var endPageY = 0;
      var startTouch, moveTouch, endTouch;
      _domThis.ontouchstart = function(event) {
        if (isFin) {
          clearInterval(timer);
          isMove = false;
          startTouch = event.targetTouches[0];
          startPageX = startTouch.pageX;
          startPageY = startTouch.pageY;
        };
      };
      _domThis.ontouchmove = function(event) {
        if (isFin) {
          if (event.targetTouches.length > 1 || event.scale && event.scale !== 1) return;
          moveTouch = event.targetTouches[0];
          var moveWidth = startPageX - moveTouch.pageX;
          var moveHeight = startPageY - moveTouch.pageY;
          if (Math.abs(moveWidth) > Math.abs(moveHeight)) {
            isMove = true;
            event.preventDefault()
          }
          moveTouch = event.targetTouches[0];
          endPageX = moveTouch.pageX;
        };
      };
      _domThis.ontouchend = function(event) {
        try {
          if (isFin && isMove) {
            isFin = false;
            endTouch = event.targetTouches[0];
            var _move = endPageX - startPageX;
            if (_move > 0 && chooseValue > 0) {
              $footspans.eq((chooseValue + contentLen - 1) % contentLen).click();
            } else if (_move < 0 && chooseValue < contentLen - 1) {
              $footspans.eq((chooseValue + 1) % contentLen).click();
            };
          };
        } catch (e) {};
        isFin = true;
        autoGo();
      };
    };

    // 自动切换
    autoGo();

    function autoGo() {
      if(timer != null) {
        clearInterval(timer);
        timer = null;
      };
      timer = setInterval(function() {
        $footspans.eq((chooseValue + 1) % contentLen).click();
      }, conf.slitime);
    };
  });

  // 加载完成执行函数
  if(conf.success) {
    conf.success();
  };

  // 设置值
  function setValue($main, val) {
    $main.attr('choose', val == undefined ? '0' : val);
  };

  // 构建底部
  function buildFooter($slider, len) {
    var _html = '';
    for (var i = 0; i < len; i++) {
      _html += html_footer;
    };
    var $_html = $(html_footer_main.replace('{content}', _html));
    $_html.find('span:eq(0)').addClass('j-choose');
    $slider.append($_html);
    $slider.find('.j-shadow').css('opacity', 0.5);
    return $_html;
  };

  // 自动适应高度
  function autoHeight($slider, $imgs) {
    var _h = $imgs.eq(0).css('height');
    $slider.css('height', _h);
  };
};
