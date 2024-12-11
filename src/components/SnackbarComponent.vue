<template>
  <v-snackbar v-model="isVisible" :timeout="timeout" :color="color">
    {{ message }}
    <template v-slot:actions>
      <v-btn variant="text" @click="closeSnackbar">{{ t('close') }}</v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import { useSnackbarStore } from '@/stores/snackbarStore';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

export default {
  setup() {
    const { t } = useI18n();
    const snackbarStore = useSnackbarStore();

    // Computed properties to get the snackbar data
    const isVisible = computed(() => snackbarStore.isVisible);
    const message = computed(() => snackbarStore.message);
    const color = computed(() => snackbarStore.color);
    const timeout = computed(() => snackbarStore.timeout);

    // Action to close the snackbar
    const closeSnackbar = () => snackbarStore.closeSnackbar();

    return {
      t,
      isVisible,
      message,
      color,
      timeout,
      closeSnackbar,
    };
  },
};
</script>
