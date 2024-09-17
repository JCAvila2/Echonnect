<template>
  <div>
    <h1>TODO: Profile Component</h1>

    <h1>Lista de Usuarios</h1>
    <ul>
      <li v-for="user in users" :key="user.id">{{ user.title }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { collection, getDocs, QuerySnapshot, DocumentData, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

export default defineComponent({
  setup() {
    const users = ref<DocumentData[]>([]);

    // Fetch users from Firestore
    const fetchUsers = async () => {
      const q = query(collection(db, 'audios'), orderBy('title', 'asc')); // TODO: Change query to users collection
      const querySnapshot: QuerySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        users.value.push({ id: doc.id, ...doc.data() });
      });
    };

    onMounted(() => {
      fetchUsers();
    });

    return { users };
  },
});
</script>
