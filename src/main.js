import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { createVuestic } from 'vuestic-ui'
import 'vuestic-ui/css'
import { VueQueryPlugin } from '@tanstack/vue-query'
import routes from './router/routes'
import '@/styles/theme.css'

const app = createApp(App)
app.use(createPinia())

const router = createRouter({ history: createWebHistory(), routes })
app.use(router)

app.use(createVuestic({
    config: {
        colors: {
            variables: {
                primary: '#ff3366',
                secondary: '#6c757d',
                success: '#1db954',
                info: '#3b82f6',
                danger: '#ef4444',
                warning: '#f59e0b',
            },
        },
        themes: {
            dark: {
                colors: {
                    primary: '#ff3366',
                    secondary: '#6c757d',
                    success: '#1db954',
                    info: '#3b82f6',
                    danger: '#ef4444',
                    warning: '#f59e0b',
                    backgroundPrimary: '#1a1a1a',
                    backgroundSecondary: '#2a2a2a',
                    backgroundElement: '#333333',
                    backgroundBorder: '#404040',
                    textPrimary: '#ffffff',
                    textInverted: '#000000',
                    shadow: 'rgba(0, 0, 0, 0.12)',
                    focus: '#ff3366',
                },
            },
        },
    },
    components: {
        VaButton: { 
            rounded: true,
        },
        VaCard: {
            color: 'backgroundSecondary',
            textColor: 'textPrimary',
        },
        VaSidebar: { 
            color: 'backgroundSecondary',
        },
        VaDataTable: { 
            striped: true, 
            hoverable: true, 
            density: 'compact',
        },
    },
}))
app.use(VueQueryPlugin, { queryClientConfig: { defaultOptions: { queries: { refetchOnWindowFocus: false }}}})

app.mount('#app')