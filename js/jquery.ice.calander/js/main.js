// 日历控件
function IceCalendar($, conf) {
  var nowDate = new Date();
  var dayArr = ['日', '一', '二', '三', '四', '五', '六'];
  var isIE7 = $('<div style="*width:1px;"></div>').css('width') == '1px';
  var options = {
    selector: '.calendar',
    appendTo: null, //日历控件显示到的控件， jquery selector，默认 selector 控件
    times: 1, // 1/2 多少个日历
    type: 'day', // 插件类型，day/month 选日/选月
    tformat: {
      "day": "yyyy年MM月",
      "month": "yyyy年"
    }, // 标题格式化
    initIndex: 0, // 默认当前月/年
    maxDateOpe: true, // 设置的 maxDate 是否可以操作，如果 false，则 maxDate 默认是少一天
    chooseDate: null, // 默认选中的日期，如果为 null 则默认选中当天，格式必须是 yyyyMMdd
    maxDate: null, // 最大日期，格式必须是 yyyyMMdd
    minDate: null, // 最小日期, 格式必须是 yyyyMMdd
    closeWeek: [], // 周几不能操作，只对 type="day" 有效
    closeDay: [], // 每月几号不能操作， 只对 type="day" 有效
    closeMonth: [], // 每年几月不能操作，只对 type="month" 有效
    openEvent: 'click', // 执行什么事件的时候打开
    positionLeft: null, // left 距离
    positionRight: null, // right 距离
    positionTop: null, // top 距离
    positionBottom: null, // bottom 距离
    ok: null, // 确认事件
    cancel: null, // 取消事件
    other: null
  };
  conf = $.extend(options, conf);

  var html_box = '<div class="ice-calendar-parent"><div class="ice-calendar-main"><table><tr>{content}</tr></table><div class="ice-calendar-btn">{buttons}</div></div></div>';
  var html_content = '<td valign="top"><div class="ice-calendar"><div class="sec sec-bdl sec-bdr"><div class="sec-head j-head"><div class="btn j-pre"><a class="bg bg-pre" href="javascript:;">&nbsp;</a></div><div class="time j-title"></div><div class="btn"><a class="bg bg-next j-next" href="javascript:;">&nbsp;</a></div></div><div class="sec-day"><div class="sec-date"><span>日</span> <span>一</span> <span>二</span> <span>三</span> <span>四</span> <span>五</span> <span>六</span></div><div class="sec-days j-contents"></div></div></div></div></td>';
  var html_content_month = '<td valign="top"><div class="ice-calendar"><div class="sec sec-bdl sec-bdr"><div class="sec-head j-head"><div class="btn j-pre"><a class="bg bg-pre" href="javascript:;">&nbsp;</a></div><div class="time j-title"></div><div class="btn"><a class="bg bg-next j-next" href="javascript:;">&nbsp;</a></div></div><div class="sec-month"><div class="sec-months j-contents"></div></div></div></div></td>';
  var html_buttons = '<span class="yes j-yes">确定</span> <span class="no j-no">取消</span>';

  if (!conf) {
    return;
  };
  $(conf.selector).each(function(bbb) {
    var $_this = $(this);
    // 单个插件配置信息
    var initDay = conf.initDay;
    var myMaxDate = conf.maxDate == undefined ? nowDate : numToDate(conf.maxDate);
    if (!conf.maxDateOpe) {
      myMaxDate = getDateDay(myMaxDate, 0);
    };
    conf.maxDate = dateFormat(myMaxDate, 'yyyyMMdd');

    var appendTo = conf.appendTo;
    var initIndex = conf.initIndex;
    var times = conf.times;
    var type = conf.type;
    var chooseDate = conf.chooseDate == undefined ? nowDate : numToDate(conf.chooseDate);
    var openEvent = conf.openEvent;
    var positionRight = conf.positionRight;
    var positionLeft = conf.positionLeft;
    var positionTop = conf.positionTop;
    var positionBottom = conf.positionBottom;

    var $box = appendTo == undefined ? $_this : $(appendTo);
    if ($box == 0) {
      return;
    } else {
      $box = $box.eq(0);
    };

    // 生成插件内容
    var $calendar_main = build(times, type, $box);
    var $calendars = $calendar_main.find('.ice-calendar');
    var $btnShow = $_this.find('.j-show');
    var $btnYes = $calendar_main.find('.j-yes');
    var $btnNo = $calendar_main.find('.j-no');

    // 设置位置
    if (positionLeft != undefined) {
      $calendar_main.css('left', positionLeft);
    } else if (positionRight != undefined) {
      $calendar_main.css('right', positionRight);
    };
    if (positionTop != undefined) {
      $calendar_main.css('top', positionTop);
    } else if (positionBottom != undefined) {
      $calendar_main.css('bottom', positionBottom);
    };

    // 获取初始日期
    var dates = [];
    if (times == '2') {
      if (type == 'day') {
        dates.push(getDateMonth(nowDate, initIndex + 1));
        dates.push(getDateMonth(nowDate, initIndex));
      } else {
        dates.push(getDateYear(nowDate, initIndex + 1));
        dates.push(getDateYear(nowDate, initIndex));
      };
    } else {
      if (type == 'day') {
        dates.push(getDateMonth(nowDate, initIndex));
      } else {
        dates.push(getDateYear(nowDate, initIndex));
      };
    };

    var _test = new Date('2015', '01', '01');

    // 绑定展示事件
    $btnShow.on('click', function() {
      openCalanderMain($calendar_main);
    });

    // 绑定按钮事件
    $btnYes.on('click', function() {
      closeCalanderMain($calendar_main);
      setValueYes($calendars);
      if (!!conf.ok) {
        conf.ok(getValue($calendars));
      };
    });

    $btnNo.on('click', function() {
      closeCalanderMain($calendar_main);
      if (!!conf.cancel) {
        conf.cancel(getValue($calendars));
      };
    });

    // 设置插件值
    if (type == 'day') {
      // 日历
      $calendars.each(function(index) {
        // 基本属性
        var $_this = $(this);
        var _date = dates[index];
        var $_btnPre = $_this.find('.j-pre:eq(0)');
        var $_btnNext = $_this.find('.j-next:eq(0)');
        var $_title = $_this.find('.j-title:eq(0)');
        var $_days = $_this.find('.j-contents');
        buildDay($_this, $_title, $_days, _date, conf);

        // 日历翻页
        $_btnPre.on('click', function() {
          var _date = getDateMonth(yearMonthToDate(getYearMonth($_this)), 1);
          buildDay($_this, $_title, $_days, _date, conf);
        });

        $_btnNext.on('click', function() {
          var _date = getDateMonth(yearMonthToDate(getYearMonth($_this)), -1);
          buildDay($_this, $_title, $_days, _date, conf);
        });

        // 设置默认值
        setValueChoose($_this, dateFormat(chooseDate, 'yyyyMMdd'));
        setValueYes($_this);
      });
    } else {
      // 月历
      $calendars.each(function(index) {
        // 基本属性
        var $_this = $(this);
        var _date = dates[index];
        var $_btnPre = $_this.find('.j-pre:eq(0)');
        var $_btnNext = $_this.find('.j-next:eq(0)');
        var $_title = $_this.find('.j-title:eq(0)');
        var $_months = $_this.find('.j-contents');
        buildMonth($_this, $_title, $_months, _date, conf);

        // 月历翻页
        $_btnPre.on('click', function() {
          var _date = getDateYear(yearMonthToDate(getYearMonth($_this)), 1);
          buildMonth($_this, $_title, $_months, _date, conf);
        });

        $_btnNext.on('click', function() {
          var _date = getDateYear(yearMonthToDate(getYearMonth($_this)), -1);
          buildMonth($_this, $_title, $_months, _date, conf);
        });

        // 设置默认值
        setValueChoose($_this, dateFormat(chooseDate, 'yyyyMM') + '01');
        setValueYes($_this);
      });
    };
  });

  // 打开，关闭日历
  function openCalanderMain($calendarMain) {
    $calendarMain.show(isIE7 ? 0 : 200);
  };

  function closeCalanderMain($calendarMain) {
    $calendarMain.hide();
  };

  // 生成日历模板
  function build(times, type, $box) {
    if (type == 'day') {
      var _html = '';
      for (var i = 0; i < times; i++) {
        _html += html_content;
      };
      var calendar = html_box.replace('{content}', _html).replace('{buttons}', html_buttons);
      var $calendar = $(calendar);
      $box.append($calendar);
      return $calendar;
    } else {
      var _html = '';
      for (var i = 0; i < times; i++) {
        _html += html_content_month;
      };
      var calendar = html_box.replace('{content}', _html).replace('{buttons}', html_buttons);
      var $calendar = $(calendar);
      $box.append($calendar);
      return $calendar;
    };
  };

  // 生成日历日期
  function buildDay($_calendar, $_title, $_days, _date, conf) {
    // 配置项
    var closeweek = conf.closeweek;
    var closeDay = conf.closeDay;
    var tformat = conf.tformat;
    var maxDate = conf.maxDate == undefined ? 0 : parseFloat(conf.maxDate);
    var minDate = conf.minDate == undefined ? 0 : parseFloat(conf.minDate);
    // 设置值
    var $_this = $_calendar;
    var _yearMonth = dateFormat(_date, 'yyyyMM');
    $_title.text(dateFormat(_date, tformat.day));
    setYearMonth($_this, _yearMonth);
    // 生成日历
    var begin = getFirstWeek(_date);
    var count = getDaysCount(_date);
    var _html = '';
    var _weekindex = 0;
    for (var i = 0; i < begin; i++) {
      _html += '<span class="disabeld">-</span>\n';
      _weekindex++;
    };
    for (var i = 1; i <= count; i++) {
      var _date = (_yearMonth + dateFormatZero(i));
      var _c = '';
      if ((maxDate != 0 && parseFloat(_date) > maxDate) || (minDate != 0 && parseFloat(_date) < minDate)) {
        _c = ' class="disabeld"';
      };
      _html += '<span' + _c + ' j-day="' + i + '" j-week="' + (_weekindex % 7) + '" j-date="' + _date + '">' + i + '</span>\n';
      _weekindex++;
    };
    for (var i = 0; i < 35 - begin - count; i++) {
      _html += '<span class="disabeld">-</span>\n';
    };

    var $_dayList = $(_html);
    $_days.html(_html);

    // 不可选周期和号数
    for (var k in closeweek) {
      $_days.find('span[j-week=' + closeweek[k] + ']').addClass('disabeld');
    };
    for (var k in closeDay) {
      $_days.find('span[j-day=' + closeDay[k] + ']').addClass('disabeld');
    };

    // 点击选择日期
    $_days.find('span').on('click', function() {
      setValueChoose($_this, getChooseValue($(this)));
    });

    // 设置默认值
    setValueChoose($_this, getValueChoose($_this));
  };

  // 生成月历日期
  function buildMonth($_calendar, $_title, $_months, _date, conf) {
    // 配置
    var tformat = conf.tformat;
    var closeMonth = conf.closeMonth;
    var maxDate = conf.maxDate == undefined ? 0 : parseFloat(conf.maxDate);
    var minDate = conf.minDate == undefined ? 0 : parseFloat(conf.minDate);
    // 设置项
    var $_this = $_calendar;
    var _year = dateFormat(_date, 'yyyy');
    var _yearMonth = dateFormat(_date, 'yyyyMM');
    setYearMonth($_this, _yearMonth);
    $_title.text(dateFormat(_date, tformat.month));
    // 生成月历
    var _html = '';
    for (var i = 1; i <= 12; i++) {
      var _date = (_year + dateFormatZero(i)) + '01';
      var _c = '';
      if ((maxDate != 0 && parseFloat(_date) > maxDate) || (minDate != 0 && parseFloat(_date) < minDate)) {
        _c = ' class="disabeld"';
      };
      _html += '<label><span' + _c + ' j-month="' + i + '" j-date="' + _date + '">' + i + '月</span></label>\n';
    };
    $_months.html(_html);

    // 不可选月份
    for (var k in closeMonth) {
      $_months.find('span[j-month=' + closeMonth[k] + ']').addClass('disabeld');
    };

    // 点击选择月份
    $_months.find('span').on('click', function() {
      setValueChoose($_this, getChooseValue($(this)));
    });

    // 设置默认值
    setValueChoose($_this, getValueChoose($_this));
  };

  // 获取日期-i月
  function getDateMonth(myDate, i) {
    myDate = myDate == undefined ? new Date() : new Date(myDate);
    if (i != undefined) {
      myDate.setMonth(myDate.getMonth() - i);
    };
    return myDate;
  };

  // 获取日期-i年
  function getDateYear(myDate, i) {
    myDate = myDate == undefined ? new Date() : new Date(myDate);
    if (i != undefined) {
      myDate.setYear(myDate.getFullYear() - i);
    };
    return myDate;
  };

  // 获取日期 -i 天
  function getDateDay(myDate, i) {
    myDate = myDate == undefined ? new Date() : new Date(myDate);
    if (i != undefined) {
      myDate.setDate(myDate.getDate() - i);
    };
    return myDate;
  };

  // 获取日期对应的月份有多少天
  function getDaysCount(curDate) {
    var curMonth = curDate.getMonth();
    curDate.setMonth(curMonth + 1);
    curDate.setDate(0);
    return curDate.getDate();
  };

  // 获取 curDate 月第一天是星期几
  function getFirstWeek(date) {
    date.setDate(1);
    return date.getDay();
  };

  // 设置日历值
  function setValue($_calendar, val) {
    $_calendar.attr('i-val', val);
  };

  // 获取日历值
  function getValue($_calendars) {
    var val = [];
    $_calendars.each(function() {
      var v = $(this).attr('i-val-yes');
      val.push(!!v ? v : '');
    });
    if (val.length == 2 && val[0] > val[1]) {
      var _v = val[0];
      val[0] = val[1];
      val[1] = _v;
    };
    return val;
  };

  // 设置日历确认值
  function setValueYes($_calendars) {
    $_calendars.each(function() {
      var _val = getValueChoose($(this));
      $(this).attr('i-val-yes', _val);
    });
  };

  // 设置日历选中值
  function setValueChoose($_calendar, val) {
    var $_contents = $_calendar.find('.j-contents');
    var $_choose = $_contents.find('span[j-date=' + val + ']');

    if (!$_choose.hasClass('disabeld')) {
      $_contents.find('.choose').removeClass('choose');
      $_choose.addClass('choose');
      $_calendar.attr('i-val-choose', val);
    };
  };

  // 获取日历选中值
  function getValueChoose($_calendar) {
    return $_calendar.attr('i-val-choose');
  };

  // 获取点击选中日期
  function getChooseValue($choose) {
    return $choose.attr('j-date');
  };

  // 把 yyyyMM(i-month) 转成 date
  function yearMonthToDate(num) {
    return new Date(num.substring(0, 4), num.substring(4, 6) - 1, '01');
  };

  // 把 yyyyMMdd 转成 date
  function numToDate(num) {
    return new Date(num.substring(0, 4), num.substring(4, 6) - 1, num.substring(6, 8));
  };

  // 获取日历当前的 i-month
  function getYearMonth($_calendar) {
    return $_calendar.attr('i-month');
  };

  function setYearMonth($_calendar, _val) {
    $_calendar.attr('i-month', _val);
  };

  // 格式
  function format(str, regStr) {
    if (regStr == undefined || regStr == '' || regStr == 'string') {
      return str == undefined ? '' : str.toString().replace(/"/g, '');
    } else if (regStr == 'json') {
      return str == undefined || str == '' ? {} : $.parseJSON(str);
    };
    return str;
  };

  // 格式化日期
  function dateFormat(date, format) {
    var o = {
      // 格式化数据，多字符必须放在前面
      "yyyy": date.getFullYear(),
      "MM": dateFormatZero(date.getMonth() + 1),
      "dd": dateFormatZero(date.getDate()),
      "hh": dateFormatZero(date.getHours()),
      "mm": dateFormatZero(date.getMinutes()),
      "ss": dateFormatZero(date.getSeconds()),
      "y": date.getFullYear(),
      "M": date.getMonth() + 1,
      "d": date.getDate(),
      "h": date.getHours(),
      "m": date.getMinutes(),
      "s": date.getSeconds(),
      "q": Math.floor((date.getMonth() + 3) / 3),
      "S": date.getMilliseconds()
    };

    for (var k in o) {
      format = format.replace(k, o[k]);
    };
    return format;
  };

  // 自动补0
  function dateFormatZero(str) {
    str = str.toString();
    return str.length == 1 ? '0' + str : str;
  };
};
