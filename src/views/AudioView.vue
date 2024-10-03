<template>
	<h1>Audio</h1>
	<div v-if="audio">
		<img :src="audio.imageUrl" alt="Image" style="max-width: 200px;"/>

		<h1>{{ audio.title }}</h1>
		<p>{{ audio.description }}</p>
		<p>{{ audio.tags }}</p>


		<p><strong>Uploaded:</strong> {{ formatDate(audio.createdAt) }}</p>


		<p>{{ audio.ratings }}</p>
		<p>{{ audio.averageRating }}</p>

		<audio controls>
			<source :src="audio.audioUrl" type="audio/mpeg">
			Your browser does not support the audio element.
		</audio>
	</div>

	<!-- Show message if audio is not ready -->
	<div v-else>
		<p>Loading audio...</p>
	</div>
</template>


<script lang="ts">
import { db } from '@/firebase';
import { doc, collection, getDoc, increment, updateDoc } from 'firebase/firestore';
import { defineComponent } from 'vue';

export default defineComponent({
	props: {
		id: {
			type: String,
			required: true,
		},
	},
	mounted() {
		this.fetchAudio();
	},
	data() {
		return {
			audio: null,
		};
	},
	methods: {
		async fetchAudio() {
			const audioDoc = doc(collection(db, 'audios'), this.id);
			const docSnapshot = await getDoc(audioDoc);
			if (docSnapshot.exists()) {
				this.audio = { id: docSnapshot.id, ...docSnapshot.data() };
				document.title = this.audio?.title ?? 'Audio';

				// Increment the audio reproductions count in the database
				const incrementValue = increment(1);
				await updateDoc(audioDoc, { reproductions: incrementValue });
			} else {
				// TODO: Redirect to 404 page
				console.log('Audio not found');
			}
		},
		formatDate(timestamp) {
			if (timestamp) {
				const date = timestamp.toDate();
				return date.toLocaleDateString();
			}
			return '';
		},
	}
});
</script>

<style>

</style>
