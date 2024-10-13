<template>
  <div class="profile-container">
    <div v-if="user" class="profile-content">
      <div class="profile-header">
        <div class="profile-picture-container">
          <label for="file-input" class="profile-picture-label">
            <img :src="user.profilePicture || defaultProfilePicture" alt="Profile Picture" class="profile-picture" />
            <font-awesome-icon icon="pen" class="profile-picture-icon" />
            <input id="file-input" type="file" @change="handleFileChange" accept="image/*" style="display: none;" />
          </label>
          <div class="icon-actions">
            <font-awesome-icon icon="trash" class="delete-picture-icon" v-if="user.profilePicture"
              @click.stop="removeProfilePicture" />
          </div>
        </div>

        <div class="user-info">
          <h2 class="username">{{ user.username }}</h2>
          <p class="user-creation"><strong>Joined:</strong> {{ formatDate(user.createdAt) }}</p>
          <p class="user-bio" v-if="user.biography != ''">{{ user.biography }}</p>
          <button @click="logout" class="logout-button">Logout</button>
        </div>
      </div>

      <div class="stats-and-audios">
        <div class="stats">
          <h3>
            Stats
            <font-awesome-icon icon="chart-line" />
          </h3>
          <ul>
            <li><strong>Followers:</strong> {{ followerCount }}</li>
            <li><strong>Audios:</strong> {{ audiosCount }}</li>
            <li><strong>Plays:</strong> {{ playsCount }}</li>
            <li><strong>Avg. Score:</strong> {{ averageRating ? averageRating.toFixed(1) + ' ⭐' : 'No ratings yet' }}
            </li>
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
import { collection, doc, getAggregateFromServer, getCountFromServer, getDoc, query, sum, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { db } from '@/firebase/';
import UserAudiosTable from '@/components/UserAudiosTable.vue';
import { useAuthStore } from '@/stores/auth';
import { formatDate } from '@/utils/formatDate';
// @ts-ignore
import defaultProfilePicture from '@/assets/default-profile.png';
import { getStorage, deleteObject } from 'firebase/storage';
import { getAuth, signOut } from 'firebase/auth';

export default defineComponent({
  components: {
    UserAudiosTable,
  },
  setup() {
    const uid = useAuthStore().user.uid;
    return { uid };
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
      averageRating: null,
      followerCount: 0,
    };
  },
  methods: {
    logout() {
			const auth = getAuth();
			signOut(auth)
				.then(() => {
					this.$router.push('/login');
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
    async fetchUserStats() {
      const coll = collection(db, "audios");
      const q = query(coll, where("uid", "==", this.uid));
      const count = await getCountFromServer(q);
      const snapshot = await getAggregateFromServer(q, {
        totalPlays: sum('reproductions'),
        totalRating: sum('averageRating'),
      });
      await this.fetchFollowersCount();

      this.audiosCount = count.data().count;
      this.playsCount = snapshot.data().totalPlays;
      this.averageRating = snapshot.data().totalRating / count.data().count;
    },
    async fetchFollowersCount() {
      const followsCollection = collection(db, 'follows');
      const followQuery = query(followsCollection, where('followedId', '==', this.uid));
      const count = await getCountFromServer(followQuery);
      this.followerCount = count.data().count;
    },

    handleFileChange(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const selectedFile = target.files[0];
        if (this.isValidFileSize(selectedFile)) {
          this.file = selectedFile;
          this.uploadProfilePicture();
        } else {
          alert('The file is too large. Please select an image smaller than 1 MB.');
        }
      }
    },
    isValidFileSize(file: File): boolean {
      const maxSize = 1 * 1024 * 1024; // 1MB in bytes
      return file.size <= maxSize;
    },
    async uploadProfilePicture() {
      if (!this.file || !this.uid) {
        console.error('No file selected or user ID is missing');
        return;
      }

      this.isUploading = true;

      try {
        const storage = getStorage();
        const fileRef = storageRef(storage, `profile-pictures/${this.uid}`);

        const snapshot = await uploadBytes(fileRef, this.file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Update local user object
        this.user.profilePicture = downloadURL;

        // Update user document in Firestore
        const userDoc = doc(collection(db, 'users'), this.uid);
        await updateDoc(userDoc, {
          profilePicture: downloadURL
        });
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        // Handle the error appropriately (e.g., show an error message to the user)
      } finally {
        this.isUploading = false;
      }
    },
    async removeProfilePicture() {
      if (!this.uid) {
        console.error('User ID is missing');
        return;
      }

      try {
        this.user.profilePicture = null;

        // Delete profile picture from storage
        const storage = getStorage();
        const fileRef = storageRef(storage, `profile-pictures/${this.uid}`);
        await deleteObject(fileRef);

        // Update user document in Firestore
        const userDoc = doc(collection(db, 'users'), this.uid);
        await updateDoc(userDoc, {
          profilePicture: null
        });
      } catch (error) {
        console.error('Error removing profile picture:', error);
      }
    },
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

.profile-picture-container {
  position: relative;
  display: inline-block;
}

.profile-picture {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
}

.profile-picture-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.profile-picture:hover+.profile-picture-icon {
  opacity: 1;
}

.profile-picture:hover {
  opacity: 0.3;
}

.icon-actions {
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  gap: 10px;
}

.delete-picture-icon {
  position: relative;
  bottom: 0px;
  font-size: 24px;
  color: white;
  transition: opacity 0.3s ease;
}

.delete-picture-icon:hover {
  color: #f44336;
  cursor: pointer;
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
  color: #a0a0a0;
  margin: 5px 0;
}

.logout-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #333;
}

.stats-and-audios {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.stats {
  width: 200px;
  padding-top: 20px;
  padding-right: 20px;
  border-right: 2px solid #333;
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
