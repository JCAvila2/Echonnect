<template>
  <v-data-table
    :headers="headers"
    :items="listOfAudios"
    class="custom-table" 
    item-key="title"
    items-per-page="5"
  >
    <template v-slot:item="{ item }">
      <tr class="custom-item" @click="HearAudio(item.id)">
        <td>
          <img v-if="item.imageUrl" :src="item.imageUrl" alt="Audio Image" class="audio-image" />
          <img v-else src="" alt="Default Image" class="audio-image" /> <!-- TODO: add default image -->
        </td>
        <td>{{ item.title }}</td>
        <td>{{ item.author }}</td> <!-- TODO: get author connected with firebase -->
        <td>{{ item.reproductions }}</td>
        <td>{{ item.tags }}</td>
      </tr>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import { collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { db } from '@/firebase/';

export default {
  setup() {
    const router = useRouter();
    document.title = 'Search';

    return {
      router,
    };
  },
  data() {

    const headers = [
      { title: 'Image', value: 'imageUrl' },
      { title: 'Title', value: 'title' },
      { title: 'Autor', value: 'author' },
      
      { title: 'Plays', value: 'reproductions' },
      { title: 'Topics', value: 'tags' },
    ];

    return {
      search: '',
      headers,
      listOfAudios: [],
    }
  },
  mounted() {
    this.getAudios();
  },
  methods: {
    async getAudios() {
      const audios = await getDocs(collection(db, 'audios'));
      audios.forEach((audio) => {
        this.listOfAudios.push({
          id: audio.id,
          ...audio.data(),
        });
      });
    },

    // redirect methods
    watchProfile(uid: string) {
      this.router.push(`/profile/${uid}`);
    },
    HearAudio(audioId: string) {
      this.router.push(`/audio/${audioId}`);
    },
  }

};

</script>

<style scoped>
.custom-table {
  background-color: gray; /* background color of the table */
}

.custom-item {
  background-color: orange; /* background color of the rows */
}
.custom-item:hover {
  background-color: blue; /* background color of the rows when hovered */
  cursor: pointer;
}


.audio-image {
  width: 50px;
  height: 50px;
  object-fit: cover;

  display: block;
  margin-top: auto;
  margin-bottom: auto;
}
</style>
