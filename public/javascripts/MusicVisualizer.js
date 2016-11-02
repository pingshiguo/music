function MusicVisualizer(options) {
	//播放过的bufferSource的对象
	this.buffer = {};

	//当前正在播放的bufferSource
	this.source = null;

	//通过audio标签创建MediaaudioElementSourceNode时使用的audio元素
	this.audio = new Audio();
	this.audioSource = MusicVisualizer.ac.createMediaElementSource(this.audio);

	//选择过的资源数的累计值
	this.count = 0;

	//播完后的回调
	this.onended = options.onended;

	//unit8Array的长度
	this.size = options.size || 32;

	//可视化调用的绘图函数
	this.visualizer = options.visualizer;

	//控制音量的GainNode
	this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain ? 'createGain' : 'createGainNode']();

	//音频分析对象
	this.analyser = MusicVisualizer.ac.createAnalyser();

	this.analyser.connect(this.gainNode);

	this.gainNode.connect(MusicVisualizer.ac.destination);

	//xhr对象
	this.xhr = new window.XMLHttpRequest();

	MusicVisualizer.visualize(this);
}

MusicVisualizer.ac = new(window.AudioContext || window.webkitAudioContext || window.mozAudioContext)();

//播放mv对象的source,mv.onended为播放结束后的回调
MusicVisualizer.play = function(mv) {

	mv.source.connect(mv.analyser);

	if (mv.source === mv.audioSource) {
		mv.audio.play();
		mv.audio.onended = mv.onended;
	} else {
		//兼容较老的API
		mv.source[mv.source.start ? "start" : "noteOn"](0);

		//为该bufferSource绑定onended事件
		mv.source.onended = mv.onended;
	}
}

//停止mv.source
MusicVisualizer.stop = function(mv) {
	if (mv.source === mv.audioSource) {
		mv.audio.pause();
		mv.audio.onended = window.undefined;
	} else {
		//兼容较老的API
		mv.source[mv.source.stop ? "stop" : "noteOff"](0);

		//停止后移除之前为mv.source绑定的onended事件
		mv.source.onended = window.undefined;
	}
}

/*可视化当前正在播放的音频
 *@param mv MusicVisualizer,MusicVisualizer的实例对象
*/
MusicVisualizer.visualize = function(mv) {
	mv.analyser.fftSize = mv.size * 2;
	var arr = new Uint8Array(mv.analyser.frequencyBinCount);

	var requestAnimationFrame = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.mzRequestAnimationFrame;
	var oldav = 0;

	function v() {
		mv.analyser.getByteFrequencyData(arr);
		var av = Math.round(100 * Array.prototype.reduce.call(arr, function(x, y) {
			return x + y
		}) / mv.size / 256);
		var dlav = av - oldav;
		oldav = av;
		//将分析得到的音频数据传递给mv.visualizer方法可视化
		mv.visualizer.call(arr, dlav, av);
		requestAnimationFrame(v);
	}

	requestAnimationFrame(v);
}

//将arraybuffer数据decode得到buffer
//成功后将bufferSourceNode作为fun回调的this
MusicVisualizer.prototype.decode = function(arraybuffer, fun) {
	var self = this;
	MusicVisualizer.ac.decodeAudioData(arraybuffer, function(buffer) {
		var bufferSourceNode = MusicVisualizer.ac.createBufferSource();
		bufferSourceNode.buffer = buffer;
		fun.call(bufferSourceNode);
	}, function(error) {
		console.log(error);
	});
}

MusicVisualizer.prototype.play = function(path) {
	var self = this;
	var count = ++self.count;

	//停止当前正在播放的bufferSource
	self.source && MusicVisualizer.stop(self);

	if (path instanceof ArrayBuffer) {
		self.decode(path, function() {
			self.source = this;
			MusicVisualizer.play(self);
		});
	}

	if (typeof(path) === 'string') {
		//pc上通过audio标签创建MediaaudioElementSourceNode，比ajax请求再解码要快
		//self.audio.src = path;
		self.audio = new Audio(path);
		//console.log(path);
		self.audioSource = MusicVisualizer.ac.createMediaElementSource(self.audio);
		self.source = self.audioSource;
		MusicVisualizer.play(self);
	}
}

//音量调节
MusicVisualizer.prototype.changeVolume = function(rate) {
	this.gainNode.gain.value = rate * rate;
}