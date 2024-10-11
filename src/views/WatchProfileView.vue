<template>
  <div class="profile-container">
    <div v-if="user" class="profile-content">
      <div class="profile-header">
        <img :src="user.profilePicture || defaultProfilePicture" alt="Profile Picture" class="profile-picture" />
        <div class="user-info">
          <h2 class="username">{{ user.username }}</h2>
          <p class="user-creation"> <strong>Joined:</strong> {{ formatDate(user.createdAt) }}</p>
          <p class="user-bio" v-if="user.biography != ''">{{ user.biography }}</p>
        </div>
        <button @click="follow" class="btn btn-primary">Follow</button>
      </div>

      <div class="stats-and-audios">
        <div class="stats">
          <h3>Stats</h3>
          <ul>
            <li><strong>Followers:</strong> {{ user.followers || 0 }}</li>
            <li><strong>Audios:</strong> {{ audiosCount }}</li>
            <li><strong>Plays:</strong> {{ playsCount }}</li>
            <li><strong>Avg. Score:</strong> {{ averageRating.toFixed(1) + ' ⭐' || 'N/A' }}</li>
          </ul>
        </div>

        <div class="audios-table">
          <UserAudiosTable :uid="uid" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { collection, doc, getAggregateFromServer, getCountFromServer, getDoc, query, sum, where } from 'firebase/firestore';
import { db } from '@/firebase/';
import UserAudiosTable from '@/components/UserAudiosTable.vue';
import { useAuthStore } from '@/stores/auth';
import { formatDate } from '@/utils/formatDate';
// @ts-ignore
import defaultProfilePicture from '@/assets/default-profile.png';

export default defineComponent({
  props: {
    uid: {
      type: String,
      required: true,
    },
  },
  components: {
    UserAudiosTable,
  },
  setup() {
    const userAuthStore = useAuthStore;
    return { userAuthStore };
  },
  mounted() {
    this.fetchUser();
    this.fetchUserStats();
  },
  data() {
    return {
      user: null,
      defaultProfilePicture,
      formatDate,
      audiosCount: 0,
      playsCount: 0,
      averageRating: 0,
    };
  },
  methods: {
    follow() {
      console.log('Following user...', this.userAuthStore);
      // TODO: Implement follow functionality
    },
    async fetchUser() {
      const userDoc = doc(collection(db, 'users'), this.uid);
      const docSnapshot = await getDoc(userDoc);
      if (docSnapshot.exists()) {
        this.user = { id: docSnapshot.id, ...docSnapshot.data() };
        document.title = this.user.username ?? 'Profile';
      } else {
        console.log('User not found');
        // TODO: Redirect to 404 page
      }
    },
    async fetchUserStats() {
      const coll = collection(db, "audios");
      const q = query(coll, where("uid", "==", this.uid));
      const count = await getCountFromServer(q);
      const snapshot = await getAggregateFromServer(q, {
        totalPlays: sum('reproductions'),
        totalRating: sum('averageRating'),
      });

      this.audiosCount = count.data().count;
      this.playsCount = snapshot.data().totalPlays;
      this.averageRating = snapshot.data().totalRating / count.data().count;
    }
  },
});
</script>

<style scoped>
.profile-container {
  height: 100%;
  padding: 50px;
  background-color: #1c2732;
  color: white;
  font-family: Arial, sans-serif;
}

.profile-content {
  display: flex;
  flex-direction: column;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.profile-picture {
  width: 20%;
  min-width: 200px;
  height: auto;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 20px;
}

.user-info {
  flex-grow: 1;
}

.username {
  font-size: 44px;
  margin: 0;
}

.user-creation {
  font-size: 22px;
  color: #a0a0a0;
}

.user-bio {
  font-size: 24px;
  color: #a0a0a0;
  margin: 5px 0;
}

.stats-and-audios {
  display: flex;

  /* start on the same line */
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.stats {
  width: 200px;
  padding-top: 20px;
  padding-right: 20px;
}

.stats h3 {
  font-size: 18px;
  margin-bottom: 10px;
}

.stats ul {
  list-style-type: none;
  padding: 0;
}

.stats li {
  margin-bottom: 5px;
}

.audios-table {
  flex-grow: 1;
}
</style>
