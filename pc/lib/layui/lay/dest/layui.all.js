/** layui-v1.0.10 MIT License By http://www.layui.com */
 ;/*!

 @Title: Layui
 @Description：经典模块化前端框架
 @Site: www.layui.com
 @Author: 贤心
 @License：MIT

 */
 
;!function(win){
  
"use strict";

var Lay = function(){
  this.v = '1.0.9_rls'; //版本号
};

Lay.fn = Lay.prototype;

var doc = document, config = Lay.fn.cache = {},

//获取layui所在目录
getPath = function(){
  var js = doc.scripts, jsPath = js[js.length - 1].src;
  return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
}(),

//异常提示
error = function(msg){
  win.console && console.error && console.error('Layui hint: ' + msg);
},

isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]',

//内置模块
modules = {
  layer: 'modules/layer' //弹层
  ,laydate: 'modules/laydate' //日期
  ,laypage: 'modules/laypage' //分页
  ,laytpl: 'modules/laytpl' //模板引擎
  ,layim: 'modules/layim' //web通讯
  ,layedit: 'modules/layedit' //富文本编辑器
  ,form: 'modules/form' //表单集
  ,upload: 'modules/upload' //上传
  ,tree: 'modules/tree' //树结构
  ,table: 'modules/table' //富表格
  ,element: 'modules/element' //常用元素操作
  ,util: 'modules/util' //工具块
  ,flow: 'modules/flow' //流加载
  ,carousel: 'modules/carousel' //轮播
  ,code: 'modules/code' //代码修饰器
  ,jquery: 'modules/jquery' //DOM库（第三方）
  
  ,mobile: 'modules/mobile' //移动大模块 | 若当前为开发目录，则为移动模块入口，否则为移动模块集合
  ,'layui.all': 'dest/layui.all' //PC模块合并版
};

config.modules = {}; //记录模块物理路径
config.status = {}; //记录模块加载状态
config.timeout = 10; //符合规范的模块请求最长等待秒数
config.event = {}; //记录模块自定义事件

//定义模块
Lay.fn.define = function(deps, callback){
  var that = this
  ,type = typeof deps === 'function'
  ,mods = function(){
    typeof callback === 'function' && callback(function(app, exports){
      layui[app] = exports;
      config.status[app] = true;
    });
    return this;
  };
  
  type && (
    callback = deps,
    deps = []
  );
  
  if(layui['layui.all'] || (!layui['layui.all'] && layui['layui.mobile'])){
    return mods.call(that);
  }
  
  that.use(deps, mods);
  return that;
};

