window.basedir = '/p';

window.$$ = (function() {
    var $$ = {};
    var selectTpl = '{{each rows as row i}} <option value="{{row[valueField]}}">{{row[textField]}}</option> {{/each}}';

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

    $$.msg = function(content, options, end) {
        layer.msg(content, options, end);
    };

    $$.alert = function(content, options, yes) {
        layer.alert(content, options, yes);
    };

    $$.confirm = function(content, yes) {
        layer.confirm(content, {
            icon: 3,
            title: '提示'
        }, function(index) {
            layer.close(index);
            if (yes) yes();
        });
    };

    $$.prompt = function(title, yes) {
        layer.prompt({
            title: title,
        }, function(value, index, elem) {
            layer.close(index);
            if (yes) yes(value);
        });
    };

    //解析查询
    $$.parseQuery = function(queryString) {
        var query = {};
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

    $$.url = function(url, params) {
        var split = url.split('?');
        var key = split.shift();
        var args = split.join('?');
        var query = $$.parseQuery(args);
        var queryString = $.param($.extend(query, params || {}));

        if (queryString.length) {
            url = key + '?' + queryString;
        }

        return url;
    }

    $$.open = function(url, title, params, options) {
        options = $.extend({
            type: 2,
            title: title,
            content: $$.url(url, params),
            end: function() {
                if (window.pagination) window.pagination.reload();
            }
        }, options || {});

        var index = layer.open(options);
        layer.full(index);
    }

    $$.openTab = function(url, title) {
        if (window.top.addTab) {
            var id = url;
            url = 'pages/' + url;
            window.top.addTab(id, title, url);
        } else {
            $$.open(url, title);
        }
    }

    //解析查询字符串
    $$.parseQueryString = function() {
        var queryString = window.location.search.substr(1);
        return $$.parseQuery(queryString);
    };

    //POST请求
    $$.request = function(url, data, success, error, options) {
        var index;

        if (typeof error !== 'function') {
            options = error;
            error = function(data) {
                if (window.layer) {
                    $$.msg($$.errmsg(data), {
                        icon: 2
                    });
                }
            };
        }

        options = options || {};
        options = $.extend({
            async: true,
            loading: true
        }, options, {
            url: $$.wrapUrl(url),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: $.toJSON(data),
            success: function(data) {
                if (index !== undefined) layer.close(index);
                if ($$.errcode(data) == 0) {
                    success(data)
                } else {
                    error(data);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if (index !== undefined) layer.close(index);
                error({
                    errcode: -1,
                    errmsg: textStatus
                });
            }
        });


        if (window.layer && options.loading) index = layer.load(2);
        return $.ajax(options);
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

    $$.search = function(url, params, options) {
        params.page = params.page || 1;
        options = $.extend({
            selector: '#list',
            pageSelector: '#page',
            tpl: 'list-tpl',
            checkbox: true,
            onClickRow: $.noop
        }, options || {})

        load();

        function load() {
            $$.request(url, params, function(data) {
                var $list = $(options.selector).html(template(options.tpl, data)).data('data', data);
                if (options.checkbox) form.render('checkbox');

                $list.on('click', 'tbody td:has(input[type=checkbox])', function() {
                    return false
                }).on('click', 'tbody tr', function() {
                    var $this = $(this);
                    var $siblings = $this.addClass('bg-gray').siblings().removeClass('bg-gray');
                    $this.find('input[type=checkbox]').prop('checked', true);;
                    $siblings.find('input[type=checkbox]:checked').prop('checked', false);
                    if (options.checkbox) form.render('checkbox');

                    var index = parseInt($this.attr('data-index'));
                    var row = $list.data('data')[index];
                    options.onClickRow(index, row);
                });

                laypage({
                    cont: $(options.pageSelector),
                    pages: Math.ceil(data.total / 10),
                    curr: params.page,
                    skip: true,
                    jump: function(obj, first) {
                        if (!first) {
                            params.page = obj.curr;
                            load();
                        }
                    }
                });
            });
        }

        return {
            reload: load
        }
    }

    $$.loadSelect = function(selector, data, options) {
        options = $.extend({
            valueField: 'value',
            textField: 'text',
            rows: data
        }, options || {});
        var $select = $(selector);
        $select.children().slice(1).remove();
        $(selector).append(template.render(selectTpl, options));
    }

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

    $$.getChecked = function(selector) {
        return $(selector).find('tbody input[type=checkbox]:checked');
    }

    $$.getSelected = function(selector) {
        return $(selector).find('tbody tr.bg-gray');
    }

    $$.batchSubmit = function(selector, url, options) {
        options = $.extend({
            params: {},
            success: function() {
                if (window.pagination) window.pagination.reload();
            }
        }, options || {});

        params = options.params;

        var $checkbox = $$.getChecked(selector);
        if ($checkbox.length == 0) {
            $$.msg('请选择需要操作的记录');
            return;
        }

        var data = $(selector).data('data');
        var rows = [];

        $checkbox.each(function(index, item) {
            var i = parseInt($(item).val());
            if (options.keys) {
                rows.push($$.getKeys(data.rows[i], options.keys));
            } else {
                rows.push(data.rows[i]);
            }
        });

        params = $.extend(params, {
            rows: rows
        })

        $$.request(url, params, function(data) {
            $$.msg('操作成功', {
                icon: 1
            });
            if (options.success) options.success(data);
        });
    }

    $$.transformDisplay = function(selector, type) {
        var $target = $(selector);
        type = type || 'search';

        //显示/隐藏
        $target.find('.visible').show().filter('.invisible-' + type).hide();
        $target.find('.invisible').hide().filter('.visible-' + type).show();
    };

    $$.transformStatus = function(selector, status) {
        var $target = $(selector);
        status = status || 'view';

        //显示/隐藏
        $target.find('.visible').show().filter('.invisible-' + status).hide();
        $target.find('.invisible').hide().filter('.visible-' + status).show();

        $target.find('input[type!="button"],textarea,select').each(function(index, element) {
            if ($.inArray(status, ['create', 'update']) < 0) {
                readonly(index, element);
            } else {
                editable(index, element);
            }
        });

        $target.find('.readonly,.readonly-' + status).find('input[type!="button"],textarea,select').each(readonly);
        $target.find('.editable,.editable-' + status).find('input[type!="button"],textarea,select').each(editable);

        function readonly(index, element) {
            var $tmp = $(element);
            if (element.tagName == 'SELECT' || (element.tagName == 'INPUT' && element.type == 'checkbox')) {
                $tmp.attr('disabled', 'disabled');
            } else {
                $tmp.attr('readonly', 'readonly');
            }
        }

        function editable(index, element) {
            var $tmp = $(element);
            if (element.tagName == 'SELECT' || (element.tagName == 'INPUT' && element.type == 'checkbox')) {
                $tmp.removeAttr('disabled');
            } else {
                $tmp.removeAttr('readonly');
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


    $$.cropperImage = function($img, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        options = $.extend({
            aspectRatio: NaN,
            autoCropArea: 0.8
        }, options);

        var $parent = $img.parent();
        var $prev = $img.prev();
        var image = $img[0];
        var area = '500px';

        if ($img.width() > $img.height()) {
            area = '800px';
        }

        $container = $('<div class="img-container"></div>').appendTo('body');
        $container.append($img);

        var cropper = new Cropper(image, options);

        var index = layer.open({
            title: '图片裁剪',
            type: 1,
            area: area,
            offset: '0px',
            content: $container,
            btn: ['确认', '取消', '向左', '向右'],
            yes: function() {
                var imageData = cropper.getCroppedCanvas().toDataURL('image/jpeg');
                callback(imageData);
            },
            btn3: function(argument) {
                cropper.rotate(-90);
                return false;
            },
            btn4: function() {
                cropper.rotate(90);
                return false;
            },
            end: function() {
                if (cropper) {
                    if ($prev.length) {
                        $prev.after($img)
                    } else {
                        $parent.append($img);
                    }
                    cropper.destroy();
                }
            }
        });

        return index;
    }

    return $$;
})();
