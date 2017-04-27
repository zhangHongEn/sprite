onloads.push(function(){
	
	//矩形路径构造函数	s: 起始点
	function PathRect(x , y , w , h, s){
		this.x = x;
		this.y = y;
		this.w = w || this.PATHWIDTH;
		this.h = h || this.PATHWIDTH;
		this.s = s || this.LEFTTOP;
	}
	PathRect.prototype = {	//矩形路径原型
		PATHWIDTH : 40,	//路径默认宽高
		LEFTTOP : 1,	//起始点在左上角
		RIGHTTOP : 2,	//起始点在右上角
		LEFTBOTTOM : 3,	//起始点在左下角
		getLeftTop : function(){	//将路径转为左上角坐标
			
			switch(this.s){
				case this.LEFTTOP:
					return this;
					
				case this.RIGHTTOP:
					return {
						x: this.x - this.w,
						y: this.y
					};
					
				case this.LEFTBOTTOM:
					return {
						x: this.x,
						y: this.y - this.h
					};
			};
		},
		getTarget : function(r){	//得到目标点
			var main = this.PATHWIDTH/2 - (r/2 +0.5 | 0);
			switch(this.s){
				case this.LEFTTOP:
					return {
						x:	this.w == this.PATHWIDTH ? this.x : this.x + this.w - main ,		//左上往右
						y: this.h == this.PATHWIDTH ? this.y : this.y + this.h - main	//左上往下
					};
					
				case this.RIGHTTOP:	//右上,往左走
					return {
						x: this.x - this.w - this.PATHWIDTH + main,
						y: this.y
					};
					
				case this.LEFTBOTTOM:	//左下,向上
					return {
						x: this.x,
						y: this.y - this.h - this.PATHWIDTH + main
					};
			}
		}
	};
	PathRect.prototype.constructor = PathRect;
	
	var LEFTBOTTOM = PathRect.prototype.LEFTBOTTOM,
		RIGHTTOP = PathRect.prototype.RIGHTTOP,
		movingPath = [	//路径数组
			new PathRect(526, 0 , undefined , 196),
			new PathRect(526,156,96,undefined , RIGHTTOP),
			new PathRect(430,156,undefined, 94 , LEFTBOTTOM),
			new PathRect(430,62,374, undefined , RIGHTTOP),
			new PathRect(56,102,undefined,230),
			new PathRect(96,292,86,undefined),
			new PathRect(142,292,undefined,110,LEFTBOTTOM),
			new PathRect(182,182,70,undefined),
			new PathRect(214,222,undefined,110),
			new PathRect(254,292,70,undefined),
			new PathRect(284,292,undefined,110,LEFTBOTTOM),
			new PathRect(324,182,72,undefined),
			new PathRect(356,222,undefined,218),
			new PathRect(396,400,86,undefined),
			new PathRect(440,400,undefined,148,LEFTBOTTOM),
			new PathRect(480,252,90,undefined),
			new PathRect(530,292,undefined,234),
			new PathRect(530,486,266, undefined , RIGHTTOP),
			new PathRect(264,486,undefined,96,LEFTBOTTOM),
			new PathRect(264,390,304, undefined , RIGHTTOP)
		];
		
		movingPath.drawPath = function(ctx){	//绘制路径
			for(var i = 0; i < movingPath.length; i++){
				var path = movingPath[i];
				var loc = path.getLeftTop();
				ctx.strokeRect(loc.x,loc.y,path.w,path.h);
			}
			ctx.closePath();
		}
	return movingPath;
	
});