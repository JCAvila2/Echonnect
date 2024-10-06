<template>
  <div class="search-container">
    <v-text-field v-model="search" label="Search" prepend-inner-icon="mdi-magnify" single-line
      hide-details class="mb-4" theme="dark"></v-text-field>

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
          <td>{{ formatDuration(item.duration) }}</td>
          <td>{{ formatDate(item.createdAt) }}</td>
          <td>{{ calculateScore(item.ratings) }}</td>
          <td>{{ item.reproductions }}</td>
        </tr>
      </template>

    </v-data-table>
  </div>
</template>

<script lang="ts">
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { db } from '@/firebase/';
import { calculateScore } from '@/utils/calculateScore';
import { formatDate } from '@/utils/formatDate';
import { formatDuration } from '@/utils/formatDuration';

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
      calculateScore,
      formatDate,
      formatDuration,
    };
  },
  data() {
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
          duration: 0,
          audioUrl: audio.data().audioUrl,
          ...audio.data(),
        };

        audioPromises.push(this.getAudioDuration(audioData.audioUrl).then((duration) => {
          audioData.duration = duration;
          return audioData;
        }));
      });

      this.listOfAudios = await Promise.all(audioPromises);
    },
    getAudioDuration(url) {
      return new Promise((resolve) => {
        const audio = new Audio(url);
        audio.onloadedmetadata = () => {
          resolve(audio.duration);
        };
      });
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
</style>
