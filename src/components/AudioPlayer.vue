<template>
	<div class="custom-audio-player">
		<audio ref="audio" @timeupdate="updateProgress">
			<source :src="audioSrc" type="audio/wav">
			Your browser does not support the audio element.
		</audio>

		<div v-if="!isMobile" class="container">
			<!-- play/pause buttons -->
			<div class="status-controller">
				<button v-if="!isPlaying" @click="playAudio"><font-awesome-icon icon="play" class="play-pause-icon" style="margin-left: 5px;" /></button>
				<button v-else @click="pauseAudio"><font-awesome-icon icon="pause" class="play-pause-icon" /></button>
			</div>

			<!-- Progress bar -->
			<div class="progress-bar" @click="seekAudio">
				<div class="progress" :style="{ width: progress + '%' }"></div>
			</div>

			<!-- Time -->
			<div class="time">
				{{ formatTime(($refs.audio as HTMLAudioElement)?.currentTime || 0) }} / {{ formatTime(($refs.audio as
					HTMLAudioElement)?.duration || 0) }}
			</div>

			<!-- Volume -->
			<font-awesome-icon :icon="getVolumeIcon" class="volume-icon" @click="muteVolume" />
			<input type="range" min="0" max="1" step="0.01" v-model="volume" @input="changeVolume"
				:style="{ background: `linear-gradient(to right, ${isHover ? 'darkblue' : '#007bff'} 0%, ${isHover ? 'darkblue' : '#007bff'} ${volume * 100}%, #e0e0e0 ${volume * 100}%, #e0e0e0 100%)` }"
				@mouseover="isHover = true" @mouseleave="isHover = false" />
		</div>

		<!-- For mobile -->
		<div v-else class="container">
			<!-- Progress bar and time -->
			<div class="progress-container">
				<div class="progress-bar" @click.stop="seekAudio"
					style="	height: 15px; border-radius: 50px;">
					<div class="progress" :style="{ width: progress + '%' }"></div>
				</div>
				<div class="time">
					{{ formatTime(($refs.audio as HTMLAudioElement)?.currentTime || 0) }} / {{ formatTime(($refs.audio as
						HTMLAudioElement)?.duration || 0) }}
				</div>
			</div>

			<!-- play/pause buttons -->
			<div class="status-controller">
				<button v-if="!isPlaying" @click="playAudio"><font-awesome-icon icon="play" class="play-pause-icon" style="margin-left: 5px;"/></button>
				<button v-else @click="pauseAudio"><font-awesome-icon icon="pause" class="play-pause-icon" /></button>
			</div>

			<!-- Volume -->
			<div class="volume-container">
			<font-awesome-icon :icon="getVolumeIcon" class="volume-icon" @click="muteVolume" />
				<input type="range" min="0" max="1" step="0.01" v-model="volume" @input="changeVolume"
					:style="{ background: `linear-gradient(to right, ${isHover ? 'darkblue' : '#007bff'} 0%, ${isHover ? 'darkblue' : '#007bff'} ${volume * 100}%, #e0e0e0 ${volume * 100}%, #e0e0e0 100%)` }"
					@mouseover="isHover = true" @mouseleave="isHover = false" />
			</div>
		</div>

	</div>
</template>

