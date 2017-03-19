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
            $$.error($$.errmsg(data));
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
                console.log(arguments);
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

    return $$;
})();

window.$$ === undefined && (window.$$ = baseJs);

$$.info = function(msg, callback) {
    $.messager.alert('提示', msg, 'info', callback);
}

$$.error = function(msg, callback) {
    $.messager.alert('错误', msg, 'error', callback);
}

$$.confirm = function(msg, callback) {
    $.messager.confirm('确认', msg, callback);
}

$$.genEasyuiTreeData = function(rows, options) {
    var treeDataMap = {};
    var treeData = [];
    var i, row, p, node;

    for (i = 0; i < rows.length; i++) {
        row = rows[i];
        treeDataMap[row[options.id]] = genEasyuiTreeNode(row, options);
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

    function genEasyuiTreeNode(row, options) {
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
};

$$.serializeForm = function(target) {
    var data = $(target).serializeObject();
    $(target).each(function(i, element) {
        var opts = $.parser.parseOptions(element);
        if (opts.onSerialize) {
            opts.onSerialize.call(element, data);
        }
    });
    return data;
};

$$.search = function(target) {
    var opts = $.parser.parseOptions(target);
    var f = $(target).closest('form');
    var url = f.attr('action');
    var params = $$.serializeForm(f);

    //验证
    if (f.form('validate') != true) {
        return false;
    }

    //查询前处理
    if (opts.onBefore && opts.onBefore.call(target, params) == false) {
        return false;
    }

    $(target).linkbutton('disable');
    $(opts.datagrid).datagrid('clearSelections').datagrid({
        url: $$.wrapUrl(url),
        pageNumber: 1,
        queryParams: params,
        onLoadSuccess: function(data) {
            $(target).linkbutton('enable');

            if (opts.onSuccess) {
                opts.onSuccess.call(target, data);
            }
        },
        onLoadError: function() {
            $(target).linkbutton('enable');
        }
    });
};

$$.open = function(page, params, title) {
    if (typeof params != 'string') {
        params = $.toJSON(params);
    }
    var url = page + '?' + encodeURIComponent(params);
    window.open(url, title, 'status=yes,toolbar=no,menubar=yes,location=no,resizable=yes,scrollbars=yes');
};

$$.export = function(target) {
    var opts = $.parser.parseOptions(target);
    var f = $(target).closest('form');
    var url = opts.url;
    var params = $$.serializeForm(f);

    //验证
    if (f.form('validate') != true) {
        return false;
    }

    //查询前处理
    if (opts.onBefore && opts.onBefore.call(target, params) == false) {
        return false;
    }

    $(target).linkbutton('disable');
    $$.request(url, params, function(data) {
        $(target).linkbutton('enable');
        $$.open('download.html', data.url, '下载' + data.url);
    }, function function_name(data) {
        $(target).linkbutton('enable');
        $$.error($$.errmsg(data));
    });
};

$$.reset = function(target) {
    var opts = $.parser.parseOptions(target);
    var f = $(target).closest('form').form('clear');

    if (opts.onSuccess) {
        opts.onSuccess.call(target);
    }
};


$$.add = function(target, event) {
    var opts = $.parser.parseOptions(target);
    var fm = $(opts.form);

    if (opts.onBefore && opts.onBefore.call(target) == false) {
        $$.preventDefault(event);
        return false;
    }

    fm.form('disableValidation');
    $$.transformStatus(fm, 'create');

    if (fm.hasClass('form_loaded')) {
        $$.confirm('确认清空当前数据？', confirmCallback);
    } else {
        confirmCallback(true);
    }

    function confirmCallback(r) {
        if (r) {
            fm.form('clear').removeClass('form_loaded');
        }

        if (opts.onSuccess) {
            opts.onSuccess.call(target, r);
        }
    }
};

$$.loadForm = function(target, params, options) {
    options = options || {};
    var opts = $.parser.parseOptions($(target)[0], ['action']);
    var url = options.url || opts.action;
    var t = $(target).form('clear').removeClass('form_loaded');

    $$.request(url, params, function(data) {
        if (opts.onLoad) {
            opts.onLoad.call(target, data);
        }
        t.form('load', data.data).addClass('form_loaded');
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

$$.view = function(target, event, status) {
    //event参数支持
    if (typeof event != 'object') {
        status = event;
        event = undefined;
    }
    status = status || 'view';

    var opts = $.parser.parseOptions(target);
    var dgOpts = $(opts.datagrid).datagrid('options');
    var row = $(opts.datagrid).datagrid('getSelected');

    if (row) {
        if (!dgOpts.idField) {
            $$.info('没有记录ID！');
            $$.preventDefault(event);
            return false;
        }

        if (opts.onBefore && opts.onBefore.call(target, row) == false) {
            $$.preventDefault(event);
            return false;
        }

        var fm = $(opts.form).form('disableValidation');
        $$.transformStatus(fm, status);
        $$.loadForm(fm, $$.getKeys(row, dgOpts.idField), opts);

        if (opts.onSuccess) {
            opts.onSuccess.call(target, row);
        }
    } else {
        $$.info('请选择记录！');
        $$.preventDefault(event);
        return false;
    }
}

$$.viewNode = function(target, status) {
    status = status || 'view';

    var opts = $.parser.parseOptions(target);
    var treeOpts = $(opts.tree).tree('options');
    var node = $(opts.tree).tree('getSelected');
    if (node) {
        if (!treeOpts.idField) {
            $$.info('没有记录ID！');
            return false;
        }
        var requestData = {};
        requestData[treeOpts.idField] = node.id;

        if (opts.onBefore && opts.onBefore.call(target, requestData, node) == false) {
            return false;
        }

        var fm = $(opts.form).form('disableValidation');
        $$.transformStatus(fm, status);
        $$.loadForm(fm, requestData);
    } else {
        $$.info('请选择结点！');
        return false;
    }
}

$$.submitNode = function(target) {
    var opts = $.parser.parseOptions(target);
    var treeOpts = $(opts.tree).tree('options');
    var node = $(opts.tree).tree('getSelected');

    if (node) {
        if (!treeOpts.idField) {
            $$.info('没有记录ID！');
            return false;
        }
        var requestData = {};
        requestData[treeOpts.idField] = node.id;

        if (opts.onBefore && opts.onBefore.call(target, requestData, node) == false) {
            return false;
        }

        $$.confirm('确认要' + (opts.msg || '提交') + '选中的结点？', function(r) {
            if (r) {
                $$.request(opts.url, requestData, function(data) {
                    if (opts.onSuccess) {
                        opts.onSuccess.call(target, requestData, data);
                    }
                });
            }
        });

    } else {
        $$.info('请选择结点！');
        return false;
    }
}

$$.addSuccess = function(clear) {
    var opts = $.parser.parseOptions(this);
    var fm = $(opts.form);

    if (window.formDefaults) {
        fm.form('load', window.formDefaults);
    }
};

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

$$.back = function(target) {
    var opts = $.parser.parseOptions(target);
    $$.page.back();
    if (opts.onSuccess) {
        opts.onSuccess.call(target);
    }
};

$$.submit = function(target) {
    var opts = $.parser.parseOptions(target);

    var f = $(target).closest('form');
    var requestData = $$.serializeForm(f);

    if (opts.onBefore && opts.onBefore.call(target, requestData) == false) {
        return false;
    }

    if (f.form('enableValidation').form('validate') != true) {
        return false;
    }

    $(target).linkbutton('disable');
    $$.request(opts.url, requestData, function(data) {
        $(target).linkbutton('enable');

        // $$.transformStatus(f, 'view');

        if (opts.onSuccess) {
            opts.onSuccess.call(target, requestData, data);
        }
    }, function(data) {
        $(target).linkbutton('enable');
        $$.error($$.errmsg(data));
    });
};

$$.batchSubmit = function(target) {
    var opts = $.parser.parseOptions(target);
    var dgOpts = $(opts.datagrid).datagrid('options');
    var dg = $(opts.datagrid);
    var rows = dg.datagrid('getChecked');
    if (rows.length) {

        var keysRows = [];
        for (var i = 0; i < rows.length; i++) {
            keysRows.push($$.getKeys(rows[i], [dgOpts.idField]));
        }
        var requestData = { rows: keysRows };

        if (opts.onBefore && opts.onBefore.call(target, requestData) == false) {
            return false;
        }

        $$.confirm('确认要' + (opts.msg || '提交') + '选中的记录？', function(r) {
            if (r) {
                $$.request(opts.url, requestData, function(data) {
                    if (opts.onSuccess) {
                        opts.onSuccess.call(target, requestData, data);
                    }
                });
            }
        });
    } else {
        $$.info('请勾选记录！');
        return false;
    }
};

$$.submitSuccess = function(requestData, responseData) {
    var opts = $.parser.parseOptions(this);
    var dg = $(opts.datagrid);
    $$.info('操作成功', function() {
        $$.page.back();
        dg.datagrid('reload');
    });
};


$$.batchSubmitSuccess = function(requestData, responseData) {
    var opts = $.parser.parseOptions(this);
    var dg = $(opts.datagrid);
    $$.info('操作成功', function() {
        dg.datagrid('reload');
    });
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

$$.move = function(target) {
    var opts = $.parser.parseOptions(target);
    var row, index;
    while ((row = $(opts.from).datagrid('getSelected'))) {
        index = $(opts.from).datagrid('getRowIndex', row);
        $(opts.to).datagrid('appendRow', row);
        $(opts.from).datagrid('deleteRow', index);
    }
    if (opts.onSuccess) {
        opts.onSuccess.call(target);
    }
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


$$.selectRow = function(rowIndex, rowData) {
    var t = $(this);
    var opts = t.datagrid('options');
    var toolbar = $(opts.toolbar);

    var operIn = opts.operIn || 'oper_in';
    var procSt = opts.procSt || 'proc_st';
    var transition = opts.transition;

    toolbar.find('a.easyui-linkbutton[data-action]').each(function(i, element) {
        var action = $(element).attr('data-action');
        var result = true;
        if (action) {
            if (!$$.hasNextStatus(transition, rowData[operIn], rowData[procSt], action)) {
                result = false;
            }

            if (result) {
                $(element).linkbutton('enable').show();
            } else {
                $(element).linkbutton('disable').hide();
            }
        }
    });
};


$$.checkRow = function(rowIndex, rowData) {
    var t = $(this);
    var opts = t.datagrid('options');
    var toolbar = $(opts.toolbar);
    var rows = $(this).datagrid('getChecked');

    var operIn = opts.operIn || 'oper_in';
    var procSt = opts.procSt || 'proc_st';
    var transition = opts.transition;

    toolbar.find('a.easyui-linkbutton[data-actions]').each(function(i, element) {
        var action = $(element).attr('data-actions');
        var result = true;

        for (var i = 0; result && i < rows.length; i++) {
            var row = rows[i];
            if (!$$.hasNextStatus(transition, row[operIn], row[procSt], action)) {
                result = false;
            }
        }

        if (rows.length > 0 && result) {
            $(element).linkbutton('enable').show();
        } else {
            $(element).linkbutton('disable').hide();
        }
    });
};


if ($.fn.datagrid) {
    $.fn.datagrid.defaults.fitColumns = true;
    $.fn.datagrid.defaults.singleSelect = true;
    $.fn.datagrid.defaults.checkOnSelect = false;
    $.fn.datagrid.defaults.selectOnCheck = false;
    $.fn.datagrid.defaults.pageList = [10, 20, 50, 100, 200];
    $.fn.datagrid.defaults.rownumbers = true;
    $.fn.datagrid.defaults.pagination = true;

    $.fn.datagrid.defaults.onSelect = $$.selectRow;
    $.fn.datagrid.defaults.onCheck = $$.checkRow;
    $.fn.datagrid.defaults.onUncheck = $$.checkRow;
    $.fn.datagrid.defaults.onCheckAll = $$.checkRow;
    $.fn.datagrid.defaults.onUncheckAll = $$.checkRow;
    //onSelect:$$.selectRow,onCheck:$$.checkRow,onUncheck:$$.checkRow,onCheckAll:$$.checkRow,onUncheckAll:$$.checkRow
}

//扩展tree
if ($.fn.tree) {
    $.extend($.fn.tree.methods, {
        unselect: function(jq, target) {
            return jq.each(function() {
                $(target).removeClass('tree-node-selected');
            });
        }
    });
}

$(function() {
    //page
    $('body>.page').each(function() {
        $(this).data('page', {
            options: $.parser.parseOptions(this)
        });
    });

    $$.page = {
        currentPage: $('body>.page_active'),
        push: true, //默认
        history: [],
        show: function(id) {
            $$.page.currentPage.removeClass('page_active');
            if ($$.page.push) {
                $$.page.history.push($$.page.currentPage);
            }
            $$.page.currentPage = $('#' + id).addClass('page_active');
            $$.page.push = true; //重置

            var opts = $$.page.currentPage.data('page').options;
            if (opts.onOpen) {
                opts.onOpen();
            }
        },
        back: function() {
            $$.page.push = false; //back时不push
            var page = $$.page.history.splice($$.page.history.length - 1, 1)[0];
            location.hash = '#' + page.attr('id');
        }
    };

    $(window).on('hashchange', function() {
        var id = location.hash.slice(1);
        if (id) {
            $$.page.show(id);
        }
    });

    if (location.hash) {
        location.hash = '';
    }
});
