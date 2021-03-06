 var cookie = {
   set: function(name, value, expiredays) {
     var exdate = new Date();
     exdate.setTime(exdate.getTime() + expiredays * 3600 * 1000);
     document.cookie = name + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString()) + ";path=/";
   },
   get: function(name) {
     if (document.cookie.length > 0) {
       var end = '';
       var start = document.cookie.indexOf(name + "=");
       if (start != -1) {
         start = start + name.length + 1;
         end = document.cookie.indexOf(";", start);
         if (end == -1) {
           end = document.cookie.length;
         }
         return unescape(document.cookie.substring(start, end));
       }
     }
   },
   remove: function(name) {
     setCookie(name, 1, -1);
   }
 };