<script lang="ts">
import { formatTime } from '@/utils/formatTime';
import { AudioPlayerStatus } from '@/types/components/audioPlayer';

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
	mounted() {
		const audio = this.$refs.audio as HTMLAudioElement | null;
		if (audio) {
			audio.volume = this.volume;
		}
		this.checkMobile();
		window.addEventListener('resize', this.checkMobile);
	},
	data(): AudioPlayerStatus {
		return {
			progress: 0,
			isPlaying: false,
			volume: 0.2, // Default volume
			previousVolume: 0.2,
			isHover: false,
			isMobile: false,
		};
	},
	computed: {
		getVolumeIcon() {
			if (this.volume > 0.5) {
				return 'volume-up';
			} else if (this.volume > 0) {
				return 'volume-low';
			} else {
				return 'volume-mute';
			}
		},
	},
	methods: {
		playAudio() {
			const audio = this.$refs.audio as HTMLAudioElement | null;
			if (audio) {
				audio.play().catch((error: any) => console.error('Error playing audio:', error));
				this.isPlaying = true;
			} else {
				console.error('Audio element not found');
			}
		},
		pauseAudio() {
			const audio = this.$refs.audio as HTMLAudioElement | null;
			if (audio) {
				audio.pause();
				this.isPlaying = false;
			} else {
				console.error('Audio element not found');
			}
		},
		updateProgress() {
			const audio = this.$refs.audio as HTMLAudioElement | null;
			if (audio) {
				this.progress = (audio.currentTime / audio.duration) * 100;
			}
		},
		seekAudio(event: MouseEvent) {
			const audio = this.$refs.audio as HTMLAudioElement;
			const progressBar = event.currentTarget as HTMLElement;
			const clickPosition = event.offsetX / progressBar.offsetWidth;
			if (audio.duration) {
				const newTime = clickPosition * audio.duration;
				audio.currentTime = newTime;
				this.updateProgress();
			}
		},
		changeVolume(event: Event) {
			const audio = this.$refs.audio as HTMLAudioElement;
			if (audio) {
				const target = event.target as HTMLInputElement;
				audio.volume = target.valueAsNumber;
				this.volume = audio.volume;
			}
		},
		muteVolume() {
			const audio = this.$refs.audio as HTMLAudioElement;
			if (audio.volume > 0) {
				this.previousVolume = audio.volume;
				audio.volume = 0;
				this.volume = 0;
			} else {
				audio.volume = this.previousVolume;
				this.volume = this.previousVolume;
			}
		},
		checkMobile() {
			this.isMobile = window.innerWidth < 768;
		},
	}
};
</script>

<style scoped>
.container {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	margin: 20px auto;
}


/* Play/Pause button */
.status-controller {
	display: flex;
	align-items: center;
	margin-right: 10px;
}
.status-controller button {
	background-color: #007bff;
	color: white;
	border: none;
	padding: 10px;
	border-radius: 50%;
	cursor: pointer;
	transition: background-color 0.3s ease;
	width: 70px;
	height: 70px;
}
.status-controller button:hover {
	background-color: #0056b3;
}
.play-pause-icon {
	font-size: 40px;
}


/* Progress % and time */
.progress-bar {
	flex-grow: 2;
	height: 15px;
	background-color: #e0e0e0;
	border-radius: 50px;
	position: relative;
	margin: 0 10px;
	cursor: pointer;
}

.progress-bar:hover {
	height: 20px;
	transition: width 0.2s ease;
	border-radius: 5px;
}

.progress-bar:hover .progress {
	background-color: darkblue;
	height: 20px;
	border-radius: 5px;
}

.progress {
	height: 100%;
	background-color: #007bff;
	border-radius: 50px;
	transition: width 0.2s ease;
}

.time {
	margin-right: 10px;
	color: white;
	white-space: nowrap;
}


/* Volume */
.volume-icon {
	height: 20px;
	width: 20px;
	margin-right: 10px;
}

input[type="range"] {
	width: 100px;
	-webkit-appearance: none;
	appearance: none;
	height: 5px;
	background: #e0e0e0;
	border-radius: 5px;
	outline: none;
}

input[type="range"]::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 10px;
	height: 10px;
	background: #007bff;
	border-radius: 50%;
	cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
	width: 10px;
	height: 10px;
	background: #007bff;
	border-radius: 50%;
	cursor: pointer;
}

input[type="range"]:hover::-webkit-slider-thumb {
	transform: scale(1.5);
	background: darkblue;
}

@media (max-width: 768px) {
	.container {
		flex-direction: column;
		align-items: stretch;
	}

	.status-controller {
		margin-block: 30px;
		margin-right: 0px;
	}
	.status-controller button {
		margin-inline: auto;
	}


	/* Progress % and time */
	.progress-container {
		display: flex;
		width: 100%;
	}

	.progress-bar:hover .progress {
		height: 100%;
		margin-right: 10px;
		background-color: #007bff;
	}

	.progress-bar {
		margin: auto 0;
		margin-right: 10px;
	}

	.progress {
		flex-grow: 1;
		height: 100%;
		background-color: #007bff;
		margin-right: 10px;
		border-radius: 5px;
		border-radius: '50px';
	}

	.time {
		white-space: nowrap;
		margin-right: 0px;
		font-size: 14px;
	}

	.volume-container {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.volume-control {
		width: 100%;
		justify-content: center;
	}

	input[type="range"] {
		width: calc(100% - 40px);
	}
}
</style>
