<template>
  <div class="profile-container">
    <div v-if="user">
      <div class="profile-header">
        
        <!-- Profile Picture -->
        <label for="file-input" class="profile-picture-container">
          <img :src="user.profilePicture || defaultProfilePicture" alt="Profile Picture" class="profile-picture" />
          <font-awesome-icon icon="pen" class="profile-picture-icon" />
        </label>
        <font-awesome-icon icon="trash" class="delete-picture-icon" v-if="user.profilePicture" @click="removeProfilePicture" />
        <input id="file-input" type="file" @change="handleFileChange" accept="image/*" style="display: none;" />
        
        <h2>{{ user.username }}</h2>
        <p>{{ user.biography }}</p>
      </div>
      <div class="user-details">
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Joined:</strong> {{ formatDate(user.createdAt) }}</p>
      </div>
    </div>

    <button @click="logout" class="logout-button">Logout</button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/';
import { getAuth, signOut } from 'firebase/auth';
import { useAuthStore } from '@/stores/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
// @ts-ignore
import defaultProfilePicture from '@/assets/default-profile.png';

export default defineComponent({
  setup() {
    document.title = 'Profile';
    const authStore = useAuthStore();
    const uid = computed(() => authStore.user?.uid);
    const file = ref<File | null>(null);
    const isUploading = ref(false);

    return {
      uid,
      defaultProfilePicture,
      file,
      isUploading,
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
    formatDate(timestamp) {
      if (timestamp) {
        const date = timestamp.toDate();
        return date.toLocaleDateString();
      }
      return '';
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

        // Update user document in Firestore
        const userDoc = doc(collection(db, 'users'), this.uid);
        await updateDoc(userDoc, {
          profilePicture: downloadURL
        });

        // Update local user object
        this.user.profilePicture = downloadURL;

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
        // Delete profile picture from storage
        const storage = getStorage();
        const fileRef = storageRef(storage, `profile-pictures/${this.uid}`);
        await deleteObject(fileRef);

        // Update user document in Firestore
        const userDoc = doc(collection(db, 'users'), this.uid);
        await updateDoc(userDoc, {
          profilePicture: null
        });

        // Update local user object
        this.user.profilePicture = null;

      } catch (error) {
        console.error('Error removing profile picture:', error);
      }
    },
  }
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

/* icon hidden initially */
.profile-picture-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.profile-picture-icon:hover {
  cursor: pointer;
}

/* show icon on hover */
.profile-picture-container:hover .profile-picture-icon {
  opacity: 1;
}

.profile-picture-container:hover .profile-picture {
  opacity: 0.3;
}

.delete-picture-icon:hover {
  color: #f44336;
  cursor: pointer;
}


.user-details {
  margin: 20px 0;
}

.logout-button {
  padding: 10px 20px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #d32f2f;
}
</style>
