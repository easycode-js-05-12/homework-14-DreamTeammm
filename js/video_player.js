class VideoPlayerBasic {
	constructor(settings) {
		this._settings = Object.assign(VideoPlayerBasic.getDefaultSettings(), settings);
		this._videoContainer = null;
		this._video = null;
		this._toggleBtn = null;
		this._progress = null;
		this._mouseDown = false;
		this._timerId = null;
		this._timeout = 500;
	}

	init() {
		// Проверить переданы ли видео и контейнер
		if (!this._settings.videoUrl) return console.error("Передайте адрес видео");
		if (!this._settings.videoPlayerContainer) return console.error("Передайте селектор контейнера");

		// Создадим разметку и добавим ее на страницу
		this._addTemplate();
		// Найти все элементы управления
		this._setElements();
		// Установить обработчики событий
		this._setEvents();
	}

	toggle() {
		const method = this._video.paused ? 'play' : 'pause';
		this._toggleBtn.textContent = this._video.paused ? '❚ ❚' : '►';
		this._video[method]();
	}

	_handlerProgress() {
		const percent = (this._video.currentTime / this._video.duration) * 100;
		this._progress.style.flexBasis = `${ percent }%`;
	}

	_scrub(e) {
		this._video.currentTime = (e.offsetX / this._progressContainer.offsetWidth) * this._video.duration;
	}

	_handlerVolume() {
		this._video.volume = this._elVolume.value;
	}

	_handlerPlaybackRate() {
		this._video.playbackRate = this._elPlaybackRate.value;
	}

	_skip(type) {
		this._video.currentTime = type > 0 ? this._video.currentTime + Math.abs(this._settings.skipNext) : this._video.currentTime - Math.abs(this._settings.skipPrev);
	}

	_handlerVideo(e) {
		this._video.videoWidth / 2 < e.offsetX ? this._skip(1) : this._skip(-1);
	}

	_defineClick(e) {
		if (e.detail === 1) {
			this._timerId = setTimeout( () => {
				this.toggle();
			}, this._timeout || 300);
		} else if (e.detail === 2) {
			clearTimeout(this._timerId);
			this._handlerVideo(e);
		}
	}

	_setElements() {
		this._videoContainer = document.querySelector(this._settings.videoPlayerContainer);
		this._video = this._videoContainer.querySelector('video');
		this._toggleBtn = this._videoContainer.querySelector('.toggle');
		this._progress = this._videoContainer.querySelector('.progress__filled');
		this._progressContainer = this._videoContainer.querySelector('.progress');
		this._elVolume = this._videoContainer.querySelector('input[type="range"][name="volume"]');
		this._elPlaybackRate = this._videoContainer.querySelector('input[type="range"][name="playbackRate"]');
		this._skipBtns = this._videoContainer.querySelectorAll('[data-skip]');
	}

	_setEvents() {
		this._video.addEventListener('click', (e) => this._defineClick(e));
		this._video.addEventListener('timeupdate', () => this._handlerProgress());

		this._toggleBtn.addEventListener('click', () => this.toggle());

		this._progressContainer.addEventListener('click', (e) => this._scrub(e));
		this._progressContainer.addEventListener('mousemove', (e) => this._mouseDown && this._scrub(e));
		this._progressContainer.addEventListener('mousedown', () => this._mouseDown = true);
		this._progressContainer.addEventListener('mouseup', () => this._mouseDown = false);

		this._elVolume.addEventListener('click', () => this._handlerVolume());
		this._elVolume.addEventListener('mousemove', () => this._mouseDown && this._handlerVolume());
		this._elVolume.addEventListener('mousedown', () => this._mouseDown = true);
		this._elVolume.addEventListener('mouseup', () => this._mouseDown = false);

		this._elPlaybackRate.addEventListener('click', () => this._handlerPlaybackRate());
		this._elPlaybackRate.addEventListener('mousemove', () => this._mouseDown && this._handlerPlaybackRate());
		this._elPlaybackRate.addEventListener('mousedown', () => this._mouseDown = true);
		this._elPlaybackRate.addEventListener('mouseup', () => this._mouseDown = false);

		this._skipBtns.forEach((item) => item.addEventListener('click', (e) => this._skip(e.target.dataset.skip)));
	}

	_addTemplate() {
		const template = this._createVideoTemplate();
		const container = document.querySelector(this._settings.videoPlayerContainer);
		container ? container.insertAdjacentHTML("afterbegin", template) : console.error('контейнер не найден');
	}

	_createVideoTemplate() {
		return `
			<div class="player">
				<video class="player__video viewer" src="${ this._settings.videoUrl }"></video>
				<div class="player__controls">
					<div class="progress">
						<div class="progress__filled"></div>
					</div>
					<button class="player__button toggle" title="Toggle Play">►</button>
					<input type="range" name="volume" class="player__slider" min=0 max="1" step="0.05" value="${ this._settings.volume }">
					<input type="range" name="playbackRate" class="player__slider" min="0.5" max="2" step="0.1" value="${ this._settings.playbackRate }">
					<button data-skip="-1" class="player__button">« ${ this._settings.skipPrev }s</button>
					<button data-skip="1" class="player__button">${ this._settings.skipNext }s »</button>
				</div>
			</div>`;
	}

	static getDefaultSettings() {
		/**
		 * Список настроек
		 * - адрес видео
		 * - тип плеера "basic", "pro"
		 * - controls - true, false
		 */
		return {
			videoUrl: '',
			videoPlayerContainer: 'body',
			skipPrev: -1,
			skipNext: 1,
			volume: .5,
			playbackRate: 1
		}
	}
}

const myPlayer = new VideoPlayerBasic({
	videoUrl: 'video/mov_bbb.mp4',
	videoPlayerContainer: '.myplayer',
	skipPrev: -1.5,
	skipNext: 2
});

myPlayer.init();