<template>
  <div class="profile-container">

    <!-- Desktop view -->
    <div v-if="user && !isMobile" class="profile-content">

      <div class="profile-header">
        <div class="profile-picture-container">
          <label for="file-input" class="profile-picture-label">
            <img :src="user?.profilePicture ?? defaultProfilePicture" alt="Profile Picture" class="profile-picture" />
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
          <div class="user-bio-container">
            <p v-if="!editingBio" class="user-bio">
              {{ user.biography || $t('noBioYet') }}
              <font-awesome-icon icon="pen" class="edit-bio-icon" @click="startEditingBio" />
            </p>
            <div v-else class="edit-bio-form">
              <textarea v-model="newBio" class="bio-textarea" :maxlength="bioMaxLength"></textarea>
              <div class="bio-actions">
                <span class="bio-char-count">{{ newBio.length }}/{{ bioMaxLength }}</span>
                <button @click="saveBio" class="save-bio-button">{{ $t('save') }}</button>
                <button @click="cancelEditingBio" class="cancel-bio-button">{{ $t('cancel') }}</button>
              </div>
            </div>
          </div>
          <p class="user-creation"><strong>{{ $t('joined') }}:</strong> {{ formatDate(user.createdAt) }}</p>
          <button @click="logout" class="logout-button">{{ $t('logout') }}</button>
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
            <li><strong>{{ $t('avgRating') }}:</strong> {{ averageRating ? averageRating.toFixed(1) + ' ⭐' : $t('noRatingYet') }}
            </li>
          </ul>
        </div>

        <div class="audios-table">
          <ManageAudioTable @updateStats="fetchUserStats" :uid="uid || ''"/>
        </div>
      </div>

    </div>

    <!-- Mobile view -->
    <div v-else-if="user && isMobile" class="profile-content">

      <div class="profile-picture-container">
        <label for="file-input" class="profile-picture-label">
          <img :src="user?.profilePicture ?? defaultProfilePicture" alt="Profile Picture" class="profile-picture" />
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
        <div class="user-bio-container">
          <div v-if="!editingBio" class="user-bio">
            <span>{{ user.biography || t('noBioYet')  }}</span>
            <font-awesome-icon icon="pen" class="edit-bio-icon" @click="startEditingBio" />
          </div>
          <div v-else class="edit-bio-form">
            <textarea v-model="newBio" class="bio-textarea" :maxlength="bioMaxLength"></textarea>
            <div class="bio-actions">
              <span class="bio-char-count">{{ newBio.length }}/{{ bioMaxLength }}</span>
              <button @click="saveBio" class="save-bio-button">{{ $t('save') }}</button>
              <button @click="cancelEditingBio" class="cancel-bio-button">{{ $t('cancel') }}</button>
            </div>
          </div>
        </div>
        <p class="user-creation"><strong>{{ $t('joined') }}:</strong> {{ formatDate(user.createdAt) }}</p>
        <button @click="logout" class="logout-button">{{ $t('logout') }}</button>
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
          <li><strong>{{ $t('avgRating') }}:</strong> {{ averageRating ? averageRating.toFixed(1) + ' ⭐' : $t('noRatingYet') }}
          </li>
        </ul>
      </div>

      <div class="audios-table">
        <ManageAudioTable @updateStats="fetchUserStats" :uid="uid || ''"/>
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
import { collection, doc, getAggregateFromServer, getCountFromServer, getDoc, getDocs, query, sum, updateDoc, where, writeBatch } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes, getStorage, deleteObject } from 'firebase/storage';
import { db } from '@/firebase/';
import ManageAudioTable from '@/components/ManageAudioTable.vue';
import { getAuth, signOut } from 'firebase/auth';
import { useAuthStore } from '@/stores/auth';
import { formatDate } from '@/utils/formatDate';
// @ts-ignore
import defaultProfilePicture from '@/assets/default-profile.png';
import { ProfileViewState, User } from '@/types/views/profileView';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  components: {
    ManageAudioTable,
  },
  setup() {
    const uid = useAuthStore().user?.uid;
    const { t, locale } = useI18n();
    document.title = t('profile');
    return { 
      uid,
      formatDate,
      locale,
      t,
    };
  },
  watch: {
    locale() {
      document.title = this.t('profile');
    }
  },  
  mounted() {
    this.fetchUser();
    this.fetchUserStats();
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
  },
  data(): ProfileViewState {
    return {
      user: null,
      defaultProfilePicture,
      audiosCount: 0,
      playsCount: 0,
      averageRating: null,
      followerCount: 0,
      bookmarksCount: 0,
      editingBio: false,
      newBio: '',
      bioMaxLength: 150,
      file: null,
      isUploading: false,
      isMobile: false,
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
        this.user = { id: docSnapshot.id, ...docSnapshot.data() } as User;
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
      await this.fetchBookmarksCount();

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
    async fetchBookmarksCount() {
      const bookmarksCollection = collection(db, 'bookmarks');
      const bookmarksQuery = query(bookmarksCollection, where('authorId', '==', this.uid));
      const count = await getCountFromServer(bookmarksQuery);
      this.bookmarksCount = count.data().count;
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
        if (this.user) {
          this.user.profilePicture = downloadURL;
        }

        // Update user document in Firestore
        const userDoc = doc(collection(db, 'users'), this.uid);
        await updateDoc(userDoc, {
          profilePicture: downloadURL
        });

        // Update comments with the user's profile picture
        const commentsCollection = collection(db, "comments");
        const commentsQuery = query(commentsCollection, where("uid", "==", this.uid));
        const querySnapshot = await getDocs(commentsQuery);
        if (querySnapshot.empty) {
          return;
        }
        const batch = writeBatch(db);
        querySnapshot.forEach((docSnapshot) => {
          const docRef = doc(db, "comments", docSnapshot.id);
          batch.update(docRef, { userProfilePicture: downloadURL });
        });
        await batch.commit();
        // TODO: notify user of success (toast)
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
        if (this.user) {
          this.user.profilePicture = null;
        }

        // Delete profile picture from storage
        const storage = getStorage();
        const fileRef = storageRef(storage, `profile-pictures/${this.uid}`);
        await deleteObject(fileRef);

        // Update user document in Firestore
        const userDoc = doc(collection(db, 'users'), this.uid);
        await updateDoc(userDoc, {
          profilePicture: null
        });

        // Update comments with the user's profile picture
        const commentsCollection = collection(db, "comments");
        const commentsQuery = query(commentsCollection, where("uid", "==", this.uid));
        const querySnapshot = await getDocs(commentsQuery);
        if (querySnapshot.empty) {
          return;
        }
        const batch = writeBatch(db);
        querySnapshot.forEach((docSnapshot) => {
          const docRef = doc(db, "comments", docSnapshot.id);
          batch.update(docRef, { userProfilePicture: null });
        });
        await batch.commit();
        // TODO: notify user of success (toast)
      } catch (error) {
        console.error('Error removing profile picture:', error);
      }
    },
    startEditingBio() {
      this.editingBio = true;
      if (this.user) {
        this.newBio = this.user.biography || '';
      }
    },
    cancelEditingBio() {
      this.editingBio = false;
      this.newBio = '';
    },
    async saveBio() {
      if (!this.uid) {
        console.error('User ID is missing');
        return;
      }

      try {
        const userDoc = doc(collection(db, 'users'), this.uid);
        await updateDoc(userDoc, {
          biography: this.newBio
        });

        if (this.user) {
          this.user.biography = this.newBio;
        }
        this.editingBio = false;
      } catch (error) {
        console.error('Error updating bio:', error);
        alert('An error occurred while saving the bio. Please try again.');
        // TODO: Handle the error appropriately (e.g., show an error message to the user)
      }
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
  color: var(--color-text);
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
  color: var(--color-text);
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
  color: var(--color-text);
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
  color: var(--color-text);
  margin: 5px 0;
}

.user-bio-container {
  position: relative;
  margin: 10px 0;
}

.edit-bio-icon {
  margin-left: 10px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.edit-bio-icon:hover {
  opacity: 1;
}

.edit-bio-form {
  display: flex;
  flex-direction: column;
}

.bio-textarea {
  width: 100%;
  min-height: 100px;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #2c3e50;
  color: white;
  border: 1px solid #34495e;
  border-radius: 5px;
  resize: vertical;
}

.bio-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.bio-char-count {
  margin-right: 10px;
  font-size: 14px;
  color: #a0a0a0;
}

.save-bio-button,
.cancel-bio-button {
  padding: 5px 15px;
  margin-left: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-bio-button {
  background-color: #2ecc71;
  color: white;
}

.save-bio-button:hover {
  background-color: #27ae60;
}

.cancel-bio-button {
  background-color: gray;
  color: white;
}

.cancel-bio-button:hover {
  background-color: gray;
}

.logout-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: gray;
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
