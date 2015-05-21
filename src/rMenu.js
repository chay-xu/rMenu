/**
 * @file jq contextMenu
 * @author xucaiyu
 * @email 569455187@qq.com
 * @version 1.0.0
 * @date 2015-05-21
 * @license MIT License 
 */
// 右键菜单插件
(function(){
    var Defaults = {
            container: 'body',
            target: '',
            trigger: 'right',
            data: [],
            bindFn: function(){},
            tools: {},
            tmpl: '{{if data.line }}<li class="x-menu-item"><div class="x-menu-line"></div></li>{{else}}'
            + '<li class="{{if data.locked }}x-menu-locked{{else}}x-menu-item{{/if}}" data-fn="{{if data.fn }}${data.fn}{{/if}}">'
            + '<a class="x-menu-text" href="javascript:;">${data.text}{{if data.sub }}<i></i>{{/if}}</a>'
            + '</li>{{/if}}'
        };

    rMenu.tools = {}

    function rMenu(options){
        var opts = $.extend( {}, Defaults, options ? options : {} ),
            timer = null,
            $parentMenu = null,
            $target = null,
            trigger = opts.trigger == 'right' ? 2 : 0;

        $.extend(rMenu.tools, opts.tools)

        $( opts.container ).delegate(opts.target, 'mouseup contextmenu', function(e){
            var type = e.type,
                $em = $(this),
                data;

            if(type == 'mouseup'){
                // 右键
                if(e.button == trigger){
                    $target = $em;
                    // 限制只有一个菜单
                    $parentMenu && destroyMenu();
                    // 回调函数
                    data = opts.bindFn( $em );
                    data = $.extend( opts.data, data );
                    if( data === undefined ) return;
                    // data = data != undefined ? data : opts.data;

                    $parentMenu = createMenu( data, opts.tmpl, '');
                    $('body').append( $parentMenu )

                    var position = rangePosition( $parentMenu, e.pageX, e.pageY );

                    $parentMenu.css({
                        // 'z-index': '99',
                        top: position.top,
                        left: position.left
                    })

                    // 单击其他范围菜单隐藏
                    $( document ).bind('mousedown', destroyMenu)
                    // 滚动消失
                    $( document ).bind('scroll', destroyMenu)
                    // 失去焦点消失
                    $( window ).bind('blur', destroyMenu)

                    // 菜单右键禁止
                    $parentMenu.bind('contextmenu', function(e){
                        return false;
                    })

                    menuEvent( $parentMenu )
                }
                return false;
            }else{
                return false;
            }
        })

        function createMenu(menu, tmpl, className){
            var $warp = $('<ul class="x-menu '+ className +'"></ul>'),
                html, $li, $menu;

            $.each(menu, function(i, o){
                // 模板
                html = fasTpl( tmpl, {data: o } );
                $li = $( html );
                // 子菜单
                if(o[ 'sub' ]){
                    $menu = createMenu(o[ 'sub' ], tmpl, 'x-menu-sub')
                    // 绑定事件
                    $li.append( $menu );
                }

                $warp.append( $li );
            })

            return $warp;
        }

        function rangePosition( $el, l, t, eHeight ){
            var offset = $el.offset(),
                width = $el.outerWidth(),
                height = $el.outerHeight(),
                winWidth = $(window).width(),
                winHeight = $(window).height(),
                left = l ? l : offset.left,
                top = t ? t : offset.top;

            if( left + width > winWidth ){
                if( l ){
                    l = left + (winWidth - (left + width))
                }else{
                    l = -(width);
                }
            }
            if( top + height > winHeight ){
                if( t ){
                    t = top + (winHeight - (top + height))
                }else{
                    t = -(height - eHeight);
                }
            }

            return {
                left: l,
                top: t
            }
        }

        function menuEvent( $menu ){
            var $focus = null;
            $menu.delegate('li', 'mouseenter mouseleave mousedown mouseup', function(e){
                var $me = $( this ),
                    type = e.type,
                    fn = $me.attr('data-fn'),
                    className = $me.attr('class'),
                    $subMenu = $me.children('.x-menu-sub');

                if( className == 'x-menu-locked' ) return false;

                // 显示子菜单
                if( type == 'mouseenter' ){
                    // hide old focus menu
                    if( $focus && $focus.length != 0 ){
                        $focus.trigger('mouseleave')
                    }
                    
                    if( $subMenu.length != 0 ){
                        $subMenu.show()

                        $subMenu.css( rangePosition( $subMenu, null, null, $me.height() ) )
                        menuEvent( $subMenu )
                    }
                    $me.children('.x-menu-text').addClass('x-menu-text-hover');
                }

                // 隐藏子菜单
                if( type == 'mouseleave' ){
                    if( $subMenu.length != 0 ){
                        $subMenu.hide();
                        $subMenu.undelegate();
                        $subMenu = null;
                    }
                    $me.children('.x-menu-text').removeClass('x-menu-text-hover');
                }

                // 菜单事件
                if( type == 'mouseup' && fn){

                    rMenu.tools[fn] && rMenu.tools[fn]( $target );
                    destroyMenu();
                }
                $focus = $me;

                return false;
            })
        }

        // 隐藏主菜单
        function destroyMenu(){
            $parentMenu.undelegate();
            $parentMenu.unbind();
            $parentMenu.remove();

            $( document ).unbind('mousedown', destroyMenu);
            $( document ).unbind('scroll', destroyMenu)
            $( window ).unbind('blur', destroyMenu)

            $parentMenu = null;
        }

        options = null;
    }

    'function' === typeof define? define(function(){
        return rMenu;
    }) : window.rMenu = rMenu;
    
})()