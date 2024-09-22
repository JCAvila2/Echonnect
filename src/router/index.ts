import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import SearchView from '@/views/SearchView.vue';
import ProfileView from '@/views/ProfileView.vue';
import watchProfileView from '@/views/WatchProfileView.vue';
import UploadView from '@/views/UploadView.vue';
import SettingsView from '@/views/SettingsView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView
    },
    {
      path: '/profile/:uid',
      name: 'watchProfile',
      component: watchProfileView,
      props: true,
      beforeEnter: (to, from, next) => {
        if (to.params.uid === useAuthStore().user?.uid) {
          next({ name: 'profile' });
        } else {
          next();
        }
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/upload',
      name: 'upload',
      component: UploadView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    },

    // Auth
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.user) {
    // Redirect to login if not authenticated
    next({
      path: '/login',
      query: { redirect: to.fullPath }, // Save the destination in the query
    });
  } else if ((to.path === '/login' || to.path === '/register') && authStore.user) {
    next('/profile'); // Redirect to profile if authenticated
  } else {
    next(); // Proceed to the route
  }

});

export default router
