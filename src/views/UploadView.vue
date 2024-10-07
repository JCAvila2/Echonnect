<template>
  <div class="upload-container">
    <h1>Upload Audio</h1>

    <input type="file" @change="handleAudioFileChange" accept="audio/*" />
    <label for="file">Choose an audio</label>

    <input type="file" @change="handleImageFileChange" accept="image/*" />
    <label for="file">Choose an image</label>
    
    <input v-model="title" type="text" placeholder="Title" />
    <textarea v-model="description" placeholder="Description"></textarea>
    <input v-model="tagsInput" type="text" placeholder="Tags (comma-separated)" @blur="handleTags" />

    <button :disabled="!audioFile || isUploading || !imageFile" @click="uploadAudio">Upload Audio</button>

    <div v-if="isUploading">Uploading...</div>
    <div v-if="uploadSuccess">Upload successful!</div>
    <div v-if="uploadError">{{ uploadError }}</div>
  </div>
</template>

<script lang="ts">
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuthStore } from '@/stores/auth';

export default {
  setup() {
    document.title = 'Upload Audio';
  },
  data() {
    return {
      title: '',
      description: '',
      tags: [],
      tagsInput: '',
      audioFile: null,
      imageFile: null,
      isUploading: false,
      uploadSuccess: false,
      uploadError: null,
      audioDuration: '',
    };
  },
  methods: {
    async uploadAudio() {
      if (!this.audioFile || !this.imageFile || !this.title || !this.description) {
        alert('Please provide an audio file, audio image, title, and description.');
        return;
      }

      this.isUploading = true;
      this.uploadSuccess = false;
      this.uploadError = null;

      try {
        // Get author info
        const authStore = useAuthStore();
        const userDoc = await getDoc(doc(db, 'users', authStore.user.uid));
        const userData = userDoc.data();

        // Add audio metadata to Firestore
        const audioDoc = await addDoc(collection(db, 'audios'), {
          uid: authStore.user.uid,
          author: userData.username,
          title: this.title,
          description: this.description,
          tags: this.tags,
          duration: this.audioDuration,
          createdAt: new Date(),
          ratings: [],
          reproductions: 0,
        });

        const generatedId = audioDoc.id;

        // Upload audio file to Firebase Storage
        const audioStorage = getStorage();
        const audioStoragePath = `audios/${generatedId}`;
        const fileRef = storageRef(audioStorage, audioStoragePath);
        const audioBytes = await uploadBytes(fileRef, this.audioFile);
        const audioDownloadURL = await getDownloadURL(audioBytes.ref);

        // Upload image to Firebase Storage
        const imageStoragePath = `images/${generatedId}`;
        const imageRef = storageRef(audioStorage, imageStoragePath);
        const imageBytes = await uploadBytes(imageRef, this.imageFile);
        const imageDownloadURL = await getDownloadURL(imageBytes.ref);
        
        // Update Firestore with the URLs
        await updateDoc(doc(db, 'audios', generatedId), {
          audioUrl: audioDownloadURL,
          imageUrl: imageDownloadURL,
        });

        this.uploadSuccess = true;
      } catch (error) {
        console.error('Error uploading audio:', error);
        this.uploadError = 'Failed to upload audio.';
      } finally {
        this.isUploading = false;
      }
    },

    handleTags() {
      this.tags = this.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    },
    handleImageFileChange(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        this.imageFile = target.files[0];
      }
    },
    formatDuration(seconds: number) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    },
    handleAudioFileChange(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        this.audioFile = target.files[0];
        const audioUrl = URL.createObjectURL(this.audioFile);
        const audio = new Audio(audioUrl);
        audio.onloadedmetadata = () => {
          const durationInSeconds = audio.duration;
          this.audioDuration = this.formatDuration(durationInSeconds);
        };
      }
    },
  }
};
</script>

<style scoped>
.upload-container {
  max-width: 500px;
  margin: auto;
  padding: 20px;
  text-align: center;
}

input, textarea {
  display: block;
  width: 100%;
  margin-bottom: 10px;
}

button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
