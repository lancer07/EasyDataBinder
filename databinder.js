// 简单数据双向绑定类
var DataBinder = function () {
	var tplData = {}; // 用于存放数据
	var inputs = document.querySelectorAll('[data-binder]'); // 获取所有需要数据双向绑定的节点

	// 根据元素的type决定触发的事件
    function _event (eventType) {
		switch (eventType) {
			case 'checkbox':
				return 'click';
				break;
			case 'radio':
				return 'click';
				break;
			default:
				return 'keyup';
		}
	}
	// 渲染表单
	function _renderInputs(i,m,v){
		if(typeof v == 'object'){
			for(var j in v){
				_renderInputs(i,m+'.'+j,v[j]);
			}
			return ;
		}
		if (inputs[i].getAttribute('data-binder') == m) {
			if (inputs[i].type != 'radio') {
				inputs[i].value = v;
			}
			if (inputs[i].type == 'radio') {
				inputs[i].checked = inputs[i].value == v;
			}
			if (inputs[i].type == 'checkbox') {
				inputs[i].checked = v;
			}
		}
	}
	// 显示隐藏容器
	function _visibleTags(){
		var eles = document.querySelectorAll('[data-visible]');
		for (var i = 0; i < eles.length; i++) {
			var showCondition = eles[i].getAttribute('data-visible');
			var equal = true;

			var decollator = showCondition.indexOf('==');
			if(decollator == -1){
				decollator = showCondition.indexOf('!=');
				equal = false;
			}
			var key = showCondition.slice(0, decollator);
			var value = showCondition.slice(decollator + 2);
				
			// 普通比较
			if(equal){
				if (tplData[key] == value) {
					eles[i].style.display = 'inherit';
				} else {
					eles[i].style.display = 'none';
				}
			}else{
				if (tplData[key] != value) {
					eles[i].style.display = 'inherit';
				} else {
					eles[i].style.display = 'none';
				}
			}
			// 数组长度比较
			if(value == '[]'){
				if(equal){
					if(tplData[key].length == 0){
						eles[i].style.display = 'inherit';
					}else{
						eles[i].style.display = 'none';
					}
				}else{
					if(tplData[key].length == 0){
						eles[i].style.display = 'none';
					}else{
						eles[i].style.display = 'inherit';
					}
				}
			}
		}
	}
	// 判断是否已存在className
	function _hasClass(ele,cls){
		var result = false;
		if(ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'))){
			result = true;
		}
		return result
	}
	// 切换显示样式
	function _toggleClass(){
		var eles = document.querySelectorAll('[data-class]');
		for (var i = 0; i < eles.length; i++) {
			var classes = eles[i].getAttribute('data-class').split(',');
			for(var j=0;j<classes.length;j++){
				var decollator1 = classes[j].indexOf(':');
				var decollator2 = classes[j].indexOf('==');
				var styleName = classes[j].slice(0,decollator1);
				var key = classes[j].slice(decollator1+1, decollator2);
				var value = classes[j].slice(decollator2 + 2);
				// +'' 使boolen变string
				if (tplData[key]+'' == value) {
					if(!_hasClass(eles[i],styleName)){
						eles[i].className += " " + styleName;
					}
				} else {
					if(_hasClass(eles[i],styleName)){
						var reg = new RegExp('(\\s|^)'+styleName+'(\\s|$)');
						eles[i].className=eles[i].className.replace(reg,'');
					}
				}
			}
		}
	}
	// 递归找key修改
	function _setDeepValue(obj,arr,v) {
		if(arr.length > 1){
	   		for(var j = 0;j<arr.length;j++){
	   			if(!obj[arr[0]]){
	   				obj[arr[0]] = {};
	   			}
	   			_setDeepValue(obj[arr[0]],arr.slice(1),v);
	   		}
		}else{
			obj[arr[0]] = v;
		}	
    }

    // 渲染列表
    function _renderList(obj){
    	for(var key in obj){
    		if(typeof obj[key] === 'object' && !(obj[key] instanceof Array)){
    			_renderList(obj[key])
    		}else if(typeof obj[key] === 'object' && (obj[key] instanceof Array)){
    			var innerContent = "";
    			for(var i=0;i<inputs.length;i++){
    				if(inputs[i].getAttribute("data-binder") == key){
    					for(var j=0;j<obj[key].length;j++){
    						if(typeof obj[key][j] === 'object'){
    							var subContent = ""
    							for(subKey in obj[key][j]){
    								subContent += '<span class="key">'+subKey+': </span><span class="value">' + obj[key][j][subKey]+'</span>';
    							}
    							innerContent += '<li>'+ subContent +'<em class="remove_item" data-item="'+ key +'" data-index="'+ j +'">X</em></li>';
    						}else{
    							innerContent += '<li>'+ obj[key][j] +'<em class="remove_item" data-item="'+ key +'" data-index="'+ j +'" >X</em></li>';
    						}
    					}
    					inputs[i].innerHTML = innerContent;
    				}
    			}
    		}
    	}
    	_binderRemove();
    }
    // 绑定删除按钮的事件
    function _binderRemove(){
    	var removeBtns = document.querySelectorAll('.remove_item');
    	for(var i=0;i<removeBtns.length;i++){
    		removeBtns[i].addEventListener('click', function() {
    			var key = this.getAttribute('data-item');
    			var index = this.getAttribute('data-index');
    			tplData[key].splice(index,1);
				binder.set(key,tplData[key]);
    		})
    	}
    }

	// 为input绑定事件
	(function bindEvent(){
		for (var i = 0; i < inputs.length; i++) {
			var eventType = inputs[i].getAttribute('type');
			inputs[i].addEventListener(_event(eventType), function() {
				var duplex = this.getAttribute("data-binder");
				var value = this.value;
				if (this.getAttribute('type') == 'checkbox') {
					value = this.checked;
				}
				binder.set(duplex, value);
			});
		}
	})();

	var binder = {
		get : function(){
			return tplData;
		},
		set: function(m, v) {
			var data = m;
			// 有v的话是单个更新，否则是通过键值对一起更新dom
			if (v || v == '') {
				// 更新data
				if(m.match(new RegExp('.'))){
					var ms = m.split('.');
					var key = [];
					for(var j=0;j<ms.length;j++){
						key.push(ms[j])
					}
					_setDeepValue(tplData,key,v)
				}else{
					tplData[m] = v;
				}

				// 更新表单里的显示
				for (var i = 0; i < inputs.length; i++) {
					_renderInputs(i,m,v)
				}
			} else {
				for (var i in data) {
					// 更新data
					tplData[i] = data[i];
				}
				// 更新表单里的显示
				for (var i = 0; i < inputs.length; i++) {
					for (var j in data) {
						_renderInputs(i,j,data[j])	
					}
				}
			}
			if(this.debug){
				console.log(tplData);
			}
			_visibleTags();
			_toggleClass();
			_renderList(tplData);
		},
		// 数组操作
		pushArray:function(m,v){
			tplData[m].push(v);
			this.set(m,tplData[m]);
		},
		// 默认关闭调试
		debug : false
	}
	return binder;
}