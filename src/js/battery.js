onloads.push(function(ctx , movingPath , enemys,bullets){

	var	batterys = [],	//防御塔数组
		batteryInfos = [
			{	//子弹炮台
				img : imgBulletBattery(),
				title : '发射子弹的防御塔,一发子弹攻击一个敌人,攻速快,攻击高',
				price : 500
			},
			{	//炮弹炮台
				img : imgPunctureBattery(),
				title : '发射穿透子弹的防御塔,子弹体积大,可穿透',
				price : 400
			},
			{	//冰冻炮台
				img : imgFrozenBattery(),
				title : '冰冻防御塔,可冰冻敌人无法移动一段时间',
				price : 500
			}
		],
		selectedPrice = 0,
		mouseYes = false,	//是否可放置鼠标防御塔
		mouseBattery = null,	//要购买的防御塔,跟随鼠标,未放置
		canvasLeft = 0,
		canvasTop = 0;
		
	var BTE = document.body.appendChild(document.createElement('p'));
	BTE.id = 'bTitle';
	BTE.style = 'position:absolute; left:0px; top:0px; display:none;'
	
	canvasLeft = parseFloat(getComputedSty(ctx.canvas,'marginLeft'));
	canvasTop = parseFloat(getComputedSty(ctx.canvas,'marginTop'));
	
	//获得计算后样式
	function getComputedSty(element,style){
		if(window.getComputedStyle)
			return window.getComputedStyle(element,false)[style];
		else if(element.currentStyle)
			return element.currentStyle[style];
	}
	
	function attack(){	//攻击
		return {
			lastTime : +new Date,
			execute : function(sprite,ctx,time){
				if(!sprite.isAttack) return;
			
				var battery = sprite,
					enemy = null,
					now = +new Date,
					baR = battery.width / 2,
					enR = 0,
					pathIndexs = sprite.pathIndexs;
				if(now - this.lastTime < sprite.speed * 1000)	return;
				
				// if(sprite.prEnemy){
					// enemy = sprite.prEnemy;
					// enR = enemy.width / 2;
					// if(enemys[enemy.pathIndex].indexOf(enemy) != -1 && isCollision(battery.left +  baR, enemy.left + enR, battery.top + baR , enemy.top + enR , battery.r + enR)) {
						// sprite.attack(battery.left +  baR,battery.top + baR,unitVector(battery.left+  baR,battery.top+  baR,enemy.left + enR, enemy.top+ enR),sprite.hurt, sprite.num);
						// this.lastTime = now;
						// return;
					// }
				// }
					
				for(var i = pathIndexs.length-1; i > -1; i--){
					var enemys1 = enemys[pathIndexs[i]];
					
					for(var j = 0; j < enemys1.length; j++){
						enemy = enemys1[j];
						enR = enemy.width / 2;
						
						if(isCollision(battery.left +  baR, enemy.left + enR, battery.top + baR , enemy.top + enR , battery.r + enR)){
							sprite.prEnemy = enemy;
							sprite.attack(battery.left +  baR,battery.top + baR,unitVector(battery.left+  baR,battery.top+  baR,enemy.left + enR, enemy.top+ enR),sprite.hurt , sprite.num);
							this.lastTime = now;
							return;
						}
					}
				}
				
			}
		}
	}
	
	//普通防御塔构造函数	r:范围 , speed:攻击速度
	//继承精灵绘制器构造函数
	function OrdinaryBattery(r , speed , img,behaviors){
		var imgPaint = new ImagePainter(img);
		Sprite.call(this, imgPaint,behaviors||[]);
		imgPaint.paint = function(){
			var paint = imgPaint.paint;
			return function(sprite,ctx){
				paint.call(this,sprite,ctx);
				if(sprite.isRange){
					OrdinaryBattery.prototype.drawRange(sprite,ctx);
				}
			}
		}();
		
		this.prEnemy = undefined;
		this.isAttack = false;
		this.isRange = true;
		this.pathIndexs = [];
		this.r = r;
		this.level = 0;
		this.speed = speed;
		this.money = 0;
	}
	
	//防御塔继承精灵绘制器原型
	create(Sprite , OrdinaryBattery , {
		//绘制防御塔范围
		drawRange : function(sprite,ctx){
			var rangeR = sprite.r,
				spriteR = sprite.width / 2;
			
			ctx.save();
			ctx.beginPath();
			ctx.fillStyle = mouseYes ?'rgba(50,100,175,0.3)' : 'rgba(255,0,0,0.3)';
			ctx.arc(sprite.left + spriteR, sprite.top + spriteR, rangeR , 0 , Math.PI * 2 , false);
			ctx.fill();
			ctx.restore();
			ctx.closePath();
			
			if(!mouseYes) return;
			
			ctx.save();
			ctx.beginPath();
			ctx.fillStyle = 'rgb(255,0,0)';
			ctx.arc(sprite.left + spriteR, sprite.top + spriteR, 5 , 0 , Math.PI * 2 , false);
			ctx.fill();
			ctx.restore();
			ctx.closePath();
		}
	});
	
	//子弹攻击防御塔构造函数 继承普通防御塔
	function BulletAttackBattery(r , speed ,img, hurt){
		OrdinaryBattery.call(this , r , speed,img , [
			attack()
		]);
		this.hurt = hurt;
	}
	
	//子弹攻击防御塔继承普通防御塔原型
	create(OrdinaryBattery , BulletAttackBattery,{
		attack : function(batX , batY , vector , hurt){
			bullets.addBullet(batX , batY , vector , hurt);
			this.play();
		},
		upgrades : [	//升级信息
			{price : 300 , speed : 1.2 , title : '攻击速度增加'},
			{price : 300 , r : 20 , title : '攻击范围增加'},
			{price : 600 , speed : 0.9 , r : 20 , title : '攻击速度增加\n攻击范围增加'},
			{price : 1200 , speed : 0.6 , r : 20 , title : '攻击速度增加\n攻击范围增加'},
			{price : 5000 , speed : 0.3 , r : 20, title : '攻击速度增加\n攻击范围增加'},
			{price : 15000 , speed : 0.1 , r : 20 , hurt : 1, title : '攻击速度增加\n攻击范围增加\n攻击力增加'}
		],
		upgrade : function(){	//升级
			var upgrade = this.upgrades[this.level];
			
			if(!upgrade || window.money < upgrade.price){
				return;
			}
			battGetAttackPath(this);
			this.level++;
			this.speed = upgrade.speed || this.speed;
			this.hurt += upgrade.hurt || 0;
			this.r += upgrade.r || 0;
			this.money += upgrade.price / 2;
			
			window.money -= upgrade.price;
			window.updateMoney();
		},
		sell : function(){	//卖出
			batterys.remove(this);
			window.money += this.money;
			window.updateMoney();
		},
		audios : new Audios('music/bullet.mp3',0.2),
		play : function(){
			this.audios.play();
		}
	});
	
	//穿弹攻击防御塔继承子弹攻击防御塔
	function PunctureAttackBattery(r , speed , img,  hurt , num){
		BulletAttackBattery.call(this, r, speed , img , hurt);
		this.num = num;
	}
	//穿弹攻击防御塔继承子弹防御塔原型
	create(BulletAttackBattery ,PunctureAttackBattery,{
		attack : function(batX , batY , vector , hurt , num){
			this.play();
			bullets.addPuncture(batX , batY , vector , hurt , num);
		},
		upgrades : [	//升级信息
			{price : 400 , speed : 1.5 , title : '攻击速度增加'},
			{price : 400 , r : 20 , title : '攻击范围增加'},
			{price : 1500 , speed : 1.2 , r : 20 , num : 1, title : '攻击速度增加\n攻击范围增加\n穿透个数增加'},
			{price : 3000 , speed : 0.8 , r : 20 , num : 2, title : '攻击速度增加\n攻击范围增加\n穿透个数增加'},
			{price : 6000 , speed : 0.5 , r : 10 , num : 4, title : '攻击速度增加\n攻击范围增加\n穿透个数大幅增加'},
			{price : 15000 , speed : 0.2 , r : 10 , num : 4, title : '攻击速度增加\n攻击范围增加\n穿透个数大幅增加'}
		],
		upgrade : function(){
			var upgrade = this.upgrades[this.level];
			
			if(!upgrade || window.money < upgrade.price){
				return;
			}
			battGetAttackPath(this);
			this.level++;
			this.speed = upgrade.speed || this.speed;
			this.hurt += upgrade.hurt || 0;
			this.r += upgrade.r || 0;
			this.num += upgrade.num || 0;
			this.money += upgrade.price / 2;
			
			window.money -= upgrade.price;
			window.updateMoney();
		}
	});
	
	
	//冰冻塔 继承穿弹防御塔构造函数
	function FrozenBattery(r , speed , img , hurt, num){	//num:持续时间
		PunctureAttackBattery.call(this, r , speed , img , hurt , [
			attack()
		]);
		this.num = num;
		this.isFrozeing = false;
	}
	//冰冻塔原型 继承穿弹防御塔原型
	create(PunctureAttackBattery , FrozenBattery,{
		frozeing : function(){
			this.isFrozeing = true;
			var battery = this;
			setTimeout(function(){
				battery.isFrozeing = false;
			},400);
		},
		attack : function(batX , batY , vector , hurt , num){
			this.play();
			for(var i = this.pathIndexs.length-1; i > -1; i--){
				var enemys1 = enemys[this.pathIndexs[i]];
				
				for(var j = enemys1.length - 1; j > -1 ; j--){
					enemy = enemys1[j];
					enR = enemy.width / 2,
					baR = this.width / 2;
					
					if(isCollision(this.left +  baR, enemy.left + enR, this.top + baR , enemy.top + enR , this.r + enR)){
						if(hurt) enemy.downLevel(hurt);
						enemy.froze(num);
						this.frozeing();
					}
				}
			}
		},
		upgrades : [	//升级信息
			{price : 300 , speed : 3.5 , title : '攻击速度增加'},
			{price : 300 , r : 10 , title : '攻击范围增加'},
			{price : 800 , speed : 3.3 , r : 8, title : '攻击速度增加\n攻击范围增加'},
			{price : 1200 , speed : 3.0 , r : 8 , title : '攻击速度增加\n攻击范围增加'},
			{price : 4000 , speed : 2.8 , r : 8 , num : 0.2, title : '攻击速度增加\n攻击范围增加\n持续时间增加'},
			{price : 8000 , speed : 2.4 , r : 8 , num : 0.2, title : '攻击速度增加\n攻击范围增加\n持续时间增加'}
		],
		audios : new Audios('music/froze.mp3',1)
	});
	FrozenBattery.prototype.oldPaint = FrozenBattery.prototype.paint;
	FrozenBattery.prototype.paint = function(ctx){
		this.oldPaint(ctx);
		
		if(this.isFrozeing){
			var baR = this.width / 2,
				baLeft = this.left + baR,
				baTop = this.top + baR,
				radial = ctx.createRadialGradient(baLeft , baTop , baR / 10 , baLeft , baTop , this.r);
			radial.addColorStop(0.5 , 'rgba(90,179,230,0)');
			radial.addColorStop(1 , 'rgba(90,179,230,0.5)');
			ctx.beginPath();
			ctx.save();
			ctx.fillStyle = radial;
			ctx.arc(baLeft, baTop , this.r , 0 , Math.PI * 2, false);
			ctx.fill();
			ctx.restore();
			ctx.closePath();
		}
	};
	
	//加载商店 
	//鼠标点击防御塔事件(购买)	加载图片 显示提示文本
	(function(){
		var imgs = document.getElementById('shop').getElementsByTagName('img');
		for(var i = 0;i < imgs.length; ++i){
			(function(i){
				imgs[i].index = i;
			})(i);
		}
		(function(){	//防御塔商店图片
			for(var i =0; i < batteryInfos.length; i++){
				imgs[i].src = batteryInfos[i].img.src;
				imgs[i].onclick = buyBattery;
				imgs[i].onmousemove = titleBattery;
				imgs[i].onmouseout = clearTitle;
			}
		})();
		clearTitle();
		//显示提示文本
		function titleBattery(event){
			var event = window.event || event,
				element = event.target || event.srcElement;
			if(element.index > batteryInfos.length -1) return;
			
			BTE.style.position = 'absolute';
			BTE.style.left = event.pageX + 20;
			BTE.style.top = event.pageY + 20;
			BTE.style.display = 'block';
			BTE.innerHTML = batteryInfos[element.index].title + '<br/>&nbsp;<strong>$:' + batteryInfos[element.index].price + '</strong>';
		}
		//清空提示文本
		function clearTitle(){
			BTE.innerHTML = '';
			BTE.style.display = 'none';
		}
		//点击商店防御塔
		function buyBattery(event){
			var event = window.event || event,
				img = event.srcElement || event.target;
				
			clearIsRange();
			clearBottomInfo();
			
			if(window.money < batteryInfos[img.index].price){
				return;
			}
			
			if(mouseBattery) {
				batterys.remove(mouseBattery);
			}
			
			selectedPrice = batteryInfos[img.index].price;
			
			mouseBattery = getClickShopBattery(img.index);
			
			mouseBattery.left = -mouseBattery.r *2;
			mouseBattery.top = -mouseBattery.r * 2;
			loadBattery(mouseBattery);
			batterys.push(mouseBattery);
			ctx.canvas.onmousemove = mouseBattMove;
			ctx.canvas.onclick = mouseBatt;
		}
		
		//取消要买的商店防御塔
		function cancelBattery(){
			batterys.remove(mouseBattery);
			mouseBattery = null;
		}
		
		//得到点击的商店防御塔
		function getClickShopBattery(index){
			switch(index){
				case 0:
					return new BulletAttackBattery(80,1.5, batteryInfos[index].img, 2);
				case 1:
					return new PunctureAttackBattery(80,2,batteryInfos[index].img,1,4);
				case 2:
					return new FrozenBattery(40,4,batteryInfos[index].img , 0 , 1.5);
				break;
			}
		}
		
		//防御塔跟随鼠标移动
		function mouseBattMove(event){
			mouseBattery.left = event.pageX - canvasLeft - mouseBattery.width / 2;
			mouseBattery.top = event.pageY - canvasTop - mouseBattery.height / 2;
			
			var spriteR = mouseBattery.width / 2;
			
			for(var i = 0; i < movingPath.length; i++){
				var path = movingPath[i].getLeftTop();
				if(isArcRectCollides(mouseBattery.left, mouseBattery.top , spriteR , path.x , path.y , movingPath[i].w , movingPath[i].h)){
					mouseYes = false;
					return;
				}
			}
			
			for(i = 0; i < batterys.length - 1; i++){
				var battery = batterys[i],
					spriteR1 = battery.width / 2;
					
				if(isCollision(mouseBattery.left +  spriteR, battery.left + spriteR1, mouseBattery.top + spriteR , battery.top + spriteR1 ,spriteR  + spriteR1)){
					mouseYes = false;
					return;
				}
			}
			
			mouseYes = true;
			
		}
		//点击固定防御塔
		function mouseBatt(){
			if(!mouseYes) {
				cancelBattery();
				mouseBattery = null;
				ctx.canvas.onmousemove = null;
				ctx.canvas.onclick = selectedBattery;
				return;
			};
			
			window.money -= selectedPrice;
			window.updateMoney();
			
			mouseBattery.money += selectedPrice/2;
			mouseBattery.isRange = false;
			mouseBattery.isAttack = true;
			battGetAttackPath(mouseBattery);
			mouseBattery = null;
			ctx.canvas.onmousemove = null;
			ctx.canvas.onclick = selectedBattery;
		}
	})();
	
	
	var upInfoElement = null,
		sellPriceElement = null,
		upgradeElement = null;
	upInfoElement = document.getElementById('level');
	sellPriceElement = document.getElementById('sell');
	upgradeElement = document.getElementById('upgrade');
	
	//选中防御塔
	function selectedBattery(event){
	
		var event = window.event || event,
			flag = false;
			
		clearIsRange();	
			
		for(i = 0; i < batterys.length; i++){
			var battery = batterys[i],
				spriteR1 = battery.width / 2;
			
			if(isCollision(event.pageX - canvasLeft, battery.left + spriteR1, event.pageY - canvasTop , battery.top + spriteR1 ,1  + spriteR1)){
			
				battery.isRange = flag = true;
				
				showInfo(battery);
				
				sellPriceElement.onclick = function(){
					battery.sell();
					clearBottomInfo();
				};
				
				if(battery.upgrades.length == battery.level) return;
				
				upgradeElement.onclick = function(){
					battery.upgrade();
					if(battery.upgrades.length == battery.level){
						upgradeElement.innerHTML = '';
						upgradeElement.onclick = null;
						upInfoElement.innerHTML = battery.level + 1;
						sellPriceElement.innerHTML = battery.money;
					}else{
						showInfo(battery);
					}
				};
				return;
			}
		}
		
		clearBottomInfo();
	}
	
	function clearIsRange(){
		for(i = 0; i < batterys.length; i++){
			batterys[i].isRange = false;
		}	
	}
	
	//清空下方售出 升级信息
	function clearBottomInfo(){
			upInfoElement.innerHTML = '';
			sellPriceElement.innerHTML = '';
			sellPriceElement.onclick = null;
			upgradeElement.innerHTML = '';
			upgradeElement.onclick = null;
	}
	
	//显示信息
	function showInfo(battery){
		upInfoElement.innerHTML = battery.level + 1;
		sellPriceElement.innerHTML = battery.money;
		if(battery.level < battery.upgrades.length)
			upgradeElement.innerHTML = battery.upgrades[battery.level].price + '<br/>升级:' + battery.upgrades[battery.level].title;
	}
	
	//加载防御塔
	function loadBattery(battery){
		battery.width = battery.painter.image.width;
		battery.height = battery.painter.image.height;
		spriteR = battery.width / 2;
		
	}
	
	//防御塔获得攻击路径
	function battGetAttackPath(battery){
		battery.pathIndexs = [];
		var rangeR = battery.r,
			spriteR = battery.width / 2,
			path = null;
			
		for(var i = 0; i < movingPath.length; ++i){
			path = movingPath[i].getLeftTop();
		
			if(isArcRectCollides(battery.left + spriteR - rangeR, battery.top + spriteR  - rangeR, rangeR , path.x , path.y , movingPath[i].w , movingPath[i].h)){
				battery.pathIndexs.push(i);
			}
		}
		
	}
	
	function imgMouth(ctx){
		ctx.beginPath();
		ctx.save();
		ctx.fillStyle = 'rgba(255,255,255,0.9)';
		ctx.moveTo(6,20);
		ctx.bezierCurveTo(10,30,30,30,34,20);
		ctx.bezierCurveTo(30,38,10,38,6,20);
		ctx.fill();
		ctx.stroke();
		ctx.restore();
		
		ctx.save();
		ctx.clip();
		ctx.strokeStyle = 'black';
		for(var i = 0; i < 7; i++){
			ctx.moveTo(6 + i * 4,10);
			ctx.lineTo(6 + i * 4,60);
			ctx.stroke();
		}
		ctx.restore();
		ctx.closePath();
	}
	
	//子弹防御塔 图片
	function imgBulletBattery(){
		var canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d'),
			img = new Image();
		canvas.width = canvas.height = 40;
		ctx.beginPath();
		ctx.save();
		var radial = ctx.createRadialGradient(15,15,10,20,20,20);
		radial.addColorStop(0,'rgba(252,170,155,0.9)');
		radial.addColorStop(1,'rgba(220,100,142,0.9)');
		ctx.fillStyle = radial;
		ctx.arc(20,20,20,0,Math.PI * 2 , false);
		ctx.fill();
		ctx.restore();
		ctx.closePath();
		
		imgMouth(ctx);
		
		ctx.beginPath();
		ctx.arc(15,15,1,0,Math.PI * 2 , false);
		ctx.arc(25,15,1,0,Math.PI * 2 , false);
		ctx.fill();
		ctx.closePath();
		
		ctx.beginPath();
		ctx.save();
		ctx.fillStyle = 'rgba(220,100,98,0.9)';
		ctx.moveTo(9,20);
		ctx.bezierCurveTo(9,18,16,18,15,20);
		ctx.bezierCurveTo(16,22,9,22,9,20);
		
		ctx.moveTo(23,20);
		ctx.bezierCurveTo(23,18,32,18,30,20);
		ctx.bezierCurveTo(30,22,23,22,23,20);
		ctx.fill();
		ctx.restore();
		ctx.closePath();

		img.src = canvas.toDataURL('image/png');
		
		return img;
	}
	//穿弹塔图片
	function imgPunctureBattery(){
		var canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d'),
			img = new Image();
		canvas.width = canvas.height = 40;
		
		ctx.beginPath();
		ctx.save();
		var radial = ctx.createRadialGradient(15,15,10,20,20,20);
		radial.addColorStop(0,'rgba(251,239,67,0.9)');
		radial.addColorStop(1,'rgba(252,107,4,0.9)');
		ctx.fillStyle = radial;
		ctx.arc(20,20,20,0,Math.PI * 2 , false);
		ctx.fill();
		ctx.restore();
		ctx.closePath();
		
		ctx.beginPath();
		ctx.moveTo(15,25);
		ctx.lineTo(25,25);
		ctx.stroke();
		ctx.closePath();
		
		ctx.beginPath();
		ctx.arc(14,15,1,0,Math.PI * 2 , false);
		ctx.arc(26,15,1,0,Math.PI * 2 , false);
		ctx.fill();
		ctx.closePath();
		
		
		img.src = canvas.toDataURL('image/png');
		
		return img;
	}
	
	//冰冻塔图片
	function imgFrozenBattery(){
		var canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d'),
			img = new Image(),
			radial = ctx.createRadialGradient(20 ,20 ,5 ,20 ,20 ,20);
			
		radial.addColorStop(0.1,'rgba(202,230,248,0.5)');
		radial.addColorStop(1,'rgba(202,230,248,1)');
		canvas.width = 40;
		canvas.height = 40;
		ctx.beginPath();
		ctx.save();
		ctx.fillStyle = radial;
		ctx.arc(20,20,20,0,Math.PI*2,false);
		ctx.fill();
		ctx.closePath();
		ctx.restore();
		img.src = canvas.toDataURL('image/png');
		return img;
	}
	return batterys;
});