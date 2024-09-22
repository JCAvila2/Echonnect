<template>
  <h1>TODO: Implement search</h1>
  <!-- TODO: Remove, only for testing purpuses -->
  <button @click="watchProfile('yXei2gjObsd5JIvtR7QnNPGibGY2')">Mlaverde</button>
  <button @click="watchProfile('W5kEP3QxztOZI6NDGpy4w5PM2Vj2')">JCAvila2</button> 
</template>

<script lang="ts">
import { useRouter } from 'vue-router';

export default {
  setup() {
    document.title = 'Search';
    const router = useRouter();
    const watchProfile = (uid: string) => {
      router.push(`/profile/${uid}`);
    };
    return { watchProfile };
  },
};

</script>

