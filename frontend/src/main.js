import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Fuentes instaladas con npm (funcionan sin internet, ej. en el laboratorio)
import '@fontsource/barlow/400.css';
import '@fontsource/barlow/500.css';
import '@fontsource/barlow/600.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/barlow-condensed/800.css';
import './style.css';

createApp(App).use(router).mount('#app');