//使用特定模块
Lay.fn.use = function(apps, callback, exports){
  var that = this, dir = config.dir = config.dir ? config.dir : getPath;
  var head = doc.getElementsByTagName('head')[0];

  apps = typeof apps === 'string' ? [apps] : apps;
  
  //如果页面已经存在jQuery1.7+库且所定义的模块依赖jQuery，则不加载内部jquery模块
  if(window.jQuery && jQuery.fn.on){
    that.each(apps, function(index, item){
      if(item === 'jquery'){
        apps.splice(index, 1);
      }
    });
    layui.jquery = jQuery;
  }
  
  var item = apps[0], timeout = 0;
  exports = exports || [];

  //静态资源host
  config.host = config.host || (dir.match(/\/\/([\s\S]+?)\//)||['//'+ location.host +'/'])[0];
  
  if(apps.length === 0 
  || (layui['layui.all'] && modules[item]) 
  || (!layui['layui.all'] && layui['layui.mobile'] && modules[item])
  ){
    return onCallback(), that;
  }

  //加载完毕
  function onScriptLoad(e, url){
    var readyRegExp = navigator.platform === 'PLaySTATION 3' ? /^complete$/ : /^(complete|loaded)$/
    if (e.type === 'load' || (readyRegExp.test((e.currentTarget || e.srcElement).readyState))) {
      config.modules[item] = url;
      head.removeChild(node);
      (function poll() {
        if(++timeout > config.timeout * 1000 / 4){
          return error(item + ' is not a valid module');
        };
        config.status[item] ? onCallback() : setTimeout(poll, 4);
      }());
    }
  }

  //加载模块
  var node = doc.createElement('script'), url =  (
    modules[item] ? (dir + 'lay/') : (config.base || '')
  ) + (that.modules[item] || item) + '.js';
  node.async = true;
  node.charset = 'utf-8';
  node.src = url + function(){
    var version = config.version === true 
    ? (config.v || (new Date()).getTime())
    : (config.version||'');
    return version ? ('?v=' + version) : '';
  }();
  
  //首次加载
  if(!config.modules[item]){
    head.appendChild(node);
    if(node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) && !isOpera){
      node.attachEvent('onreadystatechange', function(e){
        onScriptLoad(e, url);
      });
    } else {
      node.addEventListener('load', function(e){
        onScriptLoad(e, url);
      }, false);
    }
  } else {
    (function poll() {
      if(++timeout > config.timeout * 1000 / 4){
        return error(item + ' is not a valid module');
      };
      (typeof config.modules[item] === 'string' && config.status[item]) 
      ? onCallback() 
      : setTimeout(poll, 4);
    }());
  }
  
  config.modules[item] = url;
  
  //回调
  function onCallback(){
    exports.push(layui[item]);
    apps.length > 1 ?
      that.use(apps.slice(1), callback, exports)
    : ( typeof callback === 'function' && callback.apply(layui, exports) );
  }

  return that;

};

//获取节点的style属性值
Lay.fn.getStyle = function(node, name){
  var style = node.currentStyle ? node.currentStyle : win.getComputedStyle(node, null);
  return style[style.getPropertyValue ? 'getPropertyValue' : 'getAttribute'](name);
};

//css外部加载器
Lay.fn.link = function(href, fn, cssname){
  var that = this, link = doc.createElement('link');
  var head = doc.getElementsByTagName('head')[0];
  if(typeof fn === 'string') cssname = fn;
  var app = (cssname || href).replace(/\.|\//g, '');
  var id = link.id = 'layuicss-'+app, timeout = 0;
  
  link.rel = 'stylesheet';
  link.href = href + (config.debug ? '?v='+new Date().getTime() : '');
  link.media = 'all';
  
  if(!doc.getElementById(id)){
    head.appendChild(link);
  }

  if(typeof fn !== 'function') return ;
  
  //轮询css是否加载完毕
  (function poll() {
    if(++timeout > config.timeout * 1000 / 100){
      return error(href + ' timeout');
    };
    parseInt(that.getStyle(doc.getElementById(id), 'width')) === 1989 ? function(){
      fn();
    }() : setTimeout(poll, 100);
  }());
};

//css内部加载器
Lay.fn.addcss = function(firename, fn, cssname){
  layui.link(config.dir + 'css/' + firename, fn, cssname);
};

//图片预加载
Lay.fn.img = function(url, callback, error) {   
  var img = new Image();
  img.src = url; 
  if(img.complete){
    return callback(img);
  }
  img.onload = function(){
    img.onload = null;
    callback(img);
  };
  img.onerror = function(e){
    img.onerror = null;
    error(e);
  };  
};

//全局配置
Lay.fn.config = function(options){
  options = options || {};
  for(var key in options){
    config[key] = options[key];
  }
  return this;
};

//记录全部模块
Lay.fn.modules = function(){
  var clone = {};
  for(var o in modules){
    clone[o] = modules[o];
  }
  return clone;
}();

//拓展模块
Lay.fn.extend = function(options){
  var that = this;

  //验证模块是否被占用
  options = options || {};
  for(var o in options){
    if(that[o] || that.modules[o]){
      error('\u6A21\u5757\u540D '+ o +' \u5DF2\u88AB\u5360\u7528');
    } else {
      that.modules[o] = options[o];
    }
  }
  
  return that;
};

//路由
Lay.fn.router = function(hash){
  var hashs = (hash || location.hash).replace(/^#/, '').split('/') || [];
  var item, param = {
    dir: []
  };
  for(var i = 0; i < hashs.length; i++){
    item = hashs[i].split('=');
    /^\w+=/.test(hashs[i]) ? function(){
      if(item[0] !== 'dir'){
        param[item[0]] = item[1];
      }
    }() : param.dir.push(hashs[i]);
    item = null;
  }
  return param;
};

//本地存储
Lay.fn.data = function(table, settings){
  table = table || 'layui';
  
  if(!win.JSON || !win.JSON.parse) return;
  
  //如果settings为null，则删除表
  if(settings === null){
    return delete localStorage[table];
  }
  
  settings = typeof settings === 'object' 
    ? settings 
  : {key: settings};
  
  try{
    var data = JSON.parse(localStorage[table]);
  } catch(e){
    var data = {};
  }
  
  if(settings.value) data[settings.key] = settings.value;
  if(settings.remove) delete data[settings.key];
  localStorage[table] = JSON.stringify(data);
  
  return settings.key ? data[settings.key] : data;
};

//设备信息
Lay.fn.device = function(key){
  var agent = navigator.userAgent.toLowerCase();

  //获取版本号
  var getVersion = function(label){
    var exp = new RegExp(label + '/([^\\s\\_\\-]+)');
    label = (agent.match(exp)||[])[1];
    return label || false;
  };

  var result = {
    os: function(){ //底层操作系统
      if(/windows/.test(agent)){
        return 'windows';
      } else if(/linux/.test(agent)){
        return 'linux';
      } else if(/mac/.test(agent)){
        return 'mac';
      } else if(/iphone|ipod|ipad|ios/.test(agent)){
        return 'ios';
      }
    }()
    ,ie: function(){ //ie版本
      return (!!win.ActiveXObject || "ActiveXObject" in win) ? (
        (agent.match(/msie\s(\d+)/) || [])[1] || '11' //由于ie11并没有msie的标识
      ) : false;
    }()
    ,weixin: getVersion('micromessenger')  //是否微信
  };
  
  //任意的key
  if(key && !result[key]){
    result[key] = getVersion(key);
  }
  
  //移动设备
  result.android = /android/.test(agent);
  result.ios = result.os === 'ios';
  
  return result;
};

//提示
Lay.fn.hint = function(){
  return {
    error: error
  }
};

//遍历
Lay.fn.each = function(obj, fn){
  var that = this, key;
  if(typeof fn !== 'function') return that;
  obj = obj || [];
  if(obj.constructor === Object){
    for(key in obj){
      if(fn.call(obj[key], key, obj[key])) break;
    }
  } else {
    for(key = 0; key < obj.length; key++){
      if(fn.call(obj[key], key, obj[key])) break;
    }
  }
  return that;
};

//阻止事件冒泡
Lay.fn.stope = function(e){
  e = e || win.event;
  e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
};

//自定义模块事件
Lay.fn.onevent = function(modName, events, callback){
  if(typeof modName !== 'string' 
  || typeof callback !== 'function') return this;
  config.event[modName + '.' + events] = [callback];
  
  //不再对多次事件监听做支持
  /*
  config.event[modName + '.' + events] 
    ? config.event[modName + '.' + events].push(callback) 
  : config.event[modName + '.' + events] = [callback];
  */
  
  return this;
};

//执行自定义模块事件
Lay.fn.event = function(modName, events, params){
  var that = this, result = null, filter = events.match(/\(.*\)$/)||[]; //提取事件过滤器
  var set = (events = modName + '.'+ events).replace(filter, ''); //获取事件本体名
  var callback = function(_, item){
    var res = item && item.call(that, params);
    res === false && result === null && (result = false);
  };
  layui.each(config.event[set], callback);
  filter[0] && layui.each(config.event[events], callback); //执行过滤器中的事件
  return result;
};

win.layui = new Lay();

}(window);

/**

 @Name：用于打包PC完整版，即包含layui.js和所有模块的完整合并（该文件不会存在于构建后的目录）
 @Author：贤心
 @License：LGPL
    
 */
 
layui.define(function(exports){
  var cache = layui.cache;
  layui.config({
    dir: cache.dir.replace(/lay\/dest\/$/, '')
  });
  exports('layui.all', layui.v);
});
/**
 
 @Name : layui.laypage 分页组件
 @Author：贤心
 @License：MIT
 
 */

layui.define(function(exports){
  "use strict";

  function laypage(options){
    var skin = 'laypagecss';
    new Page(options);
  }

  var doc = document, id = 'getElementById', tag = 'getElementsByTagName';
  var index = 0, Page = function(options){
    var that = this;
    var conf = that.config = options || {};
    conf.item = index++;
    that.render(true);
  };

  Page.on = function(elem, even, fn){
    elem.attachEvent ? elem.attachEvent('on'+ even, function(){
      fn.call(elem, window.even); //for ie, this指向为当前dom元素
    }) : elem.addEventListener(even, fn, false);
    return Page;
  };

  //判断传入的容器类型
  Page.prototype.type = function(){
    var conf = this.config;
    if(typeof conf.cont === 'object'){
      return conf.cont.length === undefined ? 2 : 3;
    }
  };

  //分页视图
  Page.prototype.view = function(){
    var that = this, conf = that.config, view = [], dict = {};
    conf.pages = conf.pages|0;
    conf.curr = (conf.curr|0) || 1;
    conf.groups = 'groups' in conf ? (conf.groups|0) : 5;
    conf.first = 'first' in conf ? conf.first : '&#x9996;&#x9875;';
    conf.last = 'last' in conf ? conf.last : '&#x672B;&#x9875;';
    conf.prev = 'prev' in conf ? conf.prev : '&#x4E0A;&#x4E00;&#x9875;';
    conf.next = 'next' in conf ? conf.next : '&#x4E0B;&#x4E00;&#x9875;';
    
    if(conf.pages <= 1){
      return '';
    }
    
    if(conf.groups > conf.pages){
      conf.groups = conf.pages;
    }
    
    //计算当前组
    dict.index = Math.ceil((conf.curr + ((conf.groups > 1 && conf.groups !== conf.pages) ? 1 : 0))/(conf.groups === 0 ? 1 : conf.groups));
    
    //当前页非首页，则输出上一页
    if(conf.curr > 1 && conf.prev){
      view.push('<a href="javascript:;" class="layui-laypage-prev" data-page="'+ (conf.curr - 1) +'">'+ conf.prev +'</a>');
    }
    
    //当前组非首组，则输出首页
    if(dict.index > 1 && conf.first && conf.groups !== 0){
      view.push('<a href="javascript:;" class="laypage_first" data-page="1"  title="&#x9996;&#x9875;">'+ conf.first +'</a><span>&#x2026;</span>');
    }
    
    //输出当前页组
    dict.poor = Math.floor((conf.groups-1)/2);
    dict.start = dict.index > 1 ? conf.curr - dict.poor : 1;
    dict.end = dict.index > 1 ? (function(){
      var max = conf.curr + (conf.groups - dict.poor - 1);
      return max > conf.pages ? conf.pages : max;
    }()) : conf.groups;
    if(dict.end - dict.start < conf.groups - 1){ //最后一组状态
      dict.start = dict.end - conf.groups + 1;
    }
    for(; dict.start <= dict.end; dict.start++){
      if(dict.start === conf.curr){
        view.push('<span class="layui-laypage-curr"><em class="layui-laypage-em" '+ (/^#/.test(conf.skin) ? 'style="background-color:'+ conf.skin +';"' : '') +'></em><em>'+ dict.start +'</em></span>');
      } else {
        view.push('<a href="javascript:;" data-page="'+ dict.start +'">'+ dict.start +'</a>');
      }
    }
    
    //总页数大于连续分页数，且当前组最大页小于总页，输出尾页
    if(conf.pages > conf.groups && dict.end < conf.pages && conf.last && conf.groups !== 0){
       view.push('<span>&#x2026;</span><a href="javascript:;" class="layui-laypage-last" title="&#x5C3E;&#x9875;"  data-page="'+ conf.pages +'">'+ conf.last +'</a>');
    }
    
    //当前页不为尾页时，输出下一页
    dict.flow = !conf.prev && conf.groups === 0;
    if(conf.curr !== conf.pages && conf.next || dict.flow){
      view.push((function(){
        return (dict.flow && conf.curr === conf.pages) 
        ? '<span class="layui-laypage-nomore" title="&#x5DF2;&#x6CA1;&#x6709;&#x66F4;&#x591A;">'+ conf.next +'</span>'
        : '<a href="javascript:;" class="layui-laypage-next" data-page="'+ (conf.curr + 1) +'">'+ conf.next +'</a>';
      }()));
    }

    return '<div class="layui-box layui-laypage layui-laypage-'+ (conf.skin ? (function(skin){
      return /^#/.test(skin) ? 'molv' : skin;
    }(conf.skin)) : 'default') +'" id="layui-laypage-'+ that.config.item +'">'+ view.join('') + function(){
      return conf.skip 
      ? '<span class="layui-laypage-total">&#x5230;&#x7B2C; <input type="number" min="1" onkeyup="this.value=this.value.replace(/\\D/, \'\');" value="'+ conf.curr +'" class="layui-laypage-skip"> &#x9875; '
      + '<button type="button" class="layui-laypage-btn">&#x786e;&#x5b9a;</button></span>' 
      : '';
    }() +'</div>';
  };

  //跳页
  Page.prototype.jump = function(elem){
    if(!elem) return;
    var that = this, conf = that.config, childs = elem.children;
    var btn = elem[tag]('button')[0];
    var input = elem[tag]('input')[0];
    for(var i = 0, len = childs.length; i < len; i++){
      if(childs[i].nodeName.toLowerCase() === 'a'){
        Page.on(childs[i], 'click', function(){
          var curr = this.getAttribute('data-page')|0;
          conf.curr = curr;
          that.render();
          
        });
      }
    }
    if(btn){
      Page.on(btn, 'click', function(){
        var curr = input.value.replace(/\s|\D/g, '')|0;
        if(curr && curr <= conf.pages){
          conf.curr = curr;
          that.render();
        }
      });
    }
  };

  //渲染分页
  Page.prototype.render = function(load){
    var that = this, conf = that.config, type = that.type();
    var view = that.view();
    if(type === 2){
      conf.cont.innerHTML = view;
    } else if(type === 3){
      conf.cont.html(view);
    } else {
      doc[id](conf.cont).innerHTML = view;
    }
    conf.jump && conf.jump(conf, load);
    that.jump(doc[id]('layui-laypage-' + conf.item));
    if(conf.hash && !load){
      location.hash = '!'+ conf.hash +'='+ conf.curr;
    }
  };
  
  window.laypage = laypage;
  exports('laypage', laypage);

});/**

 @Name：layer v3.0.3 Web弹层组件
 @Author：贤心
 @Site：http://layer.layui.com
 @License：MIT
    
 */

;!function(window, undefined){
"use strict";

var isLayui = window.layui && layui.define, $, win, ready = {
  getPath: function(){
    var js = document.scripts, script = js[js.length - 1], jsPath = script.src;
    if(script.getAttribute('merge')) return;
    return jsPath.substring(0, jsPath.lastIndexOf("/") + 1);
  }(),

  config: {}, end: {}, minIndex: 0, minLeft: [],
  btn: ['&#x786E;&#x5B9A;', '&#x53D6;&#x6D88;'],

  //五种原始层模式
  type: ['dialog', 'page', 'iframe', 'loading', 'tips']
};

//默认内置方法。
var layer = {
  v: '3.0.3',
  ie: function(){ //ie版本
    var agent = navigator.userAgent.toLowerCase();
    return (!!window.ActiveXObject || "ActiveXObject" in window) ? (
      (agent.match(/msie\s(\d+)/) || [])[1] || '11' //由于ie11并没有msie的标识
    ) : false;
  }(),
  index: (window.layer && window.layer.v) ? 100000 : 0,
  path: ready.getPath,
  config: function(options, fn){
    options = options || {};
    layer.cache = ready.config = $.extend({}, ready.config, options);
    layer.path = ready.config.path || layer.path;
    typeof options.extend === 'string' && (options.extend = [options.extend]);
    
    if(ready.config.path) layer.ready();
    
    if(!options.extend) return this;
    
    isLayui 
      ? layui.addcss('modules/layer/' + options.extend)
    : layer.link('skin/' + options.extend);
    
    return this;
  },
  
  //载入CSS配件
  link: function(href, fn, cssname){
    
    //未设置路径，则不主动加载css
    if(!layer.path) return;
    
    var head = $('head')[0], link = document.createElement('link');
    if(typeof fn === 'string') cssname = fn;
    var app = (cssname || href).replace(/\.|\//g, '');
    var id = 'layuicss-'+app, timeout = 0;
    
    link.rel = 'stylesheet';
    link.href = layer.path + href;
    link.id = id;
    
    if(!$('#'+ id)[0]){
      head.appendChild(link);
    }
    
    if(typeof fn !== 'function') return;
    
    //轮询css是否加载完毕
    (function poll() {
      if(++timeout > 8 * 1000 / 100){
        return window.console && console.error('layer.css: Invalid');
      };
      parseInt($('#'+id).css('width')) === 1989 ? fn() : setTimeout(poll, 100);
    }());
  },
  
  ready: function(callback){
    var cssname = 'skinlayercss', ver = '303';
    isLayui ? layui.addcss('modules/layer/default/layer.css?v='+layer.v+ver, callback, cssname)
    : layer.link('skin/default/layer.css?v='+layer.v+ver, callback, cssname);
    return this;
  },
  
  //各种快捷引用
  alert: function(content, options, yes){
    var type = typeof options === 'function';
    if(type) yes = options;
    return layer.open($.extend({
      content: content,
      yes: yes
    }, type ? {} : options));
  }, 
  
  confirm: function(content, options, yes, cancel){ 
    var type = typeof options === 'function';
    if(type){
      cancel = yes;
      yes = options;
    }
    return layer.open($.extend({
      content: content,
      btn: ready.btn,
      yes: yes,
      btn2: cancel
    }, type ? {} : options));
  },
  
  msg: function(content, options, end){ //最常用提示层
    var type = typeof options === 'function', rskin = ready.config.skin;
    var skin = (rskin ? rskin + ' ' + rskin + '-msg' : '')||'layui-layer-msg';
    var anim = doms.anim.length - 1;
    if(type) end = options;
    return layer.open($.extend({
      content: content,
      time: 3000,
      shade: false,
      skin: skin,
      title: false,
      closeBtn: false,
      btn: false,
      resize: false,
      end: end
    }, (type && !ready.config.skin) ? {
      skin: skin + ' layui-layer-hui',
      anim: anim
    } : function(){
       options = options || {};
       if(options.icon === -1 || options.icon === undefined && !ready.config.skin){
         options.skin = skin + ' ' + (options.skin||'layui-layer-hui');
       }
       return options;
    }()));  
  },
  
  load: function(icon, options){
    return layer.open($.extend({
      type: 3,
      icon: icon || 0,
      resize: false,
      shade: 0.01
    }, options));
  }, 
  
  tips: function(content, follow, options){
    return layer.open($.extend({
      type: 4,
      content: [content, follow],
      closeBtn: false,
      time: 3000,
      shade: false,
      resize: false,
      fixed: false,
      maxWidth: 210
    }, options));
  }
};

var Class = function(setings){  
  var that = this;
  that.index = ++layer.index;
  that.config = $.extend({}, that.config, ready.config, setings);
  document.body ? that.creat() : setTimeout(function(){
    that.creat();
  }, 30);
};

Class.pt = Class.prototype;

//缓存常用字符
var doms = ['layui-layer', '.layui-layer-title', '.layui-layer-main', '.layui-layer-dialog', 'layui-layer-iframe', 'layui-layer-content', 'layui-layer-btn', 'layui-layer-close'];
doms.anim = ['layer-anim', 'layer-anim-01', 'layer-anim-02', 'layer-anim-03', 'layer-anim-04', 'layer-anim-05', 'layer-anim-06'];

//默认配置
Class.pt.config = {
  type: 0,
  shade: 0.3,
  fixed: true,
  move: doms[1],
  title: '&#x4FE1;&#x606F;',
  offset: 'auto',
  area: 'auto',
  closeBtn: 1,
  time: 0, //0表示不自动关闭
  zIndex: 19891014, 
  maxWidth: 360,
  anim: 0,
  isOutAnim: true,
  icon: -1,
  moveType: 1,
  resize: true,
  scrollbar: true, //是否允许浏览器滚动条
  tips: 2
};

//容器
Class.pt.vessel = function(conType, callback){
  var that = this, times = that.index, config = that.config;
  var zIndex = config.zIndex + times, titype = typeof config.title === 'object';
  var ismax = config.maxmin && (config.type === 1 || config.type === 2);
  var titleHTML = (config.title ? '<div class="layui-layer-title" style="'+ (titype ? config.title[1] : '') +'">' 
    + (titype ? config.title[0] : config.title) 
  + '</div>' : '');
  
  config.zIndex = zIndex;
  callback([
    //遮罩
    config.shade ? ('<div class="layui-layer-shade" id="layui-layer-shade'+ times +'" times="'+ times +'" style="'+ ('z-index:'+ (zIndex-1) +'; background-color:'+ (config.shade[1]||'#000') +'; opacity:'+ (config.shade[0]||config.shade) +'; filter:alpha(opacity='+ (config.shade[0]*100||config.shade*100) +');') +'"></div>') : '',
    
    //主体
    '<div class="'+ doms[0] + (' layui-layer-'+ready.type[config.type]) + (((config.type == 0 || config.type == 2) && !config.shade) ? ' layui-layer-border' : '') + ' ' + (config.skin||'') +'" id="'+ doms[0] + times +'" type="'+ ready.type[config.type] +'" times="'+ times +'" showtime="'+ config.time +'" conType="'+ (conType ? 'object' : 'string') +'" style="z-index: '+ zIndex +'; width:'+ config.area[0] + ';height:' + config.area[1] + (config.fixed ? '' : ';position:absolute;') +'">'
      + (conType && config.type != 2 ? '' : titleHTML)
      + '<div id="'+ (config.id||'') +'" class="layui-layer-content'+ ((config.type == 0 && config.icon !== -1) ? ' layui-layer-padding' :'') + (config.type == 3 ? ' layui-layer-loading'+config.icon : '') +'">'
        + (config.type == 0 && config.icon !== -1 ? '<i class="layui-layer-ico layui-layer-ico'+ config.icon +'"></i>' : '')
        + (config.type == 1 && conType ? '' : (config.content||''))
      + '</div>'
      + '<span class="layui-layer-setwin">'+ function(){
        var closebtn = ismax ? '<a class="layui-layer-min" href="javascript:;"><cite></cite></a><a class="layui-layer-ico layui-layer-max" href="javascript:;"></a>' : '';
        config.closeBtn && (closebtn += '<a class="layui-layer-ico '+ doms[7] +' '+ doms[7] + (config.title ? config.closeBtn : (config.type == 4 ? '1' : '2')) +'" href="javascript:;"></a>');
        return closebtn;
      }() + '</span>'
      + (config.btn ? function(){
        var button = '';
        typeof config.btn === 'string' && (config.btn = [config.btn]);
        for(var i = 0, len = config.btn.length; i < len; i++){
          button += '<a class="'+ doms[6] +''+ i +'">'+ config.btn[i] +'</a>'
        }
        return '<div class="'+ doms[6] +' layui-layer-btn-'+ (config.btnAlign||'') +'">'+ button +'</div>'
      }() : '')
      + (config.resize ? '<span class="layui-layer-resize"></span>' : '')
    + '</div>'
  ], titleHTML, $('<div class="layui-layer-move"></div>'));
  return that;
};

//创建骨架
Class.pt.creat = function(){
  var that = this
  ,config = that.config
  ,times = that.index, nodeIndex
  ,content = config.content
  ,conType = typeof content === 'object'
  ,body = $('body');
  
  if(config.id && $('#'+config.id)[0])  return;

  if(typeof config.area === 'string'){
    config.area = config.area === 'auto' ? ['', ''] : [config.area, ''];
  }
  
  //anim兼容旧版shift
  if(config.shift){
    config.anim = config.shift;
  }
  
  if(layer.ie == 6){
    config.fixed = false;
  }
  
  switch(config.type){
    case 0:
      config.btn = ('btn' in config) ? config.btn : ready.btn[0];
      layer.closeAll('dialog');
    break;
    case 2:
      var content = config.content = conType ? config.content : [config.content||'http://layer.layui.com', 'auto'];
      config.content = '<iframe scrolling="'+ (config.content[1]||'auto') +'" allowtransparency="true" id="'+ doms[4] +''+ times +'" name="'+ doms[4] +''+ times +'" onload="this.className=\'\';" class="layui-layer-load" frameborder="0" src="' + config.content[0] + '"></iframe>';
    break;
    case 3:
      delete config.title;
      delete config.closeBtn;
      config.icon === -1 && (config.icon === 0);
      layer.closeAll('loading');
    break;
    case 4:
      conType || (config.content = [config.content, 'body']);
      config.follow = config.content[1];
      config.content = config.content[0] + '<i class="layui-layer-TipsG"></i>';
      delete config.title;
      config.tips = typeof config.tips === 'object' ? config.tips : [config.tips, true];
      config.tipsMore || layer.closeAll('tips');
    break;
  }
  
  //建立容器
  that.vessel(conType, function(html, titleHTML, moveElem){
    body.append(html[0]);
    conType ? function(){
      (config.type == 2 || config.type == 4) ? function(){
        $('body').append(html[1]);
      }() : function(){
        if(!content.parents('.'+doms[0])[0]){
          content.data('display', content.css('display')).show().addClass('layui-layer-wrap').wrap(html[1]);
          $('#'+ doms[0] + times).find('.'+doms[5]).before(titleHTML);
        }
      }();
    }() : body.append(html[1]);
    $('.layui-layer-move')[0] || body.append(ready.moveElem = moveElem);
    that.layero = $('#'+ doms[0] + times);
    config.scrollbar || doms.html.css('overflow', 'hidden').attr('layer-full', times);
  }).auto(times);

  config.type == 2 && layer.ie == 6 && that.layero.find('iframe').attr('src', content[0]);

  //坐标自适应浏览器窗口尺寸
  config.type == 4 ? that.tips() : that.offset();
  if(config.fixed){
    win.on('resize', function(){
      that.offset();
      (/^\d+%$/.test(config.area[0]) || /^\d+%$/.test(config.area[1])) && that.auto(times);
      config.type == 4 && that.tips();
    });
  }
  
  config.time <= 0 || setTimeout(function(){
    layer.close(that.index)
  }, config.time);
  that.move().callback();
  
  //为兼容jQuery3.0的css动画影响元素尺寸计算
  if(doms.anim[config.anim]){
    that.layero.addClass(doms.anim[config.anim]);
  };
  
  //记录关闭动画
  if(config.isOutAnim){
    that.layero.data('isOutAnim', true);
  }
};

//自适应
Class.pt.auto = function(index){
  var that = this, config = that.config, layero = $('#'+ doms[0] + index);
  if(config.area[0] === '' && config.maxWidth > 0){
    //为了修复IE7下一个让人难以理解的bug
    if(layer.ie && layer.ie < 8 && config.btn){
      layero.width(layero.innerWidth());
    }
    layero.outerWidth() > config.maxWidth && layero.width(config.maxWidth);
  }
  var area = [layero.innerWidth(), layero.innerHeight()];
  var titHeight = layero.find(doms[1]).outerHeight() || 0;
  var btnHeight = layero.find('.'+doms[6]).outerHeight() || 0;
  function setHeight(elem){
    elem = layero.find(elem);
    elem.height(area[1] - titHeight - btnHeight - 2*(parseFloat(elem.css('padding-top'))|0));
  }
  switch(config.type){
    case 2: 
      setHeight('iframe');
    break;
    default:
      if(config.area[1] === ''){
        if(config.fixed && area[1] >= win.height()){
          area[1] = win.height();
          setHeight('.'+doms[5]);
        }
      } else {
        setHeight('.'+doms[5]);
      }
    break;
  }
  return that;
};

//计算坐标
Class.pt.offset = function(){
  var that = this, config = that.config, layero = that.layero;
  var area = [layero.outerWidth(), layero.outerHeight()];
  var type = typeof config.offset === 'object';
  that.offsetTop = (win.height() - area[1])/2;
  that.offsetLeft = (win.width() - area[0])/2;
  
  if(type){
    that.offsetTop = config.offset[0];
    that.offsetLeft = config.offset[1]||that.offsetLeft;
  } else if(config.offset !== 'auto'){
    
    if(config.offset === 't'){ //上
      that.offsetTop = 0;
    } else if(config.offset === 'r'){ //右
      that.offsetLeft = win.width() - area[0];
    } else if(config.offset === 'b'){ //下
      that.offsetTop = win.height() - area[1];
    } else if(config.offset === 'l'){ //左
      that.offsetLeft = 0;
    } else if(config.offset === 'lt'){ //左上角
      that.offsetTop = 0;
      that.offsetLeft = 0;
    } else if(config.offset === 'lb'){ //左下角
      that.offsetTop = win.height() - area[1];
      that.offsetLeft = 0;
    } else if(config.offset === 'rt'){ //右上角
      that.offsetTop = 0;
      that.offsetLeft = win.width() - area[0];
    } else if(config.offset === 'rb'){ //右下角
      that.offsetTop = win.height() - area[1];
      that.offsetLeft = win.width() - area[0];
    } else {
      that.offsetTop = config.offset;
    }
    
  }
 
  if(!config.fixed){
    that.offsetTop = /%$/.test(that.offsetTop) ? 
      win.height()*parseFloat(that.offsetTop)/100
    : parseFloat(that.offsetTop);
    that.offsetLeft = /%$/.test(that.offsetLeft) ? 
      win.width()*parseFloat(that.offsetLeft)/100
    : parseFloat(that.offsetLeft);
    that.offsetTop += win.scrollTop();
    that.offsetLeft += win.scrollLeft();
  }
  
  if(layero.attr('minLeft')){
    that.offsetTop = win.height() - (layero.find(doms[1]).outerHeight() || 0);
    that.offsetLeft = layero.css('left');
  }

  layero.css({top: that.offsetTop, left: that.offsetLeft});
};

//Tips
Class.pt.tips = function(){
  var that = this, config = that.config, layero = that.layero;
  var layArea = [layero.outerWidth(), layero.outerHeight()], follow = $(config.follow);
  if(!follow[0]) follow = $('body');
  var goal = {
    width: follow.outerWidth(),
    height: follow.outerHeight(),
    top: follow.offset().top,
    left: follow.offset().left
  }, tipsG = layero.find('.layui-layer-TipsG');
  
  var guide = config.tips[0];
  config.tips[1] || tipsG.remove();
  
  goal.autoLeft = function(){
    if(goal.left + layArea[0] - win.width() > 0){
      goal.tipLeft = goal.left + goal.width - layArea[0];
      tipsG.css({right: 12, left: 'auto'});
    } else {
      goal.tipLeft = goal.left;
    };
  };
  
  //辨别tips的方位
  goal.where = [function(){ //上        
    goal.autoLeft();
    goal.tipTop = goal.top - layArea[1] - 10;
    tipsG.removeClass('layui-layer-TipsB').addClass('layui-layer-TipsT').css('border-right-color', config.tips[1]);
  }, function(){ //右
    goal.tipLeft = goal.left + goal.width + 10;
    goal.tipTop = goal.top;
    tipsG.removeClass('layui-layer-TipsL').addClass('layui-layer-TipsR').css('border-bottom-color', config.tips[1]); 
  }, function(){ //下
    goal.autoLeft();
    goal.tipTop = goal.top + goal.height + 10;
    tipsG.removeClass('layui-layer-TipsT').addClass('layui-layer-TipsB').css('border-right-color', config.tips[1]);
  }, function(){ //左
    goal.tipLeft = goal.left - layArea[0] - 10;
    goal.tipTop = goal.top;
    tipsG.removeClass('layui-layer-TipsR').addClass('layui-layer-TipsL').css('border-bottom-color', config.tips[1]);
  }];
  goal.where[guide-1]();
  
  /* 8*2为小三角形占据的空间 */
  if(guide === 1){
    goal.top - (win.scrollTop() + layArea[1] + 8*2) < 0 && goal.where[2]();
  } else if(guide === 2){
    win.width() - (goal.left + goal.width + layArea[0] + 8*2) > 0 || goal.where[3]()
  } else if(guide === 3){
    (goal.top - win.scrollTop() + goal.height + layArea[1] + 8*2) - win.height() > 0 && goal.where[0]();
  } else if(guide === 4){
     layArea[0] + 8*2 - goal.left > 0 && goal.where[1]()
  }

  layero.find('.'+doms[5]).css({
    'background-color': config.tips[1], 
    'padding-right': (config.closeBtn ? '30px' : '')
  });
  layero.css({
    left: goal.tipLeft - (config.fixed ? win.scrollLeft() : 0), 
    top: goal.tipTop  - (config.fixed ? win.scrollTop() : 0)
  });
}

//拖拽层
Class.pt.move = function(){
  var that = this
  ,config = that.config
  ,_DOC = $(document)
  ,layero = that.layero
  ,moveElem = layero.find(config.move)
  ,resizeElem = layero.find('.layui-layer-resize')
  ,dict = {};
  
  if(config.move){
    moveElem.css('cursor', 'move');
  }

  moveElem.on('mousedown', function(e){
    e.preventDefault();
    if(config.move){
      dict.moveStart = true;
      dict.offset = [
        e.clientX - parseFloat(layero.css('left'))
        ,e.clientY - parseFloat(layero.css('top'))
      ];
      ready.moveElem.css('cursor', 'move').show();
    }
  });
  
  resizeElem.on('mousedown', function(e){
    e.preventDefault();
    dict.resizeStart = true;
    dict.offset = [e.clientX, e.clientY];
    dict.area = [
      layero.outerWidth()
      ,layero.outerHeight()
    ];
    ready.moveElem.css('cursor', 'se-resize').show();
  });
  
  _DOC.on('mousemove', function(e){

    //拖拽移动
    if(dict.moveStart){
      var X = e.clientX - dict.offset[0]
      ,Y = e.clientY - dict.offset[1]
      ,fixed = layero.css('position') === 'fixed';
      
      e.preventDefault();
      
      dict.stX = fixed ? 0 : win.scrollLeft();
      dict.stY = fixed ? 0 : win.scrollTop();

      //控制元素不被拖出窗口外
      if(!config.moveOut){
        var setRig = win.width() - layero.outerWidth() + dict.stX
        ,setBot = win.height() - layero.outerHeight() + dict.stY;  
        X < dict.stX && (X = dict.stX);
        X > setRig && (X = setRig); 
        Y < dict.stY && (Y = dict.stY);
        Y > setBot && (Y = setBot);
      }
      
      layero.css({
        left: X
        ,top: Y
      });
    }
    
    //Resize
    if(config.resize && dict.resizeStart){
      var X = e.clientX - dict.offset[0]
      ,Y = e.clientY - dict.offset[1];
      
      e.preventDefault();
      
      layer.style(that.index, {
        width: dict.area[0] + X
        ,height: dict.area[1] + Y
      })
      dict.isResize = true;
      config.resizing && config.resizing(layero);
    }
  }).on('mouseup', function(e){
    if(dict.moveStart){
      delete dict.moveStart;
      ready.moveElem.hide();
      config.moveEnd && config.moveEnd(layero);
    }
    if(dict.resizeStart){
      delete dict.resizeStart;
      ready.moveElem.hide();
    }
  });
  
  return that;
};

Class.pt.callback = function(){
  var that = this, layero = that.layero, config = that.config;
  that.openLayer();
  if(config.success){
    if(config.type == 2){
      layero.find('iframe').on('load', function(){
        config.success(layero, that.index);
      });
    } else {
      config.success(layero, that.index);
    }
  }
  layer.ie == 6 && that.IE6(layero);
  
  //按钮
  layero.find('.'+ doms[6]).children('a').on('click', function(){
    var index = $(this).index();
    if(index === 0){
      if(config.yes){
        config.yes(that.index, layero)
      } else if(config['btn1']){
        config['btn1'](that.index, layero)
      } else {
        layer.close(that.index);
      }
    } else {
      var close = config['btn'+(index+1)] && config['btn'+(index+1)](that.index, layero);
      close === false || layer.close(that.index);
    }
  });
  
  //取消
  function cancel(){
    var close = config.cancel && config.cancel(that.index, layero);
    close === false || layer.close(that.index);
  }
  
  //右上角关闭回调
  layero.find('.'+ doms[7]).on('click', cancel);
  
  //点遮罩关闭
  if(config.shadeClose){
    $('#layui-layer-shade'+ that.index).on('click', function(){
      layer.close(that.index);
    });
  } 
  
  //最小化
  layero.find('.layui-layer-min').on('click', function(){
    var min = config.min && config.min(layero);
    min === false || layer.min(that.index, config); 
  });
  
  //全屏/还原
  layero.find('.layui-layer-max').on('click', function(){
    if($(this).hasClass('layui-layer-maxmin')){
      layer.restore(that.index);
      config.restore && config.restore(layero);
    } else {
      layer.full(that.index, config);
      setTimeout(function(){
        config.full && config.full(layero);
      }, 100);
    }
  });

  config.end && (ready.end[that.index] = config.end);
};

//for ie6 恢复select
ready.reselect = function(){
  $.each($('select'), function(index , value){
    var sthis = $(this);
    if(!sthis.parents('.'+doms[0])[0]){
      (sthis.attr('layer') == 1 && $('.'+doms[0]).length < 1) && sthis.removeAttr('layer').show(); 
    }
    sthis = null;
  });
}; 

Class.pt.IE6 = function(layero){
  //隐藏select
  $('select').each(function(index , value){
    var sthis = $(this);
    if(!sthis.parents('.'+doms[0])[0]){
      sthis.css('display') === 'none' || sthis.attr({'layer' : '1'}).hide();
    }
    sthis = null;
  });
};

//需依赖原型的对外方法
Class.pt.openLayer = function(){
  var that = this;
  
  //置顶当前窗口
  layer.zIndex = that.config.zIndex;
  layer.setTop = function(layero){
    var setZindex = function(){
      layer.zIndex++;
      layero.css('z-index', layer.zIndex + 1);
    };
    layer.zIndex = parseInt(layero[0].style.zIndex);
    layero.on('mousedown', setZindex);
    return layer.zIndex;
  };
};

ready.record = function(layero){
  var area = [
    layero.width(),
    layero.height(),
    layero.position().top, 
    layero.position().left + parseFloat(layero.css('margin-left'))
  ];
  layero.find('.layui-layer-max').addClass('layui-layer-maxmin');
  layero.attr({area: area});
};

ready.rescollbar = function(index){
  if(doms.html.attr('layer-full') == index){
    if(doms.html[0].style.removeProperty){
      doms.html[0].style.removeProperty('overflow');
    } else {
      doms.html[0].style.removeAttribute('overflow');
    }
    doms.html.removeAttr('layer-full');
  }
};

/** 内置成员 */

window.layer = layer;

//获取子iframe的DOM
layer.getChildFrame = function(selector, index){
  index = index || $('.'+doms[4]).attr('times');
  return $('#'+ doms[0] + index).find('iframe').contents().find(selector);  
};

//得到当前iframe层的索引，子iframe时使用
layer.getFrameIndex = function(name){
  return $('#'+ name).parents('.'+doms[4]).attr('times');
};

//iframe层自适应宽高
layer.iframeAuto = function(index){
  if(!index) return;
  var heg = layer.getChildFrame('html', index).outerHeight();
  var layero = $('#'+ doms[0] + index);
  var titHeight = layero.find(doms[1]).outerHeight() || 0;
  var btnHeight = layero.find('.'+doms[6]).outerHeight() || 0;
  layero.css({height: heg + titHeight + btnHeight});
  layero.find('iframe').css({height: heg});
};

//重置iframe url
layer.iframeSrc = function(index, url){
  $('#'+ doms[0] + index).find('iframe').attr('src', url);
};

//设定层的样式
layer.style = function(index, options, limit){
  var layero = $('#'+ doms[0] + index)
  ,contElem = layero.find('.layui-layer-content')
  ,type = layero.attr('type')
  ,titHeight = layero.find(doms[1]).outerHeight() || 0
  ,btnHeight = layero.find('.'+doms[6]).outerHeight() || 0
  ,minLeft = layero.attr('minLeft');
  
  if(type === ready.type[3] || type === ready.type[4]){
    return;
  }
  
  if(!limit){
    if(parseFloat(options.width) <= 260){
      options.width = 260;
    };
    
    if(parseFloat(options.height) - titHeight - btnHeight <= 64){
      options.height = 64 + titHeight + btnHeight;
    };
  }
  
  layero.css(options);
  btnHeight = layero.find('.'+doms[6]).outerHeight();
  
  if(type === ready.type[2]){
    layero.find('iframe').css({
      height: parseFloat(options.height) - titHeight - btnHeight
    });
  } else {
    contElem.css({
      height: parseFloat(options.height) - titHeight - btnHeight
      - parseFloat(contElem.css('padding-top'))
      - parseFloat(contElem.css('padding-bottom'))
    })
  }
};

//最小化
layer.min = function(index, options){
  var layero = $('#'+ doms[0] + index)
  ,titHeight = layero.find(doms[1]).outerHeight() || 0
  ,left = layero.attr('minLeft') || (181*ready.minIndex)+'px'
  ,position = layero.css('position');
  
  ready.record(layero);
  
  if(ready.minLeft[0]){
    left = ready.minLeft[0];
    ready.minLeft.shift();
  }
  
  layero.attr('position', position);
  
  layer.style(index, {
    width: 180
    ,height: titHeight
    ,left: left
    ,top: win.height() - titHeight
    ,position: 'fixed'
    ,overflow: 'hidden'
  }, true);

  layero.find('.layui-layer-min').hide();
  layero.attr('type') === 'page' && layero.find(doms[4]).hide();
  ready.rescollbar(index);
  
  if(!layero.attr('minLeft')){
    ready.minIndex++;
  }
  layero.attr('minLeft', left);
};

//还原
layer.restore = function(index){
  var layero = $('#'+ doms[0] + index), area = layero.attr('area').split(',');
  var type = layero.attr('type');
  layer.style(index, {
    width: parseFloat(area[0]), 
    height: parseFloat(area[1]), 
    top: parseFloat(area[2]), 
    left: parseFloat(area[3]),
    position: layero.attr('position'),
    overflow: 'visible'
  }, true);
  layero.find('.layui-layer-max').removeClass('layui-layer-maxmin');
  layero.find('.layui-layer-min').show();
  layero.attr('type') === 'page' && layero.find(doms[4]).show();
  ready.rescollbar(index);
};

//全屏
layer.full = function(index){
  var layero = $('#'+ doms[0] + index), timer;
  ready.record(layero);
  if(!doms.html.attr('layer-full')){
    doms.html.css('overflow','hidden').attr('layer-full', index);
  }
  clearTimeout(timer);
  timer = setTimeout(function(){
    var isfix = layero.css('position') === 'fixed';
    layer.style(index, {
      top: isfix ? 0 : win.scrollTop(),
      left: isfix ? 0 : win.scrollLeft(),
      width: win.width(),
      height: win.height()
    }, true);
    layero.find('.layui-layer-min').hide();
  }, 100);
};

//改变title
layer.title = function(name, index){
  var title = $('#'+ doms[0] + (index||layer.index)).find(doms[1]);
  title.html(name);
};

//关闭layer总方法
layer.close = function(index){
  var layero = $('#'+ doms[0] + index), type = layero.attr('type'), closeAnim = 'layer-anim-close';
  if(!layero[0]) return;
  var WRAP = 'layui-layer-wrap', remove = function(){
    if(type === ready.type[1] && layero.attr('conType') === 'object'){
      layero.children(':not(.'+ doms[5] +')').remove();
      var wrap = layero.find('.'+WRAP);
      for(var i = 0; i < 2; i++){
        wrap.unwrap();
      }
      wrap.css('display', wrap.data('display')).removeClass(WRAP);
    } else {
      //低版本IE 回收 iframe
      if(type === ready.type[2]){
        try {
          var iframe = $('#'+doms[4]+index)[0];
          iframe.contentWindow.document.write('');
          iframe.contentWindow.close();
          layero.find('.'+doms[5])[0].removeChild(iframe);
        } catch(e){}
      }
      layero[0].innerHTML = '';
      layero.remove();
    }
    typeof ready.end[index] === 'function' && ready.end[index]();
    delete ready.end[index];
  };
  
  if(layero.data('isOutAnim')){
    layero.addClass(closeAnim);
  }
  
  $('#layui-layer-moves, #layui-layer-shade' + index).remove();
  layer.ie == 6 && ready.reselect();
  ready.rescollbar(index); 
  if(layero.attr('minLeft')){
    ready.minIndex--;
    ready.minLeft.push(layero.attr('minLeft'));
  }
  
  if((layer.ie && layer.ie < 10) || !layero.data('isOutAnim')){
    remove()
  } else {
    setTimeout(function(){
      remove();
    }, 200);
  }
};

//关闭所有层
layer.closeAll = function(type){
  $.each($('.'+doms[0]), function(){
    var othis = $(this);
    var is = type ? (othis.attr('type') === type) : 1;
    is && layer.close(othis.attr('times'));
    is = null;
  });
};

/** 

  拓展模块，layui开始合并在一起

 */

var cache = layer.cache||{}, skin = function(type){
  return (cache.skin ? (' ' + cache.skin + ' ' + cache.skin + '-'+type) : '');
}; 
 
//仿系统prompt
layer.prompt = function(options, yes){
  var style = '';
  options = options || {};
  
  if(typeof options === 'function') yes = options;
  
  if(options.area){
    var area = options.area;
    style = 'style="width: '+ area[0] +'; height: '+ area[1] + ';"';
    delete options.area;
  }
  var prompt, content = options.formType == 2 ? '<textarea class="layui-layer-input"' + style +'>' + (options.value||'') +'</textarea>' : function(){
    return '<input type="'+ (options.formType == 1 ? 'password' : 'text') +'" class="layui-layer-input" value="'+ (options.value||'') +'">';
  }();
  
  var success = options.success;
  delete options.success;
  
  return layer.open($.extend({
    type: 1
    ,btn: ['&#x786E;&#x5B9A;','&#x53D6;&#x6D88;']
    ,content: content
    ,skin: 'layui-layer-prompt' + skin('prompt')
    ,maxWidth: win.width()
    ,success: function(layero){
      prompt = layero.find('.layui-layer-input');
      prompt.focus();
      typeof success === 'function' && success(layero);
    }
    ,resize: false
    ,yes: function(index){
      var value = prompt.val();
      if(value === ''){
        prompt.focus();
      } else if(value.length > (options.maxlength||500)) {
        layer.tips('&#x6700;&#x591A;&#x8F93;&#x5165;'+ (options.maxlength || 500) +'&#x4E2A;&#x5B57;&#x6570;', prompt, {tips: 1});
      } else {
        yes && yes(value, index, prompt);
      }
    }
  }, options));
};

//tab层
layer.tab = function(options){
  options = options || {};
  
  var tab = options.tab || {}
  ,success = options.success;
  
  delete options.success;
  
  return layer.open($.extend({
    type: 1,
    skin: 'layui-layer-tab' + skin('tab'),
    resize: false,
    title: function(){
      var len = tab.length, ii = 1, str = '';
      if(len > 0){
        str = '<span class="layui-layer-tabnow">'+ tab[0].title +'</span>';
        for(; ii < len; ii++){
          str += '<span>'+ tab[ii].title +'</span>';
        }
      }
      return str;
    }(),
    content: '<ul class="layui-layer-tabmain">'+ function(){
      var len = tab.length, ii = 1, str = '';
      if(len > 0){
        str = '<li class="layui-layer-tabli xubox_tab_layer">'+ (tab[0].content || 'no content') +'</li>';
        for(; ii < len; ii++){
          str += '<li class="layui-layer-tabli">'+ (tab[ii].content || 'no  content') +'</li>';
        }
      }
      return str;
    }() +'</ul>',
    success: function(layero){
      var btn = layero.find('.layui-layer-title').children();
      var main = layero.find('.layui-layer-tabmain').children();
      btn.on('mousedown', function(e){
        e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
        var othis = $(this), index = othis.index();
        othis.addClass('layui-layer-tabnow').siblings().removeClass('layui-layer-tabnow');
        main.eq(index).show().siblings().hide();
        typeof options.change === 'function' && options.change(index);
      });
      typeof success === 'function' && success(layero);
    }
  }, options));
};

//相册层
layer.photos = function(options, loop, key){
  var dict = {};
  options = options || {};
  if(!options.photos) return;
  var type = options.photos.constructor === Object;
  var photos = type ? options.photos : {}, data = photos.data || [];
  var start = photos.start || 0;
  dict.imgIndex = (start|0) + 1;
  
  options.img = options.img || 'img';
  
  var success = options.success;
  delete options.success;

  if(!type){ //页面直接获取
    var parent = $(options.photos), pushData = function(){
      data = [];
      parent.find(options.img).each(function(index){
        var othis = $(this);
        othis.attr('layer-index', index);
        data.push({
          alt: othis.attr('alt'),
          pid: othis.attr('layer-pid'),
          src: othis.attr('layer-src') || othis.attr('src'),
          thumb: othis.attr('src')
        });
      })
    };
    
    pushData();
    
    if (data.length === 0) return;
    
    loop || parent.on('click', options.img, function(){
      var othis = $(this), index = othis.attr('layer-index'); 
      layer.photos($.extend(options, {
        photos: {
          start: index,
          data: data,
          tab: options.tab
        },
        full: options.full
      }), true);
      pushData();
    })
    
    //不直接弹出
    if(!loop) return;
    
  } else if (data.length === 0){
    return layer.msg('&#x6CA1;&#x6709;&#x56FE;&#x7247;');
  }
  
  //上一张
  dict.imgprev = function(key){
    dict.imgIndex--;
    if(dict.imgIndex < 1){
      dict.imgIndex = data.length;
    }
    dict.tabimg(key);
  };
  
  //下一张
  dict.imgnext = function(key,errorMsg){
    dict.imgIndex++;
    if(dict.imgIndex > data.length){
      dict.imgIndex = 1;
      if (errorMsg) {return};
    }
    dict.tabimg(key)
  };
  
  //方向键
  dict.keyup = function(event){
    if(!dict.end){
      var code = event.keyCode;
      event.preventDefault();
      if(code === 37){
        dict.imgprev(true);
      } else if(code === 39) {
        dict.imgnext(true);
      } else if(code === 27) {
        layer.close(dict.index);
      }
    }
  }
  
  //切换
  dict.tabimg = function(key){
    if(data.length <= 1) return;
    photos.start = dict.imgIndex - 1;
    layer.close(dict.index);
    return layer.photos(options, true, key);
    setTimeout(function(){
      layer.photos(options, true, key);
    }, 200);
  }
  
  //一些动作
  dict.event = function(){
    dict.bigimg.hover(function(){
      dict.imgsee.show();
    }, function(){
      dict.imgsee.hide();
    });
    
    dict.bigimg.find('.layui-layer-imgprev').on('click', function(event){
      event.preventDefault();
      dict.imgprev();
    });  
    
    dict.bigimg.find('.layui-layer-imgnext').on('click', function(event){     
      event.preventDefault();
      dict.imgnext();
    });
    
    $(document).on('keyup', dict.keyup);
  };
  
  //图片预加载
  function loadImage(url, callback, error) {   
    var img = new Image();
    img.src = url; 
    if(img.complete){
      return callback(img);
    }
    img.onload = function(){
      img.onload = null;
      callback(img);
    };
    img.onerror = function(e){
      img.onerror = null;
      error(e);
    };  
  };
  
  dict.loadi = layer.load(1, {
    shade: 'shade' in options ? false : 0.9,
    scrollbar: false
  });

  loadImage(data[start].src, function(img){
    layer.close(dict.loadi);
    dict.index = layer.open($.extend({
      type: 1,
      id: 'layui-layer-photos',
      area: function(){
        var imgarea = [img.width, img.height];
        var winarea = [$(window).width() - 100, $(window).height() - 100];
        
        //如果 实际图片的宽或者高比 屏幕大（那么进行缩放）
        if(!options.full && (imgarea[0]>winarea[0]||imgarea[1]>winarea[1])){
          var wh = [imgarea[0]/winarea[0],imgarea[1]/winarea[1]];//取宽度缩放比例、高度缩放比例
          if(wh[0] > wh[1]){//取缩放比例最大的进行缩放
            imgarea[0] = imgarea[0]/wh[0];
            imgarea[1] = imgarea[1]/wh[0];
          } else if(wh[0] < wh[1]){
            imgarea[0] = imgarea[0]/wh[1];
            imgarea[1] = imgarea[1]/wh[1];
          }
        }
        
        return [imgarea[0]+'px', imgarea[1]+'px']; 
      }(),
      title: false,
      shade: 0.9,
      shadeClose: true,
      closeBtn: false,
      move: '.layui-layer-phimg img',
      moveType: 1,
      scrollbar: false,
      moveOut: true,
      //anim: Math.random()*5|0,
      isOutAnim: false,
      skin: 'layui-layer-photos' + skin('photos'),
      content: '<div class="layui-layer-phimg">'
        +'<img src="'+ data[start].src +'" alt="'+ (data[start].alt||'') +'" layer-pid="'+ data[start].pid +'">'
        +'<div class="layui-layer-imgsee">'
          +(data.length > 1 ? '<span class="layui-layer-imguide"><a href="javascript:;" class="layui-layer-iconext layui-layer-imgprev"></a><a href="javascript:;" class="layui-layer-iconext layui-layer-imgnext"></a></span>' : '')
          +'<div class="layui-layer-imgbar" style="display:'+ (key ? 'block' : '') +'"><span class="layui-layer-imgtit"><a href="javascript:;">'+ (data[start].alt||'') +'</a><em>'+ dict.imgIndex +'/'+ data.length +'</em></span></div>'
        +'</div>'
      +'</div>',
      success: function(layero, index){
        dict.bigimg = layero.find('.layui-layer-phimg');
        dict.imgsee = layero.find('.layui-layer-imguide,.layui-layer-imgbar');
        dict.event(layero);
        options.tab && options.tab(data[start], layero);
        typeof success === 'function' && success(layero);
      }, end: function(){
        dict.end = true;
        $(document).off('keyup', dict.keyup);
      }
    }, options));
  }, function(){
    layer.close(dict.loadi);
    layer.msg('&#x5F53;&#x524D;&#x56FE;&#x7247;&#x5730;&#x5740;&#x5F02;&#x5E38;<br>&#x662F;&#x5426;&#x7EE7;&#x7EED;&#x67E5;&#x770B;&#x4E0B;&#x4E00;&#x5F20;&#xFF1F;', {
      time: 30000, 
      btn: ['&#x4E0B;&#x4E00;&#x5F20;', '&#x4E0D;&#x770B;&#x4E86;'], 
      yes: function(){
        data.length > 1 && dict.imgnext(true,true);
      }
    });
  });
};

//主入口
ready.run = function(_$){
  $ = _$;
  win = $(window);
  doms.html = $('html');
  layer.open = function(deliver){
    var o = new Class(deliver);
    return o.index;
  };
};

//加载方式
window.layui && layui.define ? (
  layer.ready()
  ,layui.define('jquery', function(exports){ //layui加载
    layer.path = layui.cache.dir;
    ready.run(layui.jquery);

    //暴露模块
    window.layer = layer;
    exports('layer', layer);
  })
) : (
  (typeof define === 'function' && define.amd) ? define(['jquery'], function(){ //requirejs加载
    ready.run(window.jQuery);
    return layer;
  }) : function(){ //普通script标签加载
    ready.run(window.jQuery);
    layer.ready();
  }()
);

}(window);
/**

 @Name：layui.element 常用元素操作
 @Author：贤心
 @License：MIT
    
 */
 
layui.define('jquery', function(exports){
  "use strict";
  
  var $ = layui.jquery
  ,hint = layui.hint()
  ,device = layui.device()
  
  ,MOD_NAME = 'element', THIS = 'layui-this', SHOW = 'layui-show'
  
  ,Element = function(){
    this.config = {};
  };
  
  //全局设置
  Element.prototype.set = function(options){
    var that = this;
    $.extend(true, that.config, options);
    return that;
  };
  
  //表单事件监听
  Element.prototype.on = function(events, callback){
    return layui.onevent(MOD_NAME, events, callback);
  };
  
  //外部Tab新增
  Element.prototype.tabAdd = function(filter, options){
    var TITLE = '.layui-tab-title'
    ,tabElem = $('.layui-tab[lay-filter='+ filter +']')
    ,titElem = tabElem.children(TITLE)
    ,contElem = tabElem.children('.layui-tab-content');
    titElem.append('<li lay-id="'+ (options.id||'') +'">'+ (options.title||'unnaming') +'</li>');
    contElem.append('<div class="layui-tab-item">'+ (options.content||'') +'</div>');
    call.hideTabMore(true);
    call.tabAuto();
    return this;
  };
  
  //外部Tab删除
  Element.prototype.tabDelete = function(filter, layid){
    var TITLE = '.layui-tab-title'
    ,tabElem = $('.layui-tab[lay-filter='+ filter +']')
    ,titElem = tabElem.children(TITLE)
    ,liElem = titElem.find('>li[lay-id="'+ layid +'"]');
    call.tabDelete(null, liElem);
    return this;
  };
  
  //外部Tab切换
  Element.prototype.tabChange = function(filter, layid){
    var TITLE = '.layui-tab-title'
    ,tabElem = $('.layui-tab[lay-filter='+ filter +']')
    ,titElem = tabElem.children(TITLE)
    ,liElem = titElem.find('>li[lay-id="'+ layid +'"]');
    call.tabClick(null, null, liElem);
    return this;
  };
  
  //动态改变进度条
  Element.prototype.progress = function(filter, percent){
    var ELEM = 'layui-progress'
    ,elem = $('.'+ ELEM +'[lay-filter='+ filter +']')
    ,elemBar = elem.find('.'+ ELEM +'-bar')
    ,text = elemBar.find('.'+ ELEM +'-text');
    elemBar.css('width', percent);
    text.text(percent);
    return this;
  };
  
  var NAV_ELEM = '.layui-nav', NAV_ITEM = 'layui-nav-item', NAV_BAR = 'layui-nav-bar'
  ,NAV_TREE = 'layui-nav-tree', NAV_CHILD = 'layui-nav-child', NAV_MORE = 'layui-nav-more'
  ,NAV_ANIM = 'layui-anim layui-anim-upbit'
  
  //基础事件体
  ,call = {
    //Tab点击
    tabClick: function(e, index, liElem){
      var othis = liElem || $(this)
      ,index = index || othis.parent().children('li').index(othis)
      ,parents = othis.parents('.layui-tab').eq(0)
      ,item = parents.children('.layui-tab-content').children('.layui-tab-item')
      ,filter = parents.attr('lay-filter');
      
      othis.addClass(THIS).siblings().removeClass(THIS);
      item.eq(index).addClass(SHOW).siblings().removeClass(SHOW);
      
      layui.event.call(this, MOD_NAME, 'tab('+ filter +')', {
        elem: parents
        ,index: index
      });
    }
    
    //Tab删除
    ,tabDelete: function(e, othis){
      var li = othis || $(this).parent(), index = li.index();
      var parents = li.parents('.layui-tab').eq(0);
      var item = parents.children('.layui-tab-content').children('.layui-tab-item')
      
      if(li.hasClass(THIS)){
        if(li.next()[0]){
          call.tabClick.call(li.next()[0], null, index + 1);
        } else if(li.prev()[0]){
          call.tabClick.call(li.prev()[0], null, index - 1);
        }
      }
      
      li.remove();
      item.eq(index).remove();
      setTimeout(function(){
        call.tabAuto();
      }, 50);
    }
    
    //Tab自适应
    ,tabAuto: function(){
      var SCROLL = 'layui-tab-scroll', MORE = 'layui-tab-more', BAR = 'layui-tab-bar'
      ,CLOSE = 'layui-tab-close', that = this;
      
      $('.layui-tab').each(function(){
        var othis = $(this)
        ,title = othis.children('.layui-tab-title')
        ,item = othis.children('.layui-tab-content').children('.layui-tab-item')
        ,STOPE = 'lay-stope="tabmore"'
        ,span = $('<span class="layui-unselect layui-tab-bar" '+ STOPE +'><i '+ STOPE +' class="layui-icon">&#xe61a;</i></span>');
        
        if(that === window && device.ie != 8){
          call.hideTabMore(true)
        }
        
        //允许关闭
        if(othis.attr('lay-allowClose')){
          title.find('li').each(function(){
            var li = $(this);
            if(!li.find('.'+CLOSE)[0]){
              var close = $('<i class="layui-icon layui-unselect '+ CLOSE +'">&#x1006;</i>');
              close.on('click', call.tabDelete);
              li.append(close);
            }
          });
        }
        
        //响应式
        if(title.prop('scrollWidth') > title.outerWidth()+1){
          if(title.find('.'+BAR)[0]) return;
          title.append(span);
          othis.attr('overflow', '');
          span.on('click', function(e){
            title[this.title ? 'removeClass' : 'addClass'](MORE);
            this.title = this.title ? '' : '收缩';
          });
        } else {
          title.find('.'+BAR).remove();
          othis.removeAttr('overflow');
        }
      });
    }
    //隐藏更多Tab
    ,hideTabMore: function(e){
      var tsbTitle = $('.layui-tab-title');
      if(e === true || $(e.target).attr('lay-stope') !== 'tabmore'){
        tsbTitle.removeClass('layui-tab-more');
        tsbTitle.find('.layui-tab-bar').attr('title','');
      }
    }
    
    //点击选中
    ,clickThis: function(){
      var othis = $(this), parents = othis.parents(NAV_ELEM)
      ,filter = parents.attr('lay-filter');
      
      if(othis.find('.'+NAV_CHILD)[0]) return;
      parents.find('.'+THIS).removeClass(THIS);
      othis.addClass(THIS);
      layui.event.call(this, MOD_NAME, 'nav('+ filter +')', othis);
    }
    //点击子菜单选中
    ,clickChild: function(){
      var othis = $(this), parents = othis.parents(NAV_ELEM)
      ,filter = parents.attr('lay-filter');
      parents.find('.'+THIS).removeClass(THIS);
      othis.addClass(THIS);
      layui.event.call(this, MOD_NAME, 'nav('+ filter +')', othis);
    }
    //展开二级菜单
    ,showChild: function(){
      var othis = $(this), parents = othis.parents(NAV_ELEM);
      var parent = othis.parent(), child = othis.siblings('.'+NAV_CHILD);
      if(parents.hasClass(NAV_TREE)){
        child.removeClass(NAV_ANIM);
        parent[child.css('display') === 'none' ? 'addClass': 'removeClass'](NAV_ITEM+'ed');
      }
    }
    
    //折叠面板
    ,collapse: function(){
      var othis = $(this), icon = othis.find('.layui-colla-icon')
      ,elemCont = othis.siblings('.layui-colla-content')
      ,parents = othis.parents('.layui-collapse').eq(0)
      ,filter = parents.attr('lay-filter')
      ,isNone = elemCont.css('display') === 'none';
      //是否手风琴
      if(typeof parents.attr('lay-accordion') === 'string'){
        var show = parents.children('.layui-colla-item').children('.'+SHOW);
        show.siblings('.layui-colla-title').children('.layui-colla-icon').html('&#xe602;');
        show.removeClass(SHOW);
      }
      elemCont[isNone ? 'addClass' : 'removeClass'](SHOW);
      icon.html(isNone ? '&#xe61a;' : '&#xe602;');
      
      layui.event.call(this, MOD_NAME, 'collapse('+ filter +')', {
        title: othis
        ,content: elemCont
        ,show: isNone
      });
    }
  };
  
  //初始化元素操作
  Element.prototype.init = function(type){
    var that = this, items = {
      
      //Tab选项卡
      tab: function(){
        call.tabAuto.call({});
      }
      
      //导航菜单
      ,nav: function(){
        var TIME = 200, timer, timerMore, timeEnd, follow = function(bar, nav){
          var othis = $(this), child = othis.find('.'+NAV_CHILD);
          
          if(nav.hasClass(NAV_TREE)){
            bar.css({
              top: othis.position().top
              ,height: othis.children('a').height()
              ,opacity: 1
            });
          } else {
            child.addClass(NAV_ANIM);
            bar.css({
              left: othis.position().left + parseFloat(othis.css('marginLeft'))
              ,top: othis.position().top + othis.height() - 5
            });
            
            timer = setTimeout(function(){
              bar.css({
                width: othis.width()
                ,opacity: 1
              });
            }, device.ie && device.ie < 10 ? 0 : TIME);
            
            clearTimeout(timeEnd);
            if(child.css('display') === 'block'){
              clearTimeout(timerMore);
            }
            timerMore = setTimeout(function(){
              child.addClass(SHOW)
              othis.find('.'+NAV_MORE).addClass(NAV_MORE+'d');
            }, 300);
          }
        }
        
        $(NAV_ELEM).each(function(){
          var othis = $(this)
          ,bar = $('<span class="'+ NAV_BAR +'"></span>')
          ,itemElem = othis.find('.'+NAV_ITEM);
          
          //Hover滑动效果
          if(!othis.find('.'+NAV_BAR)[0]){
            othis.append(bar);
            itemElem.on('mouseenter', function(){
              follow.call(this, bar, othis);
            }).on('mouseleave', function(){
              if(!othis.hasClass(NAV_TREE)){
                clearTimeout(timerMore);
                timerMore = setTimeout(function(){
                  othis.find('.'+NAV_CHILD).removeClass(SHOW);
                  othis.find('.'+NAV_MORE).removeClass(NAV_MORE+'d');
                }, 300);
              }
            });
            othis.on('mouseleave', function(){
              clearTimeout(timer)
              timeEnd = setTimeout(function(){
                if(othis.hasClass(NAV_TREE)){
                  bar.css({
                    height: 0
                    ,top: bar.position().top + bar.height()/2
                    ,opacity: 0
                  });
                } else {
                  bar.css({
                    width: 0
                    ,left: bar.position().left + bar.width()/2
                    ,opacity: 0
                  });
                }
              }, TIME);
            });
          }
          
          itemElem.each(function(){
            var oitem = $(this), child = oitem.find('.'+NAV_CHILD);
            
            //二级菜单
            if(child[0] && !oitem.find('.'+NAV_MORE)[0]){
              var one = oitem.children('a');
              one.append('<span class="'+ NAV_MORE +'"></span>');
            }
            
            oitem.off('click', call.clickThis).on('click', call.clickThis); //点击选中
            oitem.children('a').off('click', call.showChild).on('click', call.showChild); //展开二级菜单
            child.children('dd').off('click', call.clickChild).on('click', call.clickChild); //点击子菜单选中
          });
        });
      }
      
      //面包屑
      ,breadcrumb: function(){
        var ELEM = '.layui-breadcrumb';
        
        $(ELEM).each(function(){
          var othis = $(this)
          ,separator = othis.attr('lay-separator') || '>'
          ,aNode = othis.find('a');
          if(aNode.find('.layui-box')[0]) return;
          aNode.each(function(index){
            if(index === aNode.length - 1) return;
            $(this).append('<span class="layui-box">'+ separator +'</span>');
          });
          othis.css('visibility', 'visible');
        });
      }
      
      //进度条
      ,progress: function(){
        var ELEM = 'layui-progress';
        
        $('.'+ELEM).each(function(){
          var othis = $(this)
          ,elemBar = othis.find('.layui-progress-bar')
          ,width = elemBar.attr('lay-percent');
          elemBar.css('width', width);
          if(othis.attr('lay-showPercent')){
            setTimeout(function(){
              var percent = Math.round(elemBar.width()/othis.width()*100);
              if(percent > 100) percent = 100;
              elemBar.html('<span class="'+ ELEM +'-text">'+ percent +'%</span>');
            },350);
          }
        });
      }
      
      //折叠面板
      ,collapse: function(){
        var ELEM = 'layui-collapse';
        
        $('.'+ELEM).each(function(){
          var elemItem = $(this).find('.layui-colla-item')
          elemItem.each(function(){
            var othis = $(this)
            ,elemTitle = othis.find('.layui-colla-title')
            ,elemCont = othis.find('.layui-colla-content')
            ,isNone = elemCont.css('display') === 'none';
            
            //初始状态
            elemTitle.find('.layui-colla-icon').remove();
            elemTitle.append('<i class="layui-icon layui-colla-icon">'+ (isNone ? '&#xe602;' : '&#xe61a;') +'</i>');

            //点击标题
            elemTitle.off('click', call.collapse).on('click', call.collapse);
          });     
         
        });
      }
    };

    return layui.each(items, function(index, item){
      item();
    });
  };

  var element = new Element(), dom = $(document);
  element.init();
  
  var TITLE = '.layui-tab-title li';
  dom.on('click', TITLE, call.tabClick); //Tab切换
  dom.on('click', call.hideTabMore); //隐藏展开的Tab
  $(window).on('resize', call.tabAuto); //自适应
  
  exports(MOD_NAME, function(options){
    return element.set(options);
  });
});

/*!

 @Title: layui.upload 单文件上传 - 全浏览器兼容版
 @Author: 贤心
 @License：MIT

 */
 
layui.define('layer' , function(exports){
  "use strict";
  
  var $ = layui.jquery;
  var layer = layui.layer;
  var device = layui.device();
  
  var elemDragEnter = 'layui-upload-enter';
  var elemIframe = 'layui-upload-iframe';
 
  var msgConf = {
    icon: 2
    ,shift: 6
  }, fileType = {
    file: '文件'
    ,video: '视频'
    ,audio: '音频'
  };
  
  var Upload = function(options){
    this.options = options;
  };
  
  //初始化渲染
  Upload.prototype.init = function(){
    var that = this, options = that.options;
    var body = $('body'), elem = $(options.elem || '.layui-upload-file');
    var iframe = $('<iframe id="'+ elemIframe +'" class="'+ elemIframe +'" name="'+ elemIframe +'"></iframe>');
    
    //插入iframe    
    $('#'+elemIframe)[0] || body.append(iframe);
    
    return elem.each(function(index, item){
      item = $(item);
      var form = '<form target="'+ elemIframe +'" method="'+ (options.method||'post') +'" key="set-mine" enctype="multipart/form-data" action="'+ (options.url||'') +'"></form>';
      
      var type = item.attr('lay-type') || options.type; //获取文件类型

      //包裹ui元素
      if(!options.unwrap){
        form = '<div class="layui-box layui-upload-button">' + form + '<span class="layui-upload-icon"><i class="layui-icon">&#xe608;</i>'+ (
          item.attr('lay-title') || options.title|| ('上传'+ (fileType[type]||'图片') )
        ) +'</span></div>';
      }
      
      form = $(form);
      
      //拖拽支持
      if(!options.unwrap){
        form.on('dragover', function(e){
          e.preventDefault();
          $(this).addClass(elemDragEnter);
        }).on('dragleave', function(){
          $(this).removeClass(elemDragEnter);
        }).on('drop', function(){
          $(this).removeClass(elemDragEnter);
        });
      }
      
      //如果已经实例化，则移除包裹元素
      if(item.parent('form').attr('target') === elemIframe){
        if(options.unwrap){
          item.unwrap();
        } else {
          item.parent().next().remove();
          item.unwrap().unwrap();
        }
      };
      
      //包裹元素
      item.wrap(form);
      
      //触发上传
      item.off('change').on('change', function(){
        that.action(this, type);
        item.closest('.layui-upload-button').removeClass('layui-form-danger');
      });
    });
  };
  
  //提交上传
  Upload.prototype.action = function(input, type){
    var that = this, options = that.options, val = input.value;
    var item = $(input), ext = item.attr('lay-ext') || options.ext || ''; //获取支持上传的文件扩展名;

    if(!val){
      return;
    };
    
    //校验文件
    switch(type){
      case 'file': //一般文件
        if(ext && !RegExp('\\w\\.('+ ext +')$', 'i').test(escape(val))){
          layer.msg('不支持该文件格式', msgConf);
          return input.value = '';
        }
      break;
      case 'video': //视频文件
        if(!RegExp('\\w\\.('+ (ext||'avi|mp4|wma|rmvb|rm|flash|3gp|flv') +')$', 'i').test(escape(val))){
          layer.msg('不支持该视频格式', msgConf);
          return input.value = '';
        }
      break;
      case 'audio': //音频文件
        if(!RegExp('\\w\\.('+ (ext||'mp3|wav|mid') +')$', 'i').test(escape(val))){
          layer.msg('不支持该音频格式', msgConf);
          return input.value = '';
        }
      break;
      default: //图片文件
        if(!RegExp('\\w\\.('+ (ext||'jpg|png|gif|bmp|jpeg') +')$', 'i').test(escape(val))){
          layer.msg('不支持该图片格式', msgConf);
          return input.value = '';
        }
      break;
    }
    
    options.before && options.before(input);
    item.parent().submit();

    var iframe = $('#'+elemIframe), timer = setInterval(function() {
      var res;
      try {
        res = iframe.contents().find('body').text();
      } catch(e) {
        layer.msg('上传接口存在跨域', msgConf);
        clearInterval(timer);
        typeof options.error === 'function' && options.error(input);
        return;
      }
      if(res){
        clearInterval(timer);
        iframe.contents().find('body').html('');
        try {
          res = JSON.parse(res);
        } catch(e){
          res = {};
          layer.msg('请对上传接口返回JSON字符', msgConf);
          typeof options.error === 'function' && options.error(input);
          return;
        }
        typeof options.success === 'function' && options.success(res, input);
      }
    }, 30); 
    
    input.value = '';
  };
  
  //暴露接口
  exports('upload', function(options){
    var upload = new Upload(options = options || {});
    upload.init();
  });
});

/**

 @Name：layui.form 表单组件
 @Author：贤心
 @License：MIT
    
 */
 
layui.define('layer', function(exports){
  "use strict";
  
  var $ = layui.jquery
  ,layer = layui.layer
  ,hint = layui.hint()
  ,device = layui.device()
  
  ,MOD_NAME = 'form', ELEM = '.layui-form', THIS = 'layui-this', SHOW = 'layui-show', HIDE = 'layui-hide', DISABLED = 'layui-disabled'
  
  ,Form = function(){
    this.config = {
      verify: {
        required: [
          /[\S]+/
          ,'必填项不能为空'
        ]
        ,phone: [
          /^1\d{10}$/
          ,'请输入正确的手机号'
        ]
        ,email: [
          /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
          ,'邮箱格式不正确'
        ]
        ,url: [
          /(^#)|(^http(s*):\/\/[^\s]+\.[^\s]+)/
          ,'链接格式不正确'
        ]
        ,number: [
          /^\d+$/
          ,'只能填写数字'
        ]
        ,date: [
          /^(\d{4})[-\/](\d{1}|0\d{1}|1[0-2])([-\/](\d{1}|0\d{1}|[1-2][0-9]|3[0-1]))*$/
          ,'日期格式不正确'
        ]
        ,identity: [
          /(^\d{15}$)|(^\d{17}(x|X|\d)$)/
          ,'请输入正确的身份证号'
        ]
      }
    };
  };
  
  //全局设置
  Form.prototype.set = function(options){
    var that = this;
    $.extend(true, that.config, options);
    return that;
  };
  
  //验证规则设定
  Form.prototype.verify = function(settings){
    var that = this;
    $.extend(true, that.config.verify, settings);
    return that;
  };
  
  //表单事件监听
  Form.prototype.on = function(events, callback){
    return layui.onevent(MOD_NAME, events, callback);
  };
  
  //表单控件渲染
  Form.prototype.render = function(type){
    var that = this, items = {
      
      //下拉选择框
      select: function(){
        var TIPS = '请选择', CLASS = 'layui-form-select', TITLE = 'layui-select-title'
        ,NONE = 'layui-select-none', initValue = '', thatInput
        
        ,selects = $(ELEM).find('select'), hide = function(e, clear){
          if(!$(e.target).parent().hasClass(TITLE) || clear){
            $('.'+CLASS).removeClass(CLASS+'ed');
            thatInput && initValue && thatInput.val(initValue);
          }
          thatInput = null;
        }
        
        ,events = function(reElem, disabled, isSearch){
          var select = $(this)
          ,title = reElem.find('.' + TITLE)
          ,input = title.find('input')
          ,dl = reElem.find('dl')
          ,dds = dl.children('dd')
          
          
          if(disabled) return;
          
          //展开下拉
          var showDown = function(){
            reElem.addClass(CLASS+'ed');
            dds.removeClass(HIDE);
          }, hideDown = function(){
            reElem.removeClass(CLASS+'ed');
            input.blur();
            
            notOption(input.val(), function(none){
              if(none){
                initValue = dl.find('.'+THIS).html();
                input && input.val(initValue);
              }
            });
          };
          
          //点击标题区域
          title.on('click', function(e){
            reElem.hasClass(CLASS+'ed') ? (
              hideDown()
            ) : (
              hide(e, true), 
              showDown()
            );
            dl.find('.'+NONE).remove();
          }); 
          
          //点击箭头获取焦点
          title.find('.layui-edge').on('click', function(){
            input.focus();
          });
          
          //键盘事件
          input.on('keyup', function(e){
            var keyCode = e.keyCode;
            //Tab键
            if(keyCode === 9){
              showDown();
            }
          }).on('keydown', function(e){
            var keyCode = e.keyCode;
            //Tab键
            if(keyCode === 9){
              hideDown();
            } else if(keyCode === 13){ //回车键
              e.preventDefault();
            }
          });
          
          //检测值是否不属于select项
          var notOption = function(value, callback, origin){
            var num = 0;
            layui.each(dds, function(){
              var othis = $(this)
              ,text = othis.text()
              ,not = text.indexOf(value) === -1;
              if(value === '' || (origin === 'blur') ? value !== text : not) num++;
              origin === 'keyup' && othis[not ? 'addClass' : 'removeClass'](HIDE);
            });
            var none = num === dds.length;
            return callback(none), none;
          };
          
          //搜索匹配
          var search = function(e){
            var value = this.value, keyCode = e.keyCode;
            
            if(keyCode === 9 || keyCode === 13 
              || keyCode === 37 || keyCode === 38 
              || keyCode === 39 || keyCode === 40
            ){
              return false;
            }
            
            notOption(value, function(none){
              if(none){
                dl.find('.'+NONE)[0] || dl.append('<p class="'+ NONE +'">无匹配项</p>');
              } else {
                dl.find('.'+NONE).remove();
              }
            }, 'keyup');
            
            if(value === ''){
              dl.find('.'+NONE).remove();
            }
          };
          if(isSearch){
            input.on('keyup', search).on('blur', function(e){
              thatInput = input;
              initValue = dl.find('.'+THIS).html();
              setTimeout(function(){
                notOption(input.val(), function(none){
                  if(none && !initValue){
                    input.val('');
                  }
                }, 'blur');
              }, 200);
            });
          }

          //选择
          dds.on('click', function(){
            var othis = $(this), value = othis.attr('lay-value');
            var filter = select.attr('lay-filter'); //获取过滤器

            if(othis.hasClass(DISABLED)) return false;
            
            select.val(value).removeClass('layui-form-danger'), input.val(othis.text());
            othis.addClass(THIS).siblings().removeClass(THIS);
            layui.event.call(this, MOD_NAME, 'select('+ filter +')', {
              elem: select[0]
              ,value: value
              ,othis: reElem
            });

            hideDown();
            
            return false;
          });
          
          reElem.find('dl>dt').on('click', function(e){
            return false;
          });
          
          //关闭下拉
          $(document).off('click', hide).on('click', hide);
        }
        
        selects.each(function(index, select){
          var othis = $(this), hasRender = othis.next('.'+CLASS), disabled = this.disabled;
          var value = select.value, selected = $(select.options[select.selectedIndex]); //获取当前选中项
          
          if(typeof othis.attr('lay-ignore') === 'string') return othis.show();
          
          var isSearch = typeof othis.attr('lay-search') === 'string';

          //替代元素
          var reElem = $(['<div class="layui-unselect '+ CLASS + (disabled ? ' layui-select-disabled' : '') +'">'
            ,'<div class="'+ TITLE +'"><input type="text" placeholder="'+ (select.options[0].innerHTML ? select.options[0].innerHTML : TIPS) +'" value="'+ (value ? selected.html() : '') +'" '+ (isSearch ? '' : 'readonly') +' class="layui-input layui-unselect'+ (disabled ? (' '+DISABLED) : '') +'">'
            ,'<i class="layui-edge"></i></div>'
            ,'<dl class="layui-anim layui-anim-upbit'+ (othis.find('optgroup')[0] ? ' layui-select-group' : '') +'">'+ function(options){
              var arr = [];
              layui.each(options, function(index, item){
                if(index === 0 && !item.value) return;
                if(item.tagName.toLowerCase() === 'optgroup'){
                  arr.push('<dt>'+ item.label +'</dt>'); 
                } else {
                  arr.push('<dd lay-value="'+ item.value +'" class="'+ (value === item.value ?  THIS : '') + (item.disabled ? (' '+DISABLED) : '') +'">'+ item.innerHTML +'</dd>');
                }
              });
              return arr.join('');
            }(othis.find('*')) +'</dl>'
          ,'</div>'].join(''));
          
          hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
          othis.after(reElem);
          events.call(this, reElem, disabled, isSearch);
        });
      }
      //复选框/开关
      ,checkbox: function(){
        var CLASS = {
          checkbox: ['layui-form-checkbox', 'layui-form-checked', 'checkbox']
          ,_switch: ['layui-form-switch', 'layui-form-onswitch', 'switch']
        }
        ,checks = $(ELEM).find('input[type=checkbox]')
        
        ,events = function(reElem, RE_CLASS){
          var check = $(this);
          
          //勾选
          reElem.on('click', function(){
            var filter = check.attr('lay-filter') //获取过滤器
            ,text = (check.attr('lay-text')||'').split('|');

            if(check[0].disabled) return;
            
            check[0].checked ? (
              check[0].checked = false
              ,reElem.removeClass(RE_CLASS[1]).find('em').text(text[1])
            ) : (
              check[0].checked = true
              ,reElem.addClass(RE_CLASS[1]).find('em').text(text[0])
            );
            
            layui.event.call(check[0], MOD_NAME, RE_CLASS[2]+'('+ filter +')', {
              elem: check[0]
              ,value: check[0].value
              ,othis: reElem
            });
          });
        }
        
        checks.each(function(index, check){
          var othis = $(this), skin = othis.attr('lay-skin')
          ,text = (othis.attr('lay-text')||'').split('|'), disabled = this.disabled;
          if(skin === 'switch') skin = '_'+skin;
          var RE_CLASS = CLASS[skin] || CLASS.checkbox;
          
          if(typeof othis.attr('lay-ignore') === 'string') return othis.show();
          
          //替代元素
          var hasRender = othis.next('.' + RE_CLASS[0]);
          var reElem = $(['<div class="layui-unselect '+ RE_CLASS[0] + (
            check.checked ? (' '+RE_CLASS[1]) : '') + (disabled ? ' layui-checkbox-disbaled '+DISABLED : '') +'" lay-skin="'+ (skin||'') +'">'
          ,{
            _switch: '<em>'+ ((check.checked ? text[0] : text[1])||'') +'</em><i></i>'
          }[skin] || ((check.title.replace(/\s/g, '') ? ('<span>'+ check.title +'</span>') : '') +'<i class="layui-icon">'+ (skin ? '&#xe605;' : '&#xe618;') +'</i>')
          ,'</div>'].join(''));

          hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
          othis.after(reElem);
          events.call(this, reElem, RE_CLASS);
        });
      }
      //单选框
      ,radio: function(){
        var CLASS = 'layui-form-radio', ICON = ['&#xe643;', '&#xe63f;']
        ,radios = $(ELEM).find('input[type=radio]')
        
        ,events = function(reElem){
          var radio = $(this), ANIM = 'layui-anim-scaleSpring';
          
          reElem.on('click', function(){
            var name = radio[0].name, forms = radio.parents(ELEM);
            var filter = radio.attr('lay-filter'); //获取过滤器
            var sameRadio = forms.find('input[name='+ name.replace(/(\.|#|\[|\])/g, '\\$1') +']'); //找到相同name的兄弟
            
            if(radio[0].disabled) return;
            
            layui.each(sameRadio, function(){
              var next = $(this).next('.'+CLASS);
              this.checked = false;
              next.removeClass(CLASS+'ed');
              next.find('.layui-icon').removeClass(ANIM).html(ICON[1]);
            });
            
            radio[0].checked = true;
            reElem.addClass(CLASS+'ed');
            reElem.find('.layui-icon').addClass(ANIM).html(ICON[0]);
            
            layui.event.call(radio[0], MOD_NAME, 'radio('+ filter +')', {
              elem: radio[0]
              ,value: radio[0].value
              ,othis: reElem
            });
          });
        };
        
        radios.each(function(index, radio){
          var othis = $(this), hasRender = othis.next('.' + CLASS), disabled = this.disabled;
          
          if(typeof othis.attr('lay-ignore') === 'string') return othis.show();
          
          //替代元素
          var reElem = $(['<div class="layui-unselect '+ CLASS + (radio.checked ? (' '+CLASS+'ed') : '') + (disabled ? ' layui-radio-disbaled '+DISABLED : '') +'">'
          ,'<i class="layui-anim layui-icon">'+ ICON[radio.checked ? 0 : 1] +'</i>'
          ,'<span>'+ (radio.title||'未命名') +'</span>'
          ,'</div>'].join(''));
          
          hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
          othis.after(reElem);
          events.call(this, reElem);
        });
      }
    };
    type ? (
      items[type] ? items[type]() : hint.error('不支持的'+ type + '表单渲染')
    ) : layui.each(items, function(index, item){
      item();
    });
    return that;
  };

    //表单校验
  Form.prototype.validate = function (elem) {
    var verify = this.config.verify, stop = null
    ,DANGER = 'layui-form-danger',verifyElem = $(elem).find('*[lay-verify]'); //获取需要校验的元素

    //开始校验
    layui.each(verifyElem, function(_, item){
      var othis = $(this), ver = othis.attr('lay-verify').split('|');
      var tips = '', value = othis.val();
      var rthis = othis, fthis = othis;
      if (othis.is('select:not([lay-ignore])')) {
        rthis = othis.next().find('input');
        fthis = rthis;
      } else if (othis.is('input[type=file]')) {
        value = othis.attr('data-value') || ''; //解决file验证问题
        rthis = othis.closest('.layui-upload-button');
      }
      rthis.removeClass(DANGER);
      //跳过隐藏的
      if (rthis.is(':hidden')) return;

      layui.each(ver, function(_, thisVer){
        var isFn = typeof verify[thisVer] === 'function';
        if(verify[thisVer] && (isFn ? tips = verify[thisVer](value, item) : !verify[thisVer][0].test(value)) ){
          layer.msg(tips || verify[thisVer][1], {
            icon: 5
            ,shift: 6
          });
          //非移动设备自动定位焦点
          if(!device.android && !device.ios){
            fthis.focus();
          }
          rthis.addClass(DANGER);
          return stop = true;
        }
      });
      if(stop) return stop;
    });
    
    if(stop) return false;
  };
  

  var isArray = Array.isArray || function(obj) {
      return ({}).toString.call(obj) === '[object Array]';
  };
  
  //表单提交校验
  var submit = function(){
    var button = $(this), DANGER = 'layui-form-danger'
    , field = {} ,elem = button.parents(ELEM)
    ,formElem = button.parents('form')[0] //获取当前所在的form元素，如果存在的话
    ,fieldElem = elem.find('input,select,textarea') //获取所有表单域
    ,filter = button.attr('lay-filter'); //获取过滤器
 
    if(form.validate(elem) === false) return false;
    
    layui.each(fieldElem, function(_, item){
      if(!item.name) return;
      if(/^checkbox|radio$/.test(item.type) && !item.checked) return;
      field[item.name] = field[item.name] === undefined ? item.value
          : isArray(field[item.name]) ? field[item.name].concat(item.value)
          : [field[item.name, item.value]];

    });
 
    //获取字段
    return layui.event.call(this, MOD_NAME, 'submit('+ filter +')', {
      elem: this
      ,form: formElem
      ,field: field
    });
  };

  //自动完成渲染
  var form = new Form(), dom = $(document);
  form.render();
  
  //表单reset重置渲染
  dom.on('reset', ELEM, function(){
    setTimeout(function(){
      form.render();
    }, 50);
  });
  
  //表单提交事件
  dom.on('submit', ELEM, submit)
  .on('click', '*[lay-submit]', submit);
  
  exports(MOD_NAME, function(options){
    return form.set(options);
  });
});

 
/**

 @Name：layui.tree 树组件
 @Author：贤心
 @License：MIT
    
 */
 
 
layui.define('jquery', function(exports){
  "use strict";
  
  var $ = layui.jquery;
  var hint = layui.hint();
  
  var enterSkin = 'layui-tree-enter', Tree = function(options){
    this.options = options;
  };
  
  //图标
  var icon = {
    arrow: ['&#xe623;', '&#xe625;'] //箭头
    ,checkbox: ['&#xe626;', '&#xe627;'] //复选框
    ,radio: ['&#xe62b;', '&#xe62a;'] //单选框
    ,branch: ['&#xe622;', '&#xe624;'] //父节点
    ,leaf: '&#xe621;' //叶节点
  };
  
  //初始化
  Tree.prototype.init = function(elem){
    var that = this;
    elem.addClass('layui-box layui-tree'); //添加tree样式
    if(that.options.skin){
      elem.addClass('layui-tree-skin-'+ that.options.skin);
    }
    that.tree(elem);
    that.on(elem);
  };
  
  //树节点解析
  Tree.prototype.tree = function(elem, children){
    var that = this, options = that.options
    var nodes = children || options.nodes;
    
    layui.each(nodes, function(index, item){
      var hasChild = item.children && item.children.length > 0;
      var ul = $('<ul class="'+ (item.spread ? "layui-show" : "") +'"></ul>');
      var li = $(['<li '+ (item.spread ? 'data-spread="'+ item.spread +'"' : '') +'>'
        //展开箭头
        ,function(){
          return hasChild ? '<i class="layui-icon layui-tree-spread">'+ (
            item.spread ? icon.arrow[1] : icon.arrow[0]
          ) +'</i>' : '';
        }()
        
        //复选框/单选框
        ,function(){
          return options.check ? (
            '<i class="layui-icon layui-tree-check">'+ (
              options.check === 'checkbox' ? icon.checkbox[0] : (
                options.check === 'radio' ? icon.radio[0] : ''
              )
            ) +'</i>'
          ) : '';
        }()
        
        //节点
        ,function(){
          return '<a href="'+ (item.href || 'javascript:;') +'" '+ (
            options.target && item.href ? 'target=\"'+ options.target +'\"' : ''
          ) +'>'
          + ('<i class="layui-icon layui-tree-'+ (hasChild ? "branch" : "leaf") +'">'+ (
            hasChild ? (
              item.spread ? icon.branch[1] : icon.branch[0]
            ) : icon.leaf
          ) +'</i>') //节点图标
          + ('<cite>'+ (item.name||'未命名') +'</cite></a>');
        }()
      
      ,'</li>'].join(''));
      
      //如果有子节点，则递归继续生成树
      if(hasChild){
        li.append(ul);
        that.tree(ul, item.children);
      }
      
      elem.append(li);
      
      //触发点击节点回调
      typeof options.click === 'function' && that.click(li, item); 
      
      //伸展节点
      that.spread(li, item);
      
      //拖拽节点
      options.drag && that.drag(li, item); 
    });
  };
  
  //点击节点回调
  Tree.prototype.click = function(elem, item){
    var that = this, options = that.options;
    elem.children('a').on('click', function(e){
      layui.stope(e);
      options.click(item)
    });
  };
  
  //伸展节点
  Tree.prototype.spread = function(elem, item){
    var that = this, options = that.options;
    var arrow = elem.children('.layui-tree-spread')
    var ul = elem.children('ul'), a = elem.children('a');
    
    //执行伸展
    var open = function(){
      if(elem.data('spread')){
        elem.data('spread', null)
        ul.removeClass('layui-show');
        arrow.html(icon.arrow[0]);
        a.find('.layui-icon').html(icon.branch[0]);
      } else {
        elem.data('spread', true);
        ul.addClass('layui-show');
        arrow.html(icon.arrow[1]);
        a.find('.layui-icon').html(icon.branch[1]);
      }
    };
    
    //如果没有子节点，则不执行
    if(!ul[0]) return;
    
    arrow.on('click', open);
    a.on('dblclick', open);
  }
  
  //通用事件
  Tree.prototype.on = function(elem){
    var that = this, options = that.options;
    var dragStr = 'layui-tree-drag';
    
    //屏蔽选中文字
    elem.find('i').on('selectstart', function(e){
      return false
    });
    
    //拖拽
    if(options.drag){
      $(document).on('mousemove', function(e){
        var move = that.move;
        if(move.from){
          var to = move.to, treeMove = $('<div class="layui-box '+ dragStr +'"></div>');
          e.preventDefault();
          $('.' + dragStr)[0] || $('body').append(treeMove);
          var dragElem = $('.' + dragStr)[0] ? $('.' + dragStr) : treeMove;
          (dragElem).addClass('layui-show').html(move.from.elem.children('a').html());
          dragElem.css({
            left: e.pageX + 10
            ,top: e.pageY + 10
          })
        }
      }).on('mouseup', function(){
        var move = that.move;
        if(move.from){
          move.from.elem.children('a').removeClass(enterSkin);
          move.to && move.to.elem.children('a').removeClass(enterSkin);
          that.move = {};
          $('.' + dragStr).remove();
        }
      });
    }
  };
    
  //拖拽节点
  Tree.prototype.move = {};
  Tree.prototype.drag = function(elem, item){
    var that = this, options = that.options;
    var a = elem.children('a'), mouseenter = function(){
      var othis = $(this), move = that.move;
      if(move.from){
        move.to = {
          item: item
          ,elem: elem
        };
        othis.addClass(enterSkin);
      }
    };
    a.on('mousedown', function(){
      var move = that.move
      move.from = {
        item: item
        ,elem: elem
      };
    });
    a.on('mouseenter', mouseenter).on('mousemove', mouseenter)
    .on('mouseleave', function(){
      var othis = $(this), move = that.move;
      if(move.from){
        delete move.to;
        othis.removeClass(enterSkin);
      }
    });
  };
  
  //暴露接口
  exports('tree', function(options){
    var tree = new Tree(options = options || {});
    var elem = $(options.elem);
    if(!elem[0]){
      return hint.error('layui.tree 没有找到'+ options.elem +'元素');
    }
    tree.init(elem);
  });
});
/**

 @Name：layui.util 工具集
 @Author：贤心
 @License：MIT
    
*/

layui.define('jquery', function(exports){
  "use strict";
  
  var $ = layui.jquery
  
  ,util = {
    //固定块
    fixbar: function(options){  
      options = options || {};
      options.bgcolor = options.bgcolor ? ('background-color:' + options.bgcolor) : '';

      var TOP_BAR = 'layui-fixbar-top', timer, is, icon = [
        options.bar1 === true ? '&#xe606;' : options.bar1 //bar1 - 信息图标
        ,options.bar2 === true ? '&#xe607;' : options.bar2 //bar2 - 问号图标
        ,'&#xe604;' //置顶
      ]
      
      ,dom = $(['<ul class="layui-fixbar">'
        ,options.bar1 ? '<li class="layui-icon" lay-type="bar1" style="'+ options.bgcolor +'">'+ icon[0] +'</li>' : ''
        ,options.bar2 ? '<li class="layui-icon" lay-type="bar2" style="'+ options.bgcolor +'">'+ icon[1] +'</li>' : ''
        ,'<li class="layui-icon '+ TOP_BAR +'" lay-type="top" style="'+ options.bgcolor +'">'+ icon[2] +'</li>'
      ,'</ul>'].join(''))
      
      ,topbar = dom.find('.'+TOP_BAR)
      
      ,scroll = function(){
        var stop = $(document).scrollTop();
        if(stop >= (options.showHeight || 200)){
          is || (topbar.show(), is = 1);
        } else {
          is && (topbar.hide(), is = 0);
        }
      };
      
      if($('.layui-fixbar')[0]) return;
      typeof options.css === 'object' && (dom.css(options.css));
      $('body').append(dom), scroll();
      
      //bar点击事件
      dom.find('li').on('click', function(){
        var othis = $(this), type = othis.attr('lay-type');
        if(type === 'top'){
          $('html,body').animate({
            scrollTop : 0
          }, 200);;
        }
        options.click && options.click.call(this, type);
      });
      
      //Top显示控制
      $(document).on('scroll', function(){
        if(timer) clearTimeout(timer);
        timer = setTimeout(function(){
          scroll();
        }, 100);
      });
    }
  };
  
  exports('util', util);
});/**

 @Name：layui.layedit 富文本编辑器
 @Author：贤心
 @License：MIT
    
 */
 
layui.define(['layer', 'form'], function(exports){
  "use strict";
  
  var $ = layui.jquery
  ,layer = layui.layer
  ,form = layui.form()
  ,hint = layui.hint()
  ,device = layui.device()
  
  ,MOD_NAME = 'layedit', THIS = 'layui-this', SHOW = 'layui-show', ABLED = 'layui-disabled'
  
  ,Edit = function(){
    var that = this;
    that.index = 0;
    
    //全局配置
    that.config = {
      //默认工具bar
      tool: [
        'strong', 'italic', 'underline', 'del'
        ,'|'
        ,'left', 'center', 'right'
        ,'|'
        ,'link', 'unlink', 'face', 'image'
      ]
      ,hideTool: []
      ,height: 280 //默认高
    };
  };
  
  //全局设置
  Edit.prototype.set = function(options){
    var that = this;
    $.extend(true, that.config, options);
    return that;
  };
  
  //事件监听
  Edit.prototype.on = function(events, callback){
    return layui.onevent(MOD_NAME, events, callback);
  };
  
  //建立编辑器
  Edit.prototype.build = function(id, settings){
    settings = settings || {};
    
    var that = this
    ,config = that.config
    ,ELEM = 'layui-layedit', textArea = $('#'+id)
    ,name =  'LAY_layedit_'+ (++that.index)
    ,haveBuild = textArea.next('.'+ELEM)
    
    ,set = $.extend({}, config, settings)
    
    ,tool = function(){
      var node = [], hideTools = {};
      layui.each(set.hideTool, function(_, item){
        hideTools[item] = true;
      });
      layui.each(set.tool, function(_, item){
        if(tools[item] && !hideTools[item]){
          node.push(tools[item]);
        }
      });
      return node.join('');
    }()
 
    
    ,editor = $(['<div class="'+ ELEM +'">'
      ,'<div class="layui-unselect layui-layedit-tool">'+ tool +'</div>'
      ,'<div class="layui-layedit-iframe">'
        ,'<iframe id="'+ name +'" name="'+ name +'" textarea="'+ id +'" frameborder="0"></iframe>'
      ,'</div>'
    ,'</div>'].join(''))
    
    //编辑器不兼容ie8以下
    if(device.ie && device.ie < 8){
      return textArea.removeClass('layui-hide').addClass(SHOW);
    }

    haveBuild[0] && (haveBuild.remove());

    setIframe.call(that, editor, textArea[0], set)
    textArea.addClass('layui-hide').after(editor);

    return that.index;
  };
  
  //获得编辑器中内容
  Edit.prototype.getContent = function(index){
    var iframeWin = getWin(index);
    if(!iframeWin[0]) return;
    return toLower(iframeWin[0].document.body.innerHTML);
  };
  
  //获得编辑器中纯文本内容
  Edit.prototype.getText = function(index){
    var iframeWin = getWin(index);
    if(!iframeWin[0]) return;
    return $(iframeWin[0].document.body).text();
  };
  /**
   * 设置编辑器内容
   * @param {[type]} index   编辑器索引
   * @param {[type]} content 要设置的内容
   * @param {[type]} flag    是否追加模式
   */
  Edit.prototype.setContent = function(index, content, flag){
    var iframeWin = getWin(index);
    if(!iframeWin[0]) return;
    if(flag){
      $(iframeWin[0].document.body).append(content)
    }else{
      $(iframeWin[0].document.body).html(content)
    };
    layedit.sync(index)
  };
  //将编辑器内容同步到textarea（一般用于异步提交时）
  Edit.prototype.sync = function(index){
    var iframeWin = getWin(index);
    if(!iframeWin[0]) return;
    var textarea = $('#'+iframeWin[1].attr('textarea'));
    textarea.val(toLower(iframeWin[0].document.body.innerHTML));
  };
  
  //获取编辑器选中内容
  Edit.prototype.getSelection = function(index){
    var iframeWin = getWin(index);
    if(!iframeWin[0]) return;
    var range = Range(iframeWin[0].document);
    return document.selection ? range.text : range.toString();
  };

  //iframe初始化
  var setIframe = function(editor, textArea, set){
    var that = this, iframe = editor.find('iframe');

    iframe.css({
      height: set.height
    }).on('load', function(){
      var conts = iframe.contents()
      ,iframeWin = iframe.prop('contentWindow')
      ,head = conts.find('head')
      ,style = $(['<style>'
        ,'*{margin: 0; padding: 0;}'
        ,'body{padding: 10px; line-height: 20px; overflow-x: hidden; word-wrap: break-word; font: 14px Helvetica Neue,Helvetica,PingFang SC,Microsoft YaHei,Tahoma,Arial,sans-serif; -webkit-box-sizing: border-box !important; -moz-box-sizing: border-box !important; box-sizing: border-box !important;}'
        ,'a{color:#01AAED; text-decoration:none;}a:hover{color:#c00}'
        ,'p{margin-bottom: 10px;}'
        ,'img{display: inline-block; border: none; vertical-align: middle;}'
        ,'pre{margin: 10px 0; padding: 10px; line-height: 20px; border: 1px solid #ddd; border-left-width: 6px; background-color: #F2F2F2; color: #333; font-family: Courier New; font-size: 12px;}'
      ,'</style>'].join(''))
      ,body = conts.find('body');
      
      head.append(style);
      body.attr('contenteditable', 'true').css({
        'min-height': set.height
      }).html(textArea.value||'');

      hotkey.apply(that, [iframeWin, iframe, textArea, set]); //快捷键处理
      toolActive.call(that, iframeWin, editor, set); //触发工具

    });
  }
  
  //获得iframe窗口对象
  ,getWin = function(index){
    var iframe = $('#LAY_layedit_'+ index)
    ,iframeWin = iframe.prop('contentWindow');
    return [iframeWin, iframe];
  }
  
  //IE8下将标签处理成小写
  ,toLower = function(html){
    if(device.ie == 8){
      html = html.replace(/<.+>/g, function(str){
        return str.toLowerCase();
      });
    }
    return html;
  }
  
  //快捷键处理
  ,hotkey = function(iframeWin, iframe, textArea, set){
    var iframeDOM = iframeWin.document, body = $(iframeDOM.body);
    body.on('keydown', function(e){
      var keycode = e.keyCode;
      //处理回车
      if(keycode === 13){
        var range = Range(iframeDOM);
        var container = getContainer(range)
        ,parentNode = container.parentNode;
        
        if(parentNode.tagName.toLowerCase() === 'pre'){
          if(e.shiftKey) return
          layer.msg('请暂时用shift+enter');
          return false;
        }
        iframeDOM.execCommand('formatBlock', false, '<p>');
      }
    });
    
    //给textarea同步内容
    $(textArea).parents('form').on('submit', function(){
      var html = body.html();
      //IE8下将标签处理成小写
      if(device.ie == 8){
        html = html.replace(/<.+>/g, function(str){
          return str.toLowerCase();
        });
      }
      textArea.value = html;
    });
    
    //处理粘贴
    body.on('paste', function(e){
      iframeDOM.execCommand('formatBlock', false, '<p>');
      setTimeout(function(){
        filter.call(iframeWin, body);
        textArea.value = body.html();
      }, 100); 
    });
  }
  
  //标签过滤
  ,filter = function(body){
    var iframeWin = this
    ,iframeDOM = iframeWin.document;
    
    //清除影响版面的css属性
    body.find('*[style]').each(function(){
      var textAlign = this.style.textAlign;
      this.removeAttribute('style');
      $(this).css({
        'text-align': textAlign || ''
      })
    });
    
    //修饰表格
    body.find('table').addClass('layui-table');
    
    //移除不安全的标签
    body.find('script,link').remove();
  }
  
  //Range对象兼容性处理
  ,Range = function(iframeDOM){
    return iframeDOM.selection 
      ? iframeDOM.selection.createRange()
    : iframeDOM.getSelection().getRangeAt(0);
  }
  
  //当前Range对象的endContainer兼容性处理
  ,getContainer = function(range){
    return range.endContainer || range.parentElement().childNodes[0]
  }
  
  //在选区插入内联元素
  ,insertInline = function(tagName, attr, range){
    var iframeDOM = this.document
    ,elem = document.createElement(tagName)
    for(var key in attr){
      elem.setAttribute(key, attr[key]);
    }
    elem.removeAttribute('text');

    if(iframeDOM.selection){ //IE
      var text = range.text || attr.text;
      if(tagName === 'a' && !text) return;
      if(text){
        elem.innerHTML = text;
      }
      range.pasteHTML($(elem).prop('outerHTML')); 
      range.select();
    } else { //非IE
      var text = range.toString() || attr.text;
      if(tagName === 'a' && !text) return;
      if(text){
        elem.innerHTML = text;
      }
      range.deleteContents();
      range.insertNode(elem);
    }
  }
  
  //工具选中
  ,toolCheck = function(tools, othis){
    var iframeDOM = this.document
    ,CHECK = 'layedit-tool-active'
    ,container = getContainer(Range(iframeDOM))
    ,item = function(type){
      return tools.find('.layedit-tool-'+type)
    }

    if(othis){
      othis[othis.hasClass(CHECK) ? 'removeClass' : 'addClass'](CHECK);
    }
    
    tools.find('>i').removeClass(CHECK);
    item('unlink').addClass(ABLED);

    $(container).parents().each(function(){
      var tagName = this.tagName.toLowerCase()
      ,textAlign = this.style.textAlign;

      //文字
      if(tagName === 'b' || tagName === 'strong'){
        item('b').addClass(CHECK)
      }
      if(tagName === 'i' || tagName === 'em'){
        item('i').addClass(CHECK)
      }
      if(tagName === 'u'){
        item('u').addClass(CHECK)
      }
      if(tagName === 'strike'){
        item('d').addClass(CHECK)
      }
      
      //对齐
      if(tagName === 'p'){
        if(textAlign === 'center'){
          item('center').addClass(CHECK);
        } else if(textAlign === 'right'){
          item('right').addClass(CHECK);
        } else {
          item('left').addClass(CHECK);
        }
      }
      
      //超链接
      if(tagName === 'a'){
        item('link').addClass(CHECK);
        item('unlink').removeClass(ABLED);
      }
    });
  }

  //触发工具
  ,toolActive = function(iframeWin, editor, set){
    var iframeDOM = iframeWin.document
    ,body = $(iframeDOM.body)
    ,toolEvent = {
      //超链接
      link: function(range){
        var container = getContainer(range)
        ,parentNode = $(container).parent();
        
        link.call(body, {
          href: parentNode.attr('href')
          ,target: parentNode.attr('target')
        }, function(field){
          var parent = parentNode[0];
          if(parent.tagName === 'A'){
            parent.href = field.url;
          } else {
            insertInline.call(iframeWin, 'a', {
              target: field.target
              ,href: field.url
              ,text: field.url
            }, range);
          }
        });
      }
      //清除超链接
      ,unlink: function(range){
        iframeDOM.execCommand('unlink');
      }
      //表情
      ,face: function(range){
        face.call(this, function(img){
          insertInline.call(iframeWin, 'img', {
            src: img.src
            ,alt: img.alt
          }, range);
        });
      }
      //图片
      ,image: function(range){
        var that = this;
        layui.use('upload', function(upload){
          var uploadImage = set.uploadImage || {};
          upload({
            url: uploadImage.url
            ,method: uploadImage.type
            ,elem: $(that).find('input')[0]
            ,unwrap: true
            ,success: function(res){
              if(res.code == 0){
                res.data = res.data || {};
                insertInline.call(iframeWin, 'img', {
                  src: res.data.src
                  ,alt: res.data.title
                }, range);
              } else {
                layer.msg(res.msg||'上传失败');
              }
            }
          });
        });
      }
      //插入代码
      ,code: function(range){
        code.call(body, function(pre){
          insertInline.call(iframeWin, 'pre', {
            text: pre.code
            ,'lay-lang': pre.lang
          }, range);
        });
      }
      //帮助
      ,help: function(){
        layer.open({
          type: 2
          ,title: '帮助'
          ,area: ['600px', '380px']
          ,shadeClose: true
          ,shade: 0.1
          ,skin: 'layui-layer-msg'
          ,content: ['http://www.layui.com/about/layedit/help.html', 'no']
        });
      }
    }
    ,tools = editor.find('.layui-layedit-tool')
    
    ,click = function(){
      var othis = $(this)
      ,events = othis.attr('layedit-event')
      ,command = othis.attr('lay-command');
      
      if(othis.hasClass(ABLED)) return;

      body.focus();
      
      var range = Range(iframeDOM)
      ,container = range.commonAncestorContainer
      
      if(command){
        iframeDOM.execCommand(command);
        if(/justifyLeft|justifyCenter|justifyRight/.test(command)){
          iframeDOM.execCommand('formatBlock', false, '<p>');
        }
        setTimeout(function(){
          body.focus();
        }, 10);
      } else {
        toolEvent[events] && toolEvent[events].call(this, range);
      }
      toolCheck.call(iframeWin, tools, othis);
    }
    
    ,isClick = /image/

    tools.find('>i').on('mousedown', function(){
      var othis = $(this)
      ,events = othis.attr('layedit-event');
      if(isClick.test(events)) return;
      click.call(this)
    }).on('click', function(){
      var othis = $(this)
      ,events = othis.attr('layedit-event');
      if(!isClick.test(events)) return;
      click.call(this)
    });
    
    //触发内容区域
    body.on('click', function(){
      toolCheck.call(iframeWin, tools);
      layer.close(face.index);
    });
  }
  
  //超链接面板
  ,link = function(options, callback){
    var body = this, index = layer.open({
      type: 1
      ,id: 'LAY_layedit_link'
      ,area: '350px'
      ,shade: 0.05
      ,shadeClose: true
      ,moveType: 1
      ,title: '超链接'
      ,skin: 'layui-layer-msg'
      ,content: ['<ul class="layui-form" style="margin: 15px;">'
        ,'<li class="layui-form-item">'
          ,'<label class="layui-form-label" style="width: 60px;">URL</label>'
          ,'<div class="layui-input-block" style="margin-left: 90px">'
            ,'<input name="url" lay-verify="url" value="'+ (options.href||'') +'" autofocus="true" autocomplete="off" class="layui-input">'
            ,'</div>'
        ,'</li>'
        ,'<li class="layui-form-item">'
          ,'<label class="layui-form-label" style="width: 60px;">打开方式</label>'
          ,'<div class="layui-input-block" style="margin-left: 90px">'
            ,'<input type="radio" name="target" value="_self" class="layui-input" title="当前窗口"'
            + ((options.target==='_self' || !options.target) ? 'checked' : '') +'>'
            ,'<input type="radio" name="target" value="_blank" class="layui-input" title="新窗口" '
            + (options.target==='_blank' ? 'checked' : '') +'>'
          ,'</div>'
        ,'</li>'
        ,'<li class="layui-form-item" style="text-align: center;">'
          ,'<button type="button" lay-submit lay-filter="layedit-link-yes" class="layui-btn"> 确定 </button>'
          ,'<button style="margin-left: 20px;" type="button" class="layui-btn layui-btn-primary"> 取消 </button>'
        ,'</li>'
      ,'</ul>'].join('')
      ,success: function(layero, index){
        var eventFilter = 'submit(layedit-link-yes)';
        form.render('radio');  
        layero.find('.layui-btn-primary').on('click', function(){
          layer.close(index);
          body.focus();
        });
        form.on(eventFilter, function(data){
          layer.close(link.index);
          callback && callback(data.field);
        });
      }
    });
    link.index = index;
  }
  
  //表情面板
  ,face = function(callback){
    //表情库
    var faces = function(){
      var alt = ["[微笑]", "[嘻嘻]", "[哈哈]", "[可爱]", "[可怜]", "[挖鼻]", "[吃惊]", "[害羞]", "[挤眼]", "[闭嘴]", "[鄙视]", "[爱你]", "[泪]", "[偷笑]", "[亲亲]", "[生病]", "[太开心]", "[白眼]", "[右哼哼]", "[左哼哼]", "[嘘]", "[衰]", "[委屈]", "[吐]", "[哈欠]", "[抱抱]", "[怒]", "[疑问]", "[馋嘴]", "[拜拜]", "[思考]", "[汗]", "[困]", "[睡]", "[钱]", "[失望]", "[酷]", "[色]", "[哼]", "[鼓掌]", "[晕]", "[悲伤]", "[抓狂]", "[黑线]", "[阴险]", "[怒骂]", "[互粉]", "[心]", "[伤心]", "[猪头]", "[熊猫]", "[兔子]", "[ok]", "[耶]", "[good]", "[NO]", "[赞]", "[来]", "[弱]", "[草泥马]", "[神马]", "[囧]", "[浮云]", "[给力]", "[围观]", "[威武]", "[奥特曼]", "[礼物]", "[钟]", "[话筒]", "[蜡烛]", "[蛋糕]"], arr = {};
      layui.each(alt, function(index, item){
        arr[item] = layui.cache.dir + 'images/face/'+ index + '.gif';
      });
      return arr;
    }();
    face.hide = face.hide || function(e){
      if($(e.target).attr('layedit-event') !== 'face'){
        layer.close(face.index);
      }
    }
    return face.index = layer.tips(function(){
      var content = [];
      layui.each(faces, function(key, item){
        content.push('<li title="'+ key +'"><img src="'+ item +'" alt="'+ key +'"></li>');
      });
      return '<ul class="layui-clear">' + content.join('') + '</ul>';
    }(), this, {
      tips: 1
      ,time: 0
      ,skin: 'layui-box layui-util-face'
      ,maxWidth: 500
      ,success: function(layero, index){
        layero.css({
          marginTop: -4
          ,marginLeft: -10
        }).find('.layui-clear>li').on('click', function(){
          callback && callback({
            src: faces[this.title]
            ,alt: this.title
          });
          layer.close(index);
        });
        $(document).off('click', face.hide).on('click', face.hide);
      }
    });
  }
  
  //插入代码面板
  ,code = function(callback){
    var body = this, index = layer.open({
      type: 1
      ,id: 'LAY_layedit_code'
      ,area: '550px'
      ,shade: 0.05
      ,shadeClose: true
      ,moveType: 1
      ,title: '插入代码'
      ,skin: 'layui-layer-msg'
      ,content: ['<ul class="layui-form layui-form-pane" style="margin: 15px;">'
        ,'<li class="layui-form-item">'
          ,'<label class="layui-form-label">请选择语言</label>'
          ,'<div class="layui-input-block">'
            ,'<select name="lang">'
              ,'<option value="JavaScript">JavaScript</option>'
              ,'<option value="HTML">HTML</option>'
              ,'<option value="CSS">CSS</option>'
              ,'<option value="Java">Java</option>'
              ,'<option value="PHP">PHP</option>'
              ,'<option value="C#">C#</option>'
              ,'<option value="Python">Python</option>'
              ,'<option value="Ruby">Ruby</option>'
              ,'<option value="Go">Go</option>'
            ,'</select>'
          ,'</div>'
        ,'</li>'
        ,'<li class="layui-form-item layui-form-text">'
          ,'<label class="layui-form-label">代码</label>'
          ,'<div class="layui-input-block">'
            ,'<textarea name="code" lay-verify="required" autofocus="true" class="layui-textarea" style="height: 200px;"></textarea>'
          ,'</div>'
        ,'</li>'
        ,'<li class="layui-form-item" style="text-align: center;">'
          ,'<button type="button" lay-submit lay-filter="layedit-code-yes" class="layui-btn"> 确定 </button>'
          ,'<button style="margin-left: 20px;" type="button" class="layui-btn layui-btn-primary"> 取消 </button>'
        ,'</li>'
      ,'</ul>'].join('')
      ,success: function(layero, index){
        var eventFilter = 'submit(layedit-code-yes)';
        form.render('select');  
        layero.find('.layui-btn-primary').on('click', function(){
          layer.close(index);
          body.focus();
        });
        form.on(eventFilter, function(data){
          layer.close(code.index);
          callback && callback(data.field);
        });
      }
    });
    code.index = index;
  }
  
  //全部工具
  ,tools = {
    html: '<i class="layui-icon layedit-tool-html" title="HTML源代码" lay-command="html" layedit-event="html"">&#xe64b;</i><span class="layedit-tool-mid"></span>'
    ,strong: '<i class="layui-icon layedit-tool-b" title="加粗" lay-command="Bold" layedit-event="b"">&#xe62b;</i>'
    ,italic: '<i class="layui-icon layedit-tool-i" title="斜体" lay-command="italic" layedit-event="i"">&#xe644;</i>'
    ,underline: '<i class="layui-icon layedit-tool-u" title="下划线" lay-command="underline" layedit-event="u"">&#xe646;</i>'
    ,del: '<i class="layui-icon layedit-tool-d" title="删除线" lay-command="strikeThrough" layedit-event="d"">&#xe64f;</i>'
    
    ,'|': '<span class="layedit-tool-mid"></span>'
    
    ,left: '<i class="layui-icon layedit-tool-left" title="左对齐" lay-command="justifyLeft" layedit-event="left"">&#xe649;</i>'
    ,center: '<i class="layui-icon layedit-tool-center" title="居中对齐" lay-command="justifyCenter" layedit-event="center"">&#xe647;</i>'
    ,right: '<i class="layui-icon layedit-tool-right" title="右对齐" lay-command="justifyRight" layedit-event="right"">&#xe648;</i>'
    ,link: '<i class="layui-icon layedit-tool-link" title="插入链接" layedit-event="link"">&#xe64c;</i>'
    ,unlink: '<i class="layui-icon layedit-tool-unlink layui-disabled" title="清除链接" lay-command="unlink" layedit-event="unlink"">&#xe64d;</i>'
    ,face: '<i class="layui-icon layedit-tool-face" title="表情" layedit-event="face"">&#xe650;</i>'
    ,image: '<i class="layui-icon layedit-tool-image" title="图片" layedit-event="image">&#xe64a;<input type="file" name="file"></i>'
    ,code: '<i class="layui-icon layedit-tool-code" title="插入代码" layedit-event="code">&#xe64e;</i>'
    
    ,help: '<i class="layui-icon layedit-tool-help" title="帮助" layedit-event="help">&#xe607;</i>'
  }
  
  ,edit = new Edit();

  exports(MOD_NAME, edit);
});
/**

 @Name：layui.code 代码修饰器
 @Author：贤心
 @License：MIT
    
 */
 
layui.define('jquery', function(exports){
  "use strict";
  
  var $ = layui.jquery;
  var about = 'http://www.layui.com/doc/modules/code.html'; //关于信息
  
  exports('code', function(options){
    var elems = [];
    options = options || {};
    options.elem = $(options.elem||'.layui-code');
    options.about = 'about' in options ? options.about : true;
    
    options.elem.each(function(){
      elems.push(this);
    });
    
    layui.each(elems.reverse(), function(index, item){
      var othis = $(item), html = othis.html();
      
      //转义HTML标签
      if(othis.attr('lay-encode') || options.encode){
        html = html.replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;')
      }
      
      othis.html('<ol class="layui-code-ol"><li>' + html.replace(/[\r\t\n]+/g, '</li><li>') + '</li></ol>')
      
      if(!othis.find('>.layui-code-h3')[0]){
        othis.prepend('<h3 class="layui-code-h3">'+ (othis.attr('lay-title')||options.title||'code') + (options.about ? '<a href="'+ about +'" target="_blank">layui.code</a>' : '') + '</h3>');
      }
      
      var ol = othis.find('>.layui-code-ol');
      othis.addClass('layui-box layui-code-view');
      
      //识别皮肤
      if(othis.attr('lay-skin') || options.skin){
        othis.addClass('layui-code-' +(othis.attr('lay-skin') || options.skin));
      }
      
      //按行数适配左边距
      if((ol.find('li').length/100|0) > 0){
        ol.css('margin-left', (ol.find('li').length/100|0) + 'px');
      }
      
      //设置最大高度
      if(othis.attr('lay-height') || options.height){
        ol.css('max-height', othis.attr('lay-height') || options.height);
      }

    });
    
  });
}).addcss('modules/code.css', 'skincodecss');