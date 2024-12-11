<template>
  <div class="audio-player" v-if="audio && author">
    <div class="audio-section">
      <div class="icon">
        <img :src="audio.imageUrl" :alt="audio.title" />
      </div>
      <div class="audio-info">
        <div class="audio-title">
          <div class="audio-title-text">{{ audio.title }}</div>

          <button @click="toggleBookmark" class="bookmark-btn">
            <font-awesome-icon icon="fa-solid fa-bookmark" v-if="isBookmarked"/>
            <font-awesome-icon icon="fa-regular fa-bookmark" v-else/>
          </button>
        </div>
        <AudioPlayer :audioSrc="audio.audioUrl" :audio="audio" />
        <div class="user-info" @click="watchUserProfile(audio.uid)">
          <img :src="author.profilePicture || defaultProfilePicture" alt="User avatar" class="avatar" />
          <span class="username">{{ author.username }}</span>
        </div>

        <div class="description"> 
          <span v-if="!isExpanded">{{ shortenedDescription }}</span>
          <span v-if="isExpanded">{{ audio.description }}</span>
          <button v-if="audio && audio.description && audio.description.length > shortDescriptionLength" @click="toggleDescription" style="padding-left: 5px;">
            <strong>{{ isExpanded ? $t('seeLess') : $t('seeMore') }}</strong>
          </button>
        </div>
        <p class="audio-uploadedAt"><strong>{{ $t('uploadedOn') }}:</strong> {{ formatDate(audio.createdAt) }}</p>
        <div class="tags">
          <span v-for="tag in audio.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
    </div>

    <div class="community">
      <div class="stats">
        <h2>
          {{ $t('stats') }}
          <font-awesome-icon icon="chart-line" />
        </h2>
        <div class="stat-item">
          <span class="stat-label">{{ $t('plays') }}</span>
          <span class="stat-value">{{ audio.reproductions }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ $t('bookmarks') }}</span>
          <span class="stat-value">{{ totalBookmarks }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ $t('rating') }}</span>
          <span class="stat-value">{{ audio.averageRating ? audio.averageRating.toFixed(1) + ' ⭐' : $t('noRatingYet') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ $t('comments') }}</span>
          <span class="stat-value">{{ totalComments }}</span>
        </div>
      </div>

      <div class="player-section">
        <div class="rating-section">
          <span class="rating-label">{{ userRating ? ($t('rated') + ':') : ($t('rateThisAudio')+':') }}</span>
          <div class="star-rating">
            <span v-for="star in 5" :key="star" @click="rateAudio(star)" @mouseover="setRatingHover(star)"
              @mouseleave="clearRatingHover"
              :class="['star', { 'active': star <= userRating, 'hover': star <= (hoverRating || 0) }]">
              ★
            </span>
          </div>
        </div>

        <div class="comment-section">
          <input v-model="newComment" type="text" :placeholder="$t('comment') + '...'" class="comment-input" @keyup.enter="addComment"/>
          <button @click="addComment" class="send-button">➤</button>
        </div>

        <div class="comments-list">
          <div class="comments-header">
            <h3 style="margin-bottom: 20px;">
              {{ $t('comments') }} ({{ displayedComments }}/{{ totalComments }})
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
                  <button @click="toggleReplyForm(comment.id)" class="reply-button">{{ $t('reply') }}</button>
                  <button 
                    v-if="comment.replyCount > 0" 
                    @click="loadReplies(comment)" 
                    class="show-replies-button"
                  >
                    {{ comment.showReplies ? $t('hideReplies') : $t('showReplies') }} ({{ comment.replyCount }})
                  </button>
                </div>
                <div v-if="replyingTo === comment.id" class="reply-form">
                  <input v-model="replyContent" type="text" :placeholder="$t('reply') + '...'" class="reply-input" @keyup.enter="addReply(comment.id)" />
                  <button @click="addReply(comment.id)" class="send-button">➤</button>
                </div>
                <div v-if="comment.replies && comment.replies.length > 0 && comment.showReplies" class="replies">
                  <div v-for="reply in comment.replies" :key="reply.id" class="reply">
                    <img :src="reply.userProfilePicture || defaultProfilePicture" alt="User avatar" class="avatar" />
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
            <button v-if="showMoreMainCommentsButton" @click="loadMoreComments" class="more-comments">
              {{ $t('moreComments') }}
            </button>
          </div>
          <div v-else>
            <p>{{ $t('loadingComments') }} <v-progress-circular indeterminate></v-progress-circular></p>
          </div>
        </div>

      </div>
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

  <div class="tour-button" @click="showTour"> 
    ?
  </div>

</template>

