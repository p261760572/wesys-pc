var baseJs = (function() {
    var $$ = {};
    window.basedir = '/p';

    $$.wrapUrl = function(url) {
        return window.basedir ? window.basedir + url : url;
    }

    $$.errcode = function(data) {
        return data.errcode;
    };

    $$.errmsg = function(data) {
        return data.errmsg;
    };

    $$.preventDefault = function(event) {
        if (event) {
            event.preventDefault ? event.preventDefault() : (event.returnValue = false);
        }
    };

    //解析查询字符串
    $$.parseQueryString = function() {
        var query = {};
        var queryString = window.location.search.substr(1);
        if (queryString.length > 0) {
            var pairs = queryString.split('&');
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i].split('=');
                if (pair.length < 2) {
                    pair[1] = "";
                }
                query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1].replace(/\+/g, ' '));
            }
        }
        return query;
    };

    //POST请求
    $$.request = function(url, data, success, error, async) {
        error = error || function(data) {
            layer.msg($$.errmsg(data), {
                icon: 2
            });
        };
        $.ajax({
            url: $$.wrapUrl(url),
            type: 'POST',
            async: (async == false ? false : true),
            contentType: 'application/json',
            dataType: 'json',
            data: $.toJSON(data),
            success: function(data) {
                if ($$.errcode(data) == 0) {
                    success(data)
                } else {
                    error(data);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if (console) console.log(arguments);
            }
        });
    };


    //字符串去空白
    $$.trim = function(str) {
        return str.replace(/(^[\s]*)|([\s]*$)/g, '');
    };

    $$.ltrim = function(str) {
        return str.replace(/(^[\s]*)/g, '');
    };

    $$.rtrim = function(str) {
        return str.replace(/([\s]*$)/g, '');
    };


    //格式化日期
    $$.formatDate = function(date, format) {
        var o = {
            "M+": date.getMonth() + 1, //month
            "d+": date.getDate(), //day
            "h+": date.getHours(), //hour
            "m+": date.getMinutes(), //minute
            "s+": date.getSeconds(), //second
            "q+": Math.floor((date.getMonth() + 3) / 3), //quarter
            "S": date.getMilliseconds() //millisecond
        }
        if (/(y+)/.test(format))
            format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(format))
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        return format;
    };

    //解析日期
    $$.parseDate = function(s, format) {
        var date = new Date(1970, 0, 1, 0, 0, 0, 0);
        var o = {
            "y+": 'setFullYear', //year
            "M+": 'setMonth', //month
            "d+": 'setDate', //day
            "h+": 'setHours', //hour
            "m+": 'setMinutes', //minute
            "s+": 'setSeconds', //second
            "S": 'setMilliseconds' //millisecond
        }

        for (var k in o) {
            var result;
            if ((result = new RegExp("(" + k + ")").exec(format)) != null) {
                date[o[k]](s.substr(result.index, result[0].length));
            }
        }

        return date;
    };


    $$.loadData = function(selector, data) {
        var $eles = $(selector);

        function _load($form, data) {
            for (var name in data) {
                var val = data[name];
                if (!_checkField($form, name, val)) {
                    $form.find('input[name="' + name + '"]').val(val);
                    $form.find('textarea[name="' + name + '"]').val(val);
                    $form.find('select[name="' + name + '"]').val(val);
                }
            }
        }

        function _checkField($form, name, val) {
            var $cc = $form.find('input[name="' + name + '"][type=radio], input[name="' + name + '"][type=checkbox]');
            if ($cc.length) {
                $cc.each(function(i, ele) {
                    $ele = $(ele);
                    if (_isChecked($ele.val(), val)) {
                        $ele.prop('checked', true);
                    }
                });
                return true;
            }
            return false;
        }

        function _isChecked(v, val) {
            if (v == String(val) || $.inArray(v, $.isArray(val) ? val : [val]) >= 0) {
                return true;
            } else {
                return false;
            }
        }

        $eles.each(function(i, ele) {
            var $form = $(ele);
            _load($form, data);
        });

        return this;
    }

    return $$;
})();

window.$$ === undefined && (window.$$ = baseJs);


$$.getKeys = function(row, keys) {
    var data = {};
    //string支持
    if (typeof keys == 'string') {
        keys = keys.split(',');
    }

    if (row) {
        for (var i = 0; i < keys.length; i++) {
            data[keys[i]] = row[keys[i]];
        }
    }
    return data;
}

$$.transformStatus = function(target, status) {
    target = $(target)[0];
    status = status || 'view';
    var opts = $.parser.parseOptions(target);

    //显示/隐藏
    $('.visible', target).show().filter('.invisible-' + status).hide();
    $('.invisible', target).hide().filter('.visible-' + status).show();

    $('input[type!="button"],textarea,select', target).each(function(index, element) {
        if ($.inArray(status, ['create', 'update']) < 0) {
            readonly(index, element);
        } else {
            editable(index, element);
        }
    });

    $('.readonly,.readonly-' + status, target).find('input[type!="button"],textarea,select').each(readonly);

    $('.editable,.editable-' + status, target).find('input[type!="button"],textarea,select').each(editable);

    function readonly(index, element) {
        var t = $(element);
        if (t.hasClass('combobox-f')) {
            t.combobox('disable');
        } else if (element.tagName == 'SELECT' || (element.tagName == 'INPUT' && element.type == 'checkbox')) {
            t.attr('disabled', 'disabled');
        } else {
            t.attr('readonly', 'readonly');
        }
    }

    function editable(index, element) {
        var t = $(element);
        if (t.hasClass('combobox-f')) {
            t.combobox('enable');
        } else if (element.tagName == 'SELECT' || (element.tagName == 'INPUT' && element.type == 'checkbox')) {
            t.removeAttr('disabled');
        } else {
            t.removeAttr('readonly');
        }
    }
};


$$.formatField = function(rows, value, valueField, textField) {
    valueField = valueField || 'value';
    textField = textField || 'text';
    for (var i = 0; i < rows.length; i++) {
        if (rows[i][valueField] == value) {
            return rows[i][textField];
        }
    }
    return null;
};


$$.hasNextStatus = function(rows, oper_in, proc_st, action) {
    oper_in = oper_in || '0';
    proc_st = proc_st || '0';

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row[0] == oper_in && row[1] == proc_st && row[2] == action) {
            return true;
        }
    }

    return false;
};
