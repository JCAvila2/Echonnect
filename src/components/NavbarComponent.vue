<template>
  <nav class="navbar">
    <router-link to="/">
      <div class="brand-title">
        <img src="@/assets/blue-icon.svg" alt="Logo">
        <h1>Echonnect</h1>
      </div>
    </router-link>

    <!-- Menu toggle for small screens -->
    <div class="menu-toggle" @click="toggleMenu">
      <span></span>
      <span></span>
      <span></span>
    </div>

    <!-- Navbar links -->
    <div :class="['navbar-links', { 'is-active': isMenuOpen }]">
      <ul>
        <li> <router-link @click="toggleMenu" to="/search"> {{ $t('search') }} </router-link> </li>
        <li v-if="uid"> <router-link @click="toggleMenu" to="/profile"> {{ $t('profile') }} </router-link> </li>
        <li v-if="uid"> <router-link @click="toggleMenu" to="/upload"> {{ $t('upload') }} </router-link> </li>
        <li v-if="uid"> <router-link @click="toggleMenu" to="/bookmarks"> {{ $t('bookmarks') }} </router-link> </li>
        <li v-if="!uid"> <router-link @click="toggleMenu" to="/login"> {{ $t('login') }} </router-link> </li>
        <li v-if="!uid"> <router-link @click="toggleMenu" to="/register"> {{ $t('register') }} </router-link> </li>
        <li @click="changeLanguage('es')">ES</li>
        <li @click="changeLanguage('en')">EN</li>
      </ul>
    </div>
  </nav>
</template>

<script lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';

export default {
  setup() {
    const authStore = useAuthStore();
    const uid = computed(() => authStore.user?.uid);
    const isMenuOpen = ref(false);
    const { locale } = useI18n();

    return { 
      uid, 
      isMenuOpen, 
      locale,
    };
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    changeLanguage(lang: string) {
      this.locale = lang;
    }
  }
};
</script>

<style>
:root {
  --header-height: 80px;
  /* Adjust according to the header height */
}

header {
  background-color: black;
  padding: 0px 0;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  height: var(--header-height);
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.brand-title {
  padding-left: 10px;
  display: flex;
  align-items: center;
}

.brand-title img {
  height: 40px;
  margin-right: 10px;
}

.brand-title h1 {
  color: white;
  font-size: 2.5rem;
}

.navbar-links ul {
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
  height: var(--header-height);
  align-items: center;
}

.navbar-links li {
  height: 100%;
}

.navbar-links a {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 50px;
  /* Adjust padding to control the clickable area */
  color: white;
  text-decoration: none;
  font-size: 18px;
  height: 100%;
}

/* TODO: change colors */
.navbar-links a:hover {
  color: black;
  background-color: gray;
}

/* Active link style */
.navbar-links a.router-link-active {
  color: black;
  background-color: gray;
}

/* Menu toggle (hamburger icon) for mobile */
.menu-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  margin-right: 20px;
}

.menu-toggle span {
  width: 30px;
  height: 3px;
  background-color: white;
  margin: 5px 0;
}

/* Media query for smaller screens */
@media (max-width: 768px) {
  .navbar {
    padding: 0 10px;
  }

  .navbar-links {
    display: none;
    position: absolute;
    top: var(--header-height);
    right: 0;
    background-color: black;
    width: 100%;
    flex-direction: column;
    align-items: center;
  }

  .navbar-links.is-active {
    display: flex;
  }

  .navbar-links ul {
    flex-direction: column;
    width: 100%;
  }

  .navbar-links li {
    width: 100%;
    text-align: center;
    margin: 0;
    background-color: black;
  }

  .navbar-links a {
    width: 100%;
    padding: 15px 0;
  }

  .navbar-links a.router-link-active {
    background-color: gray;
  }

  .menu-toggle {
    display: flex;
  }

  .brand-title h1 {
    font-size: 2rem;
  }
}
</style>
