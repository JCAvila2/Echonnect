<template>
  <div class="audio-player" v-if="audio && author">
    <div class="audio-section">
      <div class="icon">
        <img :src="audio.imageUrl" :alt="audio.title" />
      </div>
      <div class="audio-info">
        <div class="audio-title">{{ audio.title }}</div>
        <AudioPlayer :audioSrc="audio.audioUrl" />
        <div class="user-info" @click="watchUserProfile(audio.uid)">
          <img :src="author.profilePicture || defaultProfilePicture" alt="User avatar" class="avatar" />
          <span>{{ author.username }}</span>
        </div>
        
        <div class="description">{{ audio.description }}</div>
        <div class="tags">
          <span v-for="tag in audio.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
    </div>

    <div class="community">
      <div class="stats">
        <h2>
          Stats
          <font-awesome-icon icon="chart-line" />
        </h2>
        <div class="stat-item">
          <span class="stat-label">Plays</span>
          <span class="stat-value">{{ audio.reproductions }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Score</span>
          <span class="stat-value">{{ audio.averageRating ? audio.averageRating.toFixed(1) + ' ⭐' : 'No ratings yet' }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Comments</span>
          <span class="stat-value">{{ totalComments }}</span>
        </div>
      </div>

      <div class="player-section">
        <div class="rating-section">
          <span class="rating-label">{{ userRating ? 'Rated:' : 'Rate this audio:' }}</span>
          <div class="star-rating">
            <span v-for="star in 5" :key="star" @click="rateAudio(star)" @mouseover="setHover(star)"
              @mouseleave="clearHover"
              :class="['star', { 'active': star <= userRating, 'hover': star <= (hoverRating || 0) }]">
              ★
            </span>
          </div>
        </div>

        <div class="comment-section">
          <input v-model="newComment" type="text" placeholder="Comment..." class="comment-input" @keyup.enter="addComment"/>
          <button @click="addComment" class="send-button">➤</button>
        </div>

        <div class="comments-list">
          <div class="comments-header">
            <h3 style="margin-bottom: 20px;">
              Comments ({{ displayedComments }}/{{ totalComments }})
              <button @click="toggleSortOrder" class="sort-button">
                <font-awesome-icon :icon="sortOrder === 'desc' ? faSortDown : faSortUp" />
              </button>
            </h3>
          </div>

          <div v-if="comments">
            <div v-for="comment in comments" :key="comment.id" class="comment">
              <img :src="comment.userProfilePicture || defaultProfilePicture" alt="User avatar" class="avatar" />
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-username" @click="watchUserProfile(comment.uid)">{{ comment.username }}</span>
                  <span class="comment-date"> {{ formatDate(comment.timestamp) }}</span>
                </div>
                <p>{{ comment.content }}</p>
                <div class="comment-actions">
                  <button @click="toggleReplyForm(comment.id)" class="reply-button">Reply</button>
                </div>
                <div v-if="replyingTo === comment.id" class="reply-form">
                  <input v-model="replyContent" type="text" placeholder="Write a reply..." class="reply-input" @keyup.enter="addReply(comment.id)" />
                  <button @click="addReply(comment.id)" class="send-button">➤</button>
                </div>
                <div v-if="comment.replies && comment.replies.length > 0" class="replies">
                  <div v-for="reply in comment.replies" :key="reply.id" class="reply">
                    <img :src="reply.userProfilePicture || defaultProfilePicture" alt="User avatar" class="avatar small" />
                    <div class="reply-content">
                      <div class="comment-header">
                        <span class="comment-username" @click="watchUserProfile(reply.uid)">{{ reply.username }}</span>
                        <span class="comment-date"> {{ formatDate(reply.timestamp) }}</span>
                      </div>
                      <p>{{ reply.content }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button v-if="showMoreButton" @click="loadMoreComments" class="more-comments">
              More comments
            </button>
          </div>
          <div v-else>
            <p>Loading comments...</p>
          </div>
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
import { doc, collection, getDoc, increment, updateDoc, getDocs, limit, orderBy, query, where, addDoc, getCountFromServer, setDoc, OrderByDirection } from 'firebase/firestore';
import { defineComponent } from 'vue';
import { formatDate } from '@/utils/formatDate';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import AudioPlayer from '@/components/AudioPlayer.vue';
// @ts-ignore
import defaultProfilePicture from '@/assets/default-profile.png';
import { AudioItem } from '@/types/views/searchView';
import { User } from '@/types/views/profileView';
import { Comment } from '@/types/views/audioView';

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  components: {
    FontAwesomeIcon,
    AudioPlayer,
  },
  setup() {
    return { 
      faSortUp, 
      faSortDown, 
      defaultProfilePicture
    };
  },
  mounted() {
    this.fetchAudio();
  },
  data() {
    const router = useRouter();
    const { user } = useAuthStore();
    return {
      formatDate,
      router,
      user,
      audio: null as AudioItem | null,
      author: null as User | null,
      comments: [] as Comment[] | null,
      totalComments: 0 as number,
      displayedComments: 0 as number,
      currentLimit: 5 as number, // Initial limit of comments to load
      showMoreButton: false as boolean,
      newComment: '' as string,
      replyingTo: null as string | null | undefined,
      replyContent: '' as string,
      sortOrder: 'desc' as OrderByDirection, // Default order by newest first
      userRating: 0 as number,
      hoverRating: 0 as number | null, // null
    };
  },
  methods: {
    async fetchAudio() {
      const audioDoc = doc(collection(db, 'audios'), this.id);
      const docSnapshot = await getDoc(audioDoc);
      if (docSnapshot.exists()) {
        this.audio = { id: docSnapshot.id, ...docSnapshot.data() } as AudioItem;
        document.title = this.audio?.title ?? 'Audio';

        await this.fetchAuthor(this.audio?.uid);
        await this.fetchTotalComments();
        await this.loadComments();
        await this.fetchUserRating();

        const incrementValue = increment(1);
        await updateDoc(audioDoc, { reproductions: incrementValue });
        this.audio.reproductions++;
      } else {
        console.log('Audio not found');
      }
    },
    async fetchAuthor(uid: string) {
      const userDoc = doc(collection(db, 'users'), uid);
      const docSnapshot = await getDoc(userDoc);
      if (docSnapshot.exists()) {
        this.author = docSnapshot.data() as User;
      }
    },
    async fetchTotalComments() {
      const commentsRef = collection(db, 'comments');
      const q = query(commentsRef, where('audioId', '==', this.id));
      const snapshot = await getCountFromServer(q);
      this.totalComments = snapshot.data().count;
    },
    async loadComments() {
      const newComments = await this.fetchComments(this.id, null, this.currentLimit);

      for (let comment of newComments) {
        comment.replies = await this.fetchComments(this.id, comment.id);
      }

      this.comments = newComments;
      this.displayedComments = this.comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0);
      this.showMoreButton = this.displayedComments < this.totalComments;
    },
    async fetchComments(audioId: string, parentId: string | null = null, limitCount = 5): Promise<Comment[]> {
      const commentsRef = collection(db, 'comments');
      const q = query(
        commentsRef,
        where('audioId', '==', audioId),
        where('parentId', '==', parentId),
        orderBy('timestamp', parentId ? 'asc' : this.sortOrder),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Comment));
    },
    async loadMoreComments() {
      this.currentLimit += 5; // Load X more comments
      await this.loadComments();
    },
    async addComment() {
      if (!this.user) {
        alert('Please log in comment.'); // TODO: redirect to login page
        return;
      }
      if (!this.newComment.trim()) return;

      const userDoc = doc(collection(db, 'users'), this.user?.uid);
      const docSnapshot = await getDoc(userDoc);
      if (!docSnapshot.exists()) {
        console.log('User not found');
        return;
      }

      const commentData = {
        parentId: null,
        audioId: this.id,
        content: this.newComment,
        timestamp: new Date(),
        userProfilePicture: docSnapshot.data().profilePicture,
        username: docSnapshot.data().username,
        uid: this.user?.uid,
      };

      await addDoc(collection(db, 'comments'), commentData);
      this.newComment = '';
      this.totalComments++;
      this.loadComments();
    },
    async addReply(parentId: string | undefined) {
      if (!this.user) {
        alert('Please log in comment.'); // TODO: redirect to login page
        return;
      }
      if (!this.replyContent.trim()) return;

      const userDoc = doc(collection(db, 'users'), this.user?.uid);
      const docSnapshot = await getDoc(userDoc);
      if (!docSnapshot.exists()) {
        console.log('User not found');
        return;
      }

      const replyData = {
        parentId: parentId,
        audioId: this.id,
        content: this.replyContent,
        timestamp: new Date(),
        userProfilePicture: docSnapshot.data().profilePicture,
        username: docSnapshot.data().username,
        uid: this.user?.uid,
      };

      await addDoc(collection(db, 'comments'), replyData);
      this.replyingTo = null;
      this.replyContent = '';
      this.totalComments++;
      this.loadComments();
    },
    toggleReplyForm(commentId: string | undefined) {
      this.replyingTo = this.replyingTo === commentId ? null : commentId;
    },
    toggleSortOrder() {
      this.comments = null;
      this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
      this.loadComments();
    },
    watchUserProfile(uid: string) {
      this.router.push(`/profile/${uid}`);
    },
    async fetchUserRating() {
      if (this.user) {
        const ratingDoc = doc(collection(db, 'ratings'), `${this.id}_${this.user.uid}`);
        const ratingSnapshot = await getDoc(ratingDoc);
        if (ratingSnapshot.exists()) {
          this.userRating = ratingSnapshot.data().rating;
        }
      }
    },
    async rateAudio(rating: number) {
      if (!this.user) {
        alert('Please log in to rate this audio.'); // TODO: redirect to login page
        return;
      }
      this.userRating = rating;
      const ratingRef = doc(collection(db, 'ratings'), `${this.id}_${this.user.uid}`);
      const ratingSnapshot = await getDoc(ratingRef);

      const audioRef = doc(collection(db, 'audios'), this.id);
      const audioSnapshot = await getDoc(audioRef);
      const audioData = audioSnapshot.data();

      if (ratingSnapshot.exists()) {
        const oldRating = ratingSnapshot.data().rating;
        await setDoc(ratingRef, { rating, timestamp: new Date() }, { merge: true });
        await updateDoc(audioRef, {
          sumRatings: increment(rating - oldRating),
          averageRating: (audioData?.sumRatings - oldRating + rating) / audioData?.totalRatings
        });

        if (this.audio) {
          this.audio.averageRating = (audioData?.sumRatings - oldRating + rating) / audioData?.totalRatings;
        }
      } else {
        await setDoc(ratingRef, {
          audioId: this.id,
          userId: this.user.uid,
          rating,
          timestamp: new Date()
        });
        await updateDoc(audioRef, {
          totalRatings: increment(1),
          sumRatings: increment(rating),
          averageRating: (audioData?.sumRatings + rating) / (audioData?.totalRatings + 1)
        });

        if (this.audio && audioData) {
          this.audio.averageRating = (audioData.sumRatings + rating) / (audioData.totalRatings + 1);
        }
      }
      //this.userRating = rating;
    },
    setHover(star: number) {
      this.hoverRating = star;
    },
    clearHover() {
      this.hoverRating = null;
    }
  }
});
</script>

