import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { FontAwesomeIcon } from './assets/fontawesome';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import App from './App.vue';
import router from './router';

const app = createApp(App);

const vuetify = createVuetify({
  components,
  directives,
});

app.use(createPinia());
app.use(router);
app.use(vuetify);
app.component('font-awesome-icon', FontAwesomeIcon);

app.mount('#app');
