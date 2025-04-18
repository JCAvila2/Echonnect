<template>
  <div class="profile-container">
    
    <!-- Desktop view --> 
    <div v-if="user && !isMobile" class="profile-content">
      <div class="profile-header">
        <img :src="user?.profilePicture ?? defaultProfilePicture" alt="Profile Picture" class="profile-picture" />
        <div class="user-info">
          <h2 class="username">{{ user.username }}</h2>
          <p class="user-bio" v-if="user.biography != ''">{{ user.biography }}</p>
          <p class="user-creation"> <strong>{{ $t('joined') }}:</strong> {{ formatDate(user.createdAt) }}</p>
          <button @click="toggleFollow" class="btn" :class="{ 'btn-follow': !isFollowing, 'btn-unfollow': isFollowing }">
            {{ isFollowing ? $t('unfollow') : $t('follow')  }}
          </button>
        </div>
      </div>
      <div class="stats-and-audios">
        <div class="stats">
          <h3>
            {{ $t('stats') }}
            <font-awesome-icon icon="chart-line" />
          </h3>
          <ul>
            <li><strong>{{ $t('followers') }}:</strong> {{ followerCount }}</li>
            <li><strong>{{ $t('audios') }}:</strong> {{ audiosCount }}</li>
            <li><strong>{{ $t('bookmarks') }}:</strong> {{ bookmarksCount }}</li>
            <li><strong>{{ $t('plays') }}:</strong> {{ playsCount }}</li>
            <li><strong>{{ $t('avgRating') }}:</strong> {{ averageRating ? averageRating.toFixed(1) + ' ⭐' : $t('noRatingYet') }}</li>
          </ul>
        </div>
        <div class="audios-table">
          <UserAudiosTable :uid="uid || ''" />
        </div>
      </div>
    </div>

    <!-- Mobile view -->
    <div v-else-if="user && isMobile" class="profile-content">
      
      <div class="profile-picture-container">
        <img :src="user?.profilePicture ?? defaultProfilePicture" alt="Profile Picture" class="profile-picture" />
      </div>
      
      <div class="user-info">
        <h2 class="username">{{ user.username }}</h2>
        <button @click="toggleFollow" class="btn" :class="{ 'btn-follow': !isFollowing, 'btn-unfollow': isFollowing }">
          {{ isFollowing ? $t('unfollow') : $t('follow') }}
        </button>
        <p class="user-bio" v-if="user.biography != ''">{{ user.biography }}</p>
        <p class="user-creation"> <strong>{{ $t('joined') }}:</strong> {{ formatDate(user.createdAt) }}</p>
      </div>
      <div class="stats">
        <h3>
          {{ $t('stats') }}
          <font-awesome-icon icon="chart-line" />
        </h3>
          <ul>
            <li><strong>{{ $t('followers') }}:</strong> {{ followerCount }}</li>
            <li><strong>{{ $t('audios') }}:</strong> {{ audiosCount }}</li>
            <li><strong>{{ $t('bookmarks') }}:</strong> {{ bookmarksCount }}</li>
            <li><strong>{{ $t('plays') }}:</strong> {{ playsCount }}</li>
            <li><strong>{{ $t('avgRating') }}:</strong> {{ averageRating ? averageRating.toFixed(1) + ' ⭐' : $t('noRatingYet') }}</li>
          </ul>
      </div>
      <div class="audios-table">
        <UserAudiosTable :uid="uid || ''" />
      </div>
    </div>

    <div v-else>
      <v-container>
        <v-row>
          <v-col cols="12" class="d-flex justify-center">
            <v-progress-circular indeterminate></v-progress-circular>
          </v-col>
        </v-row>
      </v-container>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { addDoc, collection, deleteDoc, doc, getAggregateFromServer, getCountFromServer, getDoc, getDocs, query, sum, where } from 'firebase/firestore';
