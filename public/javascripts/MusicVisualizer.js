function MusicVisualizer(options) {
	this.source = null;

	this.count = 0;

	this.size = options.size || 32;

	this.onended = options.onended;

	this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain ? 'createGain' : 'createGainNode']();

	this.gainNode.connect(MusicVisualizer.ac.destination);

	this.analyser = MusicVisualizer.ac.createAnalyser();

	this.analyser.fftSize = this.size * 2;

	this.analyser.connect(this.gainNode);

	this.xhr = new window.XMLHttpRequest();

	this.visualizer = options.visualizer;

	this.visualize();
}

MusicVisualizer.ac = new(window.AudioContext || window.webkitAudioContext || window.mozAudioContext)();

MusicVisualizer.prototype.load = function(url, fun) {
	var self = this;
	this.xhr.abort();
	this.xhr.open('GET', url);
	self.xhr.responseType = 'arraybuffer';
	self.xhr.onload = function() {
		fun(self.xhr.response);
	}
	self.xhr.send();
}

MusicVisualizer.prototype.decode = function(arraybuffer, fun) {
	MusicVisualizer.ac.decodeAudioData(arraybuffer, function(buffer) {
		fun(buffer);
	}, function(error) {
		console.log(error);
	});
}

MusicVisualizer.prototype.play = function(url) {
	var self = this;
	var count = ++self.count;
	self.source && self.stop();
	self.load(url, function(arraybuffer) {
		if (count != self.count) return;
		self.decode(arraybuffer, function(buffer) {
			var bs = MusicVisualizer.ac.createBufferSource();
			bs.buffer = buffer;
			bs.connect(self.analyser);
			bs[bs.start ? 'start' : 'noteOn'](0);
			self.source = bs;
			self.source.connect(self.analyser);
			self.source.onended = self.onended;
		});
	});
}

MusicVisualizer.prototype.stop = function() {
	this.source[this.source.stop ? 'stop' : 'noteOff']();
	this.source.onended = window.undefined;
}

MusicVisualizer.prototype.changeVolume = function(rate) {
	this.gainNode.gain.value = rate * rate;
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

		var av = Math.round(100 * Array.prototype.reduce.call(arr, function(x, y){return x + y}) / self.size / 256);
		var dlav = av - oldav;
		oldav = av;
		
		self.visualizer.call(arr, dlav, av);
		requestAnimationFrame(v);
	}
	requestAnimationFrame(v);
}