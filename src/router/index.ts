import { createRouter, createWebHistory } from 'vue-router';
import SearchView from '@/views/SearchView.vue';
import ProfileView from '@/views/ProfileView.vue';
import watchProfileView from '@/views/WatchProfileView.vue';
import UploadView from '@/views/UploadView.vue';
import BookmarksView from '@/views/BookmarksView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import { useAuthStore } from '@/stores/auth';
import AudioView from '@/views/AudioView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/search',
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
      path: '/audio/:id',
      name: 'audio',
      component: AudioView,
      props: true,
    },
    {
      path: '/bookmarks',
      name: 'bookmarks',
      component: BookmarksView,
      meta: {
        requiresAuth: true
      }
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

    // Not found 404
    {
      path: '/not-found',
      name: 'notFound',
      component: () => import('@/views/NotFoundView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/not-found',
    }

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