<script lang="ts">
import { db } from '@/firebase';
import { doc, collection, getDoc, increment, updateDoc, getDocs, limit, orderBy, query, where, addDoc, getCountFromServer, setDoc, deleteDoc } from 'firebase/firestore';
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
import { AudioViewState, Comment } from '@/types/views/audioView';
import { useI18n } from 'vue-i18n';
import { useAudioTour } from '@/components/tour/AudioTour';

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
    const { t, locale } = useI18n();
    const { startTour, destroyTour } = useAudioTour();

    return { 
      faSortUp, 
      faSortDown, 
      defaultProfilePicture,
      formatDate,
      locale, 
      t,
      startTour,
      destroyTour,
    };
  },
  mounted() {
    this.fetchAudio();
  },
  data() : AudioViewState {
    const router = useRouter();
    const { user } = useAuthStore();
    return {
      router,
      user,
      audio: null,
      author: null,
      comments: [],
      totalComments: 0,
      totalBookmarks: 0,
      displayedComments: 0,
      displayedMainComments: 0,
      currentLimit: 3, // Initial limit of comments to load
      showMoreMainCommentsButton: false,
      newComment: '',
      replyingTo: null,
      replyContent: '',
      sortOrder: 'desc', // Default order by newest first
      userRating: 0,
      hoverRating: 0,
      isExpanded: false,
      shortDescriptionLength: 100,
      isBookmarked: false,
    };
  },
  computed: {
    shortenedDescription(): string {
      return this.audio?.description && this.audio.description.length > this.shortDescriptionLength
        ? this.audio.description.substring(0, this.shortDescriptionLength) + '...'
        : this.audio?.description ?? '';
    },
  },
  methods: {
    async fetchAudio() {
      const audioDoc = doc(collection(db, 'audios'), this.id);
      const docSnapshot = await getDoc(audioDoc);
      if (docSnapshot.exists()) {
        this.audio = { id: docSnapshot.id, ...docSnapshot.data() } as AudioItem;
        document.title = this.audio?.title ?? 'Audio';

        // Call other methods that depend on audio data
        await this.fetchTotalComments();
        await this.loadComments();
        await this.fetchUserRating();
        await this.fetchBookmarkStatus();
        await this.fetchBookmarkCount();

        const incrementValue = increment(1);
        await updateDoc(audioDoc, { reproductions: incrementValue });
        this.audio.reproductions++;

        const authorRef = this.audio?.authorRef;
        if (authorRef) {
          const authorDoc = await getDoc(authorRef);
          this.author = authorDoc.data() as User;
        }

      } else {
        console.log('Audio not found');
        this.$router.push('/not-found');
      }
    },
    toggleDescription() {
      this.isExpanded = !this.isExpanded;
    },
    async fetchTotalComments() {
      const commentsRef = collection(db, 'comments');
      const q = query(commentsRef, where('audioId', '==', this.id));
      const snapshot = await getCountFromServer(q);
      this.totalComments = snapshot.data().count;

      // Get the main comments count (not replies)
      const mainCommentsQuery = query(
        commentsRef,
        where('audioId', '==', this.id),
        where('parentId', '==', null)
      );
      const mainCommentsSnapshot = await getCountFromServer(mainCommentsQuery);
      this.displayedMainComments = mainCommentsSnapshot.data().count;
    },
    async fetchComments(audioId: string, parentId: string | null = null, limitCount = 5): Promise<Comment[]> {
      const commentsRef = collection(db, 'comments');
      
      // Get main comments (not replies)
      if (!parentId) {
        const mainCommentsQuery = query(
          commentsRef,
          where('audioId', '==', audioId),
          where('parentId', '==', null),
          orderBy('timestamp', this.sortOrder),
          limit(limitCount)
        );

        const querySnapshot = await getDocs(mainCommentsQuery);
        const comments = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            // Get reply count for each comment
            const repliesQuery = query(
              commentsRef,
              where('audioId', '==', audioId),
              where('parentId', '==', doc.id)
            );
            const replyCount = (await getCountFromServer(repliesQuery)).data().count;

            return {
              id: doc.id,
              ...doc.data() as Comment,
              replyCount,
              showReplies: false,
              replies: []
            } as Comment;
          })
        );

        return comments;
      }

      // If parentId is provided, get replies for that comment
      const repliesQuery = query(
        commentsRef,
        where('audioId', '==', audioId),
        where('parentId', '==', parentId),
        orderBy('timestamp', 'asc')
      );

      const querySnapshot = await getDocs(repliesQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        audioId: doc.data().audioId,
        content: doc.data().content,
        timestamp: doc.data().timestamp,
        uid: doc.data().uid,
        username: doc.data().username,
        userProfilePicture: doc.data().userProfilePicture,
        parentId: doc.data().parentId,
        replyCount: doc.data().replyCount,
        showReplies: doc.data().showReplies,
        replies: doc.data().replies
      }));
    },
    async loadComments() {
      const newComments = await this.fetchComments(this.id, null, this.currentLimit);
      this.comments = newComments;
      this.displayedComments = this.comments.length;
      this.showMoreMainCommentsButton = this.displayedComments < this.displayedMainComments;
    },
    async loadReplies(comment: Comment) {
      if (!comment.showReplies) {
        // Only fetch replies if we haven't already
        if (!comment.replies || comment.replies.length === 0) {
          comment.replies = await this.fetchComments(this.id, comment.id);
        }
        comment.showReplies = true;
        this.displayedComments += comment?.replies?.length;
      } else {
        comment.showReplies = false;
        if (comment.replies) {
          this.displayedComments -= comment.replies?.length;
        }
      }
    },
    async addReply(parentId: string | undefined) {
      if (!this.user) {
        alert('Please log in to comment.'); // TODO: redirect to login page
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

      // Update the reply count and replies for the parent comment
      const parentComment = this.comments?.find(c => c.id === parentId);
      if (parentComment) {
        parentComment.replyCount++;
        if (parentComment.showReplies) {
          parentComment.replies = await this.fetchComments(this.id, parentId);
        }
      }
    },
    async loadMoreComments() {
      this.currentLimit += 3; // Load X more comments
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
    },
    setRatingHover(star: number) {
      this.hoverRating = star;
    },
    clearRatingHover() {
      this.hoverRating = null;
    },

    async fetchBookmarkCount() {
      const bookmarksRef = collection(db, 'bookmarks');
      const q = query(bookmarksRef, where('audioId', '==', this.id));
      const snapshot = await getCountFromServer(q);
      this.totalBookmarks = snapshot.data().count;
    },
    async fetchBookmarkStatus() {
      if (!this.user) return;
      const bookmarkId = `${this.id}_${this.user.uid}`;
      const bookmarkRef = doc(db, 'bookmarks', bookmarkId);
      const bookmarkDoc = await getDoc(bookmarkRef);
      this.isBookmarked = bookmarkDoc.exists();
    },
    async toggleBookmark() {
      if (!this.user) {
        alert('Please log in to bookmark this audio.'); // TODO: redirect to login page
        return;
      }

      const bookmarkId = `${this.id}_${this.user.uid}`;
      const bookmarkRef = doc(db, 'bookmarks', bookmarkId);
      if (this.isBookmarked) {
        this.isBookmarked = false;
        this.totalBookmarks--;
        await deleteDoc(bookmarkRef);
      } else {
        this.isBookmarked = true;
        this.totalBookmarks++;
        await setDoc(bookmarkRef, {
          userId: this.user.uid,
          audioId: this.id,
          timestamp: new Date(),
          authorId: this.audio?.uid, // For querying bookmarks by author
        });
      }
    },
    showTour() {
      this.startTour();
    }
  }
});
</script>

