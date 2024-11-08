import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  }),
  actions: {
    setTheme(newTheme: 'light' | 'dark') {
      this.theme = newTheme;
      localStorage.setItem('theme', newTheme);
    },
    toggleTheme() {
      this.setTheme(this.theme === 'light' ? 'dark' : 'light');
    },
  },
});
