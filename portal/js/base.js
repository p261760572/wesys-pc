window.basedir = '/p';

window.$$ = (function() {
    var $$ = {};

    $$.parseOptions = function function_name(target) {
        return $.parser.parseOptions(target);
    }

    //包裹url,解决根目录问题
    $$.wrapUrl = function(url) {
        return window.basedir ? window.basedir + url : url;
    };

    //获取错误代码
    $$.errcode = function(data) {
        return data.errcode;
    };

    //获取错误原因
    $$.errmsg = function(data) {
        return data.errmsg;
    };

    $$.preventDefault = function(event) {
        if (event) {
            event.preventDefault ? event.preventDefault() : (event.returnValue = false);
        }
    };

    //toastr
    $$.error = function(message, title, onclick) {
        toastr.options = {
            'positionClass': 'toast-top-center',
            onclick: onclick
        };
        toastr.error(message, title);
    };

    $$.info = function(message, title, onclick) {
        toastr.options = {
            'positionClass': 'toast-top-center',
            onclick: onclick
        };
        toastr.info(message, title);
    };

    $$.success = function(message, title, onclick) {
        toastr.options = {
            'positionClass': 'toast-top-center',
            onclick: onclick
        };
        toastr.success(message, title);
    };

    //确认
    $$.confirm = function(content, yes) {
        layer.confirm(content, {
            icon: 3,
            title: '提示'
        }, function(index) {
            layer.close(index);
            if (yes) yes();
        });
    };

    //提示
    $$.prompt = function(title, yes) {
        layer.prompt({
            title: title,
        }, function(value, index, elem) {
            layer.close(index);
            if (yes) yes(value);
        });
    };

    //解析查询字符串
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

    //组装url
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

    //关闭tab或layer
    $$.close = function() {
        if (window.top.closeTab) {
            window.top.closeTab(window.top.getTab());
        } else {
            var index = window.parent.layer.getFrameIndex(window.name);
            window.parent.layer.close(index);
        }
    }

    //打开页面
    $$.open = function(url, title) {
        if (window.top.addTab) {
            var id = url;
            url = 'pages/' + url;
            window.top.addTab(id, title, url);
        } else {
            var index = layer.open({
                type: 2,
                title: title,
                content: url,
                end: function() {
                    // if (window.reload) window.reload();
                }
            });
            layer.full(index);
        }
    }

    //解析当前页面查询字符串
    $$.parseQueryString = function() {
        var queryString = window.location.search.substr(1);
        return $$.parseQuery(queryString);
    };

    //请求
    $$.request = function(url, data, success, error, options) {
        var index;

        if (typeof error !== 'function') {
            options = error;
            error = function(data) {
                $$.error($$.errmsg(data));
            };
        }

        options = options || {};
        options = $.extend({
            async: true,
            loading: true //自定义
        }, options, {
            url: $$.wrapUrl(url),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: $.toJSON(data),
            success: function(data) {
                $.mask.hide();
                if ($$.errcode(data) == 0) {
                    success(data)
                } else {
                    error(data);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $.mask.hide();
                error({
                    errcode: -1,
                    errmsg: textStatus
                });
            }
        });

        if (options.loading) $.mask.show();
        return $.ajax(options);
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

    $$.serializeForm = function(target) {
        var $form = $(target);
        var data = $form.serializeObject();
        $form.each(function(i, element) {
            var opts = $$.parseOptions(element);
            if (opts.serialize) {
                opts.serialize.call(element, data);
            }
        });
        return data;
    };

    $$.reset = function(target) {
        var $form = $(target).closest('form');
        $form.form('disableValidation').form('reset');
    }

    $$.search = function(target) {
        var opts = $.parser.parseOptions(target);
        var f = $(target).closest('form');
        var url = opts.url || f.attr('action');
        var params = $$.serializeForm(f);

        if (opts.before && opts.before.call(target, params) == false) {
            return false;
        }

        if(f.form('enableValidation').form('validate') != true) {
            return false;
        }

        $.mask.show();
        $(opts.datagrid).datagrid('clearSelections').datagrid({
            url: $$.wrapUrl(url),
            pageNumber: 1,
            queryParams: params,
            onLoadSuccess: function(data) {
                $.mask.hide();
                if (opts.success) {
                    opts.success.call(target, data);
                }

                //解决滚动条引起的panel宽度问题
                $(opts.datagrid).datagrid('getPanel').panel('resize');
            },
            onLoadError: function() {
                $.mask.hide();
            }
        });
    }


    $$.export = function exportData(target) {
        var opts = $.parser.parseOptions(target);
        var f = $(target).closest('form');
        var url = opts.url;
        var params = $$.serializeForm(f);

        if (opts.before && opts.before.call(target, params) == false) {
            return false;
        }

        if(f.form('enableValidation').form('validate') != true) {
            return false;
        }

        $$.request(url, params, function(data) {
            // window.open($$.wrapUrl(data.url), '下载', 'status=yes,toolbar=no,menubar=yes,location=no,resizable=yes,scrollbars=yes');
            var iframe = $('<iframe src="' + $$.wrapUrl(data.url) + '" style="display:none;"></iframe>').appendTo('body');
            setTimeout(function() {
                iframe.remove();
            }, 1000);
        });
    }


    $$.view = function(selector, url, params) {
        var options = $.extend({}, $$.parseOptions(selector));

        return $$.request(url, params, function(data) {
            if (options.load) {
                options.load(data);
            }
            $$.loadData(selector, data.data);
            form.render();
        });
    };

    $$.submit = function(target) {
        var $form = $(target).closest('form');
        var options = $.extend({
            transform: true,
            before: $.noop,
            success: function() {
                $$.success('操作成功');
            }
        }, $$.parseOptions(target));

        var requestData = $$.serializeForm($form);

        if (options.before.call(target, requestData) == false) return false;

        if (form.validate($form) == false) return false;

        $$.request(options.url, requestData, function(data) {
            if (options.transform) {
                $$.transformStatus($form, true);
                form.render();
            }
            options.success(requestData, data);
        });
    };


    $$.goto = function(target) {
        var options = $.extend({}, $$.parseOptions(target));

        var url = $$.url(options.url, {
            // displayType: displayType
        });

        $$.open(url, options.title);
    };

    $$.do = function(target, index) {
        var options = $.extend({
            datagrid: '#list',
            keys: 'rec_id'
        }, $$.parseOptions(target));

        var row = $$.datagrid(options.datagrid, 'getRows')[index];
        var params = $$.getKeys(row, options.keys)
        if (window.displayType) params.displayType = displayType;

        var url = $$.url(options.url, params);

        $$.open(url, options.title);
    };

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


    $$.batchSubmit = function(target) {
        var options = $.extend({
            datagrid: '#list',
            type: 'default', //default confirm prompt
            promptKey: null,
            success: function() {
                if (window.reload) window.reload();
            }
        }, $$.parseOptions(target));

        var rows = $$.datagrid(options.datagrid, 'getChecked');
        if (rows.length == 0) {
            $$.info('请选择需要操作的记录');
            return;
        }

        var dgOptions = $$.datagrid(options.datagrid, 'options');

        if (dgOptions.idField) {
            var tmp = [];
            $.each(rows, function(index, value) {
                tmp.push($$.getKeys(value, dgOptions.idField));
            })
            rows = tmp;
        }

        var requestData = {
            rows: rows
        };

        var callback = {
            'default': request,
            'confirm': function() {
                $$.confirm(options.title, function() {
                    request();
                });
            },
            'prompt': function() {
                $$.prompt(options.title, function(value) {
                    requestData[options.promptKey] = value;
                    request();
                });
            }
        };

        callback[options.type]();

        function request() {
            $$.request(options.url, requestData, function(data) {
                $$.success('操作成功');
                options.success(requestData, data);
            });
        }
    }

    $$.transformDisplay = function(selector, type, isSubmit) {
        var $target = $(selector);

        type = type || 'search';

        //显示/隐藏
        var tag = isSubmit ? 'button' : '';
        // $target.find(tag + '.visible').show().filter('.invisible-' + type).hide();
        // $target.find(tag + '.invisible').hide().filter('.visible-' + type).show();

        $target.find(tag + '.visible').removeClass('hide').filter('.invisible-' + type).addClass('hide');
        $target.find(tag + '.invisible').addClass('hide').filter('.visible-' + type).removeClass('hide');
    };

    $$.transformStatus = function(selector, status, isSubmit) {
        var $target = $(selector);

        if (typeof status === 'boolean') {
            isSubmit = status;
            status = 'view';
        }

        status = status || 'view';

        //显示/隐藏
        $$.transformDisplay(selector, status, isSubmit);


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



$$.generateTreeData = function(rows, options) {
    var treeDataMap = {};
    var treeData = [];
    var i, row, p, node;

    for (i = 0; i < rows.length; i++) {
        row = rows[i];
        treeDataMap[row[options.id]] = generateTreeNode(row, options);
    }

    //组装树    
    for (i = 0; i < rows.length; i++) {
        row = rows[i];
        node = treeDataMap[row[options.id]];
        p = treeDataMap[row[options.pid]];
        if (!p) { //没有找到parent
            treeData.push(node);
        } else { //找到parent
            p.children = p.children || [];
            p.children.push(node);
        }
    }

    return treeData;

    function generateTreeNode(row, options) {
        var node = {
            id: row[options.id],
            text: row[options.text]
        };

        if (options.icon && row[options.icon]) {
            node.iconCls = row[options.icon];
        }

        var i, name;
        if (options.attributes) {
            for (i = 0; i < options.attributes.length; i++) {
                name = options.attributes[i];
                if (row[name]) {
                    node.attributes = node.attributes || {};
                    node.attributes[name] = row[name];
                }
            }
        }

        return node;
    }
}
