//精灵构造函数
function Sprite(painter, behaviors){
	if(this.painter == undefined) this.painter = painter;
	
	this.top = 0;
	this.left = 0;
	this.width = 0;
	this.height = 0;
	this.velocityX = 0;
	this.velocityY = 0;
	this.behaviors = behaviors || [];
	this.visible = true;
	this.animating = false;
}
Sprite.prototype = {
	paint : function(context){
		if(this.painter !== undefined && this.visible){
			this.painter.paint(this,context);
		}
	},
	update : function(context,time){
		for(var i = 0; i < this.behaviors.length; ++i){
			this.behaviors[i].execute(this,context,time);
		}
	}
}
Sprite.prototype.constructor = Sprite;

//精灵表绘制器
function SpriteSheetPainter(cells,spritesheet){
	this.spritesheet = spritesheet;
	this.cells = cells || [];
	this.cellIndex = 0;
}
SpriteSheetPainter.prototype = {
	advance : function(){
		if(this.cellIndex == this.cells.length - 1){
			this.cellIndex = 0;
		}else{
			this.cellIndex++;
		}
	},
	paint : function(sprite , ctx){
		var cell = this.cells[this.cellIndex];
		ctx.drawImage(this.spritesheet , cell.x , cell.y , cell.w , cell.h , sprite.left , sprite.top , cell.w , cell.h);
	}
}
SpriteSheetPainter.prototype.constructor = SpriteSheetPainter;

//精灵动画制作器
SpriteAnimator = function(painters,callBack){
	this.painters = painters || [];
	this.callBack = callBack;
	this.duration = 1000;
	this.startTime = 0;
	this.index = 0;
}
SpriteAnimator.prototype = {
	start : function(sprite,duration){
		var endTime = +new Date + duration,	//动画结束时间
			period = duration / this.painters.length,	//这一个动画持续时间
			animator = this,	//绘制者
			originalPainter = sprite.painter,	//原画家
			lastUpdate = 0;	//最后修改时间
			
		this.index = 0;
		sprite.animating = true;	//动画中
		requestNextAnimationFrame(function spriteAnimatorAnimate(time){
			time = +new Date;
			if(time < endTime){
				if(time - lastUpdate > period){
					sprite.painter = animator.painters[++animator.index];
					lastUpdate = time;
				}
				requestNextAnimationFrame(spriteAnimatorAnimate);
			}else{
				animator.end(sprite,originalPainter);
			}
		});
	},
	end : function(sprite,originalPainter){
		sprite.animating = false;
		if(this.callBack) this.callBack(sprite)
		else	sprite.painter = originalPainter;
	}
}
SpriteAnimator.prototype.constructor = SpriteAnimator;


//图像绘制器
function ImagePainter(url){
	if(url instanceof HTMLImageElement){
		this.image = url;
	}else{
		this.image = new Image();
		this.image.src = url;
	}
}
ImagePainter.prototype = {
	paint : function(sprite , ctx){
		if(this.image.complete || this.image.complete === undefined){
			ctx.drawImage(this.image,sprite.left , sprite.top , sprite.width , sprite.height);
		}
	}
}
ImagePainter.prototype.constructor = ImagePainter;

//计时器
(function(){
	function Timer(){}
	Timer.prototype = {
		startTime : undefined,
		elapsed : undefined,
		running : false,
		
		start : function(){
			this.running = true;
			this.startTime = +new Date;
		},
		stop : function(){
			this.running = false;
			this.elapsed = +new Date - this.startTime;
		},
		getElapsed : function(){
			if(this.running)
				return +new Date - this.startTime;
			return this.elapsed;
		},
		isRunning : function(){
			return this.running;
		}
	}
	Timer.prototype.constructor = Timer;

	//计时器构造函数
	window.AnimationTimer = function (limit){
		this.limit = limit;
	}
	AnimationTimer.prototype = {
		timer : new Timer(),
		start : function(){
			this.timer.start();
		},
		stop : function(){
			this.timer.stop();
		},
		getElapsed : function(){
			return this.timer.getElapsed();
		},
		isRunning : function(){
			return this.timer.isRunning();
		},
		isOver : function(){
			return this.getElapsed() > this.limit * 1000;
		}
	}
	AnimationTimer.prototype.constructor = AnimationTimer;
})();