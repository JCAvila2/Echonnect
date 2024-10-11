<template>
  <div class="search-container">
    <v-text-field v-model="search" label="What do you want to hear?" prepend-inner-icon="mdi-magnify" single-line
      hide-details class="mb-4" theme="dark"></v-text-field>

    <v-data-table 
      :headers="headers" 
      :items="listOfAudios" 
      :search="search" 
      :items-per-page="5" 
      class="custom-table"
      theme="dark"
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
          <td>
            <v-avatar size="30">
              <img :src="item.imageUrl" :alt="item.title" class="audio-icon">
            </v-avatar>
          </td>
          <td>{{ item.title }}</td>
          <td>
            <span @click.stop="watchProfile(item.uid)" class="author-item">{{ item.author }} </span>
          </td>
          <td>{{ item.duration ?? '-:--' }}</td>
          <td>{{ formatDate(item.createdAt) }}</td>
          <td>{{ item?.averageRating ? item.averageRating + ' ⭐' : 'No ratings yet' }}</td>
          <td>{{ item.reproductions }}</td>
        </tr>
      </template>

    </v-data-table>
  </div>
</template>

<script lang="ts">
import { collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { db } from '@/firebase/';
import { formatDate } from '@/utils/formatDate';

export default {
  setup() {
    const router = useRouter();
    document.title = 'Search';

    return {
      router,
      formatDate,
    };
  },
  data() {
    const headers = [
      { title: '', value: 'imageUrl', sortable: false, width: '50px' },
      { title: 'Title', value: 'title', sortable: true },
      { title: 'Author', value: 'author', sortable: true },
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
      const audios = await getDocs(collection(db, 'audios'));
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

    // Redirect functions
    watchProfile(uid: string) {
      this.router.push(`/profile/${uid}`);
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
