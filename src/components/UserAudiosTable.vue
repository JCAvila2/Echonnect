<template>
  <div class="search-container">
    <v-text-field v-model="search" label="Search" prepend-inner-icon="mdi-magnify" single-line
      hide-details class="mb-4" theme="dark"></v-text-field>

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

      </v-list-item>
    </v-list>

  </div>
</template>

<script lang="ts">
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { db } from '@/firebase/';
import { formatDate } from '@/utils/formatDate';
import { AudioItem } from '@/types/views/searchView';
import { UserAudiosTableStatus } from '@/types/components/userAudiosTable';

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
  data() : UserAudiosTableStatus {
    const headers = [
      { title: '', value: 'imageUrl', sortable: false, width: '50px' },
      { title: 'Title', value: 'title', sortable: true },
      { value: 'duration', sortable: true }, // Custom slot
      { value: 'createdAt', sortable: true }, // Custom slot
      { title: 'Score', value: 'score' },
      { title: 'Plays', value: 'reproductions' },
    ];

    return {
      search: '',
      headers,
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

@media (max-width: 768px) {
	.search-container {
		padding: 0px;
		margin-bottom: 20px;
	}
}

</style>
