<script lang="ts">
import { defineComponent } from 'vue';
import Navbar from '@/components/NavbarComponent.vue';
import { RouterView } from 'vue-router';
import { useThemeStore } from '@/stores/theme';

export default defineComponent({
  components: {
    Navbar,
    RouterView,
  },
  setup() {
    document.title = 'Echonnect';

    const themeStore = useThemeStore();
    themeStore.setTheme('dark');

    return {
      themeStore,
    };
  },
  watch: {
    themeStore: {
      deep: true,
      handler() {
        document.body.className = this.themeStore.theme;
      },
    },
  },
});
</script>

<template>
  <header>
    <Navbar />
  </header>

  {{ themeStore.theme }}
  <button @click="themeStore.toggleTheme" style="background-color: red;">Toggle Theme</button>

  <RouterView />
</template>

<style>
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

body.light {
  --color-text: black;
  --color-background: #f5f5f5;
}

body.dark {
  --color-text: #333;
  --color-background: #181818;
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
