//下一帧动画函数
window.requestNextAnimationFrame = function(){
	var originalWebkitMethod , //原webkit方法
		wrapper = undefined,	//包装
		callback = undefined,	//回调
		geckoVersion = 0,	//版本
		userAgent = navigator.userAgent,	//用户代理字符串
		index = 0,	//索引
		self = this;	//自己
		
	if(window.webkitRequestAnimationFrame){
		wrapper = function(time){
			if(time === undefined){
				time = +new Date - window.lastTime;
			}
			self.callback(time);
		}
		
		originalWebkitMethod = window.webkitRequestAnimationFrame;
		window.webkitRequestAnimationFrame =
		function(callback,element){
			self.callback = callback;
			
			originalWebkitMethod(wrapper,element);
		}
	}
	
	if(window.mozRequestAnimationFrame){
		index = userAgent.indexOf('rv:');
		
		if(userAgent.indexOf('Gecko')!=-1){
			geckoVersion = userAgent.substr(index+3,3);
		}
		
		if(geckoVersion === '2.0'){
			window.mozRequestAnimationFrame = undefined;
		}
	}
	
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		
		function (callback , element){
			var start ,
				finish;
				
			window.setTimeout(function(){
				start = +new Date;
				callback(start);
				finish = +new Date;
			
				self.timeout = 1000 / 60 -(finish - start);
				
			}, self.timeout);
		}
}();