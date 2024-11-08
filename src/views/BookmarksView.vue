<template>
  <div class="search-container">
    <v-text-field 
      v-model="search" 
      label="Search bookmarked audio..." 
      prepend-inner-icon="mdi-magnify" 
      single-line
      hide-details 
      class="mb-4" 
      :theme="themeStore.theme">
    </v-text-field>

    <!-- Table for Desktop -->
    <v-data-table 
      v-if="!isMobile"
      :headers="headers" 
      :items="listOfAudios" 
      :search="search" 
      :items-per-page="10" 
      class="custom-table"
      :theme="themeStore.theme"
      >
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
          <td>
            <span @click.stop="watchProfile(item.uid)" class="author-item">{{ item.author }} </span>
          </td>
          <td>{{ item.duration ?? '-:--' }}</td>
          <td>{{ formatDate(item.createdAt) }}</td>
          <td>{{ item?.averageRating ? item.averageRating.toFixed(1) + ' ⭐' : 'No ratings yet' }}</td>
          <td>{{ item.reproductions }}</td>
          <td>
            <div class="actions-icons-delete" @click.stop="removeBookmark(item.id)">
              <font-awesome-icon icon="trash" />
            </div>
					</td>
        </tr>
      </template>
    </v-data-table>

    <!-- List for Mobile -->
    <v-list v-else class="mobile-list" :theme="themeStore.theme">
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
        <v-list-item-subtitle>
          <span @click.stop="watchProfile(item.uid)" class="author-item">{{ item.author }}</span>
        </v-list-item-subtitle>
        <template v-slot:append>
					<div @click.stop="removeBookmark(item.id)">
						<font-awesome-icon icon="trash" />
					</div>
        </template>
      </v-list-item>
    </v-list>

  </div>
</template>

<script lang="ts">
import { collection, deleteDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { db } from '@/firebase/';
import { formatDate } from '@/utils/formatDate';
import { AudioItem } from '@/types/views/searchView';
import { useAuthStore } from '@/stores/auth';
import { BookmarksViewStatus } from '@/types/views/bookmarksView';
import { useThemeStore } from '@/stores/theme';

export default {
  setup() {
    const router = useRouter();
    const uid = useAuthStore().user?.uid;
    const themeStore = useThemeStore();
    document.title = 'Bookmarks';

    return {
      router,
      uid,
      formatDate,
      themeStore,
    };
  },
  data() : BookmarksViewStatus {
    const headers = [
      { title: '', value: 'imageUrl', sortable: false, width: '50px' },
      { title: 'Title', value: 'title', sortable: true },
      { title: 'Author', value: 'author', sortable: true },
      { value: 'duration', sortable: true }, // Custom slot
      { value: 'createdAt', sortable: true }, // Custom slot
      { title: 'Score', value: 'score' },
      { title: 'Plays', value: 'reproductions' },
      { title: 'Actions', value: 'actions', sortable: false },
    ];

    return {
      search: '',
      headers,
      listOfAudios: [],
      isMobile: false,
    };
  },
  mounted() {
    this.getBookmarks();
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
  },
  computed: {
    filteredAudios(): AudioItem[] {
      return this.listOfAudios.filter((audio) =>
        audio.title.toLowerCase().includes(this.search.toLowerCase())
      );
    },
  },
  methods: {
    async getBookmarks() {
      const bookmarksQuery = query(collection(db, 'bookmarks'), where('userId', '==', this.uid));
      const bookmarksSnapshot = await getDocs(bookmarksQuery);
      const audiosIds = bookmarksSnapshot.docs.map(doc => {
        return doc.data().audioId;
      });

      if (audiosIds.length === 0) {
        this.listOfAudios = [];
        return;
      }

      this.getAudios(audiosIds);
    },
    async getAudios(audiosIds: string[]) {
      const chunkSize = 10;
      const audioChunks = [];
      
      for (let i = 0; i < audiosIds.length; i += chunkSize) {
        const chunk = audiosIds.slice(i, i + chunkSize);
        audioChunks.push(chunk);
      }

      const audios: AudioItem[] = [];

      // Process each chunk sequentially
      for (const chunk of audioChunks) {
        const promises = chunk.map(async (audioId: string) => {
          const audioDoc = await getDoc(doc(db, 'audios', audioId));
          if (audioDoc.exists()) {
            const audioData = audioDoc.data();
            audios.push({
              id: audioDoc.id,
              title: audioData.title,
              author: audioData.author,
              imageUrl: audioData.imageUrl,
              duration: audioData.duration,
              createdAt: audioData.createdAt,
              averageRating: audioData.averageRating,
              reproductions: audioData.reproductions,
              uid: audioData.uid,
              audioUrl: audioData.audioUrl,
              authorRef: audioData.authorRef,
            });
          }
        });
        await Promise.all(promises);
      }

      this.listOfAudios = audios;
    },
    async removeBookmark(audioId: string) {
      const bookmarkId = `${audioId}_${this.uid}`;
      const bookmarkRef = doc(db, 'bookmarks', bookmarkId);
      await deleteDoc(bookmarkRef);
      this.listOfAudios = this.listOfAudios.filter(audio => audio.id !== audioId);
    },
    watchProfile(uid: string) {
      this.router.push(`/profile/${uid}`);
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
  padding: 20px;
  color: var(--searbars-text);
}

.custom-table {
  background-color: transparent;
}

.icons:hover {
  color: green;
}

.item {
  height: 70px;
}

.item:hover,
.v-list-item:hover {
  background-color: var(--tables-background-hover);
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
  color: #007bff;
  cursor: pointer;
}

.author-item:hover {
  text-decoration: underline;
}

.actions-icons-delete:hover {
  color: red;
  cursor: pointer;
}

.mobile-list {
  background-color: transparent;
}

@media (max-width: 767px) {
  .search-container {
    padding: 10px;
  }
}
</style>
