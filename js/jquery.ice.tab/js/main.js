/*
 * JQuery tab 切换插件
 * param selector 选择器，默认 .ice-tab
 * param ischild true/false mains 是否在 selector 下找，默认 true
 * param tabs 标签选择器，默认 .j-tab
 * param chooseClass 选中的样式
 * param mains 主题选择器，默认 .j-main
 * param choose 默认选中第几页
 * param success function() {} 点击执行事件
 */
function IceTab($, conf) {
  // 默认配置
  var defconf = {
    selector: '.ice-tab',
    ischild: true,
    tabs: '.j-tab',
    chooseClass: 'choose',
    choose: 0,
    mains: '.j-main',
    success: null
  };

  // 绑定配置
  conf = $.extend(defconf, conf);

  // 插件初始化
  $(conf.selector).each(function() {
    var $_this = $(this);


    // 配置
    var ischild = conf.ischild;
    var mains = conf.mains;
    var tabs = conf.tabs;
    var choose = conf.choose;
    var chooseClass = conf.chooseClass;

    var $tabs = $_this.find(tabs);
    var $mains;
    if (ischild) {
      $mains = $_this.find(mains);
    } else {
      $mains = $(mains);
    };

    if ($tabs.length != $mains.length) return;

    // 默认选择
    $tabs.eq(choose).addClass(chooseClass);
    $mains.hide();
    $mains.eq(choose).show();

    // 绑定点击事件
    $tabs.each(function(idx) {
      $(this).on('click', function() {
        if (conf.success) {
          try {
            conf.success();
          } catch (e) {

          }
        };
        $tabs.removeClass(chooseClass);
        $(this).addClass(chooseClass);
        $mains.hide();
        $mains.eq(idx).show();
      });
    });
  });
};
