<script lang="ts">
import { defineComponent } from 'vue';
import Navbar from '@/components/NavbarComponent.vue';
import { RouterView } from 'vue-router';
import { useThemeStore } from '@/stores/theme';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { doc, collection, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export default defineComponent({
  components: {
    Navbar,
    RouterView,
  },
  setup() {
    document.title = 'Echonnect';
    const authStore = useAuthStore();
    const themeStore = useThemeStore();
    const { t, locale } = useI18n();
    
    return {
      themeStore,
      authStore,
      t, 
      locale,
    };
  },
  computed: {
    uid() {
      return this.authStore.user?.uid;
    }, 
    language: {
      get() {
        return this.locale;
      },
      set(lang: string) {
        this.$i18n.locale = lang;
      },
    },
  },
  watch: {
    uid: {
      async handler(newUid) {
        if (newUid) {
          const userDoc = doc(collection(db, 'users'), newUid);
          const docSnapshot = await getDoc(userDoc);
          if (docSnapshot.exists()) {
            const userTheme = docSnapshot.data().theme;
            const userLang = docSnapshot.data().language;
            this.themeStore.setTheme(userTheme ?? 'dark');
            this.language = userLang ?? 'en';
          } else {
            this.themeStore.setTheme(this.themeStore.theme ?? 'dark');
          }
        } else {
          this.themeStore.setTheme(this.themeStore.theme ?? 'dark');
          this.language = this.language ?? 'en';
        }
      },
      immediate: true,
    },
    language: {
      async handler(newLang) {
        this.$i18n.locale = newLang;
        if (this.uid) {
          const userDoc = doc(collection(db, 'users'), this.uid);
          await updateDoc(userDoc, {
            language: newLang,
          });
        }
      },
      immediate: true,
    },
    themeStore: {
      deep: true,
      handler() {
        document.body.className = this.themeStore.theme;
        if (this.uid) {
          const userDoc = doc(collection(db, 'users'), this.uid);
          updateDoc(userDoc, {
            theme: this.themeStore.theme,
          });
        }
      },
    },
  },
});
</script>

<template>
  <header>
    <Navbar />
  </header>
  <RouterView />
</template>

<style>
@import "/src/assets/theme.css";

:root {
  --navbar-height: 80px;
  /* add around +10px */
}

html, body {
  height: 100%;
  overflow: hidden;
}

#app {
  margin: 0 0;
  width: 100%;
  height: calc(100vh - calc(var(--navbar-height) + 10px));
  /* Margin to the top of the page content to avoid overlapping */
  overflow: auto;
}

body {
  background-color: var(--color-background);
  margin-top: var(--header-height);
  color: var(--color-text);
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  text-rendering: optimizeLegibility;
}

a {
  text-decoration: none;
}
</style>
