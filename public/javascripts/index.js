var $ = function(s) {
	return document.querySelectorAll(s);
}
var box = $("#canvas")[0];
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");

box.appendChild(canvas);

var lis = $('#music_list li');
var width, height;
var size = 32;
var Dots = [];
Dots.dotMode = "random";

var mv = new MusicVisualizer({
	size: size,
	visualizer: draw
});

for (var i = 0; i < lis.length; i++) {
	lis[i].onclick = function() {
		for (var j = 0; j < lis.length; j++) {
			lis[j].className = "";
		}
		this.className = "selected";
		mv.play('/media/' + this.title);
	};
}

// function random(m, n) {
// 	return Math.round(Math.random() * (n - m) + m);
// }

function random(min, max) {
	min = min || 0;
	max = max || 1;
	return max >= min ? Math.round(Math.random() * (max - min) + min) : 0;
}

function getDots() {
	Dots.length = 0;
	Dots.linearGradient = ctx.createLinearGradient(0, height, 0, 0);
	Dots.linearGradient.addColorStop(0, "#008000");
	Dots.linearGradient.addColorStop(0.5, "#FF0");
	Dots.linearGradient.addColorStop(1, "#F00");

	for (var i = 0; i < size; i++) {
		var x = random(0, width),
			y = random(0, height),
			color = "rgba(" + random(100, 250) + "," + random(50, 250) + "," + random(50, 100) + ",0)",
			ran = random(1, 8) * 0.2;
		Dots.push({
			x: x,
			y: y,
			color: color,
			dx: Dots.dotMode == "random" ? ran : 0,
			dx2: ran,
			dy: random(1, 5),
			cap: 0,
			cheight: 10
		});
	};
}

function resize() {
	width = box.clientWidth;
	height = box.clientHeight;
	canvas.width = width;
	canvas.height = height;
	ctx.globalCompositeOperation = "lighter";
	ctx.lineWidth = (height > width ? width : height) / 30;
	getDots();
}

resize();

window.onresize = resize;

function draw(arr, del, ave) {
	var o = null;
	ctx.fillStyle = Dots.linearGradient;
	var w = Math.round(width / size),
		cgap = Math.round(w * 0.3),
		cw = w - cgap;
	capH = cw > 10 ? 10 : cw;
	ctx.clearRect(0, 0, width, height);
	if (draw.type == 'Dot' && ((del > 3 && ave > 30) || (ave > 50 && del > 0))) {
		var d = Math.round(del * (ave - 20) * 0.01) + 4;
		console.log(d);
		for (var i = 0; i < d; i++) {
			var y = random(-height * 2, 3 * height);
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, height - y);
			ctx.strokeStyle = 'rgb(' + random(100, 250) + ',' + random(50, 250) + ',' + random(50, 100) + ')';
			ctx.stroke();
		}
		//if(del > 3){alert(del + ' == ' + ave)}
		//$('.type .selected').innerHTML = del + '=' + ave;
	}
	for (var i = 0; i < size; i++) {
		o = Dots[i];
		if (draw.type == "Dot") {
			var x = o.x,
				y = o.y,
				r = Math.round((this[i] / 2 + 18) * (height > width ? width : height) / 600);
			o.x += o.dx;
			o.x = o.x > width ? 0 : o.x;
			ctx.beginPath();
			var r = 10 + arr[i] / 256 * (height > width ? width : height) / 10;
			ctx.arc(o.x, o.y, r, 0, Math.PI * 2, true);
			var gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
			gradient.addColorStop(0, "rgb(255,255,255)");
			gradient.addColorStop(1, o.color);
			ctx.fillStyle = gradient;
			ctx.fill();
			// var g = ctx.createRadialGradient(x, y, 0, x, y, r);
			// g.addColorStop(0, "#FFF");
			// g.addColorStop(1, o.color);
			// ctx.fillStyle = g;
			// ctx.fill();
		}
		if (draw.type == "Column") {

			// var h = this[i] / 280 * HEIGHT;
			// ARR[i].cheight > cw && (ARR[i].cheight = cw);
			// if (--ARR[i].cap < ARR[i].cheight) {
			// 	ARR[i].cap = ARR[i].cheight;
			// };
			// if (h > 0 && (ARR[i].cap < h + 40)) {
			// 	ARR[i].cap = h + 40 > HEIGHT ? HEIGHT : h + 40;
			// }
			// //console.log(ARR[i].cap);
			// ctx.fillRect(w * i, HEIGHT - ARR[i].cap, cw, ARR[i].cheight);
			// ctx.fillRect(w * i, HEIGHT - h, cw, h);
				


			var h = this[i] / 280 * height;
			Dots[i].cheight > cw && (Dots[i].cheight = cw);
			if (--Dots[i].cap < Dots[i].cheight) {
				Dots[i].cap = Dots[i].cheight;
			};
			if (h > 0 && (Dots[i].cap < h + 40)) {
				Dots[i].cap = h + 40 > height ? height : h + 40;
			}
			//console.log(Dots[i].cap);
			ctx.fillRect(w * i, height - Dots[i].cap, cw, Dots[i].cheight);
			ctx.fillRect(w * i, height - h, cw, h);

			// var h = arr[i] / 256 * height;
			// ctx.fillRect(w * i, height - h, cw, h);
			// ctx.fillRect(w * i, height - (o.cap + capH), cw, capH);
			// o.cap--;
			// if (o.cap <= 0) {
			// 	o.cap = 0;
			// }
			// if (h > 0 && o.cap < h + 40) {
			// 	o.cap = h + 40 > height - capH ? height - capH : h + 40;
			// }
		}
	}
}

draw.type = "Dot";
var types = $("#type li");
for (var i = 0; i < types.length; i++) {
	types[i].onclick = function() {
		for (var j = 0; j < types.length; j++) {
			types[j].className = "";
		}
		this.className = "selected";
		draw.type = this.getAttribute("data-type");
	};
}

$("#volume")[0].onchange = function() {
	mv.changeVolume(this.value / this.max);
};

$("#volume")[0].onchange();