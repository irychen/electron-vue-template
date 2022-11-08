import { createApp } from 'vue'
import router from './router'
import './style/style.css'
import App from './App.vue'

const app = createApp(App).use(router).mount('#app');