<style scoped>
.audio-player {
  color: white;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.audio-section {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
}

.audio-info {
  width: 100%;
}
.icon {
  margin-right: 20px;
}

.icon img {
  width: 300px;
  height: 300px;
  object-fit: cover;
}

.audio-title {
  font-weight: bold;
  font-size: 3em;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  margin-top: 40px;
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

.community {
  display: flex;
  border-top: 1px solid #3a4a5a;
  padding-top: 20px;
}

.stats {
  width: 300px;
  margin-right: 20px;
  border-right: 1px solid #3a4a5a;
  padding-right: 20px;
}
.stats h2 {
  margin-bottom: 20px;
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

.sort-button {
  background: none;
  border: none;
  color: #4a90e2;
  cursor: pointer;
  font-size: 0.9em;
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

.more-comments:hover {
  background-color: blue;
}

.comment-actions {
  margin-top: 5px;
}

.reply-button {
  background: none;
  border: none;
  color: #4a90e2;
  padding: 5px;
  cursor: pointer;
  font-size: 0.9em;
}

.reply-button:hover {
  background-color: rgb(0, 102, 255);
  border-radius: 20px;
}

.reply-form {
  margin-top: 10px;
  display: flex;
}

.reply-input {
  flex-grow: 1;
  padding: 5px;
  border: 1px solid #3a4a5a;
  border-radius: 3px;
  background-color: #2a3a4a;
  color: white;
}

.replies {
  margin-left: 20px;
  margin-top: 10px;
}

.reply {
  display: flex;
  margin-bottom: 10px;
}

.reply-content {
  margin-left: 10px;
}

.avatar.small {
  width: 30px;
  height: 30px;
}

.rating-section {
  margin-top: 0px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.rating-label {
  display: flex;
  align-items: center;
  margin-top: 3px;
}

.star-rating {
  display: inline-block;
  margin-left: 10px;
}

.star {
  font-size: 24px;
  color: #ccc;
  cursor: pointer;
}

.star.active {
  color: #ffd700;
}

.star.hover {
  color: #0056b3;
}


@media (max-width: 768px) {
  .audio-section {
    flex-direction: column;
    align-items: center;

  }

  .icon {
    margin-right: 0;
    margin-bottom: 20px;
    text-align: center;
  }

  .icon img {
    max-width: 100%;
  }

  .community {
    flex-direction: column;
  }

  .stats {
    width: 100%;
    margin-right: 0;
    margin-bottom: 20px;
    border-right: none;
  }

  .audio-section > * {
    padding-bottom: 15px;
    margin-bottom: 15px;
  }

  .audio-section > *:last-child {
    border-bottom: none;
  }
}


</style>