import { db } from '@/firebase/';
import UserAudiosTable from '@/components/UserAudiosTable.vue';
import { useAuthStore } from '@/stores/auth';
import { formatDate } from '@/utils/formatDate';
// @ts-ignore
import defaultProfilePicture from '@/assets/default-profile.png';
import { User } from '@/types/views/profileView';
import { WatchProfileViewStatus } from '@/types/views/watchProfileView';
import { useI18n } from 'vue-i18n';

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
    const userAuthStore = useAuthStore().user;
    const { t, locale } = useI18n();
    return { 
      userAuthStore,
      formatDate, 
      locale,
      t,
    };
  },
  mounted() {
    this.fetchUser();
    this.fetchUserStats();
    this.checkFollowStatus();
    this.fetchBookmarksCount();
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
  },
  data(): WatchProfileViewStatus {
    return {
      user: null,
      defaultProfilePicture: defaultProfilePicture,
      audiosCount: 0,
      playsCount: 0,
      averageRating: null,
      followerCount: 0,
      isFollowing: false ,
      isMobile: false,
      bookmarksCount: 0,
    };
  },
  methods: {
    async fetchUser() {
      const userDoc = doc(collection(db, 'users'), this.uid);
      const docSnapshot = await getDoc(userDoc);
      if (docSnapshot.exists()) {
        this.user = { id: docSnapshot.id, ...docSnapshot.data() } as User;
        document.title = this.user.username ?? 'Profile';
      } else {
        console.log('User not found');
        this.$router.push('/not-found');
      }
    },
    async fetchUserStats() {
      const coll = collection(db, "audios");
      const q = query(coll, where("uid", "==", this.uid));
      const count = await getCountFromServer(q);
      const ratingCount = await getCountFromServer(query(coll, where("uid", "==", this.uid), where("averageRating", ">", 0)));
      const snapshot = await getAggregateFromServer(q, {
        totalPlays: sum('reproductions'),
        totalRating: sum('averageRating'),
      });
      await this.fetchFollowersCount();

      this.audiosCount = count.data().count;
      this.playsCount = snapshot.data().totalPlays;
      this.averageRating = snapshot.data().totalRating / ratingCount.data().count;
    },
    async fetchFollowersCount() {
      const followsCollection = collection(db, 'follows');
      const followQuery = query(followsCollection, where('followedId', '==', this.uid));
      const count = await getCountFromServer(followQuery);
      this.followerCount = count.data().count;
    },
    async toggleFollow() {
      if (!this.userAuthStore?.uid) {
        alert('Please log in follow this user.'); // TODO: redirect to login page
        return;
      }

      const followsCollection = collection(db, 'follows');
      const followQuery = query(
        followsCollection, 
        where('followerId', '==', this.userAuthStore?.uid),
        where('followedId', '==', this.uid)
      );

      if (this.isFollowing) {
        // Unfollow
        this.isFollowing = false;
        this.followerCount--;
        const snapshot = await getDocs(followQuery);
        snapshot.forEach((doc) => {
          deleteDoc(doc.ref);
        });
      } else {
        // Follow
        this.isFollowing = true;
        this.followerCount++;
        await addDoc(followsCollection, {
          followerId: this.userAuthStore?.uid,
          followedId: this.uid,
          timestamp: new Date()
        });
      }
    },
    async checkFollowStatus() {
      if (!this.userAuthStore?.uid) return;
      const followsCollection = collection(db, 'follows');
      const followQuery = query(
        followsCollection, 
        where('followerId', '==', this.userAuthStore?.uid),
        where('followedId', '==', this.uid)
      );
      const snapshot = await getDocs(followQuery);
      this.isFollowing = !snapshot.empty;
    },
    async fetchBookmarksCount() {
      const bookmarksCollection = collection(db, 'bookmarks');
      const bookmarksQuery = query(bookmarksCollection, where('authorId', '==', this.uid));
      const count = await getCountFromServer(bookmarksQuery);
      this.bookmarksCount = count.data().count;
    },
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
    },
  },
});
</script>

<style scoped>
.profile-container {
  height: 100%;
  padding: 50px;
  color: var(--text-color);
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
  width: 250px;
  height: 250px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex-grow: 1;
  margin-left: 30px;
}

.username {
  font-size: 81px;
  margin: 0;
  font-weight: black;
}

.user-creation {
  font-size: 22px;
  color: #a0a0a0;
}

.user-bio {
  font-size: 24px;
  margin: 5px 0;
}

.btn {
  margin-top: 20px;
  margin-bottom: 20px;
}
.btn-follow {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.btn-follow:hover {
  background-color: #333;
}
.btn-unfollow {
  padding: 10px 20px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.btn-unfollow:hover {
  background-color: #333;
}

.stats-and-audios {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.stats {
  width: 250px;
  padding-right: 20px;
  border-right: 2px solid #333;
}

.stats h3 {
  font-size: 28px;
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

@media (max-width: 768px) {
  .profile-container {
    padding: 20px;
  }

  .profile-picture-container {
    width: 250px;
    height: 250px;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  .btn {
    margin-top: 10px;
  }

  .user-info {
    margin-left: 0px;
    margin-bottom: 20px;
  }

  .logout-button {
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .stats {
    width: 100%;
    border-right: none;
    padding-right: 0;
    margin-top: 20px;
    margin-bottom: 20px;
  }

}

</style>
