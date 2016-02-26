/* 公用下拉框
 * param selector jquery 选择器，对应的选择器，class必须要有 j-select 否则有些属性方法不能用
 * param pchar string getValue 中获取的值，用该符号拼接
 * param type string checkbox/radio 代表单选或者多选，单选如果需要有默认值
 * param ok function() return false 则回滚操作
 * attr drop-value int j-drop 属性，单选的时候有效，默认选中 value=drop-value 的 input 选项
 * 控件子选择器
 * .j-select[或者 selector] 可以有 drop-text 为默认的值
 * .j-drop 控件，点击执行下拉
 * .j-main 控件，下拉展示的模块
 * .j-options 插件值列表，只有在 j-options 下的 j-option 才是值
 *            该项可以有 drop-length 属性，int值，表示该组下，最多可以选多少个值，如果有 j-all 全选，则该项无效
 * .j-option 插件值控件
 */
define(function(require, exports, module) {
  require('jquery');

  exports.build = function(conf) {
    var _def = {
      selector: '.j-checkbox',
      pchar: ',',
      ok: null,
      cancel: null,
      searchInput: false,
      keyupTime: 300,
      changeText: true,
      type: 'checkbox'
    };

    try {
      conf = $.extend(_def, conf);
      var $selector = $(conf.selector);

      $selector.each(function() {
        var droptimer = null;
        var $oldChoose;
        var $_this = $(this);
        var $drop = $_this.find('div.j-drop:eq(0)');
        var $valueDiv = $_this.find('span.j-value:eq(0)');
        var $valueInput = $_this.find('input.j-value:eq(0)');
        var $main = $_this.find('div.j-main:eq(0)');
        var $select = $_this.find('.j-options');
        var $texts = $_this.find('.j-text');
        var $btnOk = $_this.find('.j-ok');
        var $btnCancel = $_this.find('.j-cancel');
        var $search = $_this.find('.j-search');
        var $inputAll = $_this.find('.j-all');
        var haveAll = $inputAll.length > 0;
        var dropValue = $_this.attr('drop-value');
        var dropText = $_this.attr('drop-text');
        $valueDiv.html(dropText);
        $_this.attr('drop-type', conf.type);
        $_this.unbind('mouseout');
        $_this.unbind('mouseover');
        $drop.unbind('click');
        $btnOk.unbind('click');
        $btnCancel.unbind('click');

        // 点击展示下拉
        $drop.on('click', function() {
          if ($select.find('.j-option').length > 0)
            $main.toggle();
        });

        // 文字点击选中 checkbox，radio
        $texts.on('click', function() {
          try {
            if (conf.type == 'checkbox') {
              var $_check = $(this).parent().find('input:checkbox');
              $_check.click();
            } else {
              var $_radio = $(this).find('input:radio');
              $_radio.prop('checked', true);
              $valueInput.val($_radio.val());
            }
          } catch (e) {}
        });


        // 全选
        if (conf.type == 'checkbox' && haveAll) {
          var $_checkboxs = $select.find('input:checkbox');
          var _checkboxs_len = $_checkboxs.length;
          $inputAll.on('click', function() {
            var ischeck = $inputAll.prop('checked');
            $_checkboxs.prop('checked', ischeck);
          });
          $_checkboxs.on('change', function() {
            $inputAll.prop('checked', $select.find('input:checkbox:checked').length == _checkboxs_len);
          });
        }

        $search.on('keyup', function() {
          var _timer = setTimeout(function() {
            $select.find('.j-option').hide();
            $select.find('.j-option:contains(' + $search.val().replace(/\'/g, '') + ')').show();
          }, conf.keyupTime);
          $search.on('keydown', function() {
            clearTimeout(_timer);
          });
        });

        // 绑定选中执行事件
        $select.each(function() {
          var $_select = $(this);
          var _maxlen = 0;
          if (!haveAll) {
            _maxlen = $_select.attr('drop-length');
            _maxlen = _maxlen == undefined || _maxlen == '' ? 0 : parseInt(_maxlen, 10);
          }
          var $_options = $_select.find('.j-option');
          if (conf.type == 'checkbox') {
            var $_checkboxs = $_select.find('input:checkbox');

            $_checkboxs.on('change', function() {
              if (_maxlen > 0) {
                var _len = $_select.find('input:checkbox:checked').length;
                if (_len == _maxlen) {
                  $_checkboxs.prop('disabled', true);
                  $_this.find('input:checkbox:checked').prop('disabled', false);
                } else {
                  $_checkboxs.prop('disabled', false);
                }
              }
            });
          } else {
            setRadioDefault(dropValue, $_this, $valueDiv, null);
          }
        });

        // 按钮事件
        $btnOk.on('click', function() {
          var _success = true;
          if (conf.ok) {
            _success = conf.ok($select.find('input:' + conf.type + ':checked'), $_this);
          }
          if(_success === false) {
            cancelFun();
          } else {
            $oldChoose = $_this.find('input:' + conf.type + ':checked');
            $main.hide();
            $valueDiv.html(getText($_this, $select, conf.pchar, conf.changeText));
          }
        });

        $btnCancel.on('click', cancelFun);

        // 取消事件
        function cancelFun() {
          $_this.find('input:' + conf.type).prop('checked', false);
          if ($oldChoose) {
            $oldChoose.prop('checked', true);
          }
          $select.each(function() {
            $(this).find('input:' + conf.type + ':eq(0)').trigger('change');
          });
          $main.hide();
          if (conf.cancel) {
            conf.cancel();
          }
        };

        // 鼠标移出事件
        $_this.on('mouseout', function(e) {
          droptimer = setTimeout(function() {
            $main.hide();
          }, 200);
        });
        $_this.on('mouseover', function(e) {
          clearTimeout(droptimer);
        });
      });
    } catch (e) {
      console.log('j-select error:' + e.message);
    }
  };

  // 单选初始化值
  function setRadioDefault(dropValue, $_select, $valueDiv, _text) {
    if (dropValue != undefined && dropValue != '') {
      try {
        var $_input = $_select.find('.j-option input:radio[value="' + dropValue + '"]:eq(0)');
        var $_text = $_input == undefined ? undefined : $_input.parent();
        if ($_text != undefined) {
          $_text.click();
          $valueDiv.html($_text.find('span:eq(0)').text());
        }
      } catch (e) {
        console.log(e.message)
      };
    } else {
      if (_text != undefined) {
        $valueDiv.html(_text);
      }
    }
  };

  // 获取 .j-options 下的文本，用 c 隔开
  function getText($con, $select, c, changeText) {
    var result = '';
    if ($select) {
      var $texts = $select.find('input:checked').parent();
      if (changeText == undefined || changeText) {
        $texts.each(function() {
          if (result != '') {
            result += c;
          }
          result += $.trim($(this).find('span:eq(0)').text().replace(/,/g, ''));
        });
      }
    }
    return result == undefined || result == '' ? $con.attr('drop-text') : result;
  };

  // 获取 value 值，单选有效
  exports.getValue = function($con) {
    return $con.find('input.j-value:eq(0)').val();
  };

  // 获取文本
  exports.getText = function($con) {
    return $con.find('span.j-value:eq(0)').text();
  };

  // 重置插件
  exports.reset = function($cons, conf) {
    if ($cons == undefined) return;

    $cons.each(function() {
      var $_this = $(this);
      var _type = $_this.attr('drop-type');
      var _text = $_this.attr('drop-text');
      var $_select = $_this.find('.j-options');
      var $valueDiv = $_this.find('span.j-value:eq(0)');
      var $valueInput = $_this.find('input.j-value:eq(0)');
      // 设置默认值
      if (_type == undefined || _type == 'checkbox') {
        $valueDiv.html(_text);
        $valueInput.val('');
        $_this.find('input:checkbox').prop('checked', false);
      } else {
        var dropValue = $_this.attr('drop-value');
        setRadioDefault(dropValue, $_this, $valueDiv, _text);
      }
    });
  };
});
