window.basedir = '/p';

window.$$ = (function() {
    var $$ = {};

    $$.parseOptions = function(target) {
        var $target = $(target);
        if ($target.length > 0) {
            return $.parser.parseOptions($(target)[0]);
        }

        if (window.console) console.warn(target);

        return {};
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
    $$.alert = function(title, msg, callback) {
        if (typeof msg == 'function') {
            callback = msg;
            msg = title;
            title = '提示';
        }
        $.messager.alert(title, msg, 'info', callback);
    }

    //确认
    $$.confirm = function(title, msg, callback) {
        if (typeof msg != 'string') {
            callback = msg;
            msg = title;
            title = '确认对话框';
        }

        function fn(r) {
            if (r) {
                if (callback) callback();
            }
        }
        $.messager.confirm(title, msg, fn);
    }

    //提示
    $$.prompt = function(title, msg, callback) {
        if (typeof msg != 'string') {
            callback = msg;
            msg = title;
            title = '提示信息';
        }
        $.messager.prompt(title, msg, callback);
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

    //关闭tab
    $$.close = function() {
        if (window.top.closeTab) {
            window.top.closeTab();
        }
    }

    //打开tab
    $$.open = function(url, title) {
        if (window.top.addTab) {
            url = 'pages/' + url;
            window.top.addTab(title, url, true);
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
            error = function(result) {
                $$.error($$.errmsg(result));
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
            success: function(result) {
                if (options.loading) $.mask.hide();
                if ($$.errcode(result) == 0) {
                    success(result)
                } else {
                    error(result);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if (options.loading) $.mask.hide();
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
        var $disabled = $form.find('[disabled]').removeAttr('disabled');
        var data = $form.serializeObject();
        $form.each(function(i, element) {
            var opts = $$.parseOptions(element);
            if (opts.serialize) {
                opts.serialize.call(element, data);
            }
        });
        $disabled.attr('disabled', 'disabled');
        return data;
    };


    $$.validateForm = function(target) {
        var $form = $(target);
        $form.form('enableValidation').find('.validatebox-text:hidden').validatebox('disableValidation');
        return $form.form('validate');
    }

    $$.reset = function(target) {
        var $form = $(target).closest('form');
        $form.form('disableValidation').form('reset');
    }

    $$.search = function(target) {
        var opts = $$.parseOptions(target);
        var f = $(target).closest('form');
        var url = opts.url || f.attr('action');
        var params = $$.serializeForm(f);

        if (opts.before && opts.before.call(target, params) == false) {
            return false;
        }

        if ($$.validateForm(f) != true) {
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

                $(opts.datagrid).datagrid('clearChecked');
                //解决滚动条引起的panel宽度问题
                $(opts.datagrid).datagrid('getPanel').panel('resize');
            },
            onLoadError: function() {
                $.mask.hide();
            }
        });
    }


    $$.exportData = function(target) {
        var opts = $$.parseOptions(target);
        var f = $(target).closest('form');
        var url = opts.url;
        var params = $$.serializeForm(f);

        if (opts.before && opts.before.call(target, params) == false) {
            return false;
        }

        if ($$.validateForm(f) != true) {
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

    $$.view = function(target, url, title) {
        var opts = $$.parseOptions(target);
        var $dg = $(target).closest('.datagrid-toolbar').next('.datagrid-view').children('.datagrid-f');
        var dgOpts = $dg.datagrid('options');
        var row = $dg.datagrid('getSelected');
        if (row) {
            if (!dgOpts.idField) {
                $$.info('没有记录ID！');
                return false;
            }

            var params = {};

            if (opts.before && opts.before.call(target, row, params) == false) {
                return false;
            }

            params[dgOpts.idField] = row[dgOpts.idField];

            $$.open($$.url(url, params), title);
        } else {
            $$.info('请选择记录！');
            return false;
        }
    }


    // $$.view = function(selector, url, params) {
    //     var options = $.extend({}, $$.parseOptions(selector));

    //     return $$.request(url, params, function(data) {
    //         if (options.load) {
    //             options.load(data);
    //         }
    //         $$.loadData(selector, data.data);
    //         form.render();
    //     });
    // };

    $$.submit = function(target) {
        var $form = $(target).closest('form');
        var options = $.extend({
            before: $.noop,
            success: function() {
                $$.transform($form, 'view');
                $$.success('操作成功');
            }
        }, $$.parseOptions(target));

        var data = $$.serializeForm($form);

        if (options.before.call(target, data) == false) return false;

        if ($$.validateForm($form) != true) return false;

        $$.request(options.url, data, function(result) {
            options.success.call(target, data, result);
        });
    };


    // $$.goto = function(target) {
    //     var options = $.extend({}, $$.parseOptions(target));

    //     var url = $$.url(options.url, {
    //         // displayType: displayType
    //     });

    //     $$.open(url, options.title);
    // };

    // $$.do = function(target, index) {
    //     var options = $.extend({
    //         datagrid: '#list',
    //         keys: 'rec_id'
    //     }, $$.parseOptions(target));

    //     var row = $$.datagrid(options.datagrid, 'getRows')[index];
    //     var params = $$.getKeys(row, options.keys)
    //     if (window.displayType) params.displayType = displayType;

    //     var url = $$.url(options.url, params);

    //     $$.open(url, options.title);
    // };

    $$.loadSelect = function(selector, rows, options) {
        options = $.extend({
            valueField: 'value',
            textField: 'text'
        }, $$.parseOptions(selector), options || {});
        var $select = $(selector);
        $select.children().slice(1).remove();

        if (rows) {
            var html = [],
                row;
            for (var i = 0; i < rows.length; i++) {
                row = rows[i]
                html.push('<option value="' + row[options['valueField']] + '">' + row[options['textField']] + '</option>')
            }
            $(selector).append(html);
        }
    }

    $$.loadData = function(selector, url, params) {
        var options = $$.parseOptions(selector);

        return $$.request(url, params, function(data) {
            if (options.load) {
                options.load(data);
            }
            $(selector).form('load', data.data);
        });
    };

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

    //批量提交
    $$.batchSubmit = function(target) {
        var $dg = $(target).closest('.datagrid-toolbar').next('.datagrid-view').children('.datagrid-f');
        var dgOpts = $dg.datagrid('options');
        var rows = $dg.datagrid('getChecked');

        var opts = $.extend({
            before: function(data, callback) {
                $$.confirm('确认要' + opts.msg + '勾选的记录？', function() {
                    callback();
                });
            },
            success: function() {
                $$.success('操作成功');
                $dg.datagrid('reload');
            }
        }, $$.parseOptions(target));

        if (rows.length) {
            var keyRows = [];
            for (var i = 0; i < rows.length; i++) {
                keyRows.push($$.getKeys(rows[i], dgOpts.idField));
            }

            var data = {
                rows: keyRows
            };

            var callback = function() {
                $$.request(opts.url, data, function(result) {
                    opts.success.call(target, data, result);
                });
            };

            opts.before.call(target, data, callback);
        } else {
            $$.info('请勾选记录！');
            return false;
        }
    }


    // $$.batchSubmit = function(target) {
    //     var options = $.extend({
    //         datagrid: '#list',
    //         type: 'default', //default confirm prompt
    //         promptKey: null,
    //         success: function() {
    //             if (window.reload) window.reload();
    //         }
    //     }, $$.parseOptions(target));

    //     var rows = $$.datagrid(options.datagrid, 'getChecked');
    //     if (rows.length == 0) {
    //         $$.info('请选择需要操作的记录');
    //         return;
    //     }

    //     var dgOptions = $$.datagrid(options.datagrid, 'options');

    //     if (dgOptions.idField) {
    //         var tmp = [];
    //         $.each(rows, function(index, value) {
    //             tmp.push($$.getKeys(value, dgOptions.idField));
    //         })
    //         rows = tmp;
    //     }

    //     var requestData = {
    //         rows: rows
    //     };

    //     var callback = {
    //         'default': request,
    //         'confirm': function() {
    //             $$.confirm(options.title, function() {
    //                 request();
    //             });
    //         },
    //         'prompt': function() {
    //             $$.prompt(options.title, function(value) {
    //                 requestData[options.promptKey] = value;
    //                 request();
    //             });
    //         }
    //     };

    //     callback[options.type]();

    //     function request() {
    //         $$.request(options.url, requestData, function(data) {
    //             $$.success('操作成功');
    //             options.success(requestData, data);
    //         });
    //     }
    // }

    //界面显示转换
    $$.transformDisplay = function(selector, display) {
        var $target = $(selector);
        $target.find('.tf').addClass('hide').filter('.tfd-' + display).removeClass('hide');
    };

    //表单状态转换
    $$.transform = function(selector, action, config) {
        var $target = $(selector);
        if (action == 'view') {
            $target.find('.tf').removeClass('hide').find('input,textarea,select').each(readonly);
            $target.find('button.tf').addClass('hide');
        } else {
            $target.find('.tf').addClass('hide');

            var dependencies = config[action];
            if (dependencies) {
                for (var i = 0; i < dependencies.length; i++) {
                    var daction = dependencies[i];
                    $target.find('.tf-' + daction + ':not(button,.tf-'+ action +')').removeClass('hide').find('input,textarea,select').each(readonly);
                }
            }

            $target.find('.tf-' + action).removeClass('hide');
        }


        // var $target = $(selector);

        // if (typeof status === 'boolean') {
        //     isSubmit = status;
        //     status = 'view';
        // }

        // status = status || 'view';

        // //显示/隐藏
        // $$.transformDisplay(selector, status, isSubmit);


        // $target.find('input[type!="button"],textarea,select').each(function(index, element) {
        //     if ($.inArray(status, ['view', 'check1', 'check2']) >= 0) {
        //         readonly(index, element);
        //     } else {
        //         editable(index, element);
        //     }
        // });

        // $target.find('.tf-ro,.tf-ro-' + status).find('input[type!="button"],textarea,select').each(readonly);
        // $target.find('.tf-e,.tf-e-' + status).find('input[type!="button"],textarea,select').each(editable);

        function readonly(index, element) {
            var $tmp = $(element);

            if ($tmp.hasClass('textbox-f')) {
                $tmp.textbox('textbox').css('background-color', '#ebebe4');
            }

            if ($tmp.hasClass('combobox-f')) {
                $tmp.combobox('readonly');
            } else if ($tmp.hasClass('combotree-f')) {
                $tmp.combotree('readonly');
            } else if (element.tagName == 'SELECT' || (element.tagName == 'INPUT' && $.inArray(element.type, ['checkbox', 'file']) >= 0) || $tmp.hasClass('Wdate')) {
                $tmp.attr('disabled', 'disabled');
            } else {
                $tmp.attr('readonly', 'readonly');
            }
        }

        // function editable(index, element) {
        //     var $tmp = $(element);
        //     if($tmp.hasClass('combobox-f')) {
        //         $tmp.combobox('readonly', false);
        //     } else if(element.tagName == 'SELECT' || (element.tagName == 'INPUT' && element.type == 'checkbox')) {
        //         $tmp.removeAttr('disabled');
        //     } else {
        //         $tmp.removeAttr('readonly');
        //     }
        // }
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
