<template>
  <div class="audio-player" v-if="audio && author">
    <div class="header">
      <div class="icon">
        <img :src="audio.imageUrl" :alt="audio.title"/>
      </div>
      <div class="title-section">
        <h1>{{ audio.title }}</h1>
        <div class="user-info" @click="watchUserProfile(audio.uid)">
          <img :src="author.profilePicture" alt="User avatar" class="avatar" />
          <span>{{ author.username }}</span>
        </div>
        <p class="description">{{ audio.description }}</p>
        <div class="tags">
          <span v-for="tag in audio.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="stats">
        <h2>Stats</h2>
        <div class="stat-item">
          <span class="stat-label">Plays</span>
          <span class="stat-value">{{ audio.reproductions }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Score</span>
          <span class="stat-value">{{ calculateScore(audio.ratings) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Comments</span>
          <span class="stat-value">{{ totalComments }}</span>
        </div>
      </div>

      <div class="player-section">
        <audio controls class="audio-player">
          <source :src="audio.audioUrl" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>

        <div class="comment-section">
          <input v-model="newComment" type="text" placeholder="Comment..." class="comment-input" />
          <button @click="addComment" class="send-button">➤</button>
        </div>

        <div class="comments-list">
          <h3 style="margin-bottom: 20px;">Comments ({{ totalComments }})</h3>
          <div v-for="comment in comments" :key="comment.id" class="comment">
            <img :src="comment.userProfilePicture" alt="User avatar" class="avatar" />
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-username" @click="watchUserProfile(comment.uid)">{{ comment.username }}</span>
                <span class="comment-date"> {{ formatDate(comment.timestamp) }}</span>
              </div>
              <p>{{ comment.content }}</p>
            </div>
          </div>
          <button v-if="showMoreButton" @click="loadMoreComments" class="more-comments">
            More comments
          </button>
        </div>

      </div>
    </div>
  </div>
  <div v-else>
    <p>Loading audio...</p>
  </div>
</template>

<script lang="ts">
import { db } from '@/firebase';
import { doc, collection, getDoc, increment, updateDoc, getDocs, limit, orderBy, query, where, addDoc } from 'firebase/firestore';
import { defineComponent } from 'vue';
import { formatDate } from '@/utils/formatDate';
import { calculateScore } from '@/utils/calculateScore';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  mounted() {
    this.fetchAudio();
  },
  data() {
    const router = useRouter();
    const { user } = useAuthStore();
    return {
      audio: null,
      author: null,
      comments: [],
      totalComments: 0,
      currentLimit: 5,
      showMoreButton: false,
      formatDate,
      calculateScore,
      router,
      newComment: '',
      user,
    };
  },
  methods: {
    async fetchAudio() {
      const audioDoc = doc(collection(db, 'audios'), this.id);
      const docSnapshot = await getDoc(audioDoc);
      if (docSnapshot.exists()) {
        this.audio = { id: docSnapshot.id, ...docSnapshot.data() };
        document.title = this.audio?.title ?? 'Audio';

        // Fetch the author of the audio
        await this.fetchAuthor(this.audio.uid);

        // Fetch the comments of the audio
        await this.loadComments();

        // Increment the audio reproductions count in the database
        const incrementValue = increment(1);
        await updateDoc(audioDoc, { reproductions: incrementValue });
      } else {
        // TODO: Redirect to 404 page
        console.log('Audio not found');
      }
    },
    async fetchAuthor(uid: string) {
      const userDoc = doc(collection(db, 'users'), uid);
      const docSnapshot = await getDoc(userDoc);
      if (docSnapshot.exists()) {
        this.author = docSnapshot.data();
      }
    },
    async loadComments() {
      // Fetch initial comments with the current limit
      const newComments = await this.fetchComments(this.id, null, this.currentLimit);
      this.comments = newComments;
      this.totalComments = this.comments.length;

      // Check if we need to show the "More comments" button
      this.showMoreButton = newComments.length === this.currentLimit;
    },
    async fetchComments(audioId: string, parentId = null, limitCount = 5) {
      const commentsRef = collection(db, 'comments');
      const q = query(
        commentsRef,
        where('audioId', '==', audioId),
        where('parentId', '==', parentId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
    async loadMoreComments() {
      this.currentLimit += 5;      
      const newComments = await this.fetchComments(this.id, null, this.currentLimit);
      this.comments = newComments;
      this.totalComments = this.comments.length;

      // Update the visibility of "More comments" button
      this.showMoreButton = newComments.length === this.currentLimit;
    },


    async addComment() {
      if (!this.newComment.trim()) return;

      // Fetch the user information
      const userDoc = doc(collection(db, 'users'), this.user?.uid);
      const docSnapshot = await getDoc(userDoc);
      if (!docSnapshot.exists()) {
        console.log('User not found');
        return;
      }

      // Create the comment data
      const commentData = {
        parentId: null,
        audioId: this.id,
        content: this.newComment,
        timestamp: new Date(),
        userProfilePicture: docSnapshot.data().profilePicture,
        username: docSnapshot.data().username,
        uid: this.user?.uid,
      };
      
      // Add the comment to the database
      await addDoc(collection(db, 'comments'), commentData);
      this.loadComments();
    },

    watchUserProfile(uid: string) {
      this.router.push(`/profile/${uid}`);
    }
  }
});
</script>

<style scoped>
.audio-player {
  background-color: #1e2a35;
  color: white;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
}

.icon {
  margin-right: 20px;
}
.icon img {
	max-width: 200px;
}

.title-section h1 {
  margin: 0 0 10px 0;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.user-info:hover {
  cursor: pointer;
  color: green;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}

.description {
  margin-bottom: 10px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
}

.tag {
  background-color: #3a4a5a;
  padding: 5px 10px;
  border-radius: 15px;
  margin-right: 5px;
  margin-bottom: 5px;
}

.content {
  display: flex;
}

.stats {
  width: 200px;
  margin-right: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.player-section {
  flex-grow: 1;
}

.audio-player {
  width: 100%;
  margin-bottom: 20px;
}

.comment-section {
  display: flex;
  margin-bottom: 20px;
}

.comment-input {
  flex-grow: 1;
  padding: 10px;
  border: none;
  border-radius: 5px 0 0 5px;
  background-color: #3a4a5a;
  color: white;
}

.send-button {
  padding: 10px 15px;
  border: none;
  border-radius: 0 5px 5px 0;
  background-color: #4a90e2;
  color: white;
  cursor: pointer;
}

.comments-list {
  background-color: #2a3a4a;
  padding: 20px;
  border-radius: 5px;
}

.comment {
  display: flex;
  margin-bottom: 15px;
}
.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}
.comment-username {
  font-weight: bold;
}
.comment-username:hover {
  cursor: pointer;
  color: green;
}
.comment-date {
  color: #999;
  font-size: 0.8em;
  margin-left: 5px;
  display: flex;
  align-items: center;
}
.comment-content {
  margin-left: 10px;
}


.more-comments {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}
</style>
