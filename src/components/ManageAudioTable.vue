<template>
	<div class="search-container">
		<v-text-field 
			v-model="search" 
			:label="$t('searchPlaceholder')" 
			prepend-inner-icon="mdi-magnify" 
			single-line hide-details class="mb-4"
			theme="dark"
		>
		</v-text-field>

		<!-- Table for Desktop -->
		<v-data-table 
			v-if="!isMobile"
			:headers="headers" 
			:items="listOfAudios" 
			:search="search" 
			:items-per-page="5" 
			class="custom-table"
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
					<td style="padding-right: 0px;">
						<v-avatar size="70">
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

		<!-- List for Mobile -->
		<v-list v-else class="mobile-list" theme="dark">
      <v-list-item
        v-for="item in filteredAudios"
        :key="item.id"
        @click="HearAudio(item.id)"
        class="py-2"
      >
        <template v-slot:prepend>
          <v-avatar size="50" style="border-radius: 10%;">
            <img :src="item.imageUrl" :alt="item.title" class="audio-icon">
          </v-avatar>
        </template>

        <v-list-item-title style="font-size: 20px;">{{ item.title }}</v-list-item-title>

				<template v-slot:append>
					<div @click.stop="deleteAudio(item.id)">
						<font-awesome-icon icon="trash" />
					</div>
        </template>

      </v-list-item>
    </v-list>

	</div>
</template>

<script lang="ts">
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { db } from '@/firebase/';
import { formatDate } from '@/utils/formatDate';
import { deleteObject, getStorage, ref as storageRef } from 'firebase/storage';
import { AudioItem, TableHeader } from '@/types/views/searchView';
import { ManageAudioTableStatus } from '@/types/components/manageAudioTable';
import { useI18n } from 'vue-i18n';

export default {
	props: {
		uid: {
			type: String,
			required: true,
		},
	},
	setup() {
		const router = useRouter();
		const { locale } = useI18n();

		return {
			router,
			formatDate,
			locale,
		};
	},
	data() : ManageAudioTableStatus {
		return {
			search: '',
			listOfAudios: [],
			isMobile: false,
		};
	},
	mounted() {
		this.getAudios();
		this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
	},
	beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
  },
	computed: {
		filteredAudios() {
			return this.listOfAudios.filter((audio) =>
				audio.title.toLowerCase().includes(this.search.toLowerCase())
			);
		},
		headers(): TableHeader[] {
			return [
				{ title: '', value: 'imageUrl', sortable: false, width: '50px' },
				{ title: this.$t('title'), value: 'title', sortable: true },
				{ value: 'duration', sortable: true, width: '10%' }, // Custom slot
				{ value: 'createdAt', sortable: true, width: '10%' }, // Custom slot
				{ title: this.$t('rating'), value: 'score', width: '15%' },
				{ title: this.$t('plays'), value: 'reproductions', width: '15%' },
				{ title: this.$t('actions'), value: 'actions', sortable: false },
			];
		},
	},
	methods: {
		async getAudios() {
			// Get all audios from an specific user
			const audiosQuery = query(collection(db, 'audios'), where('uid', '==', this.uid));
			const audios = await getDocs(audiosQuery);
			const audioPromises: AudioItem[] = [];

			audios.forEach((audio) => {
				const audioData = {
					id: audio.id,
					...audio.data(),
				} as AudioItem;
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

			// Delete bookmarks from firestore
			const bookmarksQuery = query(collection(db, 'bookmarks'), where('audioId', '==', audioId));
			const bookmarks = await getDocs(bookmarksQuery);
			bookmarks.forEach(async (bookmark) => {
				await deleteDoc(doc(db, 'bookmarks', bookmark.id));
			});

			// Update the list of audios
			this.listOfAudios = this.listOfAudios.filter((audio) => audio.id !== audioId);

			console.log(audioId, 'deleted successfully');

			// Emit event to update stats in parent component
			this.$emit('updateStats');
		},
		HearAudio(audioId: string) {
			this.router.push(`/audio/${audioId}`);
		},
		checkMobile() {
      this.isMobile = window.innerWidth < 768;
    },
	}

};
</script>

<style scoped>
.search-container {
	color: white;
	padding: 0px 0px 20px 20px;
}

.custom-table {
	background-color: transparent;
}

/* icons on header */
.icons:hover {
	color: green;
}

/* Each element */
.item {
  height: 70px;
}

.item:hover {
	background-color: #2c2c2c;
	cursor: pointer;
}

.audio-icon {
  width: 50px;
  height: 50px;
  object-fit: contain;
  vertical-align: middle; 
  border-radius: 10%;
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

@media (max-width: 768px) {
	.search-container {
		padding: 0px;
		margin-bottom: 20px;
	}
}

</style>
