window.onload = function(){
	var canvas = document.getElementById('canvas');

	if(!canvas.getContext) return;
	
	canvas.width = 605;
	canvas.height = 621;
	onloads[0]();
	var ctx = canvas.getContext('2d'),
		goNumElement = document.getElementById("go").getElementsByTagName('span')[0],
		lastAnimationTime = 0,
		isOver = false,
		movingPath = onloads[1](),
		enemys = onloads[2](ctx,movingPath),	//敌人数组
		bullets = onloads[3](ctx,enemys,movingPath),	//子弹数组
		batterys = onloads[4](ctx , movingPath, enemys , bullets),	//炮台数组
		enIndex = 0,
		goIndex = 0,
		timeId = 0,
		interval = 500,
		enemyGos = [	//敌人进攻
			createArray(40),
			createArray(20,40),
			createArray(20,50),
			createArray(20,80),
			createArray(0,100),
			createAArray(2,20).concat(createArray(40,40,40)),
			createAArray(2,20).concat(createArray(40,80,40)),
			createArray(0,100,80),
			createAArray(2,40).concat(createArray(0,80,40)),
			[60],
			createAArray(2,40).concat(createArray(0,80,40)).concat(createAArray(2,40)),
			createArray(0,0,50,50),
			createArray(0,10,40,40),
			createArray(0,20,40,40),	
			createArray(0,20,80,40),	
			createArray(0,0,80,80),	
			createArray(0,0,80,80),	
			createArray(0,0,40,40,40),
			createArray(0,0,50,50,50),
			[100],
			createArray(0,0,60,70,80),
			createArray(0,0,60,70,80).concat([140]),
			createArray(0,0,0,0,80,20),
			createArray(0,0,0,0,80,40),
			createArray(0,0,0,0,80,80),
			createArray(0,0,0,0,80,80),
			createArray(0,0,0,0,80,80),
			createArray(0,0,0,0,80,80),
			createArray(0,0,0,0,80,80),
			createArray(0,0,0,0,80,80),
			createArray(0,0,0,0,80,40),
			[180],
			createArray(0,0,0,0,80,80),
			createArray(0,0,0,0,80,80),
			createArray(0,0,0,0,80,80),
			createArray(0,0,0,0,80,80),
			createArray(0,0,0,0,80,80),
			createArray(0,0,0,0,80,80),
			createAArray(5,30).concat(createAArray(250,1)).concat(createArray(0,0,0,0,80,80)).concat([250]),
			createAArray(250,2),
			[600]
		];
	onloads = null;
	document.getElementById("go").getElementsByTagName('span')[1].innerHTML = enemyGos.length;
	//创建数组	createArray(0,1,2,3,4,5); 0个0级,1个1级,2个2级....
	
	function createArray(level0,level1,level2,level3,level4,level5,level6){
		return [].concat(createAArray(0,level0),
			createAArray(1,level1),
			createAArray(2,level2),
			createAArray(3,level3),
			createAArray(4,level4),
			createAArray(5,level5),
			createAArray(6,level6));
	}
	function createAArray(num , count){
		var array = [];
		for(var i = 0; i < count; i++){
			array.push(num);
		}
		return array;
	}
	
	document.getElementById('go').onclick = function(){
		if(enemyGos.length == goIndex)
		{
			alert('已通关!');
			isOver = true;
			return;
		}
		var go = this;
		go.disabled = true;
		if(goIndex == enemyGos.length) return;
		
		timeId = setInterval(function(){
			enemys.add(enemyGos[goIndex][enIndex++]);
			if(enIndex == enemyGos[goIndex].length){
				clearInterval(timeId);
				goIndex++;
				goNumElement.innerHTML = goIndex + 1;
				if(goIndex == 10){
					interval = 400;
				}else if(goIndex == 20){
					interval = 300;
				}else if(goIndex == 30){
					interval = 200;
				}
				enIndex = 0;
				go.disabled = false;
			}
		},interval);
	}
	
	// 绘制
	function paint(){
		
		for(i = 0; i < batterys.length; ++i){	//绘制炮台
			var battery = batterys[i];
			battery.paint(ctx);
		}
		
		for(var i = 0; i < bullets.length; ++i){	//绘制子弹
			var bullets1 = bullets[i];
			for(var j = 0; j < bullets1.length; j++){
				bullets1[j].paint(ctx);
			}
		}
		
		for(var i = 0; i < enemys.length; ++i){	//绘制敌人
			var enemys1 = enemys[i];
			for(var j = enemys1.length - 1; j > -1 ; j--){
				enemys1[j].paint(ctx);
			}
		}
		
	}
	
	// 执行行为
	function update(){
		
		for(i = 0; i < batterys.length; ++i){	//执行炮台行为
			var battery = batterys[i];
			battery.update(ctx);
		}
		
		for(var i = 0; i < bullets.length; ++i){	//执行子弹行为
			var bullets1 = bullets[i];
			for(var j = 0; j < bullets1.length; j++){
				bullets1[j].update(ctx);
			}
		}
		
		for(var i = 0; i < enemys.length; ++i){	//执行敌人行为
			var enemys1 = enemys[i];
			
			for(var j = 0; j < enemys1.length; j++){
				enemys1[j].update(ctx);
			}
		}
		
	}
		
	// 动画函数
	function animate(time){
		if(isOver) return;
		var now = +new Date;
		if(now - lastAnimationTime > 200){
			lastAnimationTime = now;
			window.requestNextAnimationFrame(animate);
			return;
		}
		lastAnimationTime = now;
		if(life < 1){
			alert('你失败了!');
			return;
		}
		
		
		ctx.clearRect(0,0,canvas.width,canvas.height);
		//movingPath.drawPath(ctx);
		update();
		paint();
		drawFps();
		
		window.requestNextAnimationFrame(animate);
	}
	
	window.requestNextAnimationFrame(animate);
	
	ctx.font = '20px a';
	var drawFps = function(){
		var lastTime = 0,
			lastUpdateTime = 0,
			lastUpdateFps = 0,
			interval = 1000;
		
		return function(){
			var now = +new Date,
				fps = (1000 / (now - lastTime)).toFixed();
			
			lastTime = now;
			if(now - lastUpdateTime > interval){
				lastUpdateTime = now;
				lastUpdateFps = fps;
			}
			
			ctx.fillText('fps:' + lastUpdateFps , 20,20);
			
		}
	}();
};