// 简单数据双向绑定类
var DataBinder = function () {
	var tplData = {}; // 用于存放数据
	var inputs = document.querySelectorAll('[data-binder]'); // 获取所有需要数据双向绑定的节点
	var repeator = document.querySelectorAll('[data-repeat]'); // 获取所有需要repeat数据的节点

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
	function _renderInputs(i,path,v){
		if(typeof v == 'object'){
			for(var j in v){
				_renderInputs(i,path+'.'+j,v[j]);
			}
			return ;
		}
		if (inputs[i].getAttribute('data-binder') == path) {
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

	// 渲染列表
    function _renderList(){
    	for(var i=0; i<repeator.length;i++){
    		var path = repeator[i].getAttribute('data-repeat');
    		var innerContent = '';
    		var arrs = _.get(tplData,path);
    		for(var j=0;j<arrs.length;j++){
    			if(typeof arrs[j] == 'object'){
    				var subContent = '';
    				_.map(arrs[j],function(v,k){
    					subContent += '<span class="span_1">'+ k +': </span><span class="span_2">'+ v +'</span>'
    				});
    				innerContent += '<li>'+ subContent +'<em class="remove_item" data-item="'+ path +'" data-index="'+ j +'" >X</em></li>';
    			}else{
    				innerContent += '<li>'+ value +'<em class="remove_item" data-item="'+ path +'" data-index="'+ j +'" >X</em></li>';
    			}
    		}
    		if (innerContent == '') {
    			repeator[i].style.display = 'none';
    		}else{
    			repeator[i].style.display = 'inherit';
    			repeator[i].innerHTML = innerContent;
    		}
    	}
    	_binderRemove();
    }
    // 绑定删除按钮的事件
    function _binderRemove(){
    	var removeBtns = document.querySelectorAll('.remove_item');
    	for(var i=0;i<removeBtns.length;i++){
    		removeBtns[i].addEventListener('click', function() {
    			var path = this.getAttribute('data-item');
    			var index = this.getAttribute('data-index');
    			binder.removeItem(path,index);
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
		set: function(path, v) {
			var data = path;
			// 有v的话是单个更新，否则是通过键值对一起更新dom
			if (v || v == '') {
				_.set(tplData, path, v);
				// 更新表单里的显示
				for (var i = 0; i < inputs.length; i++) {
					_renderInputs(i,path,v)
				}
			} else {
				for(var i in path){
					_.set(tplData, i, path[i]);
				}
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
			_renderList();
		},
		pushArray:function(path,v){
			var arrs = _.get(tplData,path);
			arrs.push(v);
			_.set(tplData, path, arrs);
			_renderList();
			if(this.debug){
				console.log(tplData);
			}
		},
		removeItem:function(path,i){
			var arrs = _.get(tplData,path);
			arrs.splice(i,1);
			_.set(tplData, path, arrs);
			_renderList();
			if(this.debug){
				console.log(tplData);
			}
		},
		// 默认关闭调试
		debug : false
	}
	return binder;
}