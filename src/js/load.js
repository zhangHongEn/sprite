onloads = [],
	life = 200,
	money = 800,
	lifeElement = null,
	moneyElement = null;

//播放音乐构造函数
function Audios(src,volume){
	Array.call(this);
	
	this.index = 0;
	
	var	audio = null;
	for(var i = 0; i < 10; ++i){
		audio = new Audio(src);
		audio.load();
		audio.volume = volume;
		audio.src = src;
		this.push(audio);
	}
}
create(Array,Audios,{
	isPlaying : function(audio){
		return !audio.ended && audio.currentTime > 0;
	},
	play : function(){
		var length = this.length;
		for(var i = 0; i < length; ++i){
			var audio = this[i];
			if(!this.isPlaying(audio)){
				audio.play();
				return;
			}
		}
	}
});
	
(function(){
	var audio = new Audio('music/back.mp3');
	audio.loop = -1;
	// audio.play();
})();

onloads.push(function(){
	(lifeElement = document.getElementById('life')).innerHTML = life;
	(moneyElement = document.getElementById('money')).innerHTML = money;
});

//更新生命值
function updateLife(){
	lifeElement.innerHTML = life;
}

//更新金钱
function updateMoney(){
	moneyElement.innerHTML = money;
}

//判断两个圆形碰撞
function isCollision(x1 , x2 , y1 , y2, r){
	return Math.sqrt(Math.pow(x1 - x2 , 2) + Math.pow(y1 - y2 , 2)) <= r;
}

function isArcRectCollides(arcX,arcY,arcR,rectX,rectY,rectW,rectH){  
  var arcOx = arcX + arcR,//圆心X坐标  
	arcOy = arcY + arcR,//圆心Y坐标 
	minDisX = 0,
	minDisY = 0; 

  if(((rectX-arcOx) * (rectX-arcOx) + (rectY-arcOy) * (rectY-arcOy)) <= arcR * arcR)  
	  return true;  
  if(((rectX+rectW-arcOx) * (rectX+rectW-arcOx) + (rectY-arcOy) * (rectY-arcOy)) <= arcR * arcR)  
	  return true;  
  if(((rectX-arcOx) * (rectX-arcOx) + (rectY+rectH-arcOy) * (rectY+rectH-arcOy)) <= arcR * arcR)  
	  return true;  
  if(((rectX+rectW-arcOx) * (rectX+rectW-arcOx) + (rectY+rectH-arcOy) * (rectY+rectH-arcOy)) <= arcR * arcR)  
	  return true;  
  //分别判断矩形4个顶点与圆心的距离是否<=圆半径；如果<=，说明碰撞成功  
	
	
  if(arcOy >= rectY && arcOy <= rectY + rectH){  
	  if(arcOx < rectX)  
		  minDisX = rectX - arcOx;  
	  else if(arcOx > rectX + rectW)  
		  minDisX = arcOx - rectX - rectW;  
	  else   
		  return true;  
	  if(minDisX <= arcR)  
		  return true;  
  }//判断当圆心的Y坐标进入矩形内时X的位置，如果X在(rectX-arcR)到(rectX+rectW+arcR)这个范围内，则碰撞成功  
	
  if(arcOx >= rectX && arcOx <= rectX + rectW){  
	  if(arcOy < rectY)  
		  minDisY = rectY - arcOy;  
	  else if(arcOy > rectY + rectH)  
		  minDisY = arcOy - rectY - rectH;  
	  else  
		  return true;  
	  if(minDisY <= arcR)  
		  return true;  
  }//判断当圆心的X坐标进入矩形内时Y的位置，如果X在(rectY-arcR)到(rectY+rectH+arcR)这个范围内，则碰撞成功  
  return false;  
}  
		
		
//临时中转函数
function obj(o) {				
	function F() {}				
	F.prototype = o;			
	return new F();			
}

//寄生函数
function create(box, desk , extend) {
	var f = obj(box.prototype);
	f.constructor = desk;				//调整原型构造指针
	desk.prototype = f;
	
	//扩展子属性方法
	if(extend instanceof Object){
		for(var key in extend){
			f[key] = extend[key];
		}
	}
}

//得到向量
function unitVector(x1,y1 ,x2, y2){
	var bottom = x2 - x1,
		right = y2 - y1,
		vector = Math.sqrt(Math.pow(bottom,2) +
			Math.pow(right,2));
	
	return {
		x: bottom /=  vector,
		y: right /= vector
	}
}

//删除指定下标或索引
Array.prototype.remove=function(obj){  
    for(var i =0;i <this.length;i++){  
        var temp = this[i];  
        if(!isNaN(obj)){  
            temp=i;  
        }  
        if(temp == obj){  
            for(var j = i;j <this.length;j++){  
                this[j]=this[j+1];  
            }  
            this.length = this.length-1;  
        }
    }  
};