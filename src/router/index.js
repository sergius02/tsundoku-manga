import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'biblioteca',
    component: () => import('../views/BibliotecaView.vue')
  },
  {
    path: '/manga/:id',
    name: 'detalle',
    component: () => import('../views/DetalleView.vue')
  },
  {
    path: '/search',
    name: 'buscar',
    component: () => import('../views/SearchView.vue')
  },
  {
    path: '/add',
    name: 'add',
    component: () => import('../views/AddView.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router