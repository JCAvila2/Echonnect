<template>
  <div>
    <h1>TODO: Implement other users profile</h1>
    <div v-if="user">
      <h2>{{ user.username }}</h2>
      <p>{{ user.description }}</p>
    </div>

  </div>

  <button @click="follow">Follow</button>

</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

export default defineComponent({
  props: {
    uid: {
      type: String,
      required: true,
    },
  },
  mounted() {
    this.fetchUser();
  },
  data() {
    return {
      user: null,
    };
  },
  methods: {
    follow() {
      const auth = getAuth();
      console.log('Following user...', auth);
      // TODO: Implement follow functionality
    },
    async fetchUser() {
      const userDoc = doc(collection(db, 'users'), this.uid);
      const docSnapshot = await getDoc(userDoc);
      if (docSnapshot.exists()) {
        this.user = { id: docSnapshot.id, ...docSnapshot.data() };
        document.title = this.user.username ?? 'Profiles';
      } else {
        console.log('User not found');
        // TODO: Redirect to 404 page
      }
    },
  }
});
</script>
