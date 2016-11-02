!function(){
	var $ = function(s) {
	return document.querySelector(s);
}

var box = $("#canvas");
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");

box.appendChild(canvas);

var WIDTH, //canvas高
	HEIGHT; //canvas 宽

var SIZE = 32; //音乐片段数

var ARR = []; //该数组保存canvas中各图形的x,y坐标以及他们的颜色
ARR.dotMode = "random";

function init() {
	WIDTH = box.clientWidth;
	HEIGHT = box.clientHeight;
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	ctx.globalCompositeOperation = "lighter"; //"lighter":表示显示源图像 + 目标图像
	ctx.lineWidth = (WIDTH < HEIGHT ? WIDTH : HEIGHT) / 30;
	getArr();
}

init();

/*
 *  获取[min ,max]之间的随机数
 *  若无参数则min = 0，max = 1
 *	max < min 则返回 0
 */
function random(min, max) {
	min = min || 0;
	max = max || 1;
	return max >= min ? Math.round(Math.random() * (max - min) + min) : 0;
}

function getArr() {
	//创建线性渐变对象，以便绘制柱状图使用
	ARR.length = 0;
	//context.createLinearGradient(x0,y0,x1,y1)
	//x0:渐变开始点的x坐标
	//y0:渐变开始点的y坐标
	//x1渐变结束点的x坐标
	//y1渐变结束点的y坐标
	ARR.linearGradient = ctx.createLinearGradient(0, HEIGHT, 0, 0);
	ARR.linearGradient.addColorStop(0, 'green');
	ARR.linearGradient.addColorStop(0.5, '#ff0');
	ARR.linearGradient.addColorStop(1, '#f00');

	for (var i = 0; i < SIZE; i++) {
		var x = random(0, WIDTH),
			y = random(0, HEIGHT),
			color = 'rgba(' + random(100, 250) + ',' + random(50, 250) + ',' + random(50, 100) + ',0)',
			ran = random(1, 8) * 0.2;
		ARR.push({
			x: x,
			y: y,
			color: color,
			dx: ARR.dotMode == "random" ? ran : 0,
			dx2: ran,
			dy: random(1, 5),
			cap: 0,
			cheight: 10
		});
	}
}

//窗口resize则重新计算heigth，width以及canvas的宽高
window.onresize = init;

function Render() {
	var o = null;
	return function(del, ave) {
		ctx.fillStyle = ARR.linearGradient;
		var w = Math.round(WIDTH / SIZE),
			cgap = Math.round(w * 0.3);
		cw = w - cgap;
		ctx.clearRect(0, 0, WIDTH, HEIGHT);
		if (Render.type == 'Dot' && ((del > 3 && ave > 30) || (ave > 50 && del > 0))) {
			var d = Math.round(del * (ave - 20) * 0.01) + 4;
			for (var i = 0; i < d; i++) {
				var y = random(-HEIGHT * 2, 3 * HEIGHT);
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(WIDTH, HEIGHT - y);
				ctx.strokeStyle = 'rgb(' + random(100, 250) + ',' + random(50, 250) + ',' + random(50, 100) + ')';
				ctx.stroke();
			}
		}
		for (var i = 0; i < SIZE; i++) {
			o = ARR[i];
			if (Render.type == 'Dot') {
				var x = o.x,
					y = o.y,
					r = Math.round((this[i] / 2 + 18) * (HEIGHT > WIDTH ? WIDTH : HEIGHT) / 600);
				o.x += o.dx;
				o.x > WIDTH && (o.x = 0);

				//开始路径，绘画圆
				ctx.beginPath();
				ctx.arc(x, y, r, 0, Math.PI * 2, true);
				var gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
				gradient.addColorStop(0, "rgb(255,255,255)");
				gradient.addColorStop(1, o.color);
				ctx.fillStyle = gradient;
				ctx.fill();
			}
			if (Render.type == 'Column') {
				var h = this[i] / 280 * HEIGHT;
				ARR[i].cheight > cw && (ARR[i].cheight = cw);
				if (--ARR[i].cap < ARR[i].cheight) {
					ARR[i].cap = ARR[i].cheight;
				};
				if (h > 0 && (ARR[i].cap < h + 40)) {
					ARR[i].cap = h + 40 > HEIGHT ? HEIGHT : h + 40;
				}
				ctx.fillRect(w * i, HEIGHT - ARR[i].cap, cw, ARR[i].cheight);
				ctx.fillRect(w * i, HEIGHT - h, cw, h);
			}
		}
	}
}

Render.type = "Dot";
var lis = document.querySelectorAll(".music-list li");
var visualizer = new MusicVisualizer({
	size: SIZE,
	onended: function() {
		if ($(".play")) {
			$(".play").nextElementSibling ? $(".play").nextElementSibling.click() : lis[0].click();
		} else {
			lis[0].click();
		}
	},
	visualizer: Render()
});

for (var i = 0; i < lis.length; i++) {
	lis[i].onclick = function() {
		visualizer.play('/media/' + this.title);
		var play = $("li.play");
		play && (play.className = ""); //如果play不为false则执行play.className = ""
		this.className = "play";
	}
}

lis[0].click();

var types = document.querySelectorAll(".type li");
for (var i = 0; i < types.length; i++) {
	types[i].onclick = function() {
		var selected = $('.type li.selected');
		selected && (selected.className = ''); //如果selected不为false则执行selected.className = ""
		this.className = "selected";
		Render.type = this.innerHTML;
	}
}

canvas.onclick = function() {
	if (Render.type == 'Dot') {
		for (var i = 0; i < SIZE; i++) {
			ARR.dotMode == "random" ? ARR[i].dx = 0 : ARR[i].dx = ARR[i].dx2;
		}
		ARR.dotMode = ARR.dotMode == "static" ? "random" : "static";
	}
}

$("#volume").oninput = function() {
	visualizer.changeVolume(this.value / this.max);
}

$("#volume").oninput();
}();