<template>
	<div class="search-container">
		<v-text-field v-model="search" label="Search" prepend-inner-icon="mdi-magnify" single-line hide-details class="mb-4"
			theme="dark"></v-text-field>

		<v-data-table :headers="headers" :items="listOfAudios" :search="search" :items-per-page="5" class="custom-table"
			theme="dark">

			<!-- Custom items on header -->
			<!-- eslint-disable-next-line vue/valid-v-slot -->
			<template v-slot:header.duration>
				<font-awesome-icon icon="far fa-clock" class="icons" />
			</template>
			<!-- eslint-disable-next-line vue/valid-v-slot -->
			<template v-slot:header.createdAt>
				<font-awesome-icon icon="far fa-calendar" class="icons" />
			</template>

			<!-- Custom items on body -->
			<template v-slot:item="{ item }">
				<tr @click="HearAudio(item.id)" class="item">
					<td>
						<v-avatar size="30">
							<img :src="item.imageUrl" :alt="item.title" class="audio-icon">
						</v-avatar>
					</td>
					<td>{{ item.title }}</td>
					<td>{{ item.duration ?? '-:--' }}</td>
					<td>{{ formatDate(item.createdAt) }}</td>
					<td>{{ item?.averageRating ? item.averageRating.toFixed(1) + ' ⭐' : 'No ratings yet' }}</td>
					<td>{{ item.reproductions }}</td>

					<td>
						<div class="actions-icons-container">
							<div class="actions-icons-edit" @click.stop="editAudio(item.id)">
								<font-awesome-icon icon="pen" />
							</div>
							<div class="actions-icons-delete" @click.stop="deleteAudio(item.id)">
								<font-awesome-icon icon="trash" />
							</div>
						</div>
					</td>

				</tr>
			</template>

		</v-data-table>
	</div>
</template>

<script lang="ts">
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { db } from '@/firebase/';
import { formatDate } from '@/utils/formatDate';
import { deleteObject, getStorage, ref as storageRef } from 'firebase/storage';

export default {
	props: {
		uid: {
			type: String,
			required: true,
		},
	},
	setup() {
		const router = useRouter();

		return {
			router,
			formatDate,
		};
	},
	data() {
		const headers = [
			{ title: '', value: 'imageUrl', sortable: false, width: '50px' },
			{ title: 'Title', value: 'title', sortable: true },
			{ value: 'duration', sortable: true }, // Custom slot
			{ value: 'createdAt', sortable: true }, // Custom slot
			{ title: 'Score', value: 'score', sortable: true },
			{ title: 'Plays', value: 'reproductions', sortable: true },
			{ title: 'Actions', value: 'actions', sortable: false },
		];

		return {
			search: '',
			headers,
			listOfAudios: [],
		};
	},
	mounted() {
		this.getAudios();
	},
	computed: {
		filteredAudios() {
			return this.listOfAudios.filter((audio) =>
				audio.title.toLowerCase().includes(this.search.toLowerCase())
			);
		},
	},
	methods: {
		async getAudios() {
			// Get all audios from an specific user
			const audiosQuery = query(collection(db, 'audios'), where('uid', '==', this.uid));
			const audios = await getDocs(audiosQuery);
			const audioPromises = [];

			audios.forEach((audio) => {
				const audioData = {
					id: audio.id,
					...audio.data(),
				};
				audioPromises.push(audioData);
			});

			this.listOfAudios = audioPromises;
		},
		editAudio(audioId: string) {
			// TODO: Implement edit audio
			console.log('Editing audio with id: ', audioId);
		},
		async deleteAudio(audioId: string) {
			const storage = getStorage();
			
			// Delete audio from firestorage
			const audioRef = storageRef(storage, `audios/${audioId}`);
			await deleteObject(audioRef);

			// Delete image from firestorage
			const imageRef = storageRef(storage, `images/${audioId}`);
			await deleteObject(imageRef);

			// Delete audio document from firestore
			await deleteDoc(doc(db, 'audios', audioId));

			// Delete comments from firestore
			const commentsQuery = query(collection(db, 'comments'), where('audioId', '==', audioId));
			const comments = await getDocs(commentsQuery);
			comments.forEach(async (comment) => {
				await deleteDoc(doc(db, 'comments', comment.id));
			});

			// Delete ratings from firestore
			const ratingsQuery = query(collection(db, 'ratings'), where('audioId', '==', audioId));
			const ratings = await getDocs(ratingsQuery);
			ratings.forEach(async (rating) => {
				await deleteDoc(doc(db, 'ratings', rating.id));
			});

			// Update the list of audios
			this.listOfAudios = this.listOfAudios.filter((audio) => audio.id !== audioId);

			console.log(audioId, 'deleted successfully');
		},
		HearAudio(audioId: string) {
			this.router.push(`/audio/${audioId}`);
		},
	}

};
</script>

<style>
.search-container {
	padding: 20px;
	color: white;
}

.custom-table {
	background-color: transparent;
}

/* icons on header */
.icons:hover {
	color: green;
}

/* Each element */
.item:hover {
	background-color: #2c2c2c;
	cursor: pointer;
}

.audio-icon {
	width: 30px;
	height: 30px;
	border-radius: 50%;
	object-fit: cover;
	vertical-align: middle;
}

.author-item {
	color: #1db954;
	cursor: pointer;
}

.author-item:hover {
	text-decoration: underline;
}



/* Actions icons */
.actions-icons-container {
	display: flex;
}

.actions-icons-edit {
	margin-right: 30px;
}

.actions-icons-edit {
	margin-top: auto;
	margin-bottom: auto;
}

.actions-icons-edit:hover {
	color: #1db954;
}

.actions-icons-delete:hover {
	color: #f44336;
}
</style>
