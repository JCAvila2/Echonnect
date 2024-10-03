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
        <td><span @click.stop="watchProfile(item.uid)" class="author-item"> {{ item.author }} </span></td>
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
  background-color: transparent; /* background color of the table */
  color: white; /* color of the text in the table */
}

.custom-item {

}
.custom-item:hover {
  background-color: gray;
  cursor: pointer;
}

.author-item {
  color: red;
}
.author-item:hover {
  color: green;
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
