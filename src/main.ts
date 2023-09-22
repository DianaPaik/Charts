import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

window.global ||= window;

createApp(App).mount('#app')
