import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';


const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    meta: { requiresAuth: true },
    redirect: `/home`
  },
  {
    path: '/settings',
    meta: { requiresAuth: true },
    component: () => import('../views/SettingsPage.vue')
  },
  {
    path: '/auth/:authType',
    meta: { hideMenu: true },
    component: () => import('../views/AuthPage.vue'),
    props: true
  },
  {
    path: '/onboarding',
    meta: { hideMenu: true },
    component: () => import('../views/OnboardingSwipe.vue')
  },
  {
    path: '/home',
    meta: { requiresAuth: true },
    component: () => import('../views/HomePage.vue')
  },
  {
    path: '/post/:postId/',
    meta: { requiresAuth: true, hideMenu: true },
    component: () => import('../views/PostView.vue'),
  }

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      next();
    } else {
      next('/onboarding');
    }
  } else {
    next();
  }
});

export default router;
