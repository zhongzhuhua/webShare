(function() {
  // 插件
  var ice = {
    isMobile: ('ontouchend' in document),
    tapStart: ('ontouchstart' in document) ? 'touchstart' : 'mousedown',
    tapMove: ('ontouchmove' in document) ? 'touchmove' : 'mousemove',
    tapEnd: ('ontouchend' in document) ? 'touchend' : 'mouseup',
    tapClick: ('ontouchstart' in document) ? 'touchstart' : 'click',
    // 获取参数 url 
    request: function(key) {
      var s = location.search.match(new RegExp('[?&]' + key + '=([^&]*)(&?)', 'i'));
      return (s == undefined || s == 'undefined' ? '' : s ? s[1] : s).replace(/[\<\>]/g, '');
    },
    // 去掉左右空格
    trim: function(s) {
      return s != null ? s.replace(/(^\s*)|(\s*$)/g, '') : null;
    },
    // 设置 style
    css: function(dom, json) {
      if (dom != null) {
        if (dom instanceof HTMLElement) {
          for (var k in json) {
            dom.style[k] = json[k];
            dom.style['-webkit-' + k] = json[k];
            dom.style['-moz-' + k] = json[k];
            dom.style['-o-' + k] = json[k];
            dom.style['-ms-' + k] = json[k];
          }
        } else {
          for (var k in dom) {
            this.css(dom[k], json);
          }
        }
      }
    },
    // 添加样式
    addClass: function(dom, clazz) {
      if (dom != null && clazz != null && clazz != '') {
        if (dom instanceof HTMLElement) {
          dom.className = dom.className + ' ' + clazz;
        } else {
          for (var k in dom) {
            this.addClass(dom[k], clazz);
          }
        }
      }
    },
    // 删除样式
    removeClass: function(dom, clazz) {
      if (dom != null && clazz != null && clazz != '') {
        if (dom instanceof HTMLElement) {
          dom.className = this.trim(dom.className.replace(new RegExp(clazz, 'g'), ''));
        } else {
          for (var k in dom) {
            this.removeClass(dom[k], clazz);
          }
        }
      }
    },
    // css3 选择器
    query: function(s) {
      return document.querySelector(s);
    },
    // css3 选择器
    queryAll: function(s) {
      return document.querySelectorAll(s);
    },
    // 合并两个 json 对象
    extend: function(a, b) {
      if (a == null) {
        return b;
      } else if (b == null) {
        return a;
      } else {
        for (var k in b) {
          a[k] = b[k];
        }
        return a;
      }
    },
    // 转换对象
    parseInt: function(str) {
      try {
        var v = parseInt(str, 10);
        return isNaN(v) || v == undefined ? 0 : v;
      } catch (e) {
        return 0;
      }
    },
    parseFloat: function(str, point) {
      try {
        var v = parseFloat(str);
        return isNaN(v) || v == undefined ? 0 : v.toFixed(point == undefined ? 0 : point);
      } catch (e) {
        return 0;
      }
    },
    parseDate: function(str) {
      var date = null;
      try {
        if (str != undefined && str != '') {
          var regNum = /^[1-3][0-9]{7}$/;
          if (str instanceof Date) {
            date = str
          } else {
            if (str.indexOf('Date') > -1) {
              date = new Date(parseInt(str.replace('/Date(', '').replace(')/', ''), 10))
            } else {
              if (regNum.test(str)) {
                date = new Date(str.substr(0, 4) + '-' + str.substr(4, 2) + '-' + str.substr(6, 2))
              } else {
                date = new Date(str.replace(/\-/g, "/"))
              }
            }
          }
        }
      } catch (e) {
        date = null
      }
      return date;
    },
    // 转成 json
    parseJson: function(s) {
      return s == null || this.trim(s) == '' ? null : eval('(' + s + ')');
    },
    // 转换字符串
    formatDate: function(date, format) {
      try {
        var o = {
          // 格式化数据，多字符必须放在前面
          "yyyy": date.getFullYear(),
          "MM": this.dateFormatZero(date.getMonth() + 1),
          "dd": this.dateFormatZero(date.getDate()),
          "hh": this.dateFormatZero(date.getHours()),
          "mm": this.dateFormatZero(date.getMinutes()),
          "ss": this.dateFormatZero(date.getSeconds()),
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
      } catch (e) {
        return '';
      }
    },
    dateFormatZero: function(str) {
      str = str.toString();
      return str.length == 1 ? '0' + str : str;
    }
  };

  // 创建 HttpRequest
  function createHttpRequest() {
    var h;
    try {
      xmlHttp = new XMLHttpRequest();
    } catch (e) {
      try {
        xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
      } catch (e) {
        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
      }
    }
    return xmlHttp;
  }

  // ajax 请求
  ice.ajax = function(o) {
    var options = {
      url: null,
      type: 'get',
      async: true,
      cache: true,
      dateType: 'text',
      data: null,
      success: function() {},
      error: function() {}
    };
    options = ice.extend(options, o);
    var myurl = options.url;
    var myhttp = createHttpRequest();

    if (myhttp == null || myurl == null || myurl == '') {
      options.error('request url is null');
    } else {
      // 是否有问号
      var havep = myurl.indexOf('?') < 0;
      var data = options.data;
      var cache = options.cache;
      var type = options.type;
      var isget = type != 'post';
      var params = '';

      // 参数
      if (data != null) {
        // 缓存
        if (!cache) {
          var rtime = '&ajaxtime=' + new Date().getTime();
          myurl = myurl + (havep ? '?' : '') + rtime;
          havep = true;
        }
        // 请求类型
        for (var k in data) {
          var v = data[k];
          v = v == null ? '' : v;
          params += '&' + k + '=' + v;
        }

        if(isget) {
          myurl = myurl + (havep ? '?' : '') + params; 
        }
      }

      // 请求
      myhttp.open(type, myurl, options.async);
      if (!isget) {
        myhttp.setRequestHeader('Content-type','application/x-www-form-urlencoded');
        myhttp.send(params);
      } else {
        myhttp.send(null);
      }

      // 判断是否请求成功
      myhttp.onreadystatechange = function() {
        var finish = false;
        if (myhttp.readyState == 4) {
          if (myhttp.status == 200) {
            finish = true;
          }
        }

        if (finish) {
          var result = myhttp.responseText;
          if (options.dateType == 'json') {
            result = ice.parseJson(result);
          }
          options.success(result);
        } else {
          options.error('request error');
        }
      };
    }
  };

  window.ice = ice;
})();
