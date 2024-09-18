<template>
  <div>
    <h1>TODO: Profile Component</h1>
  </div>

  <button @click="logout">Logout</button>

</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { collection, getDocs, QuerySnapshot, DocumentData, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';

export default defineComponent({
  setup() {
    const auth = getAuth();
    const router = useRouter();
    const user = ref(null);
    const users = ref<DocumentData[]>([]);

    // Fetch users from Firestore
    const fetchUsers = async () => {
      const q = query(collection(db, 'audios'), orderBy('title', 'asc')); // TODO: Change query to users collection
      const querySnapshot: QuerySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        users.value.push({ id: doc.id, ...doc.data() });
      });
    };

    const logout = () => {
      signOut(auth)
        .then(() => {
          router.push('/login');
          console.log('User signed out successfully');
        })
        .catch(error => {
          console.log('Error signing out: ', error);
        });
    };

    onMounted(() => {
      fetchUsers();
    });

    return { users, user, logout };
  },
});
</script>
