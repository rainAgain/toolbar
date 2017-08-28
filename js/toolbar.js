(function($){
	
	var _this;

	function ToolBar (opts) {
		_this = this;
		if(_this == $) {
			return new ToolBar(opts);
		}

		var DEFAULT = {
			MOUSE_LOCS_TRACKED: 3,
			DELAY: 200,		//显示隐藏动画的时间
			
			mouseLocs: [], //最新的三个鼠标位置
			itemLoc: {},	//item的上下左右角坐标
			isEnd: true,	//同级面板是否收缩完毕
			isOut: true,	//是否移出item
			isLeftBarOut: true,	//是否移出整个侧边栏
			leftBarTimer: null,

			slideIn: 'slide-in-',	//显示动画类名
			slideOut: 'slide-out-',	//隐藏动画类名
			active: 'active',		//激活各个面板和tab按钮状态的类名，（共用同一个类名）

			level: 'level',			//面板的data-level 层级属性 data-*,可自定义
			ref: 'ref',				//tab按钮上表示id的data属性 data-ref，用于与下一面板中的ul块的class关联的
			hasChild: 'haschild',	//tab按钮上用来表示是否有子菜单的 data属性 data-haschild （小写）

			//下面为常用替换参数		
			menu: '#menu',	//用来触发侧边栏的类名
			menuEvent: 'mouseover', //用来触发侧边栏的类名上的事件

			CHANGEDELAY: 200, //三角区域停留时间触发切换
			leftBar: '#left-bar',
			leftBarFirst: 'left-bar-first',	//侧边栏第一个面板类名
			barItem: 'bar-item',	//侧边栏所有面板的公共类名
			item: 'common-item',	//侧边栏单个面板中tab按钮的类名

			hiddenAll: $.noop,
			hidden: $.noop
		};

		_this.config = $.extend(DEFAULT, opts);

		_this.$menu = $(_this.config.menu);

		_this.$leftBar = $(_this.config.leftBar);
		_this.$leftBarFirst = $('.' + _this.config.leftBarFirst);
		_this.$barItem = $('.' + _this.config.barItem);

		//记录鼠标的最新位置
        $(document).mousemove(function(e) {
            _this.config.mouseLocs.push({ x: e.pageX, y: e.pageY });

            if (_this.config.mouseLocs.length > _this.config.MOUSE_LOCS_TRACKED) {
                _this.config.mouseLocs.shift();
            }
        });

		//菜单按钮划过，显侧边栏
        _this.$menu.on( _this.config.menuEvent, function() {
        	
        	_this.config.isLeftBarOut = true;
            _this.activate(_this.$leftBarFirst, + _this.$leftBarFirst.data( _this.config.level ));
        });

        //只显示当前面板的后面一个
	    _this.$barItem.on('mouseover', function() {
	        var $this = $(this),
	            $next = $this.next(),
	            $nextAll = $next.nextAll('.' + _this.config.active);

	        if ($nextAll.length) {
	            _this.deActiveDi($nextAll);
	        }
	    });

	    var enterTimer = null;
	    _this.$leftBar.on('mouseenter', '.' + _this.config.item, function(e) {
            var $item = $(this);

            if (_this.config.isOut) {
            	_this.activateItem($item);
                
            } else {
            	//在三角形中停留显示
                _this.calcItemLoc($item);

                clearTimeout(enterTimer);

                enterTimer = setTimeout(function() {
                    var currentLoc = _this.config.mouseLocs[_this.config.mouseLocs.length - 1];

                    if (_this.adjustInItem(currentLoc)) {
                        _this.config.isOut = true;
                        _this.activateItem($item);
                    };
                }, _this.config.CHANGEDELAY);
            }
        }).on('mouseleave', '.' + _this.config.item, function(e) {
            //鼠标移出该item
            //判断是否在三角形区域内

            _this.config.isOut = false;

            var $item = $(this),
            	$itemparent = $item.parent(),
                $parentRoom = $itemparent.parent(),
                $next = $parentRoom.next(),

                itemLeftVal = $item.offset().left,
                ulTop = $itemparent.offset().top,
                UlWidth = $itemparent.outerWidth(),
                ulHeight = $itemparent.outerHeight();

            if (e.pageX >= parseInt(itemLeftVal) + parseInt(UlWidth)) {
               // console.log('下一面板');
                _this.config.isOut = true;
            } else if (e.pageX < parseInt(itemLeftVal)) {
                //console.log('上一面板');
                _this.config.isOut = true;
            } else {

                /*if(e.pageY > parseInt(ulTop) + parseInt(ulHeight)){
                	//移出ul块则不添加active
                    //有问题，如果下面没有了，而右边有，滑动事件判断冲突了
                	//console.log('移出了')
                	$item.removeClass( _this.config.active);
                	_this.deActiveDi($next);
                } else {
                	
                }*/

                if ($next.length) {
                    var nextLeftLoc = _this.calcNextLeftLoc($next), //下一面板的左上角和左下角坐标
                        leaveLoc = { x: e.pageX, y: e.pageY }, //移出item时候的坐标
                        isInDelta = _this.adjustIsInDelta(leaveLoc, nextLeftLoc); //是否在三角形中                

                    if (isInDelta) {
                        //console.log('在三角形中');
                        _this.config.isOut = false;
                    } else {
                        //console.log('不在三角中');
                        _this.config.isOut = true;

                    }
                } else {
                    _this.config.isOut = true;
                }
                


            }
        }).on('mouseleave', function() {
            //离开left-bar
            var $this = $(this),
                $barItem = $('.' + _this.config.barItem + '.'+_this.config.active, $this);
        	_this.deActiveDi($barItem);
            _this.config.isLeftBarOut = false;
            _this.config.mouseLocs = [];
        });

	}


	//激活包含ul的面板
	var activeTimer = null;
	ToolBar.prototype.activate = function($selector, level) {
		
		if( !_this.$leftBar.hasClass( _this.config.active ) ) {
			_this.$leftBar.addClass( _this.config.active );
		}

		if( _this.config.isEnd ) {
			var _hasActive = $selector.hasClass( _this.config.active ),
				_hasSlideOut  = $selector.hasClass( _this.config.slideOut + level );
			
			if( !_hasActive && !_hasSlideOut) {
				$selector.addClass( _this.config.active + ' ' + _this.config.slideIn + level );

				setTimeout(function() {
					$selector.removeClass( _this.config.slideIn + level );
				}, _this.config.DELAY);
				if(activeTimer) {
					clearTimeout(activeTimer);
				}
			}
		} else {
			//如果动画没有结束
        	activeTimer = setTimeout(function(){
        		_this.activate($selector, level);
        	} ,10);
		}
	};

	//递归隐藏所有显示的
    ToolBar.prototype.deActiveDi = function($selectors, callback) {

        var _index = $selectors.length - 1,
        	$selector = $($selectors[_index]),
            level = $selector.data( _this.config.level );

        if ($selector.hasClass( _this.config.active )) {
            _this.config.isEnd = false;
            $selector.addClass(_this.config.slideOut + level);

            var timer = setTimeout(function() {

                $selector.removeClass( _this.config.active + ' ' + _this.config.slideOut + level);
                
                $('.' + _this.config.item, $selector).removeClass( _this.config.active );

                //当前面板后面的最后一个动画执行
                if ($selectors.length === 1) {
                    //如果动画到最后一个，则隐藏面板
                    if (level === 0) {

                        if ( _this.$leftBar.hasClass( _this.config.active )) {
                            _this.$leftBar.removeClass( _this.config.active );
                            _this.config.itemLoc = {};
                            _this.config.hiddenAll();
                        }
                    }
                    //最后一个面板动画结束
                    var temTime = setTimeout(function() {
                    	_this.config.isEnd = true;
                    	clearTimeout(temTime);
                    }, _this.config.DELAY);
                    
                    if(typeof callback == 'function') {
                    	callback();
                    }
                    _this.config.hidden($selector);
                    return;
                }

                var selectorArr = $selectors.toArray();

                selectorArr.pop();

                _this.deActiveDi($(selectorArr));

            }, _this.config.DELAY);
        }
    };

    ToolBar.prototype.slope = function(a,b) {
    	return Math.abs(b.y - a.y) / Math.abs(b.x - a.x);
    };

    //判断是否在三角形中方法一
    ToolBar.prototype.adjustIsInDelta = function(leaveLoc, nextLeftLoc) {
        var start = _this.config.mouseLocs[0] || { x: 0, y: 0 },
            end = _this.config.mouseLocs[_this.config.mouseLocs.length - 1] || { x: 0, y: 0 },
            preRatio, lastRatio, ret;
        if (end.x > start.x) {
            //第一第四象限
            if (end.y > start.y) {
                //向下
                preRatio = _this.slope(nextLeftLoc.lowerLeft,start);
                lastRatio = _this.slope(nextLeftLoc.lowerLeft,end);

            } else {
                //向上
                preRatio = _this.slope(nextLeftLoc.upperLeft,start);
                lastRatio = _this.slope(nextLeftLoc.upperLeft,end);
            }

            if(lastRatio > preRatio) {
            	ret = true;
            } else {
            	ret = false;
            }

        } else {
            //第二第三象限
            ret = false;
        }
        return ret;
    };

    //计算下一面板的左侧坐标
    ToolBar.prototype.calcNextLeftLoc = function($next) {
        var _nextLoc = {
            upperLeft: {
                x: $next.offset().left,
                y: $next.offset().top
            },
            lowerLeft: {
                x: $next.offset().left,
                y: $next.offset().top + $next.height()
            }
        };

        return _nextLoc;
    };

    //计算所在选项的角坐标
    ToolBar.prototype.calcItemLoc = function($item) {
        var _liWidth = $item.outerWidth(),
            _liHeight = $item.outerHeight();

        var _liOffset = $item.offset();

        _this.config.itemLoc = {
            upperLeft: {
                x: _liOffset.left,
                y: _liOffset.top
            },
            upperRight: {
                x: _liOffset.left + _liWidth,
                y: _liOffset.top
            },
            lowerLeft: {
                x: _liOffset.left,
                y: _liOffset.top + _liHeight
            },
            lowerRight: {
                x: _liOffset.left + _liWidth,
                y: _liOffset.top + _liHeight
            }
        };
    };

    //判断是否在单个tab中
    ToolBar.prototype.adjustInItem = function(lastLoc) {
    	lastLoc = lastLoc || {x:0,y:0};
        var x = lastLoc.x,
            y = lastLoc.y,
            itemLoc = _this.config.itemLoc;

        if (!itemLoc.upperRight || !itemLoc.upperRight.x) {
            return false;
        }
        if (x < itemLoc.upperRight.x &&
        	 x > itemLoc.upperLeft.x &&
        	 y < itemLoc.lowerLeft.y &&
        	 y > itemLoc.upperLeft.y) {

            return true;
        }
    };

    //激活item对应的面板
    ToolBar.prototype.activateItem = function($item) {

        if (_this.config.isOut && _this.config.isLeftBarOut) {

            var ref = $item.data( _this.config.ref ),
            	hasChild = $item.data( _this.config.hasChild ),
                $parentRoom = $item.parent().parent(), //该选项最外层的面板
                level = parseInt($parentRoom.data( _this.config.level )) + 1, //取得下一层级是第几个
                $next = $parentRoom.next(), //当前鼠标所在的下一面板
                $nextAll = $next.nextAll(),
                $leftBarContents = $('.' + ref, $next), //当前选项对应的下一面板中的ul块
                active = _this.config.active,
                item = _this.config.item;

            //ul块中有选项则显示
            if (hasChild) {

                _this.activate($next, level);

                $leftBarContents.addClass(active)
                	.siblings().removeClass(active)
                	.find('.'+ item)
                	.removeClass(active);
                
            } else {
                //无则隐藏其他面板
                var isHasNext = $next.next().hasClass(active),
                	$paramDom = null;

                $paramDom = isHasNext ? $parentRoom.nextAll() : $next;

                _this.deActiveDi($paramDom, function() {
                	$leftBarContents.removeClass(active).find('.'+ item).remove(active);
                });
            }
            $item.addClass(active).siblings().removeClass(active);
        }
    };

	$.ToolBar = ToolBar;



})(jQuery);