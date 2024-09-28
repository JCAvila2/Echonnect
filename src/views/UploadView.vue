<template>
  <div class="upload-container">
    <h1>Upload Audio</h1>

    <input type="file" @change="handleFileChange" accept="audio/*" />
    
    <input v-model="title" type="text" placeholder="Title" />
    <textarea v-model="description" placeholder="Description"></textarea>
    <input v-model="tagsInput" type="text" placeholder="Tags (comma-separated)" @blur="handleTags" />

    <button :disabled="!file || isUploading" @click="uploadAudio">Upload Audio</button>

    <div v-if="isUploading">Uploading...</div>
    <div v-if="uploadSuccess">Upload successful!</div>
    <div v-if="uploadError">{{ uploadError }}</div>
  </div>
</template>

<script lang="ts">
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  setup() {
    document.title = 'Upload Audio';
  },
  data() {
    return {
      file: null,
      title: '',
      description: '',
      tags: [],
      tagsInput: '',
      isUploading: false,
      uploadSuccess: false,
      uploadError: null,
    };
  },
  methods: {
    async uploadAudio() {
      if (!this.file || !this.title || !this.description) {
        alert('Please provide a file, title, and description.');
        return;
      }

      this.isUploading = true;
      this.uploadSuccess = false;
      this.uploadError = null;

      try {
        const audioDoc = await addDoc(collection(db, 'audios'), {
          title: this.title,
          description: this.description,
          tags: this.tags,
          createdAt: new Date(),
          ratings: [],
          averageRating: 0,
          url: ''
        });
        const generatedId = audioDoc.id;
        const storage = getStorage();
        const storagePath = `audios/${generatedId}`;
        const fileRef = storageRef(storage, storagePath);
        const snapshot = await uploadBytes(fileRef, this.file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        await updateDoc(doc(db, 'audios', generatedId), {
          url: downloadURL,
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

    handleFileChange(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        this.file = target.files[0];
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
