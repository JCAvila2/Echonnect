<template>
  <div v-if="showNotice" class="cookie-notice">
    <p>
      Esta aplicación utiliza cookies esenciales para garantizar su correcto funcionamiento.
    </p>
    <button @click="closeNotice">Entendido</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const showNotice = ref(!localStorage.getItem('cookiesAcknowledged'));

    const closeNotice = () => {
      localStorage.setItem('cookiesAcknowledged', 'true');
      showNotice.value = false;
    };

    return {
      showNotice,
      closeNotice,
    };
  },
});
</script>

<style>
.cookie-notice {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #333;
  color: white;
  padding: 1rem;
  text-align: center;
}
.cookie-notice button {
  margin-top: 0.5rem;
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
</style>
