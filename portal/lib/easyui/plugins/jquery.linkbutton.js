!function(t){function n(n,e){var l=t.data(n,"linkbutton").options;if(e&&t.extend(l,e),l.width||l.height||l.fit){var i=t(n),s=i.parent(),o=i.is(":visible");if(!o){var a=t('<div style="display:none"></div>').insertBefore(n),d={position:i.css("position"),display:i.css("display"),left:i.css("left")};i.appendTo("body"),i.css({position:"absolute",display:"inline-block",left:-2e4})}i._size(l,s);var c=i.find(".l-btn-left");c.css("margin-top",0),c.css("margin-top",parseInt((i.height()-c.height())/2)+"px"),o||(i.insertAfter(a),i.css(d),a.remove())}}function e(n){var e=t.data(n,"linkbutton").options,s=t(n).empty();s.addClass("l-btn").removeClass("l-btn-plain l-btn-selected l-btn-plain-selected l-btn-outline"),s.removeClass("l-btn-small l-btn-medium l-btn-large").addClass("l-btn-"+e.size),e.plain&&s.addClass("l-btn-plain"),e.outline&&s.addClass("l-btn-outline"),e.selected&&s.addClass(e.plain?"l-btn-selected l-btn-plain-selected":"l-btn-selected"),s.attr("group",e.group||""),s.attr("id",e.id||"");var o=t('<span class="l-btn-left"></span>').appendTo(s);e.text?t('<span class="l-btn-text"></span>').html(e.text).appendTo(o):t('<span class="l-btn-text l-btn-empty">&nbsp;</span>').appendTo(o),e.iconCls&&(t('<span class="l-btn-icon">&nbsp;</span>').addClass(e.iconCls).appendTo(o),o.addClass("l-btn-icon-"+e.iconAlign)),s.unbind(".linkbutton").bind("focus.linkbutton",function(){e.disabled||t(this).addClass("l-btn-focus")}).bind("blur.linkbutton",function(){t(this).removeClass("l-btn-focus")}).bind("click.linkbutton",function(){e.disabled||(e.toggle&&(e.selected?t(this).linkbutton("unselect"):t(this).linkbutton("select")),e.onClick.call(this))}),l(n,e.selected),i(n,e.disabled)}function l(n,e){var l=t.data(n,"linkbutton").options;e?(l.group&&t('a.l-btn[group="'+l.group+'"]').each(function(){var n=t(this).linkbutton("options");n.toggle&&(t(this).removeClass("l-btn-selected l-btn-plain-selected"),n.selected=!1)}),t(n).addClass(l.plain?"l-btn-selected l-btn-plain-selected":"l-btn-selected"),l.selected=!0):l.group||(t(n).removeClass("l-btn-selected l-btn-plain-selected"),l.selected=!1)}function i(n,e){var l=t.data(n,"linkbutton"),i=l.options;if(t(n).removeClass("l-btn-disabled l-btn-plain-disabled"),e){i.disabled=!0;var s=t(n).attr("href");s&&(l.href=s,t(n).attr("href","javascript:;")),n.onclick&&(l.onclick=n.onclick,n.onclick=null),i.plain?t(n).addClass("l-btn-disabled l-btn-plain-disabled"):t(n).addClass("l-btn-disabled")}else i.disabled=!1,l.href&&t(n).attr("href",l.href),l.onclick&&(n.onclick=l.onclick)}t.fn.linkbutton=function(l,i){return"string"==typeof l?t.fn.linkbutton.methods[l](this,i):(l=l||{},this.each(function(){var i=t.data(this,"linkbutton");i?t.extend(i.options,l):(t.data(this,"linkbutton",{options:t.extend({},t.fn.linkbutton.defaults,t.fn.linkbutton.parseOptions(this),l)}),t(this).removeAttr("disabled"),t(this).bind("_resize",function(e,l){return(t(this).hasClass("easyui-fluid")||l)&&n(this),!1})),e(this),n(this)}))},t.fn.linkbutton.methods={options:function(n){return t.data(n[0],"linkbutton").options},resize:function(t,e){return t.each(function(){n(this,e)})},enable:function(t){return t.each(function(){i(this,!1)})},disable:function(t){return t.each(function(){i(this,!0)})},select:function(t){return t.each(function(){l(this,!0)})},unselect:function(t){return t.each(function(){l(this,!1)})}},t.fn.linkbutton.parseOptions=function(n){var e=t(n);return t.extend({},t.parser.parseOptions(n,["id","iconCls","iconAlign","group","size","text",{plain:"boolean",toggle:"boolean",selected:"boolean",outline:"boolean"}]),{disabled:!!e.attr("disabled")||void 0,text:t.trim(e.html())||void 0,iconCls:e.attr("icon")||e.attr("iconCls")})},t.fn.linkbutton.defaults={id:null,disabled:!1,toggle:!1,selected:!1,outline:!1,group:null,plain:!1,text:"",iconCls:null,iconAlign:"left",size:"small",onClick:function(){}}}(jQuery);