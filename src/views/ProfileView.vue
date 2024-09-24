<template>
  <div>
    <h1>TODO: Implement my user profile</h1>
    <div v-if="user">
      <h2>{{ user.username }}</h2>
      <p>{{ user.description }}</p>
    </div>

  </div>

  <button @click="logout"> Logout </button>

</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { getAuth, signOut } from 'firebase/auth';
import { useAuthStore } from '@/stores/auth';

export default defineComponent({
  setup() {
    document.title = 'Profile';
    const authStore = useAuthStore();
    const uid = computed(() => authStore.user?.uid);

    return { 
      uid,
    };
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
    logout() {
      const auth = getAuth();
      signOut(auth)
        .then(() => {
          this.$router.push('/login');
          console.log('User signed out successfully');
        })
        .catch(error => {
          console.log('Error signing out: ', error);
        });
    },
    async fetchUser() {    
      const userDoc = doc(collection(db, 'users'), this.uid);
      const docSnapshot = await getDoc(userDoc);
      if (docSnapshot.exists()) {
        this.user = { id: docSnapshot.id, ...docSnapshot.data() };
      } else {
        console.log('User not found'); 
        // TODO: Redirect to 404 page
      }
    },
  }
});
</script>
