import { defineStore } from 'pinia';

export const useSnackbarStore = defineStore('snackbar', {
  state: () => ({
    isVisible: false,
    message: '',
    color: 'success',
    timeout: 2000,
  }),
  actions: {
    showSnackbar(message: string, color: string = 'success', timeout: number = 2000) {
      this.message = message;
      this.color = color;
      this.timeout = timeout;
      this.isVisible = true;

      // hide snackbar after timeout
      setTimeout(() => {
        this.isVisible = false;
      }, timeout);
    },
    closeSnackbar() {
      this.isVisible = false;
    },
  },
});
