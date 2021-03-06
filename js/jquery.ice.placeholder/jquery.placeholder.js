$(function() {
  var _def = {
    top: "0",
    mgleft: ".3em"
  };
  if (!('placeholder' in document.createElement('input'))) {
    $('*[placeholder]').each(function() {
      var $input = $(this);
      var conf = _def;
      try {
        var _conf = $(this).attr('ph-conf');
        if (_conf != undefined && _conf != '') {
          conf = $.extend(conf, $.parseJSON(_conf));
        }
      } catch (e) {}
      var _txt = $input.attr('placeholder');
      var $p = $input.parent();
      $p.css('position', 'relative');
      var span = '<div style="*+line-height:1.6em; overflow:hidden; position: absolute !important; top: $_top; margin-left: $_mgleft; color: #bbb !important;">' + _txt + '</div>';
      span = span.replace('$_top', conf.top).replace('$_mgleft', conf.mgleft);
      var $span = $(span);
      $input.before($span);
      $span.on('click', function() {
        $input.focus();
      });
      var _val = $(this).val();
      if (_val != '') {
        $span.hide();
      }
      $input.on('keyup', function() {
        var _val = $(this).val();
        if (_val != '') {
          $span.hide();
        } else {
          $span.show();
        }
      });
    });
  }
});
