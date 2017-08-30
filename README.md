# toolbar
侧边栏

## Feature

1、亚马逊三角形区域滑动判断

2、阿里云官网侧边栏切换效果

3、多级菜单

## Options

```
var opts = {
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
          leftBarContent: 'left-bar-content', //侧边栏面板中的ul类名
  	barItem: 'bar-item',	//侧边栏所有面板的公共类名
  	item: 'common-item',	//侧边栏单个面板中tab按钮的类名

  	hiddenAll: $.noop, //全部隐藏后的回调函数
  	hidden: $.noop //单个隐藏后的回调函数
}
```

## Use

```
<script src="js/toolbar.js"></script>
<script>
		$.ToolBar({
			menu: '.menu',
			menuEvent: 'mouseover',
			hiddenAll:function(){
				console.log('hiddenAll');
			},
			hidden:function(dom){
				console.log($(dom).data('level'));
			}
		});
</script>
```
