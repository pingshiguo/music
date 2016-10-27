function MusicVisualizer(obj) {
	this.buffer = {};
	
	this.source = null;

	this.count = 0;

	this.analyser = MusicVisualizer.ac.createAnalyser();

	this.size = obj.size||32;

	this.analyser.fftsize = this.size * 2;

	this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain ? "createGain" : "createGainNode"]();
	this.gainNode.connect(MusicVisualizer.ac.destination);

	this.analyser.connect(this.gainNode);

	this.xhr = new XMLHttpRequest();

	this.visualizer = obj.visualizer;

	this.visualize();

}

MusicVisualizer.ac = new(window.AudioContext || window.webkitAudioContext)();

MusicVisualizer.prototype.load = function(url,fun) {
	var self = this;
	self.xhr.abort();
	self.xhr.open("GET", url);
	self.xhr.responseType = "arraybuffer";
	
	self.xhr.onload = function() {
		fun(self.xhr.response);
	}
	self.xhr.send();
}

MusicVisualizer.prototype.decode = function(arraybuffer,fun) {
	MusicVisualizer.ac.decodeAudioData(arraybuffer, function(buffer) {
		fun(buffer);
	}, function(err) {
		console.log(err);
	});
}

MusicVisualizer.prototype.play = function(url) {
	var self = this;
	var n = ++self.count;
	self.source && self.stop();

	self.load(url, function(arraybuffer) {
		if (n != self.count) return;
		self.decode(arraybuffer, function(buffer) {
			if (n != self.count) return;
			var bs = MusicVisualizer.ac.createBufferSource();
			bs.connect(self.analyser);
			bs.buffer = buffer;
			bs[bs.start ? "start" : "noteOn"](0);
			self.source = bs;
		});
	});
}

MusicVisualizer.prototype.stop = function() {
	this.source[this.source.stop ? "stop" : "noteOff"](0);
}

MusicVisualizer.prototype.changeVolume = function(percent) {
	this.gainNode.gain.value = percent * percent;
}

MusicVisualizer.prototype.visualize = function() {
	var self = this;
	var arr = new Uint8Array(self.analyser.frequencyBinCount);

	requestAnimationFrame = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame;
		
	var oldav = 0;
	function v() {
		self.analyser.getByteFrequencyData(arr);
		var av = Math.round(100 * Array.prototype.reduce.call(arr, function(x, y){return x + y}) / mv.size / 256);
		var dlav = av - oldav;
		oldav = av;
		//console.log(arr);
		self.visualizer(arr,dlav,av);
		requestAnimationFrame(v);
	}
	requestAnimationFrame(v);
}