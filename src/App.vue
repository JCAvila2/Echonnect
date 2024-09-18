<script lang="ts">
import { defineComponent } from 'vue';
import Navbar from './components/NavbarComponent.vue';
import { RouterView } from 'vue-router';

export default defineComponent({
  components: {
    Navbar,
    RouterView,
  },
});
</script>

<template>
  <header>
    <Navbar />
  </header>

  <RouterView />
</template>
