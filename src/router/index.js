import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'library',
    component: () => import('../views/LibraryView.vue'),
  },
  {
    path: '/manga/:id',
    name: 'detail',
    component: () => import('../views/DetailView.vue'),
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('../views/SearchView.vue'),
  },
  {
    path: '/add',
    name: 'add',
    component: () => import('../views/AddView.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
