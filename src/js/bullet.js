onloads.push(function(ctx,enemys,movingPath){
	var bullets = [],
		BULLETIMGP = new ImagePainter(imgButtle(10,10,'50,50,50')),	//子弹
		PUNCTUREIMGP = new ImagePainter(imgButtle(20,20,'0,0,0')),	//穿弹
		BLASTIMGP1 = new ImagePainter(imgButtle(80,80,'255,0,0'));	//炸弹
	//********************************************************************更改位置:-=后-前
	(function(){
		for(var i = 0; i < movingPath.length+1; i++){
			bullets.push([]);
		}
	})();
	
	//添加一个子弹
	bullets.addBullet = function(x,y,vector,hurt){
		var bullet = new Bullet(vector ,hurt,BULLETIMGP);
		
		loadBullet(bullet ,x , y);
		bullet.velocityX = 300;
		bullet.velocityY = 300;
		this[this.length - 1].push(bullet);
	}
	//添加一个穿弹
	bullets.addPuncture = function(x,y,vector,hurt , num){
		var bullet = new Puncture(vector,hurt ,PUNCTUREIMGP , num);
		loadBullet(bullet ,x , y);
		bullet.velocityX = 200;
		bullet.velocityY = 200;
		this[this.length - 1].push(bullet);
	}
	
	//加载子弹 宽高坐标
	function loadBullet(bullet ,x , y){
		var img = bullet.painter.image;
		bullet.width = img.width;
		bullet.height = img.height;
		bullet.left = x - img.width/2;
		bullet.top = y - img.width / 2;
	}
	
	//子弹构造函数 继承 精灵绘制器构造函数
	function Bullet(vector,hurt,imgPainter){
		this.vector = vector;
		this.hurt = hurt;
		this.pathIndex = 0;
		
		Sprite.call(this,imgPainter,Bullet.prototype.executes());
	}
	
	//子弹原型 继承精灵绘制器原型 , 扩展自身原型
	create(Sprite,Bullet,{
		executes : function(){
			return [
				{
					execute : saveBulletPath
				},
				{
					lastTime : +new Date,
					execute : move
				}
			];
		},
		remove : function(){	//删除子弹
			if(bullets[this.pathIndex].indexOf(this) == -1){
				bullets[bullets.length - 1].remove(this);
			}else{
				bullets[this.pathIndex].remove(this);
			}
		},
		attack : function(enemy){	//攻击
			this.remove();
			enemy.downLevel(this.hurt);
		}
	});
	
	//穿弹构造函数 继承 子弹构造函数
	function Puncture(vector, hurt , imgPainter, num){
		Bullet.call(this,vector, hurt,imgPainter);
		this.enemys = [];
		this.num = num;
	}
	//穿弹原型 继承 子弹原型
	create(Bullet,Puncture,{
		attack : function (enemy){	//攻击
			if(this.enemys.indexOf(enemy) == -1){
				this.enemys.push(enemy);
				enemy.downLevel(this.hurt);
				if(this.num == this.enemys.length){
					this.remove();
				}
			}
		}
	});
	
	function saveBulletPath(sprite,ctx){	//记录子弹现在的路径
		var bulletR = sprite.width / 2;
		
		for(var i = 0; i < movingPath.length; ++i){
			path = movingPath[i].getLeftTop();
			if(isArcRectCollides(sprite.left + bulletR, sprite.top + bulletR, bulletR , path.x , path.y , movingPath[i].w , movingPath[i].h)){
				var index = sprite.pathIndex;
				if(index == i) return;
				
				if(bullets[index].indexOf(sprite) != -1){
					bullets[index].remove(sprite);
				}else{
					bullets[bullets.length - 1].remove(sprite);
				}
				
				sprite.pathIndex = i;
				bullets[i].push(sprite);
				return;
			}
		}
		
		if(bullets[sprite.pathIndex].indexOf(sprite) != -1){
			bullets[sprite.pathIndex].remove(sprite);
			bullets[bullets.length - 1].push(sprite);
		}
		
	}
	
	function move(sprite,ctx){	//移动
		
		var now = +new Date,
			ms = (now - this.lastTime) / 1000,
			veloX = sprite.velocityX * ms * sprite.vector.x,
			veloY = sprite.velocityY * ms * sprite.vector.y;
		
		if(now - this.lastTime > 200){
			this.lastTime = now;
			return;
		}
		
		this.lastTime = now;
		
		if(sprite.left < 0 || sprite.left > ctx.canvas.width|| 
			sprite.top < 0 || sprite.top > ctx.canvas.height){
			sprite.remove();
		}else{
			var index = sprite.pathIndex,
				buR = sprite.width / 2,
				end = index == 19 ? 1 : 2;
			
			for(var i =  index; i < index +end; i++){
				var enemys1 = enemys[i];
				for(var j = 0; j < enemys1.length; j++){
					var enemy = enemys1[j],
						enR =  enemy.width / 2;
					
					if(isCollision(sprite.left +  buR, enemy.left + enR, sprite.top + buR , enemy.top + enR , buR +enR)){
						
						if(enemys1.indexOf(enemy)!= -1){
							sprite.attack(enemy);
							if(!sprite.enemys){
								return;
							}
						}
						
					}
				}
			}
		}

		sprite.left += veloX;
		sprite.top += veloY;

	}
	
	//子弹图片
	function imgButtle(w , h , colors){
	
		var canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d'),
			radius = w/2 + 0.5 | 0,
			radial = ctx.createRadialGradient(radius , radius , radius/2 +0.5 |0 , radius , radius ,radius),
			img = new Image();
			
		canvas.height = canvas.width = radius*2;
		radial.addColorStop(0.1,'rgba('+colors+',0.3)');
		radial.addColorStop(0.9,'rgba('+colors+',0.9)');
		canvas.width = radius*2;
		canvas.height = radius*2;
		ctx.beginPath();
		ctx.arc(radius,radius,radius,0,Math.PI * 2,false);
		ctx.fillStyle = radial;
		ctx.fill();
		ctx.closePath();
		
		img.src = canvas.toDataURL('image/png');
		return img;
	}
	
	return bullets;
});