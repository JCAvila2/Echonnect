<template>
  <div class="upload-container">
    <h1 class="upload-title">{{ $t('uploadAudio') }}</h1>

    <v-file-input
      v-model="audioFile"
      accept="audio/*"
      :label="$t('selectAudio')"
      prepend-icon="volume-up"
      @change="handleAudioFileChange"
      clearable
      show-size
    ></v-file-input>

    <v-file-input
      v-model="imageFile"
      accept="image/*"
      :label="$t('selectImage')"
      prepend-icon="image"
      variant="filled"
      @change="handleImageFileChange"
      clearable
      show-size
    ></v-file-input>

    <v-text-field :label="$t('title')" v-model="title" hide-details="auto" variant="solo-filled"
      :theme="themeStore ? themeStore.theme : 'dark'" class="fields">
    </v-text-field>

    <v-textarea v-model="description" :label="$t('description')" variant="solo-filled"
      :theme="themeStore ? themeStore.theme : 'dark'" class="fields"></v-textarea>

    <div class="tags-input-container">
      <input v-model="currentTag" @keyup.enter="addTag" type="text" :placeholder="$t('addATag')"
        class="text-input tag-input" />
      <button @click="addTag" class="add-tag-button">
        {{ $t('add') }}
      </button>
    </div>

    <div class="tags-info">
      {{ $t('tags') }}: {{ tags.length }}
    </div>

    <div class="tags-container">
      <span v-for="(tag, index) in tags" :key="index" class="tag">
        {{ tag }}
        <button @click="removeTag(index)" class="remove-tag-button">&times;</button>
      </span>
    </div>

    <button
      :disabled="!audioFile || isUploading || !imageFile || title === '' || description === '' || tags.length === 0"
      @click="uploadAudio" class="upload-button">
      {{ isUploading ? $t('uploading') : $t('uploadAudio') }}
    </button>

    <div v-if="uploadSuccess" class="status-message success">{{ $t('uploadSuccess') }}</div>
    <div v-if="uploadError" class="status-message error">{{ uploadError }}</div>
  </div>
</template>

<script lang="ts">
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuthStore } from '@/stores/auth';
import { formatTime } from '@/utils/formatTime';
import { UploadViewStatus } from '@/types/views/uploadView';
import { useI18n } from 'vue-i18n';
import { useThemeStore } from '@/stores/theme';

export default {
  setup() {
    const { t, locale } = useI18n();
    document.title = t('uploadAudio');
    const themeStore = useThemeStore();
    return {
      t,
      locale,
      themeStore,
    };
  },
  watch: {
    locale() {
      document.title = this.t('uploadAudio');
    }
  },
  data(): UploadViewStatus {
    return {
      title: '',
      description: '',
      tags: [],
      currentTag: '',
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
        const userId = authStore.user?.uid;
        if (!userId) {
          throw new Error('User not authenticated.');
        }

        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        // Add audio metadata to Firestore
        const audioDoc = await addDoc(collection(db, 'audios'), {
          uid: userId,
          author: userData?.username,
          authorRef: userRef,
          title: this.title,
          title_words: this.title.toLowerCase().split(' '),
          description: this.description,
          tags: this.tags,
          tags_insensitive: this.tags.map((tag) => tag.toLowerCase()),
          duration: this.audioDuration,
          createdAt: new Date(),
          reproductions: 0,
          sumRatings: 0,
          totalRatings: 0,
          averageRating: 0,
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
        this.restartFields();
      } catch (error) {
        console.error('Error uploading audio:', error);
        this.uploadError = 'Failed to upload audio.';
      } finally {
        this.isUploading = false;
      }
    },
    handleImageFileChange(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        this.imageFile = target.files[0];
      }
    },
    handleAudioFileChange(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        this.audioFile = target.files[0];
        const audioUrl = URL.createObjectURL(this.audioFile);
        const audio = new Audio(audioUrl);
        audio.onloadedmetadata = () => {
          const durationInSeconds = audio.duration;
          this.audioDuration = formatTime(durationInSeconds);
        };
      }
    },
    addTag() {
      const tag = this.currentTag.trim();
      if (tag && !this.tags.includes(tag)) {
        this.tags.push(tag);
        this.currentTag = '';
      }
    },
    removeTag(index: number) {
      this.tags.splice(index, 1);
    },
    restartFields() {
      this.title = '';
      this.description = '';
      this.tags = [];
      this.currentTag = '';
      this.audioFile = null;
      this.imageFile = null;
      this.isUploading = false;
      this.uploadError = null;
      this.audioDuration = '';

      // wait 3 seconds before removing the success message
      setTimeout(() => {
        this.uploadSuccess = false;
      }, 3000);
    },
  }
};
</script>

<style scoped>
.upload-container {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--upload-background-color);
  border-radius: 8px;
  color: var(--color-text);
}

.upload-title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #0056b3;
}

.file-input-container {
  margin-bottom: 1rem;
}

.file-input {
  display: none;
}

.file-label {
  display: block;
  padding: 0.75rem 1rem;
  background-color: var(--tables-background-hover);
  color: var(--color-text);
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.file-label-selected {
  display: block;
  padding: 0.75rem 1rem;
  background-color: green;
  color: var(--color-text);
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.file-label:hover {
  background-color: #3c3c3c;
}

.text-input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: var(--tables-background-hover);
  border: none;
  border-radius: 5px;
  color: var(--color-text);
}

.fields {
  margin-bottom: 1rem;
}

.tags-input-container {
  display: flex;
  margin-bottom: 1rem;
}

.tag-input {
  flex-grow: 1;
  margin-bottom: 0;
  margin-right: 0.5rem;
}

.add-tag-button {
  padding: 0.75rem 1rem;
  background-color: var(--tables-background-hover);
  color: var(--color-text);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-tag-button:hover {
  background-color: #3c3c3c;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  background-color: var(--tag-background-color);
  color: var(--color-text);
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  font-size: 0.9rem;
}

.remove-tag-button {
  background: none;
  border: none;
  color: var(--color-text);
  margin-left: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
}

.tags-info {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #888;
}

.tag-input:disabled,
.add-tag-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #1db954;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-button:hover:not(:disabled) {
  background-color: #1ed760;
}

.upload-button:disabled {
  background-color: #1a1a1a;
  color: #5a5a5a;
  cursor: not-allowed;
}

.status-message {
  margin-top: 1rem;
  padding: 0.5rem;
  border-radius: 5px;
}

.uploading {
  background-color: #2c2c2c;
  color: #ffffff;
}

.success {
  background-color: #1db954;
  color: #ffffff;
}

.error {
  background-color: #e22134;
  color: #ffffff;
}
</style>
