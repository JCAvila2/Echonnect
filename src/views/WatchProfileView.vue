<template>
  <div class="profile-container">
    <div v-if="user">
      <div class="profile-header">
        
        <!-- Profile Picture -->
        <img :src="user.profilePicture || defaultProfilePicture" alt="Profile Picture" class="profile-picture" />
      
        <h2>{{ user.username }}</h2>
        <p>{{ user.biography }}</p>
      </div>
      <div class="user-details">
        <p><strong>Joined:</strong> {{ formatDate(user.createdAt) }}</p>
      </div>
    </div>

    <button @click="follow" class="follow-button">Follow</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
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
    formatDate(timestamp) {
      if (timestamp) {
        const date = timestamp.toDate();
        return date.toLocaleDateString();
      }
      return '';
    },
  },
});
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  text-align: center;
}

.profile-header {
  margin-bottom: 20px;
  position: relative;
}

.profile-picture-container {
  position: relative;
  display: inline-block;
}

.profile-picture {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
}

.user-details {
  margin: 20px 0;
}

.follow-button {
  padding: 10px 20px;
  background-color: gray;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.follow-button:hover {
  background-color: blue;
}
</style>
