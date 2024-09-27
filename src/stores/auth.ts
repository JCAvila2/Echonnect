import { defineStore } from 'pinia';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  
  const auth = getAuth();
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser;
  });

  return { user };
});
