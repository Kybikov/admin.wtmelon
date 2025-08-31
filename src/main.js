import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { createVuestic } from 'vuestic-ui'
import 'vuestic-ui/css'
import { VueQueryPlugin } from '@tanstack/vue-query'
import routes from './router/routes'

const app = createApp(App)
app.use(createPinia())

const router = createRouter({ history: createWebHistory(), routes })
app.use(router)

app.use(createVuestic())
app.use(VueQueryPlugin, { queryClientConfig: { defaultOptions: { queries: { refetchOnWindowFocus: false }}}})

app.mount('#app')