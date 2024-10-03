<template>
  <h1>TODO: Implement search</h1>
  <!-- TODO: Remove, only for testing purpuses -->
  <button @click="watchProfile('5zS0SvBXo4aCN2JgySx54V49dJJ2')">JCAvila2</button> 
  <button @click="HearAudio('tuyWLpYjoeVvpaMVgPSP')">Audio Test 1</button>
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

    const HearAudio = (audioId: string) => {
      router.push(`/audio/${audioId}`);
    };

    return { watchProfile, HearAudio };
  },
};

</script>

