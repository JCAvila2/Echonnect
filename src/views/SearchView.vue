<template>
  <div class="search-container">

    <!-- Search bar -->
    <div class="search-bar-container">
      <v-text-field 
        v-model="search" 
        :label="$t('searchPlaceholder')" 
        single-line
        hide-details 
        @keydown.enter="searchAudios"
      >
      </v-text-field>
      <button @click="searchAudios" class="search-button">
        <font-awesome-icon :icon="['fas', 'search']" /> 
      </button>
    </div>

    <!-- Table for Desktop -->
    <v-data-table 
      v-if="!isMobile"
      :headers="headers" 
      :items="listOfAudios" 
      :items-per-page="5" 
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
          <td class="truncated-text">{{ item.title }}</td>
          <td>
            <span @click.stop="watchProfile(item.uid)" class="author-item">{{ item.author }} </span>
          </td>
          <td>{{ item.duration ?? '-:--' }}</td>
          <td>{{ formatDate(item.createdAt) }}</td>
          <td>{{ item?.averageRating ? item.averageRating.toFixed(1) + ' ⭐' : $t('noRatingYet') }}</td>
          <td>{{ item.reproductions }}</td>
        </tr>
      </template>
    </v-data-table>

    <!-- List for Mobile -->
    <v-list v-else class="mobile-list" :theme="themeStore.theme">
      <v-list-item
        v-for="item in listOfAudios"
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
      </v-list-item>
    </v-list>

  </div>

  <div class="tour-button" @click="showTour"> 
    ?
  </div>

</template>

<script lang="ts">
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { db } from '@/firebase/';
import { formatDate } from '@/utils/formatDate';
import { useThemeStore } from '@/stores/theme';
import { AudioItem, SearchViewStatus, TableHeader } from '@/types/views/searchView';
import { useI18n } from 'vue-i18n';
import SearchTour from '@/components/tour/SearchTour';

export default {
  setup() {
    const router = useRouter();
    const { t, locale } = useI18n();
    const themeStore = useThemeStore();
    const { startTour, destroyTour } = SearchTour.setup();
    document.title = t('search');

    return {
      router,
      formatDate,
      locale,
      t,
      themeStore,
      startTour,
      destroyTour,
    };
  },
  watch: {
    locale() {
      document.title = this.t('search');
    },
  },
  data(): SearchViewStatus {
    return {
      search: '',
      listOfAudios: [],
      isMobile: false,
    };
  },
  computed: {
    headers(): TableHeader[] {
      return [
        { title: '', value: 'imageUrl', sortable: false, width: '50px' },
        { title: this.t('title'), value: 'title', sortable: true },
        { title: this.t('author'), value: 'author', sortable: true, width: '25%' },
        { value: 'duration', sortable: true, width: '10%' }, // Custom slot
        { value: 'createdAt', sortable: true, width: '10%' }, // Custom slot
        { title: this.t('rating'), value: 'score', width: '10%' },
        { title: this.t('plays'), value: 'reproductions', width: '10%' },
      ];
    },
  },
  mounted() {
    this.getAudios();
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
  },
  methods: {
    async getAudios() {
      const audiosQuery = query(
        collection(db, 'audios'),
        orderBy('reproductions', 'desc'),
        limit(10)
      );

      const audiosSnapshot = await getDocs(audiosQuery);
      const audioList: AudioItem[] = [];

      audiosSnapshot.forEach((audio) => {
        const audioData: AudioItem = {
          id: audio.id,
          ...audio.data() as Omit<AudioItem, 'id'>,
        };
        audioList.push(audioData);
      });

      this.listOfAudios = audioList;
    },
    async searchAudios() {
      this.listOfAudios = [];
      if (this.search === '') {
        return;
      }

      // Query by title
      const titleQuery = query(
        collection(db, 'audios'),
        where('title_words', 'array-contains-any', this.search.toLowerCase().split(' ')),
      )

      // Query by tags
      const tagsQuery = query(
        collection(db, 'audios'),
        where('tags_insensitive', 'array-contains', this.search.toLowerCase()),
      );

      const titleSnapshot = await getDocs(titleQuery);
      const tagsSnapshot = await getDocs(tagsQuery);

      // Merge results
      const allResults = new Map();
      
      titleSnapshot.forEach((doc) => {
        const audioData: AudioItem = {
          id: doc.id,
          ...doc.data() as Omit<AudioItem, 'id'>,
        };
        allResults.set(doc.id, audioData);
      });

      tagsSnapshot.forEach((doc) => {
        const audioData: AudioItem = {
          id: doc.id,
          ...doc.data() as Omit<AudioItem, 'id'>,
        };
        allResults.set(doc.id, audioData);
      });

      // Update list of audios
      allResults.forEach((audioData) => {
        this.listOfAudios.push(audioData);
      });
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
    showTour() {
      this.startTour();
    }
  }
};
</script>

<style scoped>
.search-container {
  padding: 20px;
}

.search-bar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  color: var(--searbars-text);
}

.search-button {
  position:absolute;
  background-color: #007bff;
  padding-inline: 20px;
  right: 0;
  top: 0;
  height: 100%;
  border-top-left-radius: 0;
  border-top-right-radius: 4px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.search-button:hover {
  background-color: #0056b3;
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

.truncated-text {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Show '...' when the title is too long */
}

.author-item {
  color: #007bff;
  cursor: pointer;
}

.author-item:hover {
  text-decoration: underline;
}

.mobile-list {
  background-color: transparent;
}

/* Start tour button */
.tour-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  z-index: 1000;
  cursor: pointer;
}

.tour-button:hover {
  background-color: #0056b3;
}

@media (max-width: 767px) {
  .search-container {
    padding: 10px;
  }
}
</style>
