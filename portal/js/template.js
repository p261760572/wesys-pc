/*!
 * template
 */
(function($) {
    var template = function(id, data) {
        var elem = document.getElementById(id);
        var source, render;

        if (template.cache[id]) {
            render = template.cache[id];
        } else {
            source = (elem.value || elem.innerHTML);
            render = compiler(source);
        }

        return render(data);
    };

    template.cache = {};

    template.render = function(source, data) {
        var render = compiler(source);

        return render(data);
    }

    var isArray = Array.isArray || function(obj) {
        return ({}).toString.call(obj) === '[object Array]';
    };

    function toString(value) {

        if (typeof value !== 'string') {

            var type = typeof value;
            if (type === 'number') {
                value += '';
            } else if (type === 'function') {
                value = toString(value.call(value));
            } else {
                value = '';
            }
        }

        return value;
    };

    var escapeMap = {
        '<': '&#60;',
        '>': '&#62;',
        '"': '&#34;',
        "'": '&#39;',
        '&': '&#38;'
    };

    var escapeFn = function(s) {
        return escapeMap[s];
    };

    var escapeHTML = function(content) {
        return toString(content)
            .replace(/&(?![\w#]+;)|[<>"']/g, escapeFn);
    };

    function each(data, callback) {
        var i, len;
        if (isArray(data)) {
            for (i = 0, len = data.length; i < len; i++) {
                callback.call(data, data[i], i);
            }
        } else {
            for (i in data) {
                callback.call(data, data[i], i);
            }
        }
    };

    var utils = {
        $helpers: {},
        $include: template,
        $string: toString,
        $escape: escapeHTML,
        $each: each
    };

    var helpers = utils.$helpers;
    template.helper = function(name, helper) {
        helpers[name] = helper;
    };

    template.debug = true;

    // 静态分析模板变量
    var KEYWORDS =
        // 关键字
        'break,case,catch,continue,debugger,default,delete,do,else,false' +
        ',finally,for,function,if,in,instanceof,new,null,return,switch,this' +
        ',throw,true,try,typeof,var,void,while,with'

    // 保留字
    +',abstract,boolean,byte,char,class,const,double,enum,export,extends' +
    ',final,float,goto,implements,import,int,interface,long,native' +
    ',package,private,protected,public,short,static,super,synchronized' +
    ',throws,transient,volatile'

    // ECMA 5 - use strict
    +
    ',arguments,let,yield'

    +
    ',undefined';

    //注释,字符串,属性访问
    var REMOVE_RE = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g;
    //非法变量名
    var SPLIT_RE = /[^\w$]+/g;
    //关键字 \b Matches a word boundary
    var KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g');
    //数字
    var NUMBER_RE = /^\d[^,]*|,\d[^,]*/g;
    //两端逗号
    var BOUNDARY_RE = /^,+|,+$/g;
    //空行,逗号
    var SPLIT2_RE = /^$|,+/;

    // 获取变量
    function getVariable(code) {
        return code
            .replace(REMOVE_RE, '')
            .replace(SPLIT_RE, ',')
            .replace(KEYWORDS_RE, '')
            .replace(NUMBER_RE, '')
            .replace(BOUNDARY_RE, '')
            .split(SPLIT2_RE);
    };

    // 字符串转义
    function stringify(code) {
        return "'" + code
            // 单引号与反斜杠转义
            .replace(/('|\\)/g, '\\$1')
            // 换行符转义
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n') + "'";
    }

    function compiler(source) {
        var uniq = {
            $data: true,
            $utils: true,
            $helpers: true,
            $out: true,
            $line: true
        };

        var include = "function(id, data) {data = data || $data; var text = $utils.$include(id, data); $out.push(text); }";

        var headerCode = "var $utils=this,$helpers=$utils.$helpers,";
        var mainCode = "$out=[];"
        var footerCode = "return new String($out.join(''));"

        each(source.split('{{'), function(code) {
            code = code.split('}}');

            if (code.length === 1) {
                // code: [html]
                mainCode += html(code[0]);
            } else {
                // code: [logic, html]
                mainCode += logic(code[0]);
                if (code[1]) {
                    mainCode += html(code[1]);
                }
            }
        });

        var code = headerCode + mainCode + footerCode;

        if (template.debug && console) console.log(code);
        var Render = new Function("$data", code);
        Render.prototype = utils;

        return function(data) {
            //set this=utils
            return new Render(data) + '';
        };

        function html(code) {
            return "$out.push(" + stringify(code) + ");";
        }

        function logic(code) {
            code = parser(code);

            // 输出语句. 编码: <%=value%> 不编码:<%=#value%>
            if (code.indexOf('=') === 0) {

                var escape = !/^=#/.test(code);

                // 清理代码两端
                code = code.replace(/^=[#]?|[\s;]*$/g, '');

                // 对内容编码
                if (escape) {
                    var name = code.replace(/\s*\([^\)]+\)/, '');

                    // 排除 utils.* | include
                    if (!utils[name] && !/^include$/.test(name)) {
                        code = "$escape(" + code + ")";
                    }

                    // 不编码
                } else {
                    code = "$string(" + code + ")";
                }

                code = "$out.push(" + code + ");"
            }

            each(getVariable(code), function(name) {
                // name 值可能为空
                if (!name || uniq[name]) {
                    return;
                }

                // 声明模板变量
                // 赋值优先级:
                // include > utils > helpers > data
                var value;
                if (name === 'include') {
                    value = include;
                } else if (utils[name]) {
                    value = "$utils." + name;
                } else if (helpers[name]) {
                    value = "$helpers." + name;
                } else {
                    value = "$data." + name;
                }

                headerCode += name + "=" + value + ",";
                uniq[name] = true;
            });

            return code;
        }

        function filtered(js, filter) {
            var parts = filter.split(':');
            var name = parts.shift();
            var args = parts.join(':') || '';

            if (args) {
                args = ', ' + args;
            }

            return '$helpers.' + name + '(' + js + args + ')';
        }

        // 语法解析器
        function parser(code) {

            code = code.replace(/^\s/, '');

            var split = code.split(' ');
            var key = split.shift();
            var args = split.join(' ');

            switch (key) {
                case 'if':
                    code = 'if(' + args + '){';
                    break;

                case 'else':
                    if (split.shift() === 'if') {
                        split = ' if(' + split.join(' ') + ')';
                    } else {
                        split = '';
                    }

                    code = '}else' + split + '{';
                    break;

                case '/if':
                    code = '}';
                    break;

                case 'each':
                    var object = split[0] || '$data';
                    var as = split[1] || 'as';
                    var value = split[2] || '$value';
                    var index = split[3] || '$index';

                    var param = value + ',' + index;

                    if (as !== 'as') {
                        object = '[]';
                    }

                    code = '$each(' + object + ',function(' + param + '){';
                    break;

                case '/each':
                    code = '});';
                    break;

                case 'include':
                    code = key + '(' + split.join(',') + ');';
                    break;

                default:
                    // 过滤器（辅助方法）
                    // {{value | filterA:'abcd' | filterB}}
                    // >>> $helpers.filterB($helpers.filterA(value, 'abcd'))
                    // TODO: {{ddd||aaa}} 不包含空格
                    if (/^\s*\|\s*[\w\$]/.test(args)) {

                        var escape = true;

                        // {{#value | link}}
                        if (code.indexOf('#') === 0) {
                            code = code.substr(1);
                            escape = false;
                        }

                        var i = 0;
                        var array = code.split('|');
                        var len = array.length;
                        var val = array[i++];

                        for (; i < len; i++) {
                            val = filtered(val, array[i]);
                        }

                        code = (escape ? '=' : '=#') + val;

                        // 内容直接输出 {{value}}
                    } else {
                        code = '=' + code;
                    }

                    break;
            }

            return code;
        };
    }

    $.template = template;
})(window);
