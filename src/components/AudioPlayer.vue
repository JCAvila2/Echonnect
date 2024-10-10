<template>
	<div class="custom-audio-player">
		<audio ref="audio" @timeupdate="updateProgress">
			<source :src="audioSrc" type="audio/wav">
			Your browser does not support the audio element.
		</audio>
		<button @click="playAudio">Play</button>
		<button @click="pauseAudio">Pause</button>
		<div class="progress-bar" @click="seekAudio">
			<div class="progress" :style="{ width: progress + '%' }"></div>
		</div>
		<input type="range" min="0" max="1" step="0.01" @input="changeVolume" />

		<p>Current time: {{ formatTime($refs.audio ? $refs.audio.currentTime : 0) }}</p>

	</div>
</template>

<script lang="ts">
import { formatTime } from '@/utils/formatTime';

export default {
	name: 'AudioPlayer',
	setup() {
		return {
			formatTime
		}
	},
	props: {
		audioSrc: {
			type: String,
			required: true
		}
	},
	data() {
		return {
			progress: 0
		};
	},
	methods: {
		playAudio() {
			console.log('Play button clicked');
			const audio = this.$refs.audio;
			if (audio) {
				audio.play().catch(error => console.error('Error playing audio:', error));
			} else {
				console.error('Audio element not found');
			}
		},
		pauseAudio() {
			console.log('Pause button clicked');
			const audio = this.$refs.audio;
			if (audio) {
				audio.pause();
			} else {
				console.error('Audio element not found');
			}
		},
		updateProgress() {
			const audio = this.$refs.audio;
			if (audio) {
				this.progress = (audio.currentTime / audio.duration) * 100;
			}
		},
		seekAudio(event) {
			const audio = this.$refs.audio;
			const progressBar = event.currentTarget;
			const clickPosition = event.offsetX / progressBar.offsetWidth;
			const newTime = clickPosition * audio.duration;
			audio.currentTime = newTime;
			this.updateProgress();
			console.log('Seeked to:', formatTime(newTime));
		},
		changeVolume(event) {
			const audio = this.$refs.audio;
			audio.volume = event.target.value;
			console.log('Volume changed to:', audio.volume);
		}
	}
};
</script>

<style scoped>
.custom-audio-player {
	display: flex;
	flex-direction: column;
	align-items: center;
}

button {
	margin: 5px;
}

.progress-bar {
	width: 100%;
	height: 10px;
	background-color: #e0e0e0;
	border-radius: 5px;
	overflow: hidden;
	margin-top: 10px;
	cursor: pointer;
}

.progress {
	height: 100%;
	background-color: #3b82f6;
	transition: width 0.1s;
}

input[type="range"] {
	margin-top: 10px;
}
</style>