<style scoped>
.audio-player {
  color: var(--color-text);
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
  object-fit: contain;
  vertical-align: middle; 
  border-radius: 10%;
}

.audio-title {
  font-weight: bold;
  font-size: 3em;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  max-width: 100%;
}

.audio-title-text {
  flex: 1;
  min-width: 0;
  word-wrap: break-word;
}

.bookmark-btn {
  padding-left: 20px;
  cursor: pointer;
}

.bookmark-btn:hover {
  color: #0056b3;
}

.user-info {
  display: flex;
  align-items: center;
  margin-top: 40px;
  margin-bottom: 10px;
  width: fit-content;
}

.user-info:hover {
  cursor: pointer;
  color: #007bff;
}

.username {
  margin-left: 10px; 
  font-weight: bolder;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 0px;
  object-fit: cover;
}

.audio-uploadedAt {
  color: #999;
  margin-bottom: 10px;
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
  background-color: var(--tag-background-color);
  padding: 5px 10px;
  border-radius: 15px;
  margin-right: 5px;
  margin-bottom: 5px;
}

.community {
  display: flex;
  border-top: 1px solid var(--tag-background-color);
  padding-top: 20px;
}

.stats {
  width: 300px;
  margin-right: 20px;
  border-right: 1px solid var(--tag-background-color);
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
  background-color: var(--tag-background-color);
  color: var(--color-text);
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
  padding: 20px;
  border-radius: 5px;
}

.comment {
  display: flex;
  margin-bottom: 15px;
}

.comment-header {
  display: flex;
  justify-content: start;
  margin-bottom: 5px;
}

.comment-username {
  font-weight: bold;
}

.comment-username:hover {
  cursor: pointer;
  color: #007bff;
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
  border-radius: 3px;
  background-color: var(--tag-background-color);
  color: white;
}

.replies {
  margin-top: 10px;
}

.reply {
  display: flex;
  margin-bottom: 10px;
}

.show-replies-button {
  background: none;
  border: none;
  color: #4a90e2;
  padding: 5px;
  cursor: pointer;
  font-size: 0.9em;
  margin-left: 10px;
}

.show-replies-button:hover {
  background-color: rgb(0, 102, 255);
  border-radius: 20px;
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

/* Start tour button */
.tour-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  z-index: 1000;
  cursor: pointer;
}

.tour-button:hover {
  background-color: #0056b3;
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
    padding-right: 0px;
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
