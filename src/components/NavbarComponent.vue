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
        <li class="settings-dropdown">
          <div @click="toggleSettingsDropdown" class="settings-selector">
            <font-awesome-icon icon="fa-solid fa-gear" />
          </div>
          <ul v-if="isSettingsDropdownOpen" class="settings-options">
            <li>
              <div class="switch-container">
                {{ $t('theme') }}
                <div class="theme-switch">
                  <label class="switch">
                    <input type="checkbox" v-model="isDarkMode" @change="themeStore.toggleTheme">
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </li>
            <li>
              <div @click="toggleLanguageDropdown" class="language-selector">
                <img :src="currentLanguageFlag" :alt="locale" class="language-flag">
                {{ $t('language') }}
                <span class="dropdown-arrow">▼</span>
              </div>
              <ul v-if="isLanguageDropdownOpen" class="language-options">
                <li 
                  v-for="(lang, index) in availableLanguages" 
                  :key="index"
                  @click="changeLanguage(lang.code)"
                >
                  <img :src="lang.flag" :alt="lang.code" class="language-flag">
                  <span>{{ lang.name }}</span>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';
import enFlag from '@/assets/flags/en.png';
import esFlag from '@/assets/flags/es.png';
import { useThemeStore } from '@/stores/theme';

export default {
  setup() {
    const authStore = useAuthStore();
    const uid = computed(() => authStore.user?.uid);
    const isMenuOpen = ref(false);
    const { locale } = useI18n();
    const themeStore = useThemeStore();
    const isSettingsDropdownOpen = ref(false);
    const isLanguageDropdownOpen = ref(false);
    const availableLanguages = [
      { code: 'en', name: 'English', flag: enFlag },
      { code: 'es', name: 'Español', flag: esFlag },
    ];

    const currentLanguageFlag = computed(() => {
      const currentLang = availableLanguages.find(lang => lang.code === locale.value);
      return currentLang ? currentLang.flag : enFlag;
    });

    // Listener to close dropdowns when clicking outside the navbar
    const handleClickOutsideNavbar = (event: MouseEvent) => {
      const dropdown = document.querySelector('.navbar-links');
      const menuToggle = document.querySelector('.menu-toggle');
      if (dropdown && !dropdown.contains(event.target as Node) && !menuToggle?.contains(event.target as Node)) {
        isMenuOpen.value = false;
      }
    };

    // Listener to close dropdowns when clicking outside the settings dropdown
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.querySelector('.settings-dropdown');
      if (dropdown && !dropdown.contains(event.target as Node)) {
        isSettingsDropdownOpen.value = false;
        isLanguageDropdownOpen.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('click', handleClickOutsideNavbar);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('click', handleClickOutsideNavbar);
    });

    return { 
      uid, 
      isMenuOpen, 
      locale,
      isSettingsDropdownOpen,
      isLanguageDropdownOpen,
      availableLanguages,
      currentLanguageFlag,
      themeStore,
      isDarkMode: themeStore.theme === 'dark',
    };
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    changeLanguage(lang: string) {
      this.locale = lang;
      this.isLanguageDropdownOpen = false;
      this.isSettingsDropdownOpen = false;
    },
    toggleSettingsDropdown() {
      this.isSettingsDropdownOpen = !this.isSettingsDropdownOpen;
    },
    toggleLanguageDropdown() {
      this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
    },
  }
};
</script>

<style>
:root {
  --header-height: 80px;
  /* Adjust according to the header height */
}

header {
  background-color: var(--color-background);
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
  color: var(--color-text);
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
  padding: 0px 50px; /* Adjust padding to control the clickable area */
  color: var(--color-text);
  text-decoration: none;
  font-size: 18px;
  height: 100%;
}

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
  background-color: var(--color-text);
  margin: 5px 0;
}

/* Settings Dropdown Styles */
.settings-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 60px;
  cursor: pointer;
  font-size: 30px;
}
.settings-selector:hover {
  color: #0056b3;
}

.settings-flag {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  border-radius: 50%;
}

.dropdown-arrow {
  margin-left: 5px;
  font-size: 0.7em;
}

.settings-options {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: black;
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid gray;
  z-index: 1000;
  display: none;
  flex-direction: column;
  align-items: flex-start;
  min-height: 150px;
}

.settings-options li {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  width: 100%;
}

.settings-options li img {
  width: 24px;
  height: 24px;
  margin-right: 10px;
  border-radius: 50%;
}

/* Theme Toggle Style */
.switch-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 100%;
  justify-content: center;
}

.theme-switch {
  display: inline-block;
}

.switch {
  position: relative;
  display: inline-block;
  margin-left: 20px;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #2196F3;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: gray;
}

input:checked + .slider:before { /* On Dark Active */
  transform: translateX(26px);
  background-color: black; 
}

/* Language Dropdown Styles */
.language-dropdown {
  display: flex;
  align-items: center;
  height: 100%;
}

.language-selector {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 15px;
  color: var(--color-text);
}

.language-flag {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  border-radius: 50%;
}

.dropdown-arrow {
  margin-left: 5px;
  font-size: 0.7em;
}

.language-options {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--color-background);
  color: var(--color-text-header);
  border: 1px solid gray;
  z-index: 1000;
  display: none;
  flex-direction: column;
  align-items: flex-start;
  min-height: 150px;
}

.language-options li {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  width: 100%;
}

.language-options li:hover {
  background-color: gray;
}

.language-options li img {
  width: 24px;
  height: 24px;
  margin-right: 10px;
  border-radius: 50%;
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
    background-color: var(--color-background);
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
    background-color: var(--color-background);
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
  
  .settings-selector {
    width: 100%;
    justify-content: center;
    padding: 15px 0px;
    color: var(--color-text);
    margin-top: 0px;
  }

  .settings-selector:hover {
    color: var(--color-text);
  }

  .language-selector {
    width: 100%;
    justify-content: center;
    padding: 15px 0px;
    color: var(--color-text);
  }
}
</style>
