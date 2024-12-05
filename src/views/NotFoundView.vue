<template>
  <div class="container">
    <h1>404</h1>
    <p>{{ t('404Message') }}</p>
    <router-link to="/">{{ t('404Redirect') }}</router-link>
  </div>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';

export default {
  name: 'NotFoundView',
  setup() {
    const { t, locale } = useI18n();
    document.title = t('404Title');
    return {
      t,
      locale,
    };
  },
}
</script>

<style scoped>
.container {
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
  margin-top: 100px;
}

h1 {
  font-size: 48px;
  color: #333;
  margin-bottom: 10px;
}

p {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

a {
  display: inline-block;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 5px;
  font-size: 16px;
  transition: background-color 0.3s;
}

a:hover {
  background-color: #0056b3;
}
</style>
