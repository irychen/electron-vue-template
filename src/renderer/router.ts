import { createRouter, createWebHistory, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Index from './pages/Index.vue'
import About from './pages/About.vue'

const routes = [
  { path: '/', component: Index },
  { path: '/about', component: About },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes, 
})

export default router