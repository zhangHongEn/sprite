onloads.push(function(ctx , movingPath){
	
	var ctx = canvas.getContext('2d'),
		PATHWIDTH = movingPath[0].PATHWIDTH,
		enLevels = [	//敌人各等级信息
			{w:25,h:25,colors:'100,50,150',velocity:40},
			{w:28,h:28,colors:'50,100,150',velocity:45},
			{w:33,h:33,colors:'20,150,150',velocity:55},
			{w:38,h:38,colors:'200,150,150',velocity:65},
			{w:45,h:45,colors:'18,0,150',velocity:75},
			{w:20,h:20,colors:'200,200,200',velocity:85},
			{w:60,h:60,colors:'200,200,200',velocity:40}
		],
		imgEnemys = [	//敌人图片绘制器数组
			new ImagePainter(imgEnemy(0)),
			new ImagePainter(imgEnemy(1)),
			new ImagePainter(imgEnemy(2)),
			new ImagePainter(imgEnemy(3)),
			new ImagePainter(imgEnemy(4)),
			new ImagePainter(imgEnemy(5))
		],
		bossPainter = new ImagePainter(imgEnemyB()),
		HP = new ImagePainter(hPImg()),
		enemys = [];	//敌人精灵绘制器数组
		
	(function(){
		for(var i = 0; i < movingPath.length; i++){
			enemys.push([]);
		}
	})();
	
	enemys.add = function(level){	//增加一个敌人函数
		if(level > 5){
			enemys[0].push(new Boss(bossPainter , level , 40));
		}else{
			enemys[0].push(loadEnemy(new Enemies(level)));
		}
	};
	
	//敌人构造函数	继承精灵绘制器构造函数
	function Enemies(level){
		Sprite.call(this,imgEnemys[level],this.executes());
		
		this.left = movingPath[0].x + 20 - this.painter.image.width / 2;
		this.top = movingPath[0].y - this.painter.image.height;
		
		this.pathIndex = 0;
		this.level = level;
	}
	
	create(Sprite,Enemies);	//继承精灵绘制器原型
	Enemies.prototype.executes = function(sprite){	//敌人行为数组
		return [
			{	//敌人移动行为
				lastInTime : +new Date,
				lastTime : +new Date,
				next : next,
				execute : executeMove
			}
		];
	};
	Enemies.prototype.downLevel = function(number){	//降低等级
		if(this.level == 5){
			level5Over(this);
		}
		if(this.level < number){
			window.money += (this.level + 1)*2;
			enemys[this.pathIndex].remove(this);
		}else{
			window.money += number*2;
			this.painter = imgEnemys[this.level -= number];
			loadEnemy(this);
			loadLoaction1(enLevels[this.level + number], this);
		}
		window.updateMoney();
		this.play();
	};
	Enemies.prototype.froze = function(s){	//冰冻
		this.timer = new AnimationTimer(s);
		this.timer.start();
	}
	Enemies.prototype.unFroze = function(){	//解冻
		this.timer = null;
	}
	Enemies.prototype.audios = new Audios('music/enemy.mp3',1);
	Enemies.prototype.play = function(){
		this.audios.play();
	};
	Enemies.prototype.play = function(){
		this.audios.play();
	};
	
	//boss构造函数	继承 精灵绘制器构造函数
	function Boss(imgPainter , life , velocity){
		Sprite.call(this,imgPainter , this.executes());
		
		this.width = 60;
		this.height = 60;
		this.left = movingPath[0].x + 20 - this.width / 2;
		this.top = movingPath[0].y - this.height;
		this.pathIndex = 0;
		this.hpRate = this.width / life;
		this.life = life;
		this.velocityY = velocity;
		this.hp = new Sprite(HP);
		this.hp.height = 4;
		this.level = 6;
	}
	//boss原型继承 敌人原型
	create(Enemies , Boss , {
		bossOver : function(){
			var count = this.width / this.hpRate / 25 + 0.5 | 0;
			for(var i = 0; i < count; i++){
				var enemy = new Enemies(5);
				enemy.pathIndex = this.pathIndex;
				enemys[this.pathIndex].push(loadEnemy(enemy));
				loadLoaction(this,enemy);
			}
		},
		downLevel : function(hurt){
			if(this.life < hurt){
				enemys[this.pathIndex].remove(this);
				this.bossOver();
				window.money += this.life*2;
			}else{
				this.life -= hurt;
				window.money += hurt*2;
			}
			window.updateMoney();
			this.play();
		},
		audios : new Audios('music/boss.mp3',1)
	});
	Boss.prototype.oldFroze = Boss.prototype.froze;
	Boss.prototype.froze = function(s){
		this.oldFroze(s/2);
	}
	Boss.prototype.oldPaint = Boss.prototype.paint;
	Boss.prototype.paint = function(ctx){
		this.oldPaint(ctx);
		
		this.hp.width = this.life * this.hpRate;
		this.hp.left = this.left;
		this.hp.top = this.top + this.height;
		this.hp.paint(ctx);
	}
	
	//level : 降级前等级信息 , enemy:降级后
	function loadLoaction1(level , enemy){
		enemy.left = enemy.left - enemy.width / 2 + level.w / 2;
		enemy.top = enemy.top - enemy.height / 2 + level.h / 2;
	}
	function loadLoaction(sprite , enemy){
		enemy.left = sprite.left - enemy.width / 2 + sprite.width / 2;
		enemy.top = sprite.top - enemy.height / 2 + sprite.height / 2;
	}
	
	//等级5死亡
	function level5Over(sprite){
		for(var i = 0; i < 5; i++){
			var enemy = new Enemies(i);
			enemy.pathIndex = sprite.pathIndex;
			enemys[sprite.pathIndex].push(loadEnemy(enemy));
			loadLoaction(sprite,enemy);
		}
	}
	
	//敌人移动到下一个路径
	function next(sprite){
		if(sprite.pathIndex == movingPath.length - 1) {
			enemys[movingPath.length-1].remove(sprite);
			window.life -= sprite.level + 1;
			if(sprite.level == 5){
				window.life -= 15;
			}else if(sprite.level == 6){
				window.life -= sprite.life - 7 + 15*(sprite.width / sprite.hpRate / 25 + 0.5 | 0);
			}
			window.updateLife();
			return;
		};
		enemys[sprite.pathIndex].remove(sprite);
		sprite.pathIndex++;

		enemys[sprite.pathIndex].push(sprite);
		loadMoveAttr(sprite);
	}
	
	//移动行为
	function executeMove(sprite,ctx,time){
		time = +new Date;
		if(time - this.lastInTime > 200){
			this.lastTime = time;
			this.lastInTime = time;
			return;
		}
		this.lastInTime = time;
		
		if(sprite.timer){
			if(sprite.timer.isOver()){
				sprite.unFroze();
			}else{
				this.lastTime = time;
				return;
			}
		}
		
		var second = (time - this.lastTime) / 1000,
			path = movingPath[sprite.pathIndex].getTarget(sprite.width);
		
		if(isArcRectCollides(sprite.left , sprite.top , sprite.width / 2 , path.x , path.y , PATHWIDTH , PATHWIDTH)){
			this.next(sprite);
		}
		
		this.lastTime = time;
		
		sprite.left += sprite.velocityX * second;
		sprite.top += sprite.velocityY * second;
	}
		
	//加载敌人
	function loadEnemy(enSprite){
	
		loadMoveAttr(enSprite);

		var image = enSprite.painter.image;
		enSprite.width = enLevels[enSprite.level].w;
		enSprite.height = enLevels[enSprite.level].h;
			
		return enSprite;
	}
	
	//加载移动属性
	function loadMoveAttr(enSprite){
		var path = movingPath[enSprite.pathIndex],	//当前路径
			target = path.getTarget(),	//得到目标点
			xDir = path.w != PATHWIDTH,	//x方向是否前进
			yDir = path.h != PATHWIDTH,	//y方向是否前进
			v = enLevels[enSprite.level].velocity;	//此等级速度
			enSprite.velocityX = xDir ? v : 0;	//x速度
			enSprite.velocityY = yDir ? v : 0;	//y速度
			
			if(xDir && target.x - path.x < 0){	//如果x方向前进并且是向左走
				enSprite.velocityX = -v;
			}
			
			if(yDir && target.y - path.y < 0){	//如果y方向前进并且是向上走
				enSprite.velocityY = -v;
			}
	}

	//创建敌人图像
	function imgEnemy(level){
		var canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d'),
			enLevel = enLevels[level],
			radius = enLevel.w / 2,
			image = new Image();
			
		canvas.width = enLevel.w;
		canvas.height = enLevel.h;
		ctx.font = '18px a';
		ctx.strokeStyle = '#fff';
		ctx.strokeText(level,radius/1.5 +0.5 | 0,radius*1.4 +0.5 | 0);
		ctx.beginPath();
		ctx.arc(radius,radius, radius,0,Math.PI * 2 , false);
		var radial = ctx.createRadialGradient(radius , radius , 5 , radius , radius ,radius);
		radial.addColorStop(0.1,'rgba('+enLevel.colors+',0.3)');
		radial.addColorStop(0.3,'rgba('+enLevel.colors+',0.6)');
		radial.addColorStop(0.9,'rgba('+enLevel.colors+',0.9)');
		ctx.fillStyle = radial;
		ctx.fill();
		ctx.closePath();
		
		image.src = canvas.toDataURL('image/png');
		return image;
	}
	//血条图片
	function hPImg(){
		var canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d');
		canvas.width = 60;
		canvas.height = 4;
		
		ctx.beginPath();
		ctx.strokeStyle = 'rgba(255,0,0,0.6)';
		ctx.lineWidth = 4;
		ctx.moveTo(0,2);
		ctx.lineTo(60,2);
		ctx.stroke();
		ctx.closePath();
		
		return canvas.toDataURL('image/png');
	}
	//boss图片
	function imgEnemyB(){
		var canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d');
		canvas.width = canvas.height = 60;
		
		ctx.beginPath();
		ctx.save();
		var radial = ctx.createRadialGradient(25,25,10,30,30,20);
		radial.addColorStop(0,'rgba(251,239,67,0.9)');
		radial.addColorStop(1,'rgba(252,107,4,0.9)');
		ctx.fillStyle = radial;
		ctx.arc(30,30,20,0,Math.PI * 2 , false);
		ctx.fill();
		ctx.restore();
		ctx.closePath();
		
		ctx.beginPath();
		ctx.arc(24,26,1,0,Math.PI * 2 , false);
		ctx.arc(36,26,1,0,Math.PI * 2 , false);
		ctx.fill();
		ctx.closePath();
		
		ctx.beginPath();
		ctx.save();
		ctx.fillStyle = 'rgba(255,255,255,0.9)';
		ctx.moveTo(16,30);
		ctx.bezierCurveTo(20,40,40,40,44,30);
		ctx.bezierCurveTo(40,48,20,48,16,30);
		ctx.fill();
		ctx.stroke();
		ctx.restore();
		
		ctx.save();
		ctx.clip();
		ctx.strokeStyle = 'black';
		for(var i = 0; i < 7; i++){
			ctx.moveTo(17 + i * 4,30);
			ctx.lineTo(17 + i * 4,90);
			ctx.stroke();
		}
		ctx.restore();
		ctx.closePath();

		ctx.beginPath();
		radial = ctx.createRadialGradient(20,25,10,30,30,30);
		radial.addColorStop(0,'rgba(255,255,255,0.3)');
		radial.addColorStop(1,'rgba(188,225,251,0.8)');
		ctx.arc(30,30,30,0,Math.PI *2 ,false);
		ctx.fillStyle = radial;
		ctx.fill();
		ctx.closePath();
		
		return canvas.toDataURL('image/png');
	}
	return enemys;
});