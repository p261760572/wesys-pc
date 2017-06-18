!function(t){function e(e){t(e).addClass("textbox-f").hide();var o=t('<span class="textbox"><input class="textbox-text" autocomplete="off"><input type="hidden" class="textbox-value"></span>').insertAfter(e),n=t(e).attr("name");return n&&(o.find("input.textbox-value").attr("name",n),t(e).removeAttr("name").attr("textboxName",n)),o}function o(e){var o=t.data(e,"textbox"),n=o.options,i=o.textbox,l="_easyui_textbox_input"+ ++b;i.addClass(n.cls),i.find(".textbox-text").remove(),n.multiline?t('<textarea id="'+l+'" class="textbox-text" autocomplete="off"></textarea>').prependTo(i):t('<input id="'+l+'" type="'+n.type+'" class="textbox-text" autocomplete="off">').prependTo(i),t("#"+l).attr("tabindex",t(e).attr("tabindex")||"").css("text-align",e.style.textAlign||""),i.find(".textbox-addon").remove();var r=n.icons?t.extend(!0,[],n.icons):[];if(n.iconCls&&r.push({iconCls:n.iconCls,disabled:!0}),r.length){var d=t('<span class="textbox-addon"></span>').prependTo(i);d.addClass("textbox-addon-"+n.iconAlign);for(var u=0;u<r.length;u++)d.append('<a href="javascript:;" class="textbox-icon '+r[u].iconCls+'" icon-index="'+u+'" tabindex="-1"></a>')}if(i.find(".textbox-button").remove(),n.buttonText||n.buttonIcon){t('<a href="javascript:;" class="textbox-button"></a>').prependTo(i).addClass("textbox-button-"+n.buttonAlign).linkbutton({text:n.buttonText,iconCls:n.buttonIcon,onClick:function(){var e=t(this).parent().prev();e.textbox("options").onClickButton.call(e[0])}})}n.label?"object"==typeof n.label?(o.label=t(n.label),o.label.attr("for",l)):(t(o.label).remove(),o.label=t('<label class="textbox-label"></label>').html(n.label),o.label.css("textAlign",n.labelAlign).attr("for",l),"after"==n.labelPosition?o.label.insertAfter(i):o.label.insertBefore(e),o.label.removeClass("textbox-label-left textbox-label-right textbox-label-top"),o.label.addClass("textbox-label-"+n.labelPosition)):t(o.label).remove(),a(e),x(e,n.disabled),s(e,n.readonly)}function n(e){var o=t.data(e,"textbox"),n=o.textbox;n.find(".textbox-text").validatebox("destroy"),n.remove(),t(o.label).remove(),t(e).remove()}function i(e,o){function n(t){return(l.iconAlign==t?c._outerWidth():0)+i(t)}function i(e){var o=0;return u.filter(".textbox-button-"+e).each(function(){o+="left"==e||"right"==e?t(this).outerWidth():t(this).outerHeight()}),o}var a=t.data(e,"textbox"),l=a.options,x=a.textbox,s=x.parent();if(o&&("object"==typeof o?t.extend(l,o):l.width=o),isNaN(parseInt(l.width))){var b=t(e).clone();b.css("visibility","hidden"),b.insertAfter(e),l.width=b.outerWidth(),b.remove()}var r=x.is(":visible");r||x.appendTo("body");var d=x.find(".textbox-text"),u=x.find(".textbox-button"),c=x.find(".textbox-addon"),f=c.find(".textbox-icon");"auto"==l.height&&d.css({margin:"",paddingTop:"",paddingBottom:"",height:"",lineHeight:""}),x._size(l,s),l.label&&l.labelPosition&&("top"==l.labelPosition?(a.label._size({width:"auto"==l.labelWidth?x.outerWidth():l.labelWidth},x),"auto"!=l.height&&x._size("height",x.outerHeight()-a.label.outerHeight())):(a.label._size({width:l.labelWidth,height:x.outerHeight()},x),l.multiline||a.label.css("lineHeight",a.label.height()+"px"),x._size("width",x.outerWidth()-a.label.outerWidth()))),"left"==l.buttonAlign||"right"==l.buttonAlign?u.linkbutton("resize",{height:x.height()}):u.linkbutton("resize",{width:"100%"});var h=x.width()-f.length*l.iconWidth-i("left")-i("right"),p="auto"==l.height?d.outerHeight():x.height()-i("top")-i("bottom");c.css(l.iconAlign,i(l.iconAlign)+"px"),c.css("top",i("top")+"px"),f.css({width:l.iconWidth+"px",height:p+"px"}),d.css({paddingLeft:e.style.paddingLeft||"",paddingRight:e.style.paddingRight||"",marginLeft:n("left"),marginRight:n("right"),marginTop:i("top"),marginBottom:i("bottom")}),l.multiline?(d.css({paddingTop:e.style.paddingTop||"",paddingBottom:e.style.paddingBottom||""}),d._outerHeight(p)):d.css({paddingTop:0,paddingBottom:0,height:p+"px",lineHeight:p+"px"}),d._outerWidth(h),l.onResizing.call(e,l.width,l.height),r||x.insertAfter(e),l.onResize.call(e,l.width,l.height)}function a(e){var o=t(e).textbox("options");t(e).textbox("textbox").validatebox(t.extend({},o,{deltaX:function(o){return t(e).textbox("getTipX",o)},deltaY:function(o){return t(e).textbox("getTipY",o)},onBeforeValidate:function(){o.onBeforeValidate.call(e);var n=t(this);n.is(":focus")||n.val()!==o.value&&(o.oldInputValue=n.val(),n.val(o.value))},onValidate:function(n){var i=t(this);void 0!=o.oldInputValue&&(i.val(o.oldInputValue),o.oldInputValue=void 0);var a=i.parent();n?a.removeClass("textbox-invalid"):a.addClass("textbox-invalid"),o.onValidate.call(e,n)}}))}function l(e){var o=t.data(e,"textbox"),n=o.options,a=o.textbox,l=a.find(".textbox-text");if(l.attr("placeholder",n.prompt),l.unbind(".textbox"),t(o.label).unbind(".textbox"),!n.disabled&&!n.readonly){o.label&&t(o.label).bind("click.textbox",function(o){n.hasFocusMe||(l.focus(),t(e).textbox("setSelectionRange",{start:0,end:l.val().length}))}),l.bind("blur.textbox",function(e){a.hasClass("textbox-focused")&&(n.value=t(this).val(),""==n.value?t(this).val(n.prompt).addClass("textbox-prompt"):t(this).removeClass("textbox-prompt"),a.removeClass("textbox-focused"))}).bind("focus.textbox",function(e){n.hasFocusMe=!0,a.hasClass("textbox-focused")||(t(this).val()!=n.value&&t(this).val(n.value),t(this).removeClass("textbox-prompt"),a.addClass("textbox-focused"))});for(var x in n.inputEvents)l.bind(x+".textbox",{target:e},n.inputEvents[x])}var s=a.find(".textbox-addon");s.unbind().bind("click",{target:e},function(o){var i=t(o.target).closest("a.textbox-icon:not(.textbox-icon-disabled)");if(i.length){var a=parseInt(i.attr("icon-index")),l=n.icons[a];l&&l.handler&&l.handler.call(i[0],o),n.onClickIcon.call(e,a)}}),s.find(".textbox-icon").each(function(e){var o=n.icons[e],i=t(this);!o||o.disabled||n.disabled||n.readonly?i.addClass("textbox-icon-disabled"):i.removeClass("textbox-icon-disabled")}),a.find(".textbox-button").linkbutton(n.disabled||n.readonly?"disable":"enable"),a.unbind(".textbox").bind("_resize.textbox",function(o,n){return(t(this).hasClass("easyui-fluid")||n)&&i(e),!1})}function x(e,o){var n=t.data(e,"textbox"),i=n.options,a=n.textbox,l=a.find(".textbox-text"),x=t(e).add(a.find(".textbox-value"));i.disabled=o,i.disabled?(l.blur(),l.validatebox("disable"),a.addClass("textbox-disabled"),x.attr("disabled","disabled"),t(n.label).addClass("textbox-label-disabled")):(l.validatebox("enable"),a.removeClass("textbox-disabled"),x.removeAttr("disabled"),t(n.label).removeClass("textbox-label-disabled"))}function s(e,o){var n=t.data(e,"textbox"),i=n.options,a=n.textbox,l=a.find(".textbox-text");i.readonly=void 0==o||o,i.readonly&&l.triggerHandler("blur.textbox"),l.validatebox("readonly",i.readonly),a.removeClass("textbox-readonly").addClass(i.readonly?"textbox-readonly":"")}var b=0;t.fn.textbox=function(n,a){if("string"==typeof n){var x=t.fn.textbox.methods[n];return x?x(this,a):this.each(function(){t(this).textbox("textbox").validatebox(n,a)})}return n=n||{},this.each(function(){var a=t.data(this,"textbox");a?(t.extend(a.options,n),void 0!=n.value&&(a.options.originalValue=n.value)):(a=t.data(this,"textbox",{options:t.extend({},t.fn.textbox.defaults,t.fn.textbox.parseOptions(this),n),textbox:e(this)}),a.options.originalValue=a.options.value),o(this),l(this),a.options.doSize&&i(this);var x=a.options.value;a.options.value="",t(this).textbox("initValue",x)})},t.fn.textbox.methods={options:function(e){return t.data(e[0],"textbox").options},cloneFrom:function(e,o){return e.each(function(){var e=t(this);if(!e.data("textbox")){t(o).data("textbox")||t(o).textbox();var n=t.extend(!0,{},t(o).textbox("options")),i=e.attr("name")||"";e.addClass("textbox-f").hide(),e.removeAttr("name").attr("textboxName",i);var x=t(o).next().clone().insertAfter(e),s="_easyui_textbox_input"+ ++b;x.find(".textbox-value").attr("name",i),x.find(".textbox-text").attr("id",s);var r=t(t(o).textbox("label")).clone();r.length&&(r.attr("for",s),"after"==n.labelPosition?r.insertAfter(e.next()):r.insertBefore(e)),t.data(this,"textbox",{options:n,textbox:x,label:r.length?r:void 0});var d=t(o).textbox("button");d.length&&e.textbox("button").linkbutton(t.extend(!0,{},d.linkbutton("options"))),l(this),a(this)}})},textbox:function(e){return t.data(e[0],"textbox").textbox.find(".textbox-text")},button:function(e){return t.data(e[0],"textbox").textbox.find(".textbox-button")},label:function(e){return t.data(e[0],"textbox").label},destroy:function(t){return t.each(function(){n(this)})},resize:function(t,e){return t.each(function(){i(this,e)})},disable:function(t){return t.each(function(){x(this,!0),l(this)})},enable:function(t){return t.each(function(){x(this,!1),l(this)})},readonly:function(t,e){return t.each(function(){s(this,e),l(this)})},isValid:function(t){return t.textbox("textbox").validatebox("isValid")},clear:function(e){return e.each(function(){t(this).textbox("setValue","")})},setText:function(e,o){return e.each(function(){var e=t(this).textbox("options"),n=t(this).textbox("textbox");o=void 0==o?"":String(o),t(this).textbox("getText")!=o&&n.val(o),e.value=o,n.is(":focus")||(o?n.removeClass("textbox-prompt"):n.val(e.prompt).addClass("textbox-prompt")),t(this).textbox("validate")})},initValue:function(e,o){return e.each(function(){var e=t.data(this,"textbox");t(this).textbox("setText",o),e.textbox.find(".textbox-value").val(o),t(this).val(o)})},setValue:function(e,o){return e.each(function(){var e=t.data(this,"textbox").options,n=t(this).textbox("getValue");t(this).textbox("initValue",o),n!=o&&(e.onChange.call(this,o,n),t(this).closest("form").trigger("_change",[this]))})},getText:function(t){var e=t.textbox("textbox");return e.is(":focus")?e.val():t.textbox("options").value},getValue:function(t){return t.data("textbox").textbox.find(".textbox-value").val()},reset:function(e){return e.each(function(){var e=t(this).textbox("options");t(this).textbox("textbox").val(e.originalValue),t(this).textbox("setValue",e.originalValue)})},getIcon:function(t,e){return t.data("textbox").textbox.find(".textbox-icon:eq("+e+")")},getTipX:function(t,e){var o=t.data("textbox"),n=o.options,i=o.textbox,a=i.find(".textbox-text"),e=e||n.tipPosition,l=i.offset(),x=a.offset(),s=i.outerWidth(),b=a.outerWidth();return"right"==e?s-b-x.left+l.left:"left"==e?l.left-x.left:(s-b-x.left+l.left)/2-(x.left-l.left)/2},getTipY:function(t,e){var o=t.data("textbox"),n=o.options,i=o.textbox,a=i.find(".textbox-text"),e=e||n.tipPosition,l=i.offset(),x=a.offset(),s=i.outerHeight(),b=a.outerHeight();return"left"==e||"right"==e?(s-b-x.top+l.top)/2-(x.top-l.top)/2:"bottom"==e?s-b-x.top+l.top:l.top-x.top},getSelectionStart:function(t){return t.textbox("getSelectionRange").start},getSelectionRange:function(t){var e=t.textbox("textbox")[0],o=0,n=0;if("number"==typeof e.selectionStart)o=e.selectionStart,n=e.selectionEnd;else if(e.createTextRange){var i=document.selection.createRange(),a=e.createTextRange();a.setEndPoint("EndToStart",i),o=a.text.length,n=o+i.text.length}return{start:o,end:n}},setSelectionRange:function(e,o){return e.each(function(){var e=t(this).textbox("textbox")[0],n=o.start,i=o.end;if(e.setSelectionRange)e.setSelectionRange(n,i);else if(e.createTextRange){var a=e.createTextRange();a.collapse(),a.moveEnd("character",i),a.moveStart("character",n),a.select()}})}},t.fn.textbox.parseOptions=function(e){var o=t(e);return t.extend({},t.fn.validatebox.parseOptions(e),t.parser.parseOptions(e,["prompt","iconCls","iconAlign","buttonText","buttonIcon","buttonAlign","label","labelPosition","labelAlign",{multiline:"boolean",iconWidth:"number",labelWidth:"number"}]),{value:o.val()||void 0,type:o.attr("type")?o.attr("type"):void 0})},t.fn.textbox.defaults=t.extend({},t.fn.validatebox.defaults,{doSize:!0,width:"auto",height:"auto",cls:null,prompt:"",value:"",type:"text",multiline:!1,icons:[],iconCls:null,iconAlign:"right",iconWidth:18,buttonText:"",buttonIcon:null,buttonAlign:"right",label:null,labelWidth:"auto",labelPosition:"before",labelAlign:"left",inputEvents:{blur:function(e){var o=t(e.data.target),n=o.textbox("options");o.textbox("getValue")!=n.value&&o.textbox("setValue",n.value)},keydown:function(e){if(13==e.keyCode){var o=t(e.data.target);o.textbox("setValue",o.textbox("getText"))}}},onChange:function(t,e){},onResizing:function(t,e){},onResize:function(t,e){},onClickButton:function(){},onClickIcon:function(t){}})}(jQuery);