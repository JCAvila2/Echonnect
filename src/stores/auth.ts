import { defineStore } from 'pinia';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  
  const auth = getAuth();
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser;
  });

  return { user };
});